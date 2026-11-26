import {
  DEFAULT_BOARD_SIZE,
  isValidBoardSize,
  loadBestScore,
  move,
  newGame,
  saveBestScore,
  type Direction,
  type GameState,
  type KeyValueStorage,
} from './game'
import { createHud } from './hud'
import { attachInput } from './input/input'
import { GameScene } from './scene'

/** The board size comes from the address for now, for example ?size=5. The size selector arrives with U1. */
function readBoardSize(): number {
  const requested = Number(new URLSearchParams(window.location.search).get('size'))
  return isValidBoardSize(requested) ? requested : DEFAULT_BOARD_SIZE
}

/** Reading localStorage can throw, for example when the browser blocks storage. */
function getStorage(): KeyValueStorage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

async function start(): Promise<void> {
  const app = document.getElementById('app')
  const versionLabel = document.getElementById('version')
  if (!app) throw new Error('Missing #app element')
  if (versionLabel) versionLabel.textContent = `v${__APP_VERSION__}`

  // The chip numbers are drawn with the page font, so wait until it is ready.
  await document.fonts?.ready

  const size = readBoardSize()
  const storage = getStorage()
  const scene = new GameScene(app, size)
  let state: GameState = newGame(size)
  let best = loadBestScore(storage, size)

  const hud = createHud(document.body, restart)

  function restart(): void {
    state = newGame(size)
    scene.setBoard(state.board)
    hud.update(state.score, best, state.status)
  }

  function play(direction: Direction): void {
    const outcome = move(state, direction)
    if (!outcome.moved) return
    state = outcome.state
    best = Math.max(best, saveBestScore(storage, size, state.score), state.score)
    scene.showMove(outcome)
    hud.update(state.score, best, state.status)
  }

  attachInput(app, play)
  window.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'n' && !event.metaKey && !event.ctrlKey && !event.altKey) restart()
  })
  restart()
}

start().catch((error: unknown) => {
  console.error(error)
  const app = document.getElementById('app')
  if (app) app.textContent = 'The game could not start. Does your browser support WebGL?'
})
