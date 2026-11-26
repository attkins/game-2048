import type { Direction } from '../game'
import { directionFromDelta, directionFromKey } from './gesture'

/**
 * Turns keyboard, touch swipe and mouse drag into the same four move commands (D-012).
 * Touch and mouse both use pointer events, so one code path handles both.
 * Returns a function that removes all listeners again.
 */
export function attachInput(target: HTMLElement, onMove: (direction: Direction) => void): () => void {
  let start: { id: number; x: number; y: number } | null = null

  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.metaKey || event.ctrlKey || event.altKey) return
    const direction = directionFromKey(event.key)
    if (!direction) return
    // Stops the arrow keys from scrolling the page.
    event.preventDefault()
    onMove(direction)
  }

  const onPointerDown = (event: PointerEvent): void => {
    // Only the primary button and the first finger start a gesture.
    if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return
    start = { id: event.pointerId, x: event.clientX, y: event.clientY }
    target.setPointerCapture(event.pointerId)
  }

  const onPointerUp = (event: PointerEvent): void => {
    if (!start || start.id !== event.pointerId) return
    const direction = directionFromDelta(event.clientX - start.x, event.clientY - start.y)
    start = null
    if (direction) onMove(direction)
  }

  const onPointerCancel = (event: PointerEvent): void => {
    if (start?.id === event.pointerId) start = null
  }

  window.addEventListener('keydown', onKeyDown)
  target.addEventListener('pointerdown', onPointerDown)
  target.addEventListener('pointerup', onPointerUp)
  target.addEventListener('pointercancel', onPointerCancel)

  return () => {
    window.removeEventListener('keydown', onKeyDown)
    target.removeEventListener('pointerdown', onPointerDown)
    target.removeEventListener('pointerup', onPointerUp)
    target.removeEventListener('pointercancel', onPointerCancel)
  }
}
