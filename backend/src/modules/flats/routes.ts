import { Elysia, t } from 'elysia';
import { FlatsService } from './service';

export const flatsRoutes = new Elysia({ prefix: '/api/flats' })
  /**
   * GET /api/flats/cities
   * List available cities with society counts
   */
  .get(
    '/cities',
    async () => {
      const cities = await FlatsService.getCities();
      return { cities };
    },
    {
      detail: {
        tags: ['Flats'],
        summary: 'List supported cities',
        description: 'Returns available cities and total society counts',
      },
    }
  )

  /**
   * GET /api/flats/localities
   * List localities for a city with pricing medians
   */
  .get(
    '/localities',
    async ({ query }) => {
      const city = query.city || 'pune';
      const localities = await FlatsService.getLocalities(city);
      return { city, localities };
    },
    {
      query: t.Object({
        city: t.Optional(t.String({ description: 'City slug (default: pune)' })),
      }),
      detail: {
        tags: ['Flats'],
        summary: 'List localities in a city',
        description: 'Returns localities with society counts and median prices',
      },
    }
  )

  /**
   * GET /api/flats/compare
   * Side-by-side comparison of 2-5 societies
   */
  .get(
    '/compare',
    async ({ query, set }) => {
      if (!query.ids) {
        set.status = 400;
        return { error: 'Bad Request', message: 'ids query parameter is required (e.g. ?ids=mb_1,mb_2)' };
      }

      const ids = query.ids
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      if (ids.length < 2 || ids.length > 5) {
        set.status = 400;
        return {
          error: 'Bad Request',
          message: 'Comparison requires between 2 and 5 society ids',
        };
      }

      const societies = await FlatsService.compareSocieties(ids);
      return { societies };
    },
    {
      query: t.Object({
        ids: t.String({ description: 'Comma-separated society IDs (2-5 items)' }),
      }),
      detail: {
        tags: ['Flats'],
        summary: 'Compare societies',
        description: 'Compare 2 to 5 societies side-by-side with full unit types and prices',
      },
    }
  )

  /**
   * GET /api/flats/societies
   * Search and filter societies
   */
  .get(
    '/societies',
    async ({ query }) => {
      const bhkList = query.bhk
        ? String(query.bhk)
            .split(',')
            .map((b) => parseInt(b.trim(), 10))
            .filter((n) => !Number.isNaN(n))
        : undefined;

      const kindList = query.kind
        ? String(query.kind)
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean)
        : undefined;

      const amenitiesList = query.amenities
        ? String(query.amenities)
            .split(',')
            .map((a) => a.trim())
            .filter(Boolean)
        : undefined;

      const nearList = query.near
        ? String(query.near)
            .split(',')
            .map((n) => n.trim())
            .filter(Boolean)
        : undefined;

      const readyBool =
        query.ready === 'true' || query.ready === '1'
          ? true
          : query.ready === 'false' || query.ready === '0'
          ? false
          : undefined;

      const minPriceNum = query.minPrice ? parseFloat(query.minPrice) : undefined;
      const maxPriceNum = query.maxPrice ? parseFloat(query.maxPrice) : undefined;
      const minRentNum = query.minRent ? parseFloat(query.minRent) : undefined;
      const maxRentNum = query.maxRent ? parseFloat(query.maxRent) : undefined;
      const minSqftNum = query.minSqft ? parseFloat(query.minSqft) : undefined;
      const maxSqftNum = query.maxSqft ? parseFloat(query.maxSqft) : undefined;
      const minRatingNum = query.minRating ? parseFloat(query.minRating) : undefined;
      const latNum = query.lat ? parseFloat(query.lat) : undefined;
      const lngNum = query.lng ? parseFloat(query.lng) : undefined;
      const radiusKmNum = query.radiusKm ? parseFloat(query.radiusKm) : undefined;
      const limitNum = query.limit ? parseInt(query.limit, 10) : 20;
      const offsetNum = query.offset ? parseInt(query.offset, 10) : 0;

      const res = await FlatsService.getSocieties({
        city: query.city,
        q: query.q,
        locality: query.locality,
        bhk: bhkList,
        kind: kindList,
        mode: query.mode as any,
        minPrice: minPriceNum,
        maxPrice: maxPriceNum,
        minRent: minRentNum,
        maxRent: maxRentNum,
        minSqft: minSqftNum,
        maxSqft: maxSqftNum,
        amenities: amenitiesList,
        ready: readyBool,
        near: nearList,
        minRating: minRatingNum,
        lat: latNum,
        lng: lngNum,
        radiusKm: radiusKmNum,
        sort: query.sort as any,
        limit: limitNum,
        offset: offsetNum,
      });

      return res;
    },
    {
      query: t.Object({
        city: t.Optional(t.String()),
        q: t.Optional(t.String()),
        locality: t.Optional(t.String()),
        bhk: t.Optional(t.String({ description: 'Comma-separated BHK numbers, e.g. 2,3' })),
        kind: t.Optional(t.String({ description: 'Comma-separated kinds: apartment, villa, plot, etc.' })),
        mode: t.Optional(t.Union([t.Literal('buy'), t.Literal('rent')])),
        minPrice: t.Optional(t.String()),
        maxPrice: t.Optional(t.String()),
        minRent: t.Optional(t.String()),
        maxRent: t.Optional(t.String()),
        minSqft: t.Optional(t.String()),
        maxSqft: t.Optional(t.String()),
        amenities: t.Optional(t.String({ description: 'Comma-separated amenities (gym, pool, etc.)' })),
        ready: t.Optional(t.String()),
        near: t.Optional(t.String({ description: 'Comma-separated: park, metro, school, hospital, shopping' })),
        minRating: t.Optional(t.String()),
        lat: t.Optional(t.String()),
        lng: t.Optional(t.String()),
        radiusKm: t.Optional(t.String()),
        sort: t.Optional(
          t.Union([
            t.Literal('best'),
            t.Literal('price'),
            t.Literal('rent'),
            t.Literal('size'),
            t.Literal('rating'),
            t.Literal('score'),
            t.Literal('distance'),
            t.Literal('name'),
          ])
        ),
        limit: t.Optional(t.String()),
        offset: t.Optional(t.String()),
      }),
      detail: {
        tags: ['Flats'],
        summary: 'Search societies',
        description:
          'Search societies with multifaceted filtering: BHK, prices, amenities, proximity to POIs, and sort options.',
      },
    }
  )

  /**
   * GET /api/flats/societies/:id
   * Get complete society detail
   */
  .get(
    '/societies/:id',
    async ({ params, set }) => {
      const society = await FlatsService.getSocietyById(params.id);
      if (!society) {
        set.status = 404;
        return {
          error: 'Not Found',
          message: `Society with ID ${params.id} was not found.`,
          code: 404,
        };
      }

      return { society };
    },
    {
      params: t.Object({
        id: t.String({ description: 'Society ID (e.g. mb_12345)' }),
      }),
      detail: {
        tags: ['Flats'],
        summary: 'Get society details',
        description: 'Returns full society details including unit types, bhk prices, listings, and reviews.',
      },
    }
  );
