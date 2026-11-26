import * as THREE from 'three'
import { WIN_VALUE, type Board, type Cell, type Merge, type Spawn, type TileMove } from '../game'
import { createBoard } from './board'
import { CHIP_HEIGHT, createChipFactory, type ChipFactory } from './chip'
import { MergeEffects } from './effects'
import { BASE_HEIGHT, boardWidth, cellCenter } from './layout'
import { Timeline, easeOutBack, easeOutBounce, easeOutCubic, squashAmount } from './motion'
import { createToonGradient } from './toon'

// The camera looks at the board from a fixed, oblique angle (D-015). The angle is the elevation above
// the board plane: 90 degrees would be straight from above. The drafts on the design canvas tilt the
// board by 50 degrees from the viewer, which is an elevation of 40 degrees. Open question Q2.
export const CAMERA_ELEVATION_DEG = 40

const FIELD_OF_VIEW_DEG = 35

// How much of the screen the board may fill, in normalized device coordinates. The rest stays free
// for the score on top and the messages at the bottom.
const FIT_LIMIT_X = 0.94
const FIT_LIMIT_Y = 0.74

// Timing of the chip animations in milliseconds (V4).
const SLIDE_MS = 150
const LAND_MS = 140
const POP_MS = 220
const SPAWN_DELAY_MS = 110
const SPAWN_MS = 380
// Sizes of the motion in board units and as a factor.
const LAND_SQUASH = 0.16
const POP_HOP = 0.32
const POP_GROW = 0.18
// The 2048 chip gets a longer, bigger pop with a full turn.
const CELEBRATE_MS = 850
const CELEBRATE_HOP = 0.75
const CELEBRATE_GROW = 0.3
const SPAWN_DROP = 1.3

/** What a move changed on the board. `MoveOutcome` from the game logic fits this shape. */
export interface BoardChange {
  readonly moves: readonly TileMove[]
  readonly merges: readonly Merge[]
  readonly spawn: Spawn | null
}

/** The 3D view of the game: toy board, chips, camera and light. It knows nothing about the rules. */
export class GameScene {
  private readonly renderer: THREE.WebGLRenderer
  private readonly scene = new THREE.Scene()
  private readonly camera = new THREE.PerspectiveCamera(FIELD_OF_VIEW_DEG, 1, 0.1, 200)
  private readonly chips = new THREE.Group()
  /** The chip standing in each cell, by row * size + col. Valid whenever no animation is running. */
  private readonly cellChips = new Map<number, THREE.Group>()
  private readonly timeline = new Timeline()
  private readonly effects = new MergeEffects(this.scene, this.timeline)
  private readonly reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  private readonly chipFactory: ChipFactory
  private readonly gradient = createToonGradient()
  private readonly resizeObserver: ResizeObserver

  constructor(
    private readonly container: HTMLElement,
    private readonly size: number,
  ) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(this.renderer.domElement)
    // The canvas must not scroll or zoom the page while the player swipes on it.
    this.renderer.domElement.style.touchAction = 'none'

