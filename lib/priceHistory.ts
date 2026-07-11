// Deterministic mock price history — this app has no real market data feed,
// so charts are derived from each holding's own avgReturn/volatility via a
// seeded random walk. Seeding on the ticker means the same stock renders an
// identical shape everywhere (sparkline, detail chart) on every render.

export interface PricePoint {
  index: number;
  price: number;
}

function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generates a `points`-long random walk seeded by `ticker`, drifted by
 * `avgReturn`/`volatility` (annualized decimals), and rescaled so the final
 * point lands exactly on `endPrice` — i.e. "here's how it plausibly got to
 * today's price."
 */
export function generatePriceSeries(
  ticker: string,
  avgReturn: number,
  volatility: number,
  endPrice: number,
  points = 30
): PricePoint[] {
  const rand = mulberry32(hashSeed(ticker));
  const dailyDrift = avgReturn / 252;
  const dailyVol = Math.max(volatility, 0.05) / Math.sqrt(252);

  const cumulative: number[] = [];
  let running = 0;
  for (let i = 0; i < points; i++) {
    const shock = (rand() - 0.5) * 2;
    running += dailyDrift + shock * dailyVol;
    cumulative.push(running);
  }

  const finalCumulative = cumulative[cumulative.length - 1] ?? 0;
  return cumulative.map((c, i) => ({
    index: i,
    price: Math.max(0.01, endPrice * (1 + (c - finalCumulative))),
  }));
}

export function seriesChangePercent(series: PricePoint[]): number {
  if (series.length < 2) return 0;
  const first = series[0].price;
  const last = series[series.length - 1].price;
  if (first <= 0) return 0;
  return (last - first) / first;
}
