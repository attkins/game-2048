// Fixed rules of the game. See docs/concept.md, section 2.

export const MIN_BOARD_SIZE = 3
export const MAX_BOARD_SIZE = 6
export const DEFAULT_BOARD_SIZE = 4

/** Reaching this chip ends the game with a win (D-011, D-013). */
export const WIN_VALUE = 2048

/** Chance that a spawned chip is a 4 instead of a 2. */
export const SPAWN_FOUR_CHANCE = 0.1

/** Number of chips on the board when a new game starts. */
export const START_CHIP_COUNT = 2
