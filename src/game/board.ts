import { MAX_BOARD_SIZE, MIN_BOARD_SIZE, SPAWN_FOUR_CHANCE } from './config'
import type { Board, Cell, Direction, Merge, Rng, SlideResult, Spawn, TileMove } from './types'

export function isValidBoardSize(size: number): boolean {
  return Number.isInteger(size) && size >= MIN_BOARD_SIZE && size <= MAX_BOARD_SIZE
}

export function createEmptyBoard(size: number): Board {
  if (!isValidBoardSize(size)) {
    throw new RangeError(
      `Board size must be an integer from ${MIN_BOARD_SIZE} to ${MAX_BOARD_SIZE}, got ${size}`,
    )
  }
  return Array.from({ length: size }, () => Array.from({ length: size }, () => 0))
}

function must<T>(value: T | undefined): T {
  if (value === undefined) throw new Error('Cell is outside of the board')
  return value
}

function valueAt(board: Board, cell: Cell): number {
  return must(must(board[cell.row])[cell.col])
}

/** The cells of one row or column, ordered from the edge the chips move towards. */
function linePositions(size: number, direction: Direction, index: number): Cell[] {
  const cells: Cell[] = []
  for (let step = 0; step < size; step++) {
    switch (direction) {
      case 'left':
        cells.push({ row: index, col: step })
        break
      case 'right':
        cells.push({ row: index, col: size - 1 - step })
        break
      case 'up':
        cells.push({ row: step, col: index })
        break
      case 'down':
        cells.push({ row: size - 1 - step, col: index })
        break
    }
  }
  return cells
}

interface Tile {
  readonly from: Cell
  readonly value: number
}

interface Slot {
  value: number
  readonly sources: Tile[]
}

/**
 * Slides all chips in one direction. Equal neighbours merge into one chip of double value.
 * A chip merges at most once per move, so [2, 2, 2, 2] becomes [4, 4, 0, 0] when sliding left.
 * The input board is never changed.
 */
export function slide(board: Board, direction: Direction): SlideResult {
  const size = board.length
  const next: number[][] = board.map((row) => row.map(() => 0))
  const moves: TileMove[] = []
  const merges: Merge[] = []
  let scoreGained = 0

  for (let index = 0; index < size; index++) {
    const cells = linePositions(size, direction, index)
    const slots: Slot[] = []

    for (const cell of cells) {
      const value = valueAt(board, cell)
      if (value === 0) continue
      const last = slots[slots.length - 1]
      if (last && last.value === value && last.sources.length === 1) {
        last.value = value * 2
        last.sources.push({ from: cell, value })
      } else {
        slots.push({ value, sources: [{ from: cell, value }] })
      }
    }

    slots.forEach((slot, slotIndex) => {
      const to = must(cells[slotIndex])
      must(next[to.row])[to.col] = slot.value
      const merged = slot.sources.length === 2
      if (merged) {
        scoreGained += slot.value
        merges.push({ cell: to, value: slot.value })
      }
      for (const source of slot.sources) {
        moves.push({ from: source.from, to, value: source.value, merged })
      }
    })
  }

  const moved = moves.some(
    (m) => m.merged || m.from.row !== m.to.row || m.from.col !== m.to.col,
  )
  return { board: moved ? next : board, moved, scoreGained, moves, merges }
}

export function getEmptyCells(board: Board): Cell[] {
  const cells: Cell[] = []
  board.forEach((line, row) => {
    line.forEach((value, col) => {
      if (value === 0) cells.push({ row, col })
    })
  })
  return cells
}

export function highestValue(board: Board): number {
  return Math.max(0, ...board.map((line) => Math.max(0, ...line)))
}

/** True when at least one move would change the board. */
export function canMove(board: Board): boolean {
  const size = board.length
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const value = valueAt(board, { row, col })
      if (value === 0) return true
      if (col + 1 < size && valueAt(board, { row, col: col + 1 }) === value) return true
      if (row + 1 < size && valueAt(board, { row: row + 1, col }) === value) return true
    }
  }
  return false
}

/**
 * Puts a new chip on a random empty cell. The value is 2 (90 percent) or 4 (10 percent).
 * The cell is drawn first, then the value. Returns null when the board is full.
 */
export function spawnChip(board: Board, rng: Rng): { board: Board; spawn: Spawn } | null {
  const empty = getEmptyCells(board)
  if (empty.length === 0) return null
  const pick = Math.min(Math.floor(rng() * empty.length), empty.length - 1)
  const cell = must(empty[pick])
  const value = rng() < SPAWN_FOUR_CHANCE ? 4 : 2
  const next: number[][] = board.map((line) => [...line])
  must(next[cell.row])[cell.col] = value
  return { board: next, spawn: { ...cell, value } }
}
