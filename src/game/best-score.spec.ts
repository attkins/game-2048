import { describe, expect, it } from 'vitest'
import { bestScoreKey, loadBestScore, saveBestScore, type KeyValueStorage } from './best-score'

function memoryStorage(initial: Record<string, string> = {}): KeyValueStorage & {
  data: Record<string, string>
} {
  const data = { ...initial }
  return {
    data,
    getItem: (key) => (key in data ? (data[key] as string) : null),
    setItem: (key, value) => {
      data[key] = value
    },
  }
}

const brokenStorage: KeyValueStorage = {
  getItem: () => {
    throw new Error('storage is not available')
  },
  setItem: () => {
    throw new Error('storage is not available')
  },
}

describe('best score', () => {
  it('is 0 when nothing is stored', () => {
    expect(loadBestScore(memoryStorage(), 4)).toBe(0)
  })

  it('is stored per board size', () => {
    const storage = memoryStorage()
    saveBestScore(storage, 4, 1200)
    saveBestScore(storage, 5, 300)
    expect(loadBestScore(storage, 4)).toBe(1200)
    expect(loadBestScore(storage, 5)).toBe(300)
    expect(loadBestScore(storage, 3)).toBe(0)
    expect(bestScoreKey(4)).not.toBe(bestScoreKey(5))
  })

  it('only changes when the new score is higher', () => {
    const storage = memoryStorage()
    expect(saveBestScore(storage, 4, 500)).toBe(500)
    expect(saveBestScore(storage, 4, 300)).toBe(500)
    expect(saveBestScore(storage, 4, 500)).toBe(500)
    expect(saveBestScore(storage, 4, 800)).toBe(800)
    expect(loadBestScore(storage, 4)).toBe(800)
  })

  it.each(['abc', '-5', '1.5', '', 'NaN'])('ignores the invalid stored value "%s"', (raw) => {
    const storage = memoryStorage({ [bestScoreKey(4)]: raw })
    expect(loadBestScore(storage, 4)).toBe(0)
    expect(saveBestScore(storage, 4, 40)).toBe(40)
  })

  it('works without a storage', () => {
    expect(loadBestScore(null, 4)).toBe(0)
    expect(saveBestScore(undefined, 4, 100)).toBe(0)
  })

  it('survives a storage that throws', () => {
    expect(loadBestScore(brokenStorage, 4)).toBe(0)
    expect(saveBestScore(brokenStorage, 4, 100)).toBe(0)
  })

  it('ignores invalid board sizes and scores', () => {
    const storage = memoryStorage()
    expect(saveBestScore(storage, 9, 100)).toBe(0)
    expect(saveBestScore(storage, 4, Number.NaN)).toBe(0)
    expect(saveBestScore(storage, 4, 1.5)).toBe(0)
    expect(storage.data).toEqual({})
  })
})
