/**
 * Growth projection utility — pure client-side math, no backend call.
 * Uses standard compound growth formula: FV = PV * (1 + r/12)^(12*n)
 * with monthly contributions using the future value of an annuity formula.
 */

export interface ProjectionDataPoint {
  year: number;
  conservative: number;
  expected: number;
  optimistic: number;
}

// Annual return rate assumptions (decimal)
const RATES = {
  conservative: 0.06, // 6% p.a.
  expected: 0.10,     // 10% p.a.
  optimistic: 0.14,   // 14% p.a.
};

/**
 * Compute the future value of regular monthly contributions.
 * FV = PMT * [((1 + r)^n - 1) / r]
 * where r = monthly rate, n = total months
 */
function futureValue(monthlyContribution: number, annualRate: number, years: number): number {
  if (annualRate === 0) return monthlyContribution * 12 * years;
  const r = annualRate / 12;
  const n = years * 12;
  return monthlyContribution * ((Math.pow(1 + r, n) - 1) / r);
}

/**
 * Returns an array of data points for each year from 1 to horizonYears.
 * @param monthlyAmount - INR amount invested per month
 * @param horizonYears - projection horizon (1–10 years typically)
 */
export function computeProjections(
  monthlyAmount: number,
  horizonYears: number
): ProjectionDataPoint[] {
  const points: ProjectionDataPoint[] = [];
  for (let year = 1; year <= horizonYears; year++) {
    points.push({
      year,
      conservative: Math.round(futureValue(monthlyAmount, RATES.conservative, year)),
      expected: Math.round(futureValue(monthlyAmount, RATES.expected, year)),
      optimistic: Math.round(futureValue(monthlyAmount, RATES.optimistic, year)),
    });
  }
  return points;
}
