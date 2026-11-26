import * as THREE from 'three'

// Placeholder scene that proves the setup works: a toy board seen at an oblique angle with one gold chip.
// The real board, chips and camera come with the backlog items V1 to V3.

const CAMERA_TILT_DEG = 50
const CAMERA_DISTANCE = 9
const BOARD_SIZE = 4

const app = document.getElementById('app')
const versionLabel = document.getElementById('version')
if (!app) throw new Error('Missing #app element')
if (versionLabel) versionLabel.textContent = `v${__APP_VERSION__}`

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
app.appendChild(renderer.domElement)

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100)
const tilt = THREE.MathUtils.degToRad(CAMERA_TILT_DEG)
camera.position.set(0, Math.sin(tilt) * CAMERA_DISTANCE, Math.cos(tilt) * CAMERA_DISTANCE)
camera.lookAt(0, 0, 0)

scene.add(new THREE.AmbientLight(0xffffff, 1.2))
const keyLight = new THREE.DirectionalLight(0xffffff, 2.2)
keyLight.position.set(3, 6, 4)
scene.add(keyLight)

const board = new THREE.Mesh(
  new THREE.BoxGeometry(BOARD_SIZE + 0.6, 0.3, BOARD_SIZE + 0.6),
  new THREE.MeshStandardMaterial({ color: 0xe8c9a0, roughness: 0.8 }),
)
board.position.y = -0.15
scene.add(board)

const chip = new THREE.Mesh(
  new THREE.CylinderGeometry(0.42, 0.42, 0.26, 48),
  new THREE.MeshStandardMaterial({ color: 0xf2b705, roughness: 0.35, metalness: 0.2 }),
)
chip.position.set(0.5, 0.13, 0.5)
scene.add(chip)

function resize(): void {
  const { clientWidth: width, clientHeight: height } = app as HTMLElement
  renderer.setSize(width, height)
  camera.aspect = width / height
  // Narrow screens need more distance so the whole board stays in view.
  camera.zoom = Math.min(1, camera.aspect * 1.1)
  camera.updateProjectionMatrix()
}

window.addEventListener('resize', resize)
resize()
renderer.setAnimationLoop(() => renderer.render(scene, camera))
