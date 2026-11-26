import type { GameStatus } from './game'

// A plain placeholder for the real top and bottom bars (backlog U1 and U2). It shows the score and
// a message when the game is won or over, and lets the player start a new game.

const MESSAGES: Record<Exclude<GameStatus, 'playing'>, string> = {
  won: 'You made 2048! Tap for a new game',
  over: 'No more moves. Tap for a new game',
}

export interface Hud {
  update(score: number, best: number, status: GameStatus): void
}

export function createHud(parent: HTMLElement, onRestart: () => void): Hud {
  const root = document.createElement('div')
  root.className = 'hud'

  const top = document.createElement('div')
  top.className = 'hud-top'
  const scoreLabel = document.createElement('span')
  const bestLabel = document.createElement('span')
  top.append(scoreLabel, bestLabel)

  const message = document.createElement('button')
  message.type = 'button'
  message.className = 'hud-message'
  message.hidden = true
  message.addEventListener('click', onRestart)

  root.append(top, message)
  parent.appendChild(root)

  return {
    update(score, best, status) {
      scoreLabel.textContent = `Score ${score.toLocaleString()}`
      bestLabel.textContent = `Best ${best.toLocaleString()}`
      if (status === 'playing') {
        message.hidden = true
      } else {
        message.textContent = MESSAGES[status]
        message.hidden = false
      }
    },
  }
}