    this.chipFactory = createChipFactory(this.gradient, this.renderer.capabilities.getMaxAnisotropy())
    this.addLights()
    this.scene.add(createBoard(size, this.gradient), this.chips)

    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(container)
    this.resize()
    let lastTime = performance.now()
    this.renderer.setAnimationLoop((time: number) => {
      // A long pause, for example in a background tab, must not make the chips jump through their motion.
      this.timeline.tick(Math.min(time - lastTime, 50))
      if (!this.reducedMotion) this.chipFactory.animate(time)
      lastTime = time
      this.renderer.render(this.scene, this.camera)
    })
  }

  /** Shows the chips of a board right away, without animation. Used for a new game. */
  setBoard(board: Board): void {
    this.timeline.finishAll()
    this.chips.clear()
    this.cellChips.clear()
    board.forEach((line, row) => {
      line.forEach((value, col) => {
        if (value === 0) return
        this.placeChip(this.chipFactory.create(value), { row, col })
      })
    })
  }

  /**
   * Animates a move: the chips slide and land with a small squash, merging chips pop into the new
   * chip and the spawned chip drops in. An unfinished animation of the move before is finished first.
   */
  showMove(change: BoardChange): void {
    this.timeline.finishAll()
    const slide = this.reducedMotion ? 0 : SLIDE_MS

    const before = new Map(this.cellChips)
    const merging = new Map<number, THREE.Group[]>()
    for (const { from } of change.moves) this.cellChips.delete(this.key(from))

    for (const { from, to, merged } of change.moves) {
      const chip = before.get(this.key(from))
      if (!chip) continue
      const start = chip.position.clone()
      const end = this.cellPosition(to)
      const distance = start.distanceTo(end)
      if (merged) {
        const key = this.key(to)
        merging.set(key, [...(merging.get(key) ?? []), chip])
      } else {
        this.cellChips.set(this.key(to), chip)
      }
      if (distance === 0) continue
      this.timeline.add({
        delay: 0,
        duration: slide,
        update: (progress) => chip.position.lerpVectors(start, end, easeOutCubic(progress)),
        done: merged ? undefined : () => this.land(chip),
      })
    }

    for (const merge of change.merges) {
      const key = this.key(merge.cell)
      const old = merging.get(key) ?? []
      const celebrate = merge.value >= WIN_VALUE
      const hop = celebrate ? CELEBRATE_HOP : POP_HOP
      const grow = celebrate ? CELEBRATE_GROW : POP_GROW
      let chip: THREE.Group | null = null
      this.timeline.add({
        delay: slide,
        duration: this.reducedMotion ? 0 : celebrate ? CELEBRATE_MS : POP_MS,
        update: (progress) => {
          if (!chip) {
            old.forEach((oldChip) => this.chips.remove(oldChip))
            chip = this.chipFactory.create(merge.value)
            this.placeChip(chip, merge.cell)
            if (!this.reducedMotion) {
              this.effects.burst(this.cellPosition(merge.cell), merge.value)
              if (celebrate) this.effects.celebrate(this.cellPosition(merge.cell))
            }
          }
          const wave = progress >= 1 ? 0 : Math.sin(Math.PI * progress)
          chip.position.y = hop * wave
          chip.scale.setScalar(1 + grow * wave)
          chip.rotation.y = celebrate && progress < 1 ? Math.PI * 2 * easeOutCubic(progress) : 0
        },
      })
    }

    const { spawn } = change
    if (spawn) {
      const spawnedCell: Cell = { row: spawn.row, col: spawn.col }
      let chip: THREE.Group | null = null
      this.timeline.add({
        delay: this.reducedMotion ? 0 : SPAWN_DELAY_MS,
        duration: this.reducedMotion ? 0 : SPAWN_MS,
        update: (progress) => {
          if (!chip) {
            chip = this.chipFactory.create(spawn.value)
            this.placeChip(chip, spawnedCell)
          }
          chip.position.y = SPAWN_DROP * (1 - easeOutBounce(progress))
          chip.scale.setScalar(0.5 + 0.5 * easeOutBack(Math.min(progress * 2.5, 1)))
        },
      })
    }

    if (this.reducedMotion) this.timeline.finishAll()
  }

  dispose(): void {
    this.timeline.finishAll()
    this.resizeObserver.disconnect()
    this.renderer.setAnimationLoop(null)
    this.effects.dispose()
    this.chipFactory.dispose()
    this.gradient.dispose()
    this.renderer.dispose()
    this.renderer.domElement.remove()
  }

  private key(cell: Cell): number {
    return cell.row * this.size + cell.col
  }

  private cellPosition(cell: Cell): THREE.Vector3 {
    const { x, z } = cellCenter(this.size, cell.row, cell.col)
    return new THREE.Vector3(x, 0, z)
  }

  /** Puts a chip into a cell, adds it to the scene and remembers it. */
  private placeChip(chip: THREE.Group, cell: Cell): void {
    chip.position.copy(this.cellPosition(cell))
    this.chips.add(chip)
    this.cellChips.set(this.key(cell), chip)
  }

  /** A short squash after a chip arrives, so it feels like it has weight. */
  private land(chip: THREE.Group): void {
    this.timeline.add({
      delay: 0,
      duration: this.reducedMotion ? 0 : LAND_MS,
      update: (progress) => {
        const height = squashAmount(progress, LAND_SQUASH)
        const width = 1 + (1 - height) * 0.5
        chip.scale.set(width, height, width)
      },
    })
  }

  private addLights(): void {
    this.scene.add(new THREE.AmbientLight(0xffffff, 1.35))
    const reach = boardWidth(this.size) / 2 + 1.5
    const key = new THREE.DirectionalLight(0xffffff, 2.1)
    key.position.set(-3.5, 8, 5.5)
    key.castShadow = true
    key.shadow.mapSize.set(2048, 2048)
    key.shadow.camera.left = -reach
    key.shadow.camera.right = reach
    key.shadow.camera.top = reach
    key.shadow.camera.bottom = -reach
    key.shadow.camera.near = 1
    key.shadow.camera.far = 24
    key.shadow.bias = -0.0005
    key.shadow.normalBias = 0.02
    key.shadow.radius = 3
    this.scene.add(key)
  }

  private resize(): void {
    const width = Math.max(1, this.container.clientWidth)
    const height = Math.max(1, this.container.clientHeight)
    this.renderer.setSize(width, height)
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.fitCamera()
  }

  /** Moves the camera back along its fixed viewing direction until the whole board is in view. */
  private fitCamera(): void {
    const elevation = THREE.MathUtils.degToRad(CAMERA_ELEVATION_DEG)
    const direction = new THREE.Vector3(0, Math.sin(elevation), Math.cos(elevation))
    const half = boardWidth(this.size) / 2
    const top = CHIP_HEIGHT + 0.1
    const corners: THREE.Vector3[] = []
    for (const x of [-half, half]) {
      for (const y of [-BASE_HEIGHT, top]) {
        for (const z of [-half, half]) corners.push(new THREE.Vector3(x, y, z))
      }
    }

    const fits = (distance: number): boolean => {
      this.camera.position.copy(direction).multiplyScalar(distance)
      this.camera.lookAt(0, 0, 0)
      this.camera.updateMatrixWorld()
      return corners.every((corner) => {
        const projected = corner.clone().project(this.camera)
        return Math.abs(projected.x) <= FIT_LIMIT_X && Math.abs(projected.y) <= FIT_LIMIT_Y
      })
    }

    let near = 2
    let far = 300
    for (let i = 0; i < 32; i++) {
      const middle = (near + far) / 2
      if (fits(middle)) far = middle
      else near = middle
    }
    fits(far)
  }
}
