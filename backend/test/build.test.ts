import { describe, expect, it } from 'bun:test';
import { dedupe, kindOf } from '../src/scraper/build/dedupe';
import { calculateNearby } from '../src/scraper/build/nearby';
import { calculateScore } from '../src/scraper/build/score';

describe('Build Logic: Dedupe, KindOf, Nearby, Score', () => {
  it('dedupe merges phases close by', () => {
    const a: { name: string; lng: number; lat: number; url: string; merged?: string[] } = {
      name: 'Heritage One',
      lng: 77.089,
      lat: 28.4034,
      url: 'a',
    };
    const b: { name: string; lng: number; lat: number; url: string; merged?: string[] } = {
      name: 'Heritage One',
      lng: 77.0891,
      lat: 28.4021,
      url: 'b',
    };
    const c: { name: string; lng: number; lat: number; url: string; merged?: string[] } = {
      name: 'Heritage One',
      lng: 77.2,
      lat: 28.5,
      url: 'c',
    };

    const out = dedupe([a, b, c]);
    expect(out.length).toBe(2);
    expect(out[0].merged).toEqual(['b']);
  });

  it('kindOf detects apartment, plot, villa correctly from text', () => {
    expect(kindOf({ config_text: '2, 3, 4 BHK Multistorey Apartments' })).toBe('apartment');
    expect(kindOf({ config_text: 'Residential Plot' })).toBe('plot');
    expect(kindOf({ config_text: '4 BHK Villa' })).toBe('villa');
  });

  it('kindOf infers from unit codes when text is missing', () => {
    expect(kindOf({ configs: { units: [{ kind: '10000' }] } })).toBe('plot');
    expect(
      kindOf({
        configs: { units: [{ kind: '10008' }, { kind: '10002' }] },
      })
    ).toBe('apartment');
    expect(kindOf({})).toBe('apartment~');
  });

  it('infer kind from name when nothing else matches', () => {
    expect(kindOf({ name: 'Sai Ram Apartment' })).toBe('apartment~');
    expect(kindOf({ name: 'Rzone Land Plot' })).toBe('plot~');
    expect(kindOf({ name: 'Emaar Business District 114' })).toBe('commercial~');
    expect(kindOf({ name: 'Ashiana Villas' })).toBe('villa~');
  });

  it('calculateNearby finds POIs within thresholds', () => {
    const soc = { lat: 18.5204, lng: 73.8567 };
    const pois = [
      { type: 'park', name: 'City Park', lat: 18.522, lng: 73.857 },
      { type: 'metro', name: 'District Court Metro', lat: 18.528, lng: 73.859 },
      { type: 'hospital', name: 'Sancheti Hospital', lat: 18.535, lng: 73.85 },
      { type: 'school', name: 'St. Mary School', lat: 18.59, lng: 73.85 }, // Far (>3000m)
    ];

    const nb = calculateNearby(soc, pois);
    expect(nb.park).toBeDefined();
    expect(nb.park.name).toBe('City Park');
    expect(nb.park.m).toBeLessThan(500);
    expect(nb.metro).toBeDefined();
    expect(nb.school).toBeUndefined(); // Beyond 3km
  });

  it('calculateScore balances residents, nearby, amenities', () => {
    const result = calculateScore({
      rating: 4.5, // 4.5 * 2 = 9.0
      amenities: ['Gym', 'Pool', 'Clubhouse', 'Garden', 'Tennis', 'Security'], // 6 / 3 = 2.0
      nearby: {
        park: { m: 400, n: 1 }, // reach 1
        metro: { m: 1200, n: 1 }, // reach 2
        school: { m: 800, n: 1 }, // reach 3
        hospital: { m: 1500, n: 1 }, // reach 4
        shopping: { m: 1000, n: 1 }, // reach 5 -> nearby = 10.0
      },
    });

    expect(result.score_parts.residents).toBe(9.0);
    expect(result.score_parts.nearby).toBe(10.0);
    expect(result.score_parts.amenities).toBe(2.0);
    // score = 9.0 * 0.5 + 10.0 * 0.3 + 2.0 * 0.2 = 4.5 + 3.0 + 0.4 = 7.9
    expect(result.score).toBe(7.9);
  });
});
