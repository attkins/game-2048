export type Direction = 'up' | 'down' | 'left' | 'right'

/** A square grid of chip values. 0 means an empty cell. */
export type Board = readonly (readonly number[])[]

/** Returns a number in [0, 1), like Math.random. Injected so tests can be deterministic. */
export type Rng = () => number

export interface Cell {
  readonly row: number
  readonly col: number
}

/**
 * One chip that took part in a move. The renderer uses this to animate the slide.
 * `value` is the value before the move. When `merged` is true, another chip ends up on the
 * same target cell and both become one chip of double value.
 */
export interface TileMove {
  readonly from: Cell
  readonly to: Cell
  readonly value: number
  readonly merged: boolean
}

/** A merge that happened during a move. `value` is the value of the new chip. */
export interface Merge {
  readonly cell: Cell
  readonly value: number
}

export interface Spawn extends Cell {
  readonly value: number
}

export interface SlideResult {
  /** The board after the move. This is the very same board object when nothing moved. */
  readonly board: Board
  readonly moved: boolean
  readonly scoreGained: number
  readonly moves: readonly TileMove[]
  readonly merges: readonly Merge[]
}
