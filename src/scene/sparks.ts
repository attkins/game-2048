// The math of the spark burst that plays when two chips merge (V5, D-017). No Three.js here, so it
// can be tested in plain Node. The scene turns these numbers into small meshes.

/** Returns a number in [0, 1), like Math.random. */
type Random = () => number

export interface Spark {
  /** Start velocity in board units per second. */
  readonly vx: number
  readonly vy: number
  readonly vz: number
  /** Radius of the spark in board units. */
  readonly size: number
  /** Which of the two colors of the burst the spark uses. */
  readonly tint: 0 | 1
}

export const SPARK_COUNT = 10
/** Pull towards the board in board units per second squared. */
export const SPARK_GRAVITY = 9

/** Sparks fly out evenly around the chip with a little jitter, and always upwards first. */
export function createSparks(random: Random, count: number = SPARK_COUNT): Spark[] {
  return Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2 + (random() - 0.5) * 0.6
    const outward = 1.3 + random() * 0.9
    return {
      vx: Math.cos(angle) * outward,
      vy: 2.2 + random() * 1.4,
      vz: Math.sin(angle) * outward,
      size: 0.045 + random() * 0.04,
      tint: index % 2 === 0 ? 0 : 1,
    }
  })
}

/** Offset of a spark from where the burst started, after `seconds` of flight. */
export function sparkOffset(spark: Spark, seconds: number): { x: number; y: number; z: number } {
  return {
    x: spark.vx * seconds,
    y: spark.vy * seconds - 0.5 * SPARK_GRAVITY * seconds * seconds,
    z: spark.vz * seconds,
  }
}

/** Size factor over the flight: full size at first, shrinking to nothing at the end. progress is 0 to 1. */
export function sparkScale(progress: number): number {
  const t = Math.min(Math.max(progress, 0), 1)
  return 1 - t * t
}
