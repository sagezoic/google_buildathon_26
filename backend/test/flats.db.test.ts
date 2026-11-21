import { describe, expect, it } from 'bun:test';
import { getDb, closeDb, testDbConnection } from '../src/db/client';
import { societies, unitTypes, listings, bhkPrices, pois } from '../src/db/schema';
import { FlatsService } from '../src/modules/flats/service';
import { eq } from 'drizzle-orm';

const dbCheck = await testDbConnection();
const hasDatabase = dbCheck.connected;

describe('Flats Database Integration', () => {
  it.skipIf(!hasDatabase)(
    'performs CRUD and filters on societies and related tables',
    async () => {
      const db = getDb();
      const testSocId = 'mb_test_999999';

      try {
        // Clean up test data if present
        await db.delete(societies).where(eq(societies.id, testSocId));

        // Insert test society
        await db.insert(societies).values({
          id: testSocId,
          city: 'pune',
          name: 'Greenwood Heights Test',
          developer: 'Realdha Infra',
          locality: 'Kothrud',
          pincode: '411038',
          lat: 18.5074,
          lng: 73.8077,
          kind: 'apartment',
          status: 'Ready to Move',
          price_min: 7500000,
          price_max: 15000000,
          amenities: ['Gym', 'Swimming Pool', 'Clubhouse'],
          score: 8.5,
          score_parts: { residents: 8.0, nearby: 9.0, amenities: 8.5 },
          rating: 4.5,
          rating_count: 25,
          review_count: 10,
        });

        // Insert unit types
        await db.insert(unitTypes).values([
          {
            society_id: testSocId,
            bhk: 2,
            label: '2 BHK 950 sq ft',
            size_sqft: 950,
            price_min: 7500000,
            price_max: 8500000,
          },
          {
            society_id: testSocId,
            bhk: 3,
            label: '3 BHK 1350 sq ft',
            size_sqft: 1350,
            price_min: 12000000,
            price_max: 14000000,
          },
        ]);

        // Insert bhk_prices
        await db.insert(bhkPrices).values([
          {
            society_id: testSocId,
            bhk: 2,
            buy_median: 8000000,
            buy_n: 3,
            rent_median: 28000,
            rent_n: 2,
            psf: 8400,
          },
          {
            society_id: testSocId,
            bhk: 3,
            buy_median: 13000000,
            buy_n: 2,
            rent_median: 45000,
            rent_n: 1,
            psf: 9600,
          },
        ]);

        // Query via service
        const detail = await FlatsService.getSocietyById(testSocId);
        expect(detail).not.toBeNull();
        expect(detail?.name).toBe('Greenwood Heights Test');
        expect(detail?.unit_types.length).toBe(2);
        expect(detail?.bhk_prices.length).toBe(2);

        // Filter via service
        const search = await FlatsService.getSocieties({
          city: 'pune',
          q: 'Greenwood',
          bhk: [2],
          minPrice: 5000000,
          maxPrice: 10000000,
        });

        expect(search.societies.some((s) => s.id === testSocId)).toBe(true);
      } finally {
        await db.delete(societies).where(eq(societies.id, testSocId));
        await closeDb();
      }
    }
  );
});
