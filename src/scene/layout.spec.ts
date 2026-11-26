import { describe, expect, it } from 'vitest'
import { CELL_SIZE, boardWidth, cellCenter, cellPitch } from './layout'

const SIZES = [3, 4, 5, 6]

describe('boardWidth', () => {
  it('grows with the number of cells', () => {
    const widths = SIZES.map(boardWidth)
    expect([...widths].sort((a, b) => a - b)).toEqual(widths)
    expect(new Set(widths).size).toBe(SIZES.length)
  })
})

describe('cellCenter', () => {
  it.each(SIZES)('is symmetric around the middle of a board of size %i', (size) => {
    const first = cellCenter(size, 0, 0)
    const last = cellCenter(size, size - 1, size - 1)
    expect(first.x).toBeCloseTo(-last.x)
    expect(first.z).toBeCloseTo(-last.z)
  })

  it.each(SIZES)('puts row 0 on the far side and column 0 on the left of a board of size %i', (size) => {
    expect(cellCenter(size, 0, 0).z).toBeLessThan(0)
    expect(cellCenter(size, 0, 0).x).toBeLessThan(0)
    expect(cellCenter(size, size - 1, size - 1).z).toBeGreaterThan(0)
  })

  it('puts the single middle cell of an odd board in the center', () => {
    expect(cellCenter(3, 1, 1)).toEqual({ x: 0, z: 0 })
  })

  it('keeps neighbouring cells one pitch apart', () => {
    expect(cellCenter(4, 2, 3).x - cellCenter(4, 2, 2).x).toBeCloseTo(cellPitch())
    expect(cellCenter(4, 3, 1).z - cellCenter(4, 2, 1).z).toBeCloseTo(cellPitch())
  })

  it.each(SIZES)('keeps all cells inside the board of size %i', (size) => {
    const edge = cellCenter(size, size - 1, size - 1).x + CELL_SIZE / 2
    expect(edge).toBeLessThan(boardWidth(size) / 2)
  })
})
