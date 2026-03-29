/**
 * Static pension system data for the /mirovine page.
 * Sources: HZMO annual reports, DZS census data, Eurostat.
 */

/** National worker-to-pensioner ratio trend (HZMO data) */
export const PENSION_HISTORY = [
  { godina: 1991, omjer: 2.59 },
  { godina: 2001, omjer: 1.68 },
  { godina: 2011, omjer: 1.28 },
  { godina: 2021, omjer: 1.18 },
];

/** Current national average */
export const NATIONAL_RATIO = 1.18;

/** EU average for comparison (Eurostat, ~2021) */
export const EU_AVERAGE_RATIO = 1.85;

/** Projected national ratios by scenario (aligned with projectionData.js scenarios) */
const NATIONAL_PROJECTIONS = [
  // Scenario 0: Eurostat baseline
  { godina: 2025, omjer: 1.14 },
  { godina: 2030, omjer: 1.05 },
  { godina: 2035, omjer: 0.95 },
  { godina: 2040, omjer: 0.87 },
  { godina: 2050, omjer: 0.75 },
];

/**
 * Calculate projected worker-to-pensioner ratio for a county at a given year.
 * Uses the county's current ratio and scales it by the national projection trend.
 */
export function getCountyProjection(countyRatio, targetYear) {
  if (targetYear <= 2021) return countyRatio;

  // Linear interpolation between known projection points
  const points = NATIONAL_PROJECTIONS;
  let factor = 1;

  if (targetYear >= 2050) {
    factor = points[points.length - 1].omjer / NATIONAL_RATIO;
  } else {
    // Find bracketing points
    for (let i = 0; i < points.length - 1; i++) {
      if (targetYear >= points[i].godina && targetYear <= points[i + 1].godina) {
        const t = (targetYear - points[i].godina) / (points[i + 1].godina - points[i].godina);
        const interpolated = points[i].omjer + t * (points[i + 1].omjer - points[i].omjer);
        factor = interpolated / NATIONAL_RATIO;
        break;
      }
    }
    // Before first projection point
    if (targetYear < points[0].godina) {
      const t = (targetYear - 2021) / (points[0].godina - 2021);
      const interpolated = NATIONAL_RATIO + t * (points[0].omjer - NATIONAL_RATIO);
      factor = interpolated / NATIONAL_RATIO;
    }
  }

  return Math.max(0.3, countyRatio * factor);
}

/**
 * Calculate retirement projection for the personal calculator.
 * @param {number} age - User's current age (20-60)
 * @param {number} countyRatio - Current worker-to-pensioner ratio for the county
 * @returns {{ retirementYear: number, projectedRatio: number, currentRatio: number }}
 */
export function calculateRetirementProjection(age, countyRatio) {
  const currentYear = 2026;
  const retirementAge = 65;
  const retirementYear = currentYear + (retirementAge - age);

  const projectedRatio = getCountyProjection(countyRatio, retirementYear);

  return {
    retirementYear,
    projectedRatio: Math.round(projectedRatio * 100) / 100,
    currentRatio: countyRatio,
  };
}

/** County-level projected ratios for the detail panel (2011, 2021, 2035) */
export function getCountyTrend(countyRatio) {
  // Estimate 2011 ratio by reversing the national trend
  const factor2011 = 1.28 / NATIONAL_RATIO;
  const ratio2011 = Math.round(countyRatio * factor2011 * 100) / 100;
  const ratio2035 = Math.round(getCountyProjection(countyRatio, 2035) * 100) / 100;

  return {
    ratio2011,
    ratio2021: countyRatio,
    ratio2035,
  };
}
