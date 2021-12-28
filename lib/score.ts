import Decimal from "decimal.js-light";

type ValueWithBounds = {
  lower: number;
  upper: number;
  value: number;
}

/**
 * Clamp a value between the bounds
 * @param lower Lower bound
 * @param upper Upper bound
 * @param score Score to clamp
 * @returns The score if it's between the bounds, else one of the bounds
 */
const clampScore = ({lower, upper, value}: ValueWithBounds): number => {
  const maxWithLower = Math.max(lower, value);
  const minWithUpper = Math.min(upper, maxWithLower);
  return minWithUpper;
}

/**
 * Normalise a value as a score in the range 0 < n <= 1
 * @param lower Lower bound
 * @param upper Upper bound
 * @param score Score to normalise
 * @returns A normalised score, higher if value is closer to the lower bound
 */
const normaliseScore = ({lower, upper, value}: ValueWithBounds): number => {
  const clamped = clampScore({lower, upper, value});
  // Normalise between 0-1, lower clamped = higher score
  const normalised = (upper - clamped) / (upper - lower);
  // don't return 0
  return Math.max(normalised, 0.01);
}

export type ScoreInput = {
  paceLowerBound: number;
  paceUpperBound: number;
  hrLowerBound: number;
  hrUpperBound: number;
  averagePace: number;
  averageHeartRate: number;
}

/**
 * Get the score for a given run based on its pace (mins/km) and average HR
 * @param paceLowerBound Lower bound for pace
 * @param paceUpperBound Upper bound for pace
 * @param hrLowerBound Lower bound for heart rate
 * @param hrUpperBound Upper bound for heart rate
 * @param averagePace Average pace of the run (mins/km)
 * @param averageHeartRate Average HR of the run (bpm)
 * @returns A score for the run in the range 0 < x <= 1
 * Note that lower pace and lower HR => higher score
 */
export const scoreRun = ({
  paceLowerBound,
  paceUpperBound,
  hrLowerBound,
  hrUpperBound,
  averagePace,
  averageHeartRate,
}: ScoreInput): number => {
  const paceScore = normaliseScore({
    lower: paceLowerBound, 
    upper: paceUpperBound, 
    value: averagePace,
  });
  const hrScore = normaliseScore({
    lower: hrLowerBound,
    upper: hrUpperBound,
    value: averageHeartRate,
  });
  return paceScore * hrScore;
}
