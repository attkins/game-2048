import * as THREE from 'three'
import { CHIP_HEIGHT } from './chip'
import { Timeline, easeOutCubic } from './motion'
import { createSparks, sparkOffset, sparkScale } from './sparks'
import { chipTheme } from './theme'

const BURST_MS = 480
const RING_MS = 260
const RING_HEIGHT = 0.03
const RING_INNER = 0.4
const RING_OUTER = 0.5
const RING_GROWTH = 0.9

/** The pop of a merge (D-017): a ring flashes around the chip and small sparks fly up from it. */
export class MergeEffects {
  private readonly sparkGeometry = new THREE.IcosahedronGeometry(1, 0)
  private readonly ringGeometry = new THREE.RingGeometry(RING_INNER, RING_OUTER, 40)
  private readonly sparkMaterials = new Map<string, THREE.MeshBasicMaterial>()

  constructor(
    private readonly parent: THREE.Object3D,
    private readonly timeline: Timeline,
    private readonly random: () => number = Math.random,
  ) {
    this.ringGeometry.rotateX(-Math.PI / 2)
  }

  /** Plays the effect on the cell at `position` for a new chip of `value`. */
  burst(position: THREE.Vector3, value: number): void {
    const theme = chipTheme(value)
    const colors = [this.sparkMaterial(theme.face), this.sparkMaterial('#FFFFFF')]
    const group = new THREE.Group()
    group.position.copy(position)

    const sparks = createSparks(this.random)
    const meshes = sparks.map((spark) => {
      const mesh = new THREE.Mesh(this.sparkGeometry, colors[spark.tint])
      mesh.scale.setScalar(spark.size)
      group.add(mesh)
      return mesh
    })

    const ringMaterial = new THREE.MeshBasicMaterial({ color: '#FFFFFF', transparent: true, depthWrite: false })
    const ring = new THREE.Mesh(this.ringGeometry, ringMaterial)
    ring.position.y = RING_HEIGHT
    group.add(ring)
    this.parent.add(group)

    this.timeline.add({
      delay: 0,
      duration: BURST_MS,
      update: (progress) => {
        const seconds = (progress * BURST_MS) / 1000
        sparks.forEach((spark, index) => {
          const mesh = meshes[index]
          if (!mesh) return
          const offset = sparkOffset(spark, seconds)
          mesh.position.set(offset.x, CHIP_HEIGHT + 0.05 + offset.y, offset.z)
          mesh.scale.setScalar(spark.size * sparkScale(progress))
        })
        const ringProgress = Math.min((progress * BURST_MS) / RING_MS, 1)
        ring.scale.setScalar(1 + RING_GROWTH * easeOutCubic(ringProgress))
        ringMaterial.opacity = 0.85 * (1 - ringProgress)
      },
      done: () => {
        this.parent.remove(group)
        ringMaterial.dispose()
      },
    })
  }

  dispose(): void {
    this.sparkGeometry.dispose()
    this.ringGeometry.dispose()
    this.sparkMaterials.forEach((material) => material.dispose())
  }

  private sparkMaterial(color: string): THREE.MeshBasicMaterial {
    let material = this.sparkMaterials.get(color)
    if (!material) {
      material = new THREE.MeshBasicMaterial({ color })
      this.sparkMaterials.set(color, material)
    }
    return material
  }
}
