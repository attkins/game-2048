// Easing curves and a tiny timeline for the chip animations. Pure math without Three.js or the DOM,
// so it can be tested in plain Node.

export type Easing = (t: number) => number

export const easeOutCubic: Easing = (t) => 1 - Math.pow(1 - t, 3)

/** Overshoots the target a little and settles back. Good for a chip that pops up. */
export const easeOutBack: Easing = (t) => {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

/** Falls to 1 and bounces a few times, like a chip dropped on the board. */
export const easeOutBounce: Easing = (t) => {
  const n1 = 7.5625
  const d1 = 2.75
  if (t < 1 / d1) return n1 * t * t
  if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75
  if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375
  return n1 * (t -= 2.625 / d1) * t + 0.984375
}

/**
 * How much a chip is squashed while it lands. Returns 1 for a relaxed chip, below 1 while the chip
 * is pressed flat. `progress` runs from 0 to 1 over the squash time and is clamped to that range.
 */
export function squashAmount(progress: number, strength: number): number {
  const t = Math.min(Math.max(progress, 0), 1)
  return 1 - strength * Math.sin(Math.PI * t) * (1 - t)
}

export interface Tween {
  /** Milliseconds to wait before the tween starts. */
  readonly delay: number
  /** Milliseconds the tween runs. 0 jumps straight to the end. */
  readonly duration: number
  /** Called with a progress from 0 to 1. Always called with exactly 1 at the end. */
  readonly update: (progress: number) => void
  /** Called once after the last update. */
  readonly done?: () => void
}

interface RunningTween {
  readonly tween: Tween
  elapsed: number
}

/** Runs tweens side by side. The scene advances it once per frame. */
export class Timeline {
  private running: RunningTween[] = []

  get busy(): boolean {
    return this.running.length > 0
  }

  add(tween: Tween): void {
    this.running.push({ tween, elapsed: 0 })
  }

  /** Advances every tween by `deltaMs`. Finished tweens are dropped, tweens added by `done` keep going. */
  tick(deltaMs: number): void {
    const current = this.running
    this.running = []
    const unfinished: RunningTween[] = []
    for (const item of current) {
      item.elapsed += deltaMs
      const local = item.elapsed - item.tween.delay
      if (local < 0) {
        unfinished.push(item)
        continue
      }
      const progress = item.tween.duration <= 0 ? 1 : Math.min(local / item.tween.duration, 1)
      item.tween.update(progress)
      if (progress >= 1) item.tween.done?.()
      else unfinished.push(item)
    }
    this.running = [...unfinished, ...this.running]
  }

  /** Jumps every tween to its end, including tweens that `done` adds on the way. Used for the next move and for restart. */
  finishAll(): void {
    // The limit guards against a chain of tweens that never ends.
    for (let guard = 0; this.running.length > 0 && guard < 100; guard++) {
      this.tick(Number.POSITIVE_INFINITY)
    }
    this.running = []
  }
}
