import type { Direction } from '../game'

/** A swipe or drag shorter than this many pixels is ignored, so a tap never moves the chips. */
export const SWIPE_THRESHOLD_PX = 24

/**
 * Turns the distance between the start and the end of a swipe or drag into a move.
 * The longer axis wins. Returns null for short gestures and for perfect diagonals.
 */
export function directionFromDelta(
  dx: number,
  dy: number,
  threshold: number = SWIPE_THRESHOLD_PX,
): Direction | null {
  const absX = Math.abs(dx)
  const absY = Math.abs(dy)
  if (Math.max(absX, absY) < threshold) return null
  if (absX === absY) return null
  if (absX > absY) return dx > 0 ? 'right' : 'left'
  return dy > 0 ? 'down' : 'up'
}

/** Arrow keys and WASD both move the chips. */
export function directionFromKey(key: string): Direction | null {
  switch (key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      return 'up'
    case 'ArrowDown':
    case 's':
    case 'S':
      return 'down'
    case 'ArrowLeft':
    case 'a':
    case 'A':
      return 'left'
    case 'ArrowRight':
    case 'd':
    case 'D':
      return 'right'
    default:
      return null
  }
}
