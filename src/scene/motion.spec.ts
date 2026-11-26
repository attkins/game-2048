import { describe, expect, it, vi } from 'vitest'
import { Timeline, easeOutBack, easeOutBounce, easeOutCubic, squashAmount } from './motion'

describe('easing curves', () => {
  it.each([
    ['easeOutCubic', easeOutCubic],
    ['easeOutBack', easeOutBack],
    ['easeOutBounce', easeOutBounce],
  ])('%s starts at 0 and ends at 1', (_name, easing) => {
    expect(easing(0)).toBeCloseTo(0)
    expect(easing(1)).toBeCloseTo(1)
  })

  it('easeOutCubic never goes backwards', () => {
    let previous = 0
    for (let i = 1; i <= 20; i++) {
      const value = easeOutCubic(i / 20)
      expect(value).toBeGreaterThanOrEqual(previous)
      previous = value
    }
  })

  it('easeOutBack overshoots before it settles', () => {
    expect(Math.max(...Array.from({ length: 20 }, (_, i) => easeOutBack((i + 1) / 20)))).toBeGreaterThan(1)
  })

  it('easeOutBounce stays inside 0 and 1', () => {
    for (let i = 0; i <= 50; i++) {
      const value = easeOutBounce(i / 50)
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThanOrEqual(1)
    }
  })
})

describe('squashAmount', () => {
  it('is relaxed at the start and at the end', () => {
    expect(squashAmount(0, 0.2)).toBe(1)
    expect(squashAmount(1, 0.2)).toBe(1)
  })

  it('presses the chip flatter in between, by at most the strength', () => {
    const middle = squashAmount(0.4, 0.2)
    expect(middle).toBeLessThan(1)
    expect(middle).toBeGreaterThanOrEqual(0.8)
  })

  it('clamps progress outside 0 to 1', () => {
    expect(squashAmount(-3, 0.2)).toBe(1)
    expect(squashAmount(7, 0.2)).toBe(1)
  })
})

describe('Timeline', () => {
  it('runs a tween and ends with progress 1 and the done callback', () => {
    const timeline = new Timeline()
    const update = vi.fn()
    const done = vi.fn()
    timeline.add({ delay: 0, duration: 100, update, done })

    timeline.tick(50)
    expect(update).toHaveBeenLastCalledWith(0.5)
    expect(done).not.toHaveBeenCalled()
    expect(timeline.busy).toBe(true)

    timeline.tick(80)
    expect(update).toHaveBeenLastCalledWith(1)
    expect(done).toHaveBeenCalledTimes(1)
    expect(timeline.busy).toBe(false)
  })

  it('waits for the delay before it updates', () => {
    const timeline = new Timeline()
    const update = vi.fn()
    timeline.add({ delay: 100, duration: 100, update })

    timeline.tick(60)
    expect(update).not.toHaveBeenCalled()
    timeline.tick(90)
    expect(update).toHaveBeenLastCalledWith(0.5)
  })

  it('finishes a tween with zero duration on the first tick', () => {
    const timeline = new Timeline()
    const update = vi.fn()
    timeline.add({ delay: 0, duration: 0, update })
    timeline.tick(1)
    expect(update).toHaveBeenCalledWith(1)
    expect(timeline.busy).toBe(false)
  })

  it('keeps a tween that is added from a done callback', () => {
    const timeline = new Timeline()
    const second = vi.fn()
    timeline.add({
      delay: 0,
      duration: 10,
      update: () => {},
      done: () => timeline.add({ delay: 0, duration: 10, update: second }),
    })

    timeline.tick(10)
    expect(timeline.busy).toBe(true)
    timeline.tick(10)
    expect(second).toHaveBeenLastCalledWith(1)
    expect(timeline.busy).toBe(false)
  })

  it('finishAll runs every tween to its end, including chained ones', () => {
    const timeline = new Timeline()
    const first = vi.fn()
    const second = vi.fn()
    timeline.add({
      delay: 500,
      duration: 500,
      update: first,
      done: () => timeline.add({ delay: 200, duration: 200, update: second }),
    })

    timeline.finishAll()
    expect(first).toHaveBeenLastCalledWith(1)
    expect(second).toHaveBeenLastCalledWith(1)
    expect(timeline.busy).toBe(false)
  })
})
