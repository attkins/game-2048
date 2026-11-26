import * as THREE from 'three'
import type { Board } from '../game'
import { createBoard } from './board'
import { CHIP_HEIGHT, createChipFactory, type ChipFactory } from './chip'
import { BASE_HEIGHT, boardWidth, cellCenter } from './layout'
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

/** The 3D view of the game: toy board, chips, camera and light. It knows nothing about the rules. */
export class GameScene {
  private readonly renderer: THREE.WebGLRenderer
  private readonly scene = new THREE.Scene()
  private readonly camera = new THREE.PerspectiveCamera(FIELD_OF_VIEW_DEG, 1, 0.1, 200)
  private readonly chips = new THREE.Group()
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
    this.renderer.setAnimationLoop(() => this.renderer.render(this.scene, this.camera))
  }

  /** Shows the chips of a board. For now the chips jump to their new cells, animations come later. */
  setBoard(board: Board): void {
    this.chips.clear()
    board.forEach((line, row) => {
      line.forEach((value, col) => {
        if (value === 0) return
        const chip = this.chipFactory.create(value)
        const { x, z } = cellCenter(this.size, row, col)
        chip.position.set(x, 0, z)
        this.chips.add(chip)
      })
    })
  }

  dispose(): void {
    this.resizeObserver.disconnect()
    this.renderer.setAnimationLoop(null)
    this.chipFactory.dispose()
    this.gradient.dispose()
    this.renderer.dispose()
    this.renderer.domElement.remove()
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
