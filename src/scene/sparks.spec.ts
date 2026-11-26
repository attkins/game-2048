import { describe, expect, it } from 'vitest'
import { SPARK_COUNT, createSparks, sparkOffset, sparkScale } from './sparks'

/** A deterministic random source that walks through a fixed list of values. */
function sequence(values: number[]): () => number {
  let index = 0
  return () => values[index++ % values.length] ?? 0
}

describe('createSparks', () => {
  it('creates the default number of sparks', () => {
    expect(createSparks(() => 0.5)).toHaveLength(SPARK_COUNT)
  })

  it('creates the requested number of sparks', () => {
    expect(createSparks(() => 0.5, 4)).toHaveLength(4)
  })

  it('throws every spark upwards', () => {
    const sparks = createSparks(sequence([0, 0.3, 0.7, 0.99]))
    expect(sparks.every((spark) => spark.vy > 0)).toBe(true)
  })

  it('spreads the sparks around in all directions', () => {
    const sparks = createSparks(() => 0.5)
    expect(sparks.some((spark) => spark.vx > 0.5)).toBe(true)
    expect(sparks.some((spark) => spark.vx < -0.5)).toBe(true)
    expect(sparks.some((spark) => spark.vz > 0.5)).toBe(true)
    expect(sparks.some((spark) => spark.vz < -0.5)).toBe(true)
  })

  it('alternates between the two colors', () => {
    const sparks = createSparks(() => 0.5, 4)
    expect(sparks.map((spark) => spark.tint)).toEqual([0, 1, 0, 1])
  })

  it('scales the speed with the power', () => {
    const normal = createSparks(() => 0.5, 3)
    const strong = createSparks(() => 0.5, 3, 2)
    strong.forEach((spark, index) => {
      expect(spark.vy).toBeCloseTo((normal[index]?.vy ?? 0) * 2)
      expect(spark.vx).toBeCloseTo((normal[index]?.vx ?? 0) * 2)
    })
  })

  it('takes turns in as many colors as asked for', () => {
    const sparks = createSparks(() => 0.5, 7, 1, 3)
    expect(sparks.map((spark) => spark.tint)).toEqual([0, 1, 2, 0, 1, 2, 0])
  })

  it('keeps every spark small', () => {
    const sparks = createSparks(sequence([0, 1 - Number.EPSILON]))
    expect(sparks.every((spark) => spark.size > 0.04 && spark.size < 0.1)).toBe(true)
  })
})

describe('sparkOffset', () => {
  const spark = { vx: 1, vy: 3, vz: -2, size: 0.05, tint: 0 } as const

  it('starts at the origin', () => {
    const start = sparkOffset(spark, 0)
    expect(start.x).toBeCloseTo(0)
    expect(start.y).toBeCloseTo(0)
    expect(start.z).toBeCloseTo(0)
  })

  it('moves straight sideways and bends down with gravity', () => {
    const early = sparkOffset(spark, 0.1)
    const late = sparkOffset(spark, 0.5)
    expect(late.x).toBeCloseTo(0.5)
    expect(late.z).toBeCloseTo(-1)
    expect(early.y).toBeGreaterThan(0)
    expect(late.y).toBeLessThan(early.y * 5)
  })
})

describe('sparkScale', () => {
  it('shrinks from full size to nothing', () => {
    expect(sparkScale(0)).toBe(1)
    expect(sparkScale(1)).toBe(0)
    expect(sparkScale(0.5)).toBeCloseTo(0.75)
  })

  it('clamps progress outside 0 to 1', () => {
    expect(sparkScale(-1)).toBe(1)
    expect(sparkScale(2)).toBe(0)
  })
})
