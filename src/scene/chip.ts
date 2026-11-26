import * as THREE from 'three'
import { FONT_FAMILY, chipTheme } from './theme'

// A chunky toy chip (D-016): a thick disc with rounded edges. The top face carries the color,
// the dashed notches and the number as a texture.
const RADIUS = 0.42
export const CHIP_HEIGHT = 0.3
const EDGE_RADIUS = 0.08
const TEXTURE_SIZE = 512

function createBodyGeometry(): THREE.LatheGeometry {
  const profile: THREE.Vector2[] = [new THREE.Vector2(0, 0), new THREE.Vector2(RADIUS - EDGE_RADIUS, 0)]
  const steps = 6
  for (let i = 1; i <= steps; i++) {
    const angle = -Math.PI / 2 + (i / steps) * (Math.PI / 2)
    profile.push(
      new THREE.Vector2(
        RADIUS - EDGE_RADIUS + Math.cos(angle) * EDGE_RADIUS,
        EDGE_RADIUS + Math.sin(angle) * EDGE_RADIUS,
      ),
    )
  }
  for (let i = 1; i <= steps; i++) {
    const angle = (i / steps) * (Math.PI / 2)
    profile.push(
      new THREE.Vector2(
        RADIUS - EDGE_RADIUS + Math.cos(angle) * EDGE_RADIUS,
        CHIP_HEIGHT - EDGE_RADIUS + Math.sin(angle) * EDGE_RADIUS,
      ),
    )
  }
  profile.push(new THREE.Vector2(0, CHIP_HEIGHT))
  return new THREE.LatheGeometry(profile, 56)
}

function drawChipFace(value: number): HTMLCanvasElement {
  const theme = chipTheme(value)
  const canvas = document.createElement('canvas')
  canvas.width = TEXTURE_SIZE
  canvas.height = TEXTURE_SIZE
  const context = canvas.getContext('2d')
  if (!context) throw new Error('2D canvas is not available')
  const mid = TEXTURE_SIZE / 2

  context.fillStyle = theme.face
  context.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE)

  // A soft light from the top left, so the face does not look flat.
  const highlight = context.createLinearGradient(0, 0, TEXTURE_SIZE, TEXTURE_SIZE)
  highlight.addColorStop(0, 'rgba(255, 255, 255, 0.38)')
  highlight.addColorStop(0.55, 'rgba(255, 255, 255, 0)')
  context.fillStyle = highlight
  context.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE)

  // The dashed notches of a poker chip.
  context.strokeStyle = theme.ring
  context.lineWidth = TEXTURE_SIZE * 0.085
  context.setLineDash([TEXTURE_SIZE * 0.07, TEXTURE_SIZE * 0.048])
  context.beginPath()
  context.arc(mid, mid, TEXTURE_SIZE * 0.44, 0, Math.PI * 2)
  context.stroke()
  context.setLineDash([])

  context.fillStyle = 'rgba(255, 255, 255, 0.22)'
  context.beginPath()
  context.arc(mid, mid, TEXTURE_SIZE * 0.31, 0, Math.PI * 2)
  context.fill()

  const digits = String(value).length
  const fontSize = digits <= 2 ? 190 : digits === 3 ? 150 : 118
  context.fillStyle = theme.text
  context.font = `700 ${fontSize}px ${FONT_FAMILY}`
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(String(value), mid, mid + TEXTURE_SIZE * 0.015)
  return canvas
}

export interface ChipFactory {
  /** Builds a chip standing on y = 0. Materials and geometry are shared between all chips. */
  create(value: number): THREE.Group
  dispose(): void
}

export function createChipFactory(gradientMap: THREE.Texture, maxAnisotropy: number): ChipFactory {
  const bodyGeometry = createBodyGeometry()
  const topGeometry = new THREE.CircleGeometry(RADIUS - EDGE_RADIUS + 0.01, 56)
  topGeometry.rotateX(-Math.PI / 2)
  const bodyMaterials = new Map<number, THREE.MeshToonMaterial>()
  const topMaterials = new Map<number, THREE.MeshToonMaterial>()
  const textures: THREE.Texture[] = []

  function bodyMaterial(value: number): THREE.MeshToonMaterial {
    let material = bodyMaterials.get(value)
    if (!material) {
      material = new THREE.MeshToonMaterial({ color: chipTheme(value).edge, gradientMap })
      bodyMaterials.set(value, material)
    }
    return material
  }

  function topMaterial(value: number): THREE.MeshToonMaterial {
    let material = topMaterials.get(value)
    if (!material) {
      const texture = new THREE.CanvasTexture(drawChipFace(value))
      texture.colorSpace = THREE.SRGBColorSpace
      texture.anisotropy = maxAnisotropy
      textures.push(texture)
      material = new THREE.MeshToonMaterial({ map: texture, gradientMap })
      topMaterials.set(value, material)
    }
    return material
  }

  return {
    create(value) {
      const group = new THREE.Group()
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial(value))
      body.castShadow = true
      body.receiveShadow = true
      const top = new THREE.Mesh(topGeometry, topMaterial(value))
      top.position.y = CHIP_HEIGHT + 0.002
      top.receiveShadow = true
      group.add(body, top)
      group.userData.value = value
      return group
    },
    dispose() {
      bodyGeometry.dispose()
      topGeometry.dispose()
      bodyMaterials.forEach((material) => material.dispose())
      topMaterials.forEach((material) => material.dispose())
      textures.forEach((texture) => texture.dispose())
    },
  }
}
