export interface PriceStats {
  median: number;
  min: number;
  max: number;
  n: number;
}

export interface BhkPriceData {
  buy?: PriceStats;
  rent?: PriceStats;
  psf?: number;
  buy_est?: { value: number; basis: string };
  rent_est?: { value: number; basis: string };
  flags?: Record<string, string>;
}

export interface YieldModel {
  pairs: number;
  city_yield: number;
  bhk_yield: Record<number, number>;
  locality_yield: Record<string, number>;
  log_price_rent_correlation: number | null;
}

const MIN_LOCALITY_PAIRS = 4;
const FAR = 8;
const MIN_PEERS = 5;

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function computeStats(values: number[]): PriceStats | null {
  const valid = values.filter((x) => typeof x === 'number' && !Number.isNaN(x) && x > 0);
  if (valid.length === 0) return null;
  valid.sort((a, b) => a - b);
  return {
    median: Math.round(median(valid)),
    min: Math.round(valid[0]),
    max: Math.round(valid[valid.length - 1]),
    n: valid.length,
  };
}

/**
 * Computes { [bhk]: { buy?: Stats, rent?: Stats, psf?: median } } from sample listings.
 */
export function listingStats(project: {
  sale_listings?: Array<{ bhk: number | null; price: number | null; psf?: number | null }>;
  rent_listings?: Array<{ bhk: number | null; price: number | null }>;
}): Record<number, BhkPriceData> {
  const out: Record<number, BhkPriceData> = {};

  const saleByBhk = new Map<number, typeof project.sale_listings>();
  for (const l of project.sale_listings || []) {
    if (l.bhk && l.price) {
      const list = saleByBhk.get(l.bhk) || [];
      list.push(l);
      saleByBhk.set(l.bhk, list);
    }
  }

  const rentByBhk = new Map<number, typeof project.rent_listings>();
  for (const l of project.rent_listings || []) {
    if (l.bhk && l.price) {
      const list = rentByBhk.get(l.bhk) || [];
      list.push(l);
      rentByBhk.set(l.bhk, list);
    }
  }

  const allBhks = new Set([...saleByBhk.keys(), ...rentByBhk.keys()]);
  for (const bhk of allBhks) {
    const data: BhkPriceData = {};
    const sales = saleByBhk.get(bhk);
    if (sales && sales.length > 0) {
      const buyPrices = sales.map((s) => s.price!).filter(Boolean);
      const buyStat = computeStats(buyPrices);
      if (buyStat) data.buy = buyStat;

      const psfs = sales.map((s) => s.psf).filter((p): p is number => typeof p === 'number' && p > 0);
      if (psfs.length > 0) {
        data.psf = Math.round(median(psfs));
      }
    }

    const rents = rentByBhk.get(bhk);
    if (rents && rents.length > 0) {
      const rentPrices = rents.map((r) => r.price!).filter(Boolean);
      const rentStat = computeStats(rentPrices);
      if (rentStat) data.rent = rentStat;
    }

    out[bhk] = data;
  }

  return out;
}

/**
 * Fits rental yield model across societies with both buy and rent medians for the same BHK.
 */
export function fitYields(
  societies: Array<{
    locality?: string | null;
    prices: Record<number | string, BhkPriceData>;
  }>
): YieldModel {
  interface YieldPair {
    locality?: string;
    bhk: number;
    y: number;
    buy: number;
    rent: number;
  }

  const pairs: YieldPair[] = [];

  for (const s of societies) {
    for (const [bhkKey, p] of Object.entries(s.prices)) {
      const bhk = parseInt(bhkKey, 10);
      if (p.buy && p.rent) {
        const y = (p.rent.median * 12) / p.buy.median;
        if (y > 0.005 && y < 0.12) {
          pairs.push({
            locality: s.locality || undefined,
            bhk,
            y,
            buy: p.buy.median,
            rent: p.rent.median,
          });
        }
      }
    }
  }

  const byLoc = new Map<string, number[]>();
  const byBhk = new Map<number, number[]>();

  for (const p of pairs) {
    if (p.locality) {
      const l = byLoc.get(p.locality) || [];
      l.push(p.y);
      byLoc.set(p.locality, l);
    }
    const b = byBhk.get(p.bhk) || [];
    b.push(p.y);
    byBhk.set(p.bhk, b);
  }

  const cityYield =
    pairs.length > 0
      ? Math.round(median(pairs.map((p) => p.y)) * 10000) / 10000
      : 0.03;

  let corr: number | null = null;
  if (pairs.length > 3) {
    const xs = pairs.map((p) => Math.log(p.buy));
    const ys = pairs.map((p) => Math.log(p.rent));
    const mx = xs.reduce((a, b) => a + b, 0) / xs.length;
    const my = ys.reduce((a, b) => a + b, 0) / ys.length;

    let cov = 0;
    let varX = 0;
    let varY = 0;
    for (let i = 0; i < xs.length; i++) {
      const dx = xs[i] - mx;
      const dy = ys[i] - my;
      cov += dx * dy;
      varX += dx * dx;
      varY += dy * dy;
    }
    const den = Math.sqrt(varX * varY);
    corr = den > 0 ? Math.round((cov / den) * 1000) / 1000 : null;
  }

  const bhk_yield: Record<number, number> = {};
  for (const [bhk, vals] of byBhk.entries()) {
    if (vals.length >= 3) {
      bhk_yield[bhk] = Math.round(median(vals) * 10000) / 10000;
    }
  }

  const locality_yield: Record<string, number> = {};
  for (const [loc, vals] of byLoc.entries()) {
    if (vals.length >= MIN_LOCALITY_PAIRS && loc) {
      locality_yield[loc] = Math.round(median(vals) * 10000) / 10000;
    }
  }

  return {
    pairs: pairs.length,
    city_yield: cityYield,
    bhk_yield,
    locality_yield,
    log_price_rent_correlation: corr,
  };
}

