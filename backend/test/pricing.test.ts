import { describe, expect, it } from 'bun:test';
import {
  listingStats,
  fitYields,
  flagOutliers,
  addEstimates,
  type BhkPriceData,
} from '../src/scraper/build/pricing';

function soc(loc: string, prices: Record<number, BhkPriceData>) {
  return { locality: loc, prices };
}

describe('Pricing Model', () => {
  it('listingStats computes median per BHK', () => {
    const p = {
      sale_listings: [
        { bhk: 3, price: 2e7, psf: 10000 },
        { bhk: 3, price: 3e7, psf: 12000 },
        { bhk: 2, price: 1e7 },
      ],
      rent_listings: [{ bhk: 3, price: 60000 }],
    };

    const st = listingStats(p);
    expect(st[3].buy).toEqual({ median: 25000000, min: 20000000, max: 30000000, n: 2 });
    expect(st[3].psf).toBe(11000);
    expect(st[3].rent?.median).toBe(60000);
    expect(st[2].rent).toBeUndefined();
  });

  it('yield model drops mistakes and uses locality', () => {
    const socs: Array<{ locality: string; prices: Record<number, BhkPriceData> }> = [];
    for (let i = 0; i < 4; i++) {
      socs.push(
        soc('Sector 62', {
          3: {
            buy: { median: 3e7, min: 3e7, max: 3e7, n: 1 },
            rent: { median: 75000, min: 75000, max: 75000, n: 1 },
          },
        })
      );
    }
    // yearly typed as monthly: 900,000 / 30,000,000 = 0.03 * 12 = 0.36 -> > 0.12, should be dropped
    socs.push(
      soc('Sector 62', {
        3: {
          buy: { median: 3e7, min: 3e7, max: 3e7, n: 1 },
          rent: { median: 900000, min: 900000, max: 900000, n: 1 },
        },
      })
    );

    const m = fitYields(socs);
    expect(m.pairs).toBe(4);
    expect(m.locality_yield['Sector 62']).toBe(0.03);
  });

  it('estimates are labelled and never replace listings', () => {
    const m = {
      pairs: 10,
      city_yield: 0.03,
      bhk_yield: {},
      locality_yield: {},
      log_price_rent_correlation: null,
    };
    const s = soc('Sector 99', {
      3: { buy: { median: 2e7, min: 2e7, max: 2e7, n: 1 } },
      2: { rent: { median: 40000, min: 40000, max: 40000, n: 1 } },
    });

    addEstimates(s, m, { 4: 3000 }, 10000);
    expect(s.prices[3].buy?.median).toBe(2e7);
    expect(s.prices[3].rent_est?.value).toBe(50000);
    expect(s.prices[2].buy_est?.value).toBe(16000000);
    expect(s.prices[2].buy_est?.basis).toContain('rent');
    expect(s.prices[4].buy_est?.value).toBe(30000000);
    expect(s.prices[4].rent_est?.value).toBe(75000);
  });

  it('flags typos but keeps values and skips them for estimates', () => {
    const socs: Array<{ locality: string; prices: Record<number, BhkPriceData> }> = [];
    for (let i = 0; i < 5; i++) {
      socs.push(
        soc('Sector 57', {
          3: {
            buy: { median: 4e7, min: 4e7, max: 4e7, n: 2 },
            rent: { median: 90000, min: 90000, max: 90000, n: 1 },
          },
        })
      );
    }
    const bad = soc('Sector 57', {
      3: {
        buy: { median: 4.1e7, min: 3.7e7, max: 3.9e8, n: 4 },
        rent: { median: 960000, min: 960000, max: 960000, n: 1 },
      },
    });
    socs.push(bad);

    expect(flagOutliers(socs)).toBe(1);
    const p = bad.prices[3];
    expect(p.rent?.median).toBe(960000);
    expect(p.flags?.rent).toBeDefined();
    expect(p.flags?.rent).toContain('10.7x');
    expect(p.flags?.buy_range).toBeDefined();
    expect(p.flags?.buy).toBeUndefined();

    addEstimates(
      bad,
      {
        pairs: 10,
        city_yield: 0.03,
        bhk_yield: {},
        locality_yield: {},
        log_price_rent_correlation: null,
      },
      {},
      null
    );
    expect(p.rent_est?.value).toBe(102500); // estimated from the price, ignoring flagged rent
  });

  it('luxury price backed by builder range is not flagged', () => {
    const socs: Array<{
      locality: string;
      price_min?: number;
      price_max?: number;
      prices: Record<number, BhkPriceData>;
    }> = [];
    for (let i = 0; i < 5; i++) {
      socs.push(
        soc('Sector 65', {
          4: { buy: { median: 3e7, min: 3e7, max: 3e7, n: 1 } },
        })
      );
    }
    const lux = {
      locality: 'Sector 65',
      price_min: 2e8,
      price_max: 4e8,
      prices: {
        4: { buy: { median: 3e8, min: 3e8, max: 3e8, n: 1 } },
      },
    };
    socs.push(lux);

    expect(flagOutliers(socs)).toBe(0);
  });
});
