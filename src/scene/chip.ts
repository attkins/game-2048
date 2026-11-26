import * as THREE from 'three'
import { WIN_VALUE } from '../game'
import { SLOT_DEPTH } from './layout'
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

// The 2048 chip stands on a golden halo that pulses softly.
const HALO_SIZE = 2.5
// Just above the wooden frame, which would hide a lower halo.
const HALO_HEIGHT = SLOT_DEPTH + 0.012
const HALO_BASE_OPACITY = 0.78
const HALO_PULSE = 0.17
const HALO_PERIOD_MS = 1800

function drawHalo(): HTMLCanvasElement {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  if (!context) throw new Error('2D canvas is not available')
  const gradient = context.createRadialGradient(size / 2, size / 2, size * 0.18, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(255, 210, 63, 0.95)')
  gradient.addColorStop(0.45, 'rgba(255, 196, 40, 0.5)')
  gradient.addColorStop(1, 'rgba(255, 190, 30, 0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, size, size)
  return canvas
}

export interface ChipFactory {
  /** Builds a chip standing on y = 0. Materials and geometry are shared between all chips. */
  create(value: number): THREE.Group
  /** Lets the halos of 2048 chips pulse. `timeMs` is any steadily growing time. Without calls they stay still. */
  animate(timeMs: number): void
  dispose(): void
}

export function createChipFactory(gradientMap: THREE.Texture, maxAnisotropy: number): ChipFactory {
  const bodyGeometry = createBodyGeometry()
  const topGeometry = new THREE.CircleGeometry(RADIUS - EDGE_RADIUS + 0.01, 56)
  topGeometry.rotateX(-Math.PI / 2)
  const bodyMaterials = new Map<number, THREE.MeshToonMaterial>()
  const topMaterials = new Map<number, THREE.MeshToonMaterial>()
  const textures: THREE.Texture[] = []
  let haloParts: { geometry: THREE.PlaneGeometry; material: THREE.MeshBasicMaterial } | null = null

  function halo(): { geometry: THREE.PlaneGeometry; material: THREE.MeshBasicMaterial } {
    if (!haloParts) {
      const texture = new THREE.CanvasTexture(drawHalo())
      texture.colorSpace = THREE.SRGBColorSpace
      textures.push(texture)
      const geometry = new THREE.PlaneGeometry(HALO_SIZE, HALO_SIZE)
      geometry.rotateX(-Math.PI / 2)
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        opacity: HALO_BASE_OPACITY,
      })
      haloParts = { geometry, material }
    }
    return haloParts
  }

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
      if (value >= WIN_VALUE) {
        const { geometry, material } = halo()
        const glow = new THREE.Mesh(geometry, material)
        glow.position.y = HALO_HEIGHT
        group.add(glow)
      }
      group.userData.value = value
      return group
    },
    animate(timeMs) {
      if (haloParts) {
        haloParts.material.opacity = HALO_BASE_OPACITY + HALO_PULSE * Math.sin((timeMs / HALO_PERIOD_MS) * Math.PI * 2)
      }
    },
    dispose() {
      bodyGeometry.dispose()
      topGeometry.dispose()
      bodyMaterials.forEach((material) => material.dispose())
      topMaterials.forEach((material) => material.dispose())
      textures.forEach((texture) => texture.dispose())
      haloParts?.geometry.dispose()
      haloParts?.material.dispose()
    },
  }
}