export function yieldFor(
  model: YieldModel,
  locality?: string | null,
  bhk?: number
): [number, string] {
  if (locality && model.locality_yield[locality]) {
    return [model.locality_yield[locality], `rental yield in ${locality}`];
  }
  if (bhk !== undefined && model.bhk_yield[bhk]) {
    return [model.bhk_yield[bhk], `city rental yield for ${bhk} BHK`];
  }
  return [model.city_yield, 'city rental yield'];
}

export function inr(v: number): string {
  if (v >= 1e7) {
    return `₹${(v / 1e7).toFixed(2)} Cr`;
  }
  if (v >= 1e5) {
    return `₹${(v / 1e5).toFixed(1)} L`;
  }
  return `₹${(v / 1e3).toFixed(0)}k`;
}

/**
 * Add p.flags = { buy | rent | buy_range | rent_range: reason } to price cells that look wrong.
 */
export function flagOutliers(
  societies: Array<{
    locality?: string | null;
    price_min?: number | null;
    price_max?: number | null;
    prices: Record<number | string, BhkPriceData>;
  }>
): number {
  const peers = new Map<string, number[]>();
  const psfMap = new Map<string, number[]>();

  const getPeerKey = (loc: string | null | undefined, bhk: number | string, kind: string) =>
    `${loc || '__city__'}_${bhk}_${kind}`;
  const getPsfKey = (loc: string | null | undefined) => loc || '__city__';

  for (const s of societies) {
    for (const [bhk, p] of Object.entries(s.prices)) {
      for (const kind of ['buy', 'rent'] as const) {
        if (p[kind]) {
          const locK = getPeerKey(s.locality, bhk, kind);
          const cityK = getPeerKey(null, bhk, kind);
          if (!peers.has(locK)) peers.set(locK, []);
          if (!peers.has(cityK)) peers.set(cityK, []);
          peers.get(locK)!.push(p[kind]!.median);
          peers.get(cityK)!.push(p[kind]!.median);
        }
      }
      if (p.psf) {
        const locK = getPsfKey(s.locality);
        const cityK = getPsfKey(null);
        if (!psfMap.has(locK)) psfMap.set(locK, []);
        if (!psfMap.has(cityK)) psfMap.set(cityK, []);
        psfMap.get(locK)!.push(p.psf);
        psfMap.get(cityK)!.push(p.psf);
      }
    }
  }

  function typicalPeer(
    loc: string | null | undefined,
    bhk: number | string,
    kind: string
  ): [number | null, string | null] {
    const locVals = peers.get(getPeerKey(loc, bhk, kind));
    if (locVals && locVals.length >= MIN_PEERS) {
      return [median(locVals), loc || 'the city'];
    }
    const cityVals = peers.get(getPeerKey(null, bhk, kind));
    if (cityVals && cityVals.length >= MIN_PEERS) {
      return [median(cityVals), 'the city'];
    }
    return [null, null];
  }

  function typicalPsf(loc: string | null | undefined): [number | null, string | null] {
    const locVals = psfMap.get(getPsfKey(loc));
    if (locVals && locVals.length >= MIN_PEERS) {
      return [median(locVals), loc || 'the city'];
    }
    const cityVals = psfMap.get(getPsfKey(null));
    if (cityVals && cityVals.length >= MIN_PEERS) {
      return [median(cityVals), 'the city'];
    }
    return [null, null];
  }

  function backed(
    s: { price_min?: number | null; price_max?: number | null },
    p: BhkPriceData,
    kind: 'buy' | 'rent',
    value: number
  ): boolean {
    const other = kind === 'buy' ? p.rent : p.buy;
    if (other) {
      const y =
        kind === 'rent'
          ? (value * 12) / other.median
          : (other.median * 12) / value;
      if (y >= 0.012 && y <= 0.06) return true;
    }
    const lo = s.price_min;
    const hi = s.price_max;
    return kind === 'buy' && !!lo && !!hi && lo * 0.6 <= value && value <= hi * 1.6;
  }

  let flaggedCount = 0;

  for (const s of societies) {
    const loc = s.locality;
    for (const [bhk, p] of Object.entries(s.prices)) {
      const flags: Record<string, string> = {};

      for (const [kind, word] of [
        ['buy', 'price'],
        ['rent', 'rent'],
      ] as const) {
        const st = p[kind];
        if (!st) continue;

        const [ref, where] = typicalPeer(loc, bhk, kind);
        if (
          ref !== null &&
          !(ref / FAR <= st.median && st.median <= ref * FAR) &&
          !backed(s, p, kind, st.median)
        ) {
          flags[kind] = `${inr(st.median)} is ${(st.median / ref).toFixed(1)}x the typical ${bhk} BHK ${word} in ${where} (${inr(ref)}); may be a listing typo, check the listing`;
        }

        if (st.n >= 2 && (st.max > st.median * FAR || st.min < st.median / FAR)) {
          flags[`${kind}_range`] =
            'some listings are far from the others (probably typos); the median is still usable';
        }
      }

      if (p.buy && p.rent && !flags.buy && !flags.rent) {
        const y = (p.rent.median * 12) / p.buy.median;
        if (y > 0.1) {
          flags.rent = `rent would be ${(y * 100).toFixed(0)}% of the price a year (usually 2 to 4%); the rent or price may be wrong`;
        } else if (y < 0.006) {
          flags.rent = `rent would be only ${(y * 100).toFixed(1)}% of the price a year (usually 2 to 4%); the rent or price may be wrong`;
        }
      }

      if (p.psf && !flags.buy) {
        const [ref, where] = typicalPsf(loc);
        if (ref !== null && !(ref / FAR <= p.psf && p.psf <= ref * FAR)) {
          flags.buy = `₹${p.psf.toLocaleString()}/sq ft is ${(p.psf / ref).toFixed(1)}x the typical in ${where} (₹${ref.toFixed(0)}); the price or the size may be mistyped`;
        }
      }

      if (Object.keys(flags).length > 0) {
        p.flags = flags;
        flaggedCount++;
      }
    }
  }

  return flaggedCount;
}

