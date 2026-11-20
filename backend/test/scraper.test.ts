import { describe, expect, it } from 'bun:test';
import fs from 'fs';
import path from 'path';
import {
  parseListPage,
  parseTotal,
  cardToProject,
  photoLinks,
} from '../src/scraper/magicbricks/parse-list';
import { parseProjectPage } from '../src/scraper/magicbricks/parse-project';

const FIXTURES_DIR = path.resolve(__dirname, 'fixtures');

function readFixture(name: string): string {
  return fs.readFileSync(path.join(FIXTURES_DIR, name), 'utf-8');
}

describe('Magicbricks Parsers', () => {
  it('parses list page correctly', () => {
    const html = readFixture('mb_list.html');
    const cards = parseListPage(html);
    expect(cards.length).toBe(20);
    expect(parseTotal(html)).toBe(2708);

    const project = cardToProject(cards[0]);
    expect(project.name).toBe('Solutrean Gateway95');
    expect(project.url.startsWith('https://www.magicbricks.com/solutrean-gateway95')).toBe(true);
  });

  it('parses plot project page correctly', () => {
    const html = readFixture('mb_project_plot.html');
    const details = parseProjectPage(html);

    expect(details.lat).not.toBeNull();
    expect(details.lng).not.toBeNull();
    expect(Math.round(details.lat! * 100000) / 100000).toBe(28.41698);
    expect(Math.round(details.lng! * 100000) / 100000).toBe(76.90962);
    expect(details.rera_id?.startsWith('GGM/607')).toBe(true);
    expect(details.amenities).toContain('Outdoor Tennis Courts');
  });

  it('parses flat project page correctly', () => {
    const html = readFixture('mb_project_flat.html');
    const details = parseProjectPage(html);

    expect(details.towers).toBe(27);
    expect(details.units).toBe(1356);
    expect(details.config_text).toBe('2, 3, 4 BHK Multistorey Apartments');

    const sizes = details.configs.units.map((u) => [u.bhk, u.sqft]);
    const has4Bhk2740 = sizes.some(([bhk, sqft]) => bhk === 4 && sqft === 2740);
    const has2Bhk1296 = sizes.some(([bhk, sqft]) => bhk === 2 && sqft === 1296);
    expect(has4Bhk2740).toBe(true);
    expect(has2Bhk1296).toBe(true);

    expect(details.configs.by_bhk[3].plan_images[0].endsWith('.jpg')).toBe(true);
  });

  it('parses card units and type codes', () => {
    const html = readFixture('mb_list.html');
    const cards = parseListPage(html);
    const gangaCard = cards.find((c) => c.psmName === 'Ganga Anantam');
    expect(gangaCard).toBeDefined();

    const p = cardToProject(gangaCard!);
    expect(p.card_units[0]).toEqual({ bhk: 3, sqft: 2050, kind: '10002' });
    expect(p.type_codes).toEqual(['10002']);
  });

  it('parses extras: ratings, reviews, listings, psf_now, trend', () => {
    const html = readFixture('mb_project_flat.html');
    const details = parseProjectPage(html);

    expect(details.rating).toBe(4.5);
    expect(details.review_count).toBe(18);
    expect(details.ratings.maintenance).toBe(4.7);
    expect(details.sale_count).toBe(140);
    expect(details.rent_count).toBe(27);

    expect(details.rent_listings[0]).toEqual({
      bhk: 2,
      price: 45000,
      sqft: 1296,
      psf: 35,
      furnished: 'Semi-Furnished',
      floor: '5',
      posted: '2026-10-15',
    });

    expect(details.sale_listings[0].price).toBe(24000000);
    expect(details.psf_now).toBe(16623);
    expect(details.trend[0]).toEqual(['2021', 7567]);
    expect(details.reviews[0].text.startsWith('Ireo The Corridors is a thoughtfully')).toBe(true);
  });

  it('ensures reviews are deduplicated', () => {
    const html = readFixture('mb_project_flat.html');
    const details = parseProjectPage(html);
    const keys = details.reviews.map((r) => r.text.slice(0, 60));
    expect(keys.length).toBe(new Set(keys).size);
  });

  it('photoLinks skips floor plans and generates resized thumbnails', () => {
    const links = photoLinks(
      '2025/09/18/Project-Photo-9-X-5021659_410_1440.jpg,2025/07/01/Floor-Plan-36-X_505_661.jpg'
    );
    expect(links).toEqual([
      {
        thumb:
          'https://img.staticmb.com/mbimages/project/Photo_h310_w462/2025/09/18/Project-Photo-9-X-5021659_410_1440_310_462.jpg',
        full: 'https://img.staticmb.com/mbimages/project/2025/09/18/Project-Photo-9-X-5021659_410_1440.jpg',
      },
    ]);
  });
});
