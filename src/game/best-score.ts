import { isValidBoardSize } from './board'

/** The part of localStorage that the game needs. Tests pass in a simple fake. */
export interface KeyValueStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export function bestScoreKey(size: number): string {
  return `game-2048.best-score.${size}`
}

/**
 * Reads the best score of one board size. Returns 0 when nothing is stored, the stored value
 * is not a valid score or the storage is not available (for example in private browsing).
 */
export function loadBestScore(storage: KeyValueStorage | null | undefined, size: number): number {
  if (!storage || !isValidBoardSize(size)) return 0
  try {
    const raw = storage.getItem(bestScoreKey(size))
    if (raw === null) return 0
    const value = Number(raw)
    return Number.isSafeInteger(value) && value > 0 ? value : 0
  } catch {
    return 0
  }
}

/** Stores the score when it beats the stored best. Returns the best score afterwards. */
export function saveBestScore(
  storage: KeyValueStorage | null | undefined,
  size: number,
  score: number,
): number {
  const best = loadBestScore(storage, size)
  if (!storage || !isValidBoardSize(size) || !Number.isSafeInteger(score) || score <= best) {
    return best
  }
  try {
    storage.setItem(bestScoreKey(size), String(score))
    return score
  } catch {
    return best
  }
}