export function isUsable(p: BhkPriceData, kind: 'buy' | 'rent'): number | null {
  if (p[kind] && (!p.flags || !p.flags[kind]) && p[kind]!.median > 0) {
    return p[kind]!.median;
  }
  return null;
}

/**
 * Fill buy_est / rent_est for each BHK of a society that lacks listings.
 */
export function addEstimates(
  s: { locality?: string | null; prices: Record<number | string, BhkPriceData> },
  model: YieldModel,
  sizesByBhk: Record<number | string, number>,
  psfFallback?: number | null
): void {
  const allBhks = new Set([
    ...Object.keys(s.prices).map(Number),
    ...Object.keys(sizesByBhk).map(Number),
  ]);

  for (const bhk of allBhks) {
    if (!s.prices[bhk]) {
      s.prices[bhk] = {};
    }
    const p = s.prices[bhk];
    const [y, why] = yieldFor(model, s.locality, bhk);

    let buy = isUsable(p, 'buy');
    const rent = isUsable(p, 'rent');

    if (!buy && rent) {
      p.buy_est = {
        value: Math.round(((rent * 12) / y) / 10000) * 10000,
        basis: `rent ÷ ${why} (${(y * 100).toFixed(1)}%)`,
      };
      buy = p.buy_est.value;
    }

    if (!buy && sizesByBhk[bhk] && psfFallback) {
      const size = sizesByBhk[bhk];
      p.buy_est = {
        value: Math.round((size * psfFallback) / 10000) * 10000,
        basis: `${Math.round(size).toLocaleString()} sq ft × ₹${Math.round(psfFallback).toLocaleString()}/sq ft`,
      };
      buy = p.buy_est.value;
    }

    if (!rent && buy) {
      p.rent_est = {
        value: Math.round(((buy * y) / 12) / 100) * 100,
        basis: `price × ${why} (${(y * 100).toFixed(1)}%)`,
      };
    }

    if (Object.keys(p).length === 0) {
      delete s.prices[bhk];
    }
  }
}
