import type { Board, Rng } from './types'

/** Small seeded random generator (mulberry32), so simulated games are reproducible. */
export function seededRng(seed: number): Rng {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** An Rng that returns the given values one after another and then fails loudly. */
export function sequenceRng(values: number[]): Rng {
  let index = 0
  return () => {
    const value = values[index++]
    if (value === undefined) throw new Error('sequenceRng ran out of values')
    return value
  }
}

export function sumOf(board: Board): number {
  return board.reduce((total, row) => total + row.reduce((a, b) => a + b, 0), 0)
}

export function countChips(board: Board): number {
  return board.reduce((total, row) => total + row.filter((v) => v > 0).length, 0)
}
