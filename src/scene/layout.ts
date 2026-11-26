// Sizes of the toy board in world units. No Three.js in here, so the math can be unit tested.
// The board lies in the x/z plane with y pointing up. Row 0 is the far side of the board.

export const CELL_SIZE = 1
export const CELL_GAP = 0.14
export const BOARD_PADDING = 0.24

/** Depth of the recessed cells, which is also the height of the wooden frame above the cell floor. */
export const SLOT_DEPTH = 0.14

/** Height of the wooden base below the cell floor. */
export const BASE_HEIGHT = 0.3

export function cellPitch(): number {
  return CELL_SIZE + CELL_GAP
}

export function boardWidth(size: number): number {
  return size * CELL_SIZE + (size - 1) * CELL_GAP + 2 * BOARD_PADDING
}

/** Center of a cell on the board plane. */
export function cellCenter(size: number, row: number, col: number): { x: number; z: number } {
  const offset = (size - 1) / 2
  return { x: (col - offset) * cellPitch(), z: (row - offset) * cellPitch() }
}
