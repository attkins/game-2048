import { describe, expect, it } from 'vitest'
import { createEmptyBoard } from './board'
import { hasWon, isGameOver, move, newGame, type GameState } from './game'
import { countChips, seededRng, sequenceRng, sumOf } from './test-helpers'
import type { Board, Direction } from './types'

const SIZES = [3, 4, 5, 6]
const DIRECTIONS: Direction[] = ['up', 'down', 'left', 'right']

function stateOf(board: Board, score = 0): GameState {
  return { size: board.length, board, score, status: 'playing' }
}

describe('newGame', () => {
  it.each(SIZES)('starts a game of size %i with two chips and no score', (size) => {
    const game = newGame(size, seededRng(size))
    expect(game.size).toBe(size)
    expect(game.board).toHaveLength(size)
    expect(game.score).toBe(0)
    expect(game.status).toBe('playing')
    expect(countChips(game.board)).toBe(2)
    expect(game.board.flat().every((v) => v === 0 || v === 2 || v === 4)).toBe(true)
  })

  it('uses a 4x4 board by default', () => {
    expect(newGame(undefined, seededRng(1)).board).toHaveLength(4)
  })

  it('rejects board sizes outside of 3 to 6', () => {
    expect(() => newGame(2)).toThrow(RangeError)
    expect(() => newGame(7)).toThrow(RangeError)
  })
})

describe('move', () => {
  it('slides, scores the merge and spawns one new chip', () => {
    const board: Board = [
      [2, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    const outcome = move(stateOf(board, 10), 'left', sequenceRng([0, 0.5]))
    expect(outcome.moved).toBe(true)
    expect(outcome.scoreGained).toBe(4)
    expect(outcome.state.score).toBe(14)
    expect(outcome.state.board[0]?.[0]).toBe(4)
    expect(outcome.spawn).toEqual({ row: 0, col: 1, value: 2 })
    expect(countChips(outcome.state.board)).toBe(2)
    expect(outcome.state.status).toBe('playing')
  })

  it('does nothing when the move changes nothing', () => {
    const state = stateOf([
      [2, 4, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ])
    const outcome = move(state, 'left', sequenceRng([]))
    expect(outcome.moved).toBe(false)
    expect(outcome.state).toBe(state)
    expect(outcome.spawn).toBeNull()
  })

  it('does not change the old state', () => {
    const state = stateOf([
      [2, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ])
    move(state, 'right', sequenceRng([0, 0.5]))
    expect(state.board[0]).toEqual([2, 2, 0, 0])
    expect(state.score).toBe(0)
  })

  it('always keeps the sum of all chips plus the spawned chip', () => {
    const outcome = move(newGame(4, seededRng(7)), 'left', seededRng(8))
    if (outcome.moved) {
      const before = sumOf(newGame(4, seededRng(7)).board)
      expect(sumOf(outcome.state.board)).toBe(before + (outcome.spawn?.value ?? 0))
    }
  })
})

describe('win', () => {
  const nearWin: Board = [
    [1024, 1024, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]

  it('is detected on the board', () => {
    expect(hasWon(nearWin)).toBe(false)
    expect(hasWon([[2048, 0, 0], [0, 0, 0], [0, 0, 0]])).toBe(true)
  })

  it('ends the game when the 2048 chip appears and spawns no new chip', () => {
    const outcome = move(stateOf(nearWin), 'left', sequenceRng([]))
    expect(outcome.state.status).toBe('won')
    expect(outcome.state.board[0]?.[0]).toBe(2048)
    expect(outcome.state.score).toBe(2048)
    expect(outcome.spawn).toBeNull()
    expect(countChips(outcome.state.board)).toBe(1)
  })

  it('ignores moves after the win', () => {
    const won = move(stateOf(nearWin), 'left', sequenceRng([])).state
    const after = move(won, 'down', sequenceRng([]))
    expect(after.moved).toBe(false)
    expect(after.state).toBe(won)
  })

  it.each(SIZES)('works on a board of size %i', (size) => {
    const board = createEmptyBoard(size).map((row) => [...row])
    board[0]![0] = 1024
    board[0]![1] = 1024
    const outcome = move(stateOf(board), 'left', sequenceRng([]))
    expect(outcome.state.status).toBe('won')
  })
})

describe('game over', () => {
  it('is detected on the board', () => {
    expect(isGameOver([[2, 4, 2], [4, 2, 4], [2, 4, 2]])).toBe(true)
    expect(isGameOver([[2, 4, 2], [4, 2, 4], [2, 4, 0]])).toBe(false)
    expect(isGameOver([[2, 4, 2], [4, 2, 4], [2, 4, 4]])).toBe(false)
  })

  it('ends the game when the new chip fills the board and nothing can merge', () => {
    const state = stateOf([
      [2, 4, 2],
      [8, 16, 8],
      [2, 4, 0],
    ])
    // The only empty cell is (2, 0) after the move. The second value picks a 4.
    const outcome = move(state, 'right', sequenceRng([0, 0.05]))
    expect(outcome.state.board).toEqual([
      [2, 4, 2],
      [8, 16, 8],
      [4, 2, 4],
    ])
    expect(outcome.state.status).toBe('over')
  })

  it('keeps playing when a merge is still possible after the spawn', () => {
    const state = stateOf([
      [2, 4, 2],
      [8, 16, 8],
      [2, 4, 0],
    ])
    // A spawned 2 lands next to the other 2 in the last row.
    const outcome = move(state, 'right', sequenceRng([0, 0.5]))
    expect(outcome.state.status).toBe('playing')
  })

  it('ignores moves after game over', () => {
    const over: GameState = {
      size: 3,
      board: [[2, 4, 2], [8, 16, 8], [4, 2, 4]],
      score: 100,
      status: 'over',
    }
    const outcome = move(over, 'left', sequenceRng([]))
    expect(outcome.moved).toBe(false)
    expect(outcome.state).toBe(over)
  })
})

describe('simulated games', () => {
  it.each(SIZES)('stay consistent on a board of size %i until the game ends', (size) => {
    for (let seed = 1; seed <= 15; seed++) {
      const rng = seededRng(seed * 100 + size)
      let state = newGame(size, rng)
      let steps = 0
      while (state.status === 'playing' && steps < 3000) {
        const direction = DIRECTIONS[Math.floor(rng() * DIRECTIONS.length)] as Direction
        const sumBefore = sumOf(state.board)
        const outcome = move(state, direction, rng)
        if (outcome.moved) {
          // Merging keeps the sum, so only the spawned chip adds to it.
          expect(sumOf(outcome.state.board)).toBe(sumBefore + (outcome.spawn?.value ?? 0))
          expect(outcome.state.score).toBe(state.score + outcome.scoreGained)
          expect(outcome.state.score).toBeGreaterThanOrEqual(state.score)
        } else {
          expect(outcome.state).toBe(state)
        }
        expect(
          outcome.state.board.flat().every((v) => v === 0 || (v >= 2 && Number.isInteger(Math.log2(v)))),
        ).toBe(true)
        expect(outcome.state.board.flat().every((v) => v <= 2048)).toBe(true)
        state = outcome.state
        steps++
      }
      if (state.status === 'over') expect(isGameOver(state.board)).toBe(true)
      if (state.status === 'won') expect(hasWon(state.board)).toBe(true)
    }
  })
})
