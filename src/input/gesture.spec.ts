import { describe, expect, it } from 'vitest'
import { SWIPE_THRESHOLD_PX, directionFromDelta, directionFromKey } from './gesture'

describe('directionFromDelta', () => {
  it.each([
    [80, 5, 'right'],
    [-80, 5, 'left'],
    [5, 80, 'down'],
    [5, -80, 'up'],
  ] as const)('maps (%i, %i) to %s', (dx, dy, expected) => {
    expect(directionFromDelta(dx, dy)).toBe(expected)
  })

  it('uses the longer axis for a diagonal gesture', () => {
    expect(directionFromDelta(60, 40)).toBe('right')
    expect(directionFromDelta(-40, -60)).toBe('up')
  })

  it('ignores gestures below the threshold', () => {
    expect(directionFromDelta(0, 0)).toBeNull()
    expect(directionFromDelta(SWIPE_THRESHOLD_PX - 1, 3)).toBeNull()
    expect(directionFromDelta(2, -(SWIPE_THRESHOLD_PX - 1))).toBeNull()
  })

  it('accepts a gesture that is exactly as long as the threshold', () => {
    expect(directionFromDelta(SWIPE_THRESHOLD_PX, 0)).toBe('right')
  })

  it('ignores a perfect diagonal because the direction is unclear', () => {
    expect(directionFromDelta(50, 50)).toBeNull()
    expect(directionFromDelta(-50, 50)).toBeNull()
  })

  it('takes a custom threshold', () => {
    expect(directionFromDelta(10, 0, 5)).toBe('right')
    expect(directionFromDelta(10, 0, 50)).toBeNull()
  })
})

describe('directionFromKey', () => {
  it.each([
    ['ArrowUp', 'up'],
    ['ArrowDown', 'down'],
    ['ArrowLeft', 'left'],
    ['ArrowRight', 'right'],
    ['w', 'up'],
    ['A', 'left'],
    ['s', 'down'],
    ['D', 'right'],
  ] as const)('maps %s to %s', (key, expected) => {
    expect(directionFromKey(key)).toBe(expected)
  })

  it.each(['Enter', ' ', 'n', 'Escape', 'Shift'])('ignores %s', (key) => {
    expect(directionFromKey(key)).toBeNull()
  })
})
