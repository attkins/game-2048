import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { BASE_HEIGHT, CELL_SIZE, SLOT_DEPTH, boardWidth, cellCenter } from './layout'
import { BOARD_THEME } from './theme'

const FRAME_RADIUS = 0.3
const SLOT_RADIUS = 0.2
const BEVEL = 0.035

function traceRoundedRect(path: THREE.Path, cx: number, cy: number, width: number, height: number, radius: number): void {
  const x = cx - width / 2
  const y = cy - height / 2
  path.moveTo(x + radius, y)
  path.lineTo(x + width - radius, y)
  path.absarc(x + width - radius, y + radius, radius, -Math.PI / 2, 0, false)
  path.lineTo(x + width, y + height - radius)
  path.absarc(x + width - radius, y + height - radius, radius, 0, Math.PI / 2, false)
  path.lineTo(x + radius, y + height)
  path.absarc(x + radius, y + height - radius, radius, Math.PI / 2, Math.PI, false)
  path.lineTo(x, y + radius)
  path.absarc(x + radius, y + radius, radius, Math.PI, Math.PI * 1.5, false)
}

/**
 * The toy board (D-014): a wooden base, a rounded frame with one hole per cell and a floor in every hole.
 * The cell floor lies at y = 0, the top of the frame at y = SLOT_DEPTH.
 */
export function createBoard(size: number, gradientMap: THREE.Texture): THREE.Group {
  const group = new THREE.Group()
  const width = boardWidth(size)

  const toon = (color: string): THREE.MeshToonMaterial => new THREE.MeshToonMaterial({ color, gradientMap })

  const base = new THREE.Mesh(new RoundedBoxGeometry(width, BASE_HEIGHT, width, 4, 0.1), toon(BOARD_THEME.base))
  base.position.y = -BASE_HEIGHT / 2
  base.castShadow = true
  base.receiveShadow = true
  group.add(base)

  const outline = new THREE.Shape()
  traceRoundedRect(outline, 0, 0, width, width, FRAME_RADIUS)
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const { x, z } = cellCenter(size, row, col)
      const hole = new THREE.Path()
      // The extrusion turns the shape's y axis into -z below, so the hole is mirrored here.
      traceRoundedRect(hole, x, -z, CELL_SIZE, CELL_SIZE, SLOT_RADIUS)
      outline.holes.push(hole)
    }
  }
  const frameGeometry = new THREE.ExtrudeGeometry(outline, {
    depth: SLOT_DEPTH - 2 * BEVEL,
    bevelEnabled: true,
    bevelThickness: BEVEL,
    bevelSize: BEVEL,
    bevelSegments: 3,
    curveSegments: 10,
  })
  frameGeometry.rotateX(-Math.PI / 2)
  frameGeometry.translate(0, BEVEL, 0)
  const frame = new THREE.Mesh(frameGeometry, toon(BOARD_THEME.frame))
  frame.castShadow = true
  frame.receiveShadow = true
  group.add(frame)

  const floorShape = new THREE.Shape()
  traceRoundedRect(floorShape, 0, 0, CELL_SIZE + 2 * BEVEL, CELL_SIZE + 2 * BEVEL, SLOT_RADIUS)
  const floorGeometry = new THREE.ShapeGeometry(floorShape, 10)
  floorGeometry.rotateX(-Math.PI / 2)
  const floorMaterial = toon(BOARD_THEME.slotFloor)
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const { x, z } = cellCenter(size, row, col)
      const floor = new THREE.Mesh(floorGeometry, floorMaterial)
      floor.position.set(x, 0.004, z)
      floor.receiveShadow = true
      group.add(floor)
    }
  }

  return group
}
