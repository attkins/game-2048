import { canMove, createEmptyBoard, highestValue, slide, spawnChip } from './board'
import { DEFAULT_BOARD_SIZE, START_CHIP_COUNT, WIN_VALUE } from './config'
import type { Board, Direction, Merge, Rng, Spawn, TileMove } from './types'

/** `won` and `over` are final. The game ignores further moves until a new game starts. */
export type GameStatus = 'playing' | 'won' | 'over'

export interface GameState {
  readonly size: number
  readonly board: Board
  readonly score: number
  readonly status: GameStatus
}

export interface MoveOutcome {
  readonly state: GameState
  /** False when the move changed nothing. No chip spawns and the score stays the same. */
  readonly moved: boolean
  readonly scoreGained: number
  readonly moves: readonly TileMove[]
  readonly merges: readonly Merge[]
  readonly spawn: Spawn | null
}

export function hasWon(board: Board): boolean {
  return highestValue(board) >= WIN_VALUE
}

export function isGameOver(board: Board): boolean {
  return !canMove(board)
}

export function newGame(size: number = DEFAULT_BOARD_SIZE, rng: Rng = Math.random): GameState {
  let board = createEmptyBoard(size)
  for (let i = 0; i < START_CHIP_COUNT; i++) {
    const spawned = spawnChip(board, rng)
    if (!spawned) throw new Error('Board is too small for the start chips')
    board = spawned.board
  }
  return { size, board, score: 0, status: 'playing' }
}

export function move(state: GameState, direction: Direction, rng: Rng = Math.random): MoveOutcome {
  const unchanged: MoveOutcome = {
    state,
    moved: false,
    scoreGained: 0,
    moves: [],
    merges: [],
    spawn: null,
  }
  if (state.status !== 'playing') return unchanged

  const slid = slide(state.board, direction)
  if (!slid.moved) return unchanged

  const score = state.score + slid.scoreGained
  const common = { moved: true, scoreGained: slid.scoreGained, moves: slid.moves, merges: slid.merges }

  // Reaching the win chip ends the game right away, so no new chip spawns.
  if (hasWon(slid.board)) {
    return {
      ...common,
      state: { size: state.size, board: slid.board, score, status: 'won' },
      spawn: null,
    }
  }

  const spawned = spawnChip(slid.board, rng)
  const board = spawned ? spawned.board : slid.board
  return {
    ...common,
    state: { size: state.size, board, score, status: isGameOver(board) ? 'over' : 'playing' },
    spawn: spawned ? spawned.spawn : null,
  }
}
