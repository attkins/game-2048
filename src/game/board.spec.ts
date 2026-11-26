import { describe, expect, it } from 'vitest'
import {
  canMove,
  createEmptyBoard,
  getEmptyCells,
  highestValue,
  isValidBoardSize,
  slide,
  spawnChip,
} from './board'
import { sequenceRng } from './test-helpers'
import type { Board, Direction } from './types'

const SIZES = [3, 4, 5, 6]

describe('createEmptyBoard', () => {
  it.each(SIZES)('creates an empty board of size %i', (size) => {
    const board = createEmptyBoard(size)
    expect(board).toHaveLength(size)
    expect(board.every((row) => row.length === size && row.every((v) => v === 0))).toBe(true)
  })

  it.each([0, 2, 7, 4.5, -4, Number.NaN])('rejects the size %s', (size) => {
    expect(isValidBoardSize(size)).toBe(false)
    expect(() => createEmptyBoard(size)).toThrow(RangeError)
  })
})

describe('slide', () => {
  it('slides a single row to the left', () => {
    const board: Board = [
      [0, 2, 0, 4],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    const result = slide(board, 'left')
    expect(result.board[0]).toEqual([2, 4, 0, 0])
    expect(result.moved).toBe(true)
    expect(result.scoreGained).toBe(0)
  })

  it('merges two equal neighbours and scores the new value', () => {
    const board: Board = [
      [2, 0, 2, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    const result = slide(board, 'left')
    expect(result.board[0]).toEqual([4, 0, 0, 0])
    expect(result.scoreGained).toBe(4)
    expect(result.merges).toEqual([{ cell: { row: 0, col: 0 }, value: 4 }])
  })

  it('merges each chip at most once per move', () => {
    const board: Board = [
      [2, 2, 2, 2],
      [2, 2, 2, 0],
      [4, 4, 8, 0],
      [2, 2, 4, 4],
    ]
    const result = slide(board, 'left')
    expect(result.board).toEqual([
      [4, 4, 0, 0],
      [4, 2, 0, 0],
      [8, 8, 0, 0],
      [4, 8, 0, 0],
    ])
    expect(result.scoreGained).toBe(4 + 4 + 4 + 8 + 4 + 8)
  })

  it('merges the pair next to the target edge first', () => {
    const right = slide([[0, 2, 2, 2], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], 'right')
    expect(right.board[0]).toEqual([0, 0, 2, 4])
    const left = slide([[2, 2, 2, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], 'left')
    expect(left.board[0]).toEqual([4, 2, 0, 0])
  })

  it('does not merge a new chip with an existing equal chip in the same move', () => {
    const result = slide([[4, 4, 8, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], 'left')
    expect(result.board[0]).toEqual([8, 8, 0, 0])
  })

  const horizontalStart: Board = [
    [0, 2, 0, 0],
    [0, 0, 4, 0],
    [0, 0, 0, 0],
    [0, 0, 8, 0],
  ]
  const verticalStart: Board = [
    [0, 0, 0, 0],
    [2, 0, 0, 0],
    [0, 4, 0, 0],
    [0, 0, 0, 8],
  ]

  it.each<[Direction, Board, Board]>([
    ['left', horizontalStart, [[2, 0, 0, 0], [4, 0, 0, 0], [0, 0, 0, 0], [8, 0, 0, 0]]],
    ['right', horizontalStart, [[0, 0, 0, 2], [0, 0, 0, 4], [0, 0, 0, 0], [0, 0, 0, 8]]],
    ['up', verticalStart, [[2, 4, 0, 8], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]],
    ['down', verticalStart, [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [2, 4, 0, 8]]],
  ])('slides chips to the %s edge', (direction, start, expected) => {
    expect(slide(start, direction).board).toEqual(expected)
  })

  it('merges vertically when sliding up and down', () => {
    const board: Board = [
      [2, 0, 0, 0],
      [2, 0, 0, 0],
      [4, 0, 0, 0],
      [4, 0, 0, 0],
    ]
    expect(slide(board, 'up').board.map((row) => row[0])).toEqual([4, 8, 0, 0])
    expect(slide(board, 'down').board.map((row) => row[0])).toEqual([0, 0, 4, 8])
  })

  it('reports no move and keeps the same board object when nothing changes', () => {
    const board: Board = [
      [2, 4, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    const result = slide(board, 'left')
    expect(result.moved).toBe(false)
    expect(result.board).toBe(board)
    expect(result.scoreGained).toBe(0)
  })

  it('does not change the input board', () => {
    const board: Board = [
      [2, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    slide(board, 'right')
    expect(board[0]).toEqual([2, 2, 0, 0])
  })

  it('describes every chip movement for the animation layer', () => {
    const board: Board = [
      [0, 2, 0, 2],
      [0, 0, 4, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    const { moves } = slide(board, 'left')
    expect(moves).toContainEqual({
      from: { row: 0, col: 1 },
      to: { row: 0, col: 0 },
      value: 2,
      merged: true,
    })
    expect(moves).toContainEqual({
      from: { row: 0, col: 3 },
      to: { row: 0, col: 0 },
      value: 2,
      merged: true,
    })
    expect(moves).toContainEqual({
      from: { row: 1, col: 2 },
      to: { row: 1, col: 0 },
      value: 4,
      merged: false,
    })
  })

  describe.each(SIZES)('on a board of size %i', (size) => {
    const fullRow = (value: number) => Array.from({ length: size }, () => value)

    it('merges a full row of equal chips pairwise and keeps the sum', () => {
      const board: Board = [fullRow(2), ...Array.from({ length: size - 1 }, () => fullRow(0))]
      const result = slide(board, 'left')
      const merged = Math.floor(size / 2)
      const leftover = size % 2
      const expected = [
        ...Array.from({ length: merged }, () => 4),
        ...Array.from({ length: leftover }, () => 2),
      ]
      expect(result.board[0]?.slice(0, expected.length)).toEqual(expected)
      expect(result.scoreGained).toBe(merged * 4)
      expect(result.board[0]?.reduce((a, b) => a + b, 0)).toBe(size * 2)
    })

    it('slides a chip from the far corner to the near corner', () => {
      const board = createEmptyBoard(size).map((row) => [...row])
      board[size - 1]![size - 1] = 2
      expect(slide(board, 'up').board[0]?.[size - 1]).toBe(2)
      expect(slide(board, 'left').board[size - 1]?.[0]).toBe(2)
    })
  })
})

describe('getEmptyCells and highestValue', () => {
  it('lists empty cells and finds the highest chip', () => {
    const board: Board = [
      [2, 0, 0],
      [0, 64, 0],
      [0, 0, 4],
    ]
    expect(getEmptyCells(board)).toHaveLength(6)
    expect(highestValue(board)).toBe(64)
    expect(highestValue(createEmptyBoard(3))).toBe(0)
  })
})

describe('canMove', () => {
  it('is true while an empty cell exists', () => {
    expect(canMove([[2, 4, 2], [4, 2, 4], [2, 4, 0]])).toBe(true)
  })

  it('is true on a full board with two equal neighbours', () => {
    expect(canMove([[2, 4, 2], [4, 2, 4], [2, 4, 4]])).toBe(true)
    expect(canMove([[2, 4, 2], [2, 8, 4], [4, 2, 8]])).toBe(true)
  })

  it('is false on a full board without equal neighbours', () => {
    expect(canMove([[2, 4, 2], [4, 2, 4], [2, 4, 2]])).toBe(false)
  })
})

describe('spawnChip', () => {
  it('puts a 2 on an empty cell for most random values', () => {
    const board = createEmptyBoard(3)
    const result = spawnChip(board, sequenceRng([0, 0.5]))
    expect(result?.spawn).toEqual({ row: 0, col: 0, value: 2 })
    expect(result?.board[0]?.[0]).toBe(2)
  })

  it('puts a 4 when the second random value is below ten percent', () => {
    const result = spawnChip(createEmptyBoard(3), sequenceRng([0, 0.05]))
    expect(result?.spawn.value).toBe(4)
  })

  it('spawns a 2 at exactly ten percent and a 4 just below', () => {
    expect(spawnChip(createEmptyBoard(3), sequenceRng([0, 0.1]))?.spawn.value).toBe(2)
    expect(spawnChip(createEmptyBoard(3), sequenceRng([0, 0.0999]))?.spawn.value).toBe(4)
  })

  it('only uses empty cells', () => {
    const board: Board = [
      [2, 4, 2],
      [4, 0, 4],
      [2, 4, 2],
    ]
    const result = spawnChip(board, sequenceRng([0.99, 0.5]))
    expect(result?.spawn).toEqual({ row: 1, col: 1, value: 2 })
  })

  it('picks the last empty cell when the random value is close to 1', () => {
    const board = createEmptyBoard(3)
    const result = spawnChip(board, sequenceRng([0.999999, 0.5]))
    expect(result?.spawn).toMatchObject({ row: 2, col: 2 })
  })

  it('returns null on a full board', () => {
    expect(spawnChip([[2, 4, 2], [4, 2, 4], [2, 4, 2]], sequenceRng([]))).toBeNull()
  })

  it('does not change the input board', () => {
    const board = createEmptyBoard(3)
    spawnChip(board, sequenceRng([0, 0.5]))
    expect(board[0]?.[0]).toBe(0)
  })

  it('spawns roughly ten percent fours over many draws', () => {
    let seed = 12345
    const rng = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296
      return seed / 4294967296
    }
    let fours = 0
    const draws = 5000
    for (let i = 0; i < draws; i++) {
      if (spawnChip(createEmptyBoard(4), rng)?.spawn.value === 4) fours++
    }
    expect(fours / draws).toBeGreaterThan(0.08)
    expect(fours / draws).toBeLessThan(0.12)
  })
})
