import {
  eq,
  and,
  or,
  ilike,
  gte,
  lte,
  inArray,
  isNotNull,
  sql,
  desc,
  asc,
} from 'drizzle-orm';
import { getDb } from '../../db/client';
import {
  societies,
  unitTypes,
  bhkPrices,
  listings,
  reviews,
  type Society,
  type UnitType,
  type BhkPrice,
  type Listing,
  type Review,
} from '../../db/schema';
import { distM } from '../../scraper/build/geo';
import { CITIES } from '../../scraper/cities';

export interface SocietyFilterParams {
  city?: string;
  q?: string;
  locality?: string;
  bhk?: number[];
  kind?: string[];
  mode?: 'buy' | 'rent';
  minPrice?: number;
  maxPrice?: number;
  minRent?: number;
  maxRent?: number;
  minSqft?: number;
  maxSqft?: number;
  amenities?: string[];
  ready?: boolean;
  near?: string[]; // park | metro | school | hospital | shopping
  minRating?: number;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  sort?: 'best' | 'price' | 'rent' | 'size' | 'rating' | 'score' | 'distance' | 'name';
  limit?: number;
  offset?: number;
}

export interface CompactSocietyCard {
  id: string;
  city: string;
  name: string;
  developer: string | null;
  locality: string | null;
  pincode: string | null;
  lat: number | null;
  lng: number | null;
  kind: string | null;
  status: string | null;
  possession: string | null;
  units: number | null;
  towers: number | null;
  acres: number | null;
  price_min: number | null;
  price_max: number | null;
  psf_now: number | null;
  amenities: string[] | null;
  images: Array<{ thumb: string; full: string }> | null;
  rating: number | null;
  rating_count: number | null;
  review_count: number | null;
  score: number | null;
  score_parts: Record<string, number> | null;
  nearby: Record<string, { m: number; name?: string; n?: number }> | null;
  prices: Record<
    number,
    {
      buy_median?: number | null;
      rent_median?: number | null;
      psf?: number | null;
    }
  >;
  distance_km?: number | null;
}

export interface FullSocietyDetail extends Society {
  unit_types: UnitType[];
  bhk_prices: BhkPrice[];
  listings: Listing[];
  reviews: Review[];
}

export interface CitySummary {
  slug: string;
  name: string;
  societies_count: number;
}

export interface LocalitySummary {
  locality: string;
  city: string;
  societies_count: number;
  median_price: number | null;
  median_psf: number | null;
}

export class FlatsService {
  /**
   * Get all supported cities with their society counts.
   */
  static async getCities(): Promise<CitySummary[]> {
    const db = getDb();
    const rows = await db
      .select({
        city: societies.city,
        count: sql<number>`cast(count(${societies.id}) as int)`,
      })
      .from(societies)
      .groupBy(societies.city);

    const countsMap = new Map<string, number>();
    for (const r of rows) {
      countsMap.set(r.city.toLowerCase(), r.count);
    }

    const out: CitySummary[] = [];
    for (const [slug, conf] of Object.entries(CITIES)) {
      out.push({
        slug,
        name: conf.name,
        societies_count: countsMap.get(slug) || 0,
      });
    }

    return out;
  }

  /**
   * Search and filter societies.
   */
  static async getSocieties(params: SocietyFilterParams): Promise<{
    societies: CompactSocietyCard[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const db = getDb();
    const city = (params.city || 'pune').toLowerCase();
    const limit = Math.min(Math.max(params.limit || 20, 1), 100);
    const offset = Math.max(params.offset || 0, 0);

    const mode = params.mode === 'rent' ? 'rent' : 'buy';
    // Only societies whose project page was scraped (they have coordinates); list-stage stubs have no detail.
    const conditions = [eq(societies.city, city), isNotNull(societies.lat)];

    if (params.q) {
      const search = `%${params.q.trim()}%`;
      conditions.push(
        or(
          ilike(societies.name, search),
          ilike(societies.developer, search),
          ilike(societies.locality, search)
        )!
      );
    }

    if (params.locality) {
      conditions.push(ilike(societies.locality, `%${params.locality.trim()}%`));
    }

    if (params.kind && params.kind.length > 0) {
      conditions.push(inArray(societies.kind, params.kind));
    }

    if (params.ready) {
      conditions.push(ilike(societies.status, '%ready%'));
    }

    if (params.minRating && params.minRating > 0) {
      conditions.push(gte(societies.rating, params.minRating));
    }

    if (params.minPrice && mode === 'buy') {
      conditions.push(gte(societies.price_max, params.minPrice));
    }

    if (params.maxPrice && mode === 'buy') {
      conditions.push(lte(societies.price_min, params.maxPrice));
    }

    // Execute query for matching societies
    let query = db
      .select()
      .from(societies)
      .where(and(...conditions));

    // Sort order
    if (params.sort === 'price') {
      query = query.orderBy(asc(societies.price_min)) as any;
    } else if (params.sort === 'rating') {
      query = query.orderBy(desc(societies.rating)) as any;
    } else if (params.sort === 'score') {
      query = query.orderBy(desc(societies.score)) as any;
    } else if (params.sort === 'name') {
      query = query.orderBy(asc(societies.name)) as any;
    } else {
      // Default: best (score desc, nulls last)
      query = query.orderBy(desc(societies.score)) as any;
    }

    const allMatches = await query;

    // Load BHK prices for matching societies
    const societyIds = allMatches.map((s) => s.id);
    let allBhkPrices: BhkPrice[] = [];
    if (societyIds.length > 0) {
      allBhkPrices = await db
        .select()
        .from(bhkPrices)
        .where(inArray(bhkPrices.society_id, societyIds));
    }

    const bhkPricesBySoc = new Map<string, Record<number, { buy_median?: number | null; rent_median?: number | null; psf?: number | null }>>();
    for (const bp of allBhkPrices) {
      const map = bhkPricesBySoc.get(bp.society_id) || {};
      map[bp.bhk] = {
        buy_median: bp.buy_median,
        rent_median: bp.rent_median,
        psf: bp.psf,
      };
      bhkPricesBySoc.set(bp.society_id, map);
    }

    // Secondary filters: BHK, Amenities, Nearby POIs, Distance
    const filtered = allMatches.filter((s) => {
      const prices = bhkPricesBySoc.get(s.id) || {};

      // Mode filter: buy needs sale data, rent needs rental data
      const hasMode = (p: { buy_median?: number | null; rent_median?: number | null }) =>
        mode === 'rent' ? typeof p.rent_median === 'number' : typeof p.buy_median === 'number';
      if (mode === 'rent') {
        if (!Object.values(prices).some(hasMode)) return false;
      } else if (!Object.values(prices).some(hasMode) && s.price_min == null) {
        return false;
      }

      // BHK filter (must have data for the chosen mode where available)
      if (params.bhk && params.bhk.length > 0) {
        const hasBhk = params.bhk.some((b) =>
          prices[b] !== undefined && (mode === 'rent' ? hasMode(prices[b]) : true)
        );
        if (!hasBhk) return false;
      }

      // Rent min/max filter
      if (params.minRent || params.maxRent) {
        const rents = Object.values(prices)
          .map((p) => p.rent_median)
          .filter((v): v is number => typeof v === 'number');
        if (rents.length === 0) return false;
        if (params.minRent && !rents.some((r) => r >= params.minRent!)) return false;
        if (params.maxRent && !rents.some((r) => r <= params.maxRent!)) return false;
      }

      // Amenities filter
      if (params.amenities && params.amenities.length > 0) {
        const socAmenities = (s.amenities || []).map((a) => a.toLowerCase());
        const hasAll = params.amenities.every((req) =>
          socAmenities.some((a) => a.includes(req.toLowerCase()))
        );
        if (!hasAll) return false;
      }

      // Nearby POIs filter: e.g. park <= 500, metro <= 1500, school <= 1000, hospital <= 2000, shopping <= 1500
      if (params.near && params.near.length > 0) {
        const nb = s.nearby || {};
        const threshold: Record<string, number> = {
          park: 500,
          metro: 1500,
          rail: 1500,
          school: 1000,
          hospital: 2000,
          shopping: 1500,
        };

        const passesNear = params.near.every((req) => {
          const key = req.toLowerCase();
          if (key === 'metro') {
            const dMetro = nb.metro?.m ?? Infinity;
            const dRail = nb.rail?.m ?? Infinity;
            return dMetro <= 1500 || dRail <= 1500;
          }
          const maxDist = threshold[key] || 1500;
          return (nb[key]?.m ?? Infinity) <= maxDist;
        });

        if (!passesNear) return false;
      }

      // Radius filter
      if (
        params.lat !== undefined &&
        params.lng !== undefined &&
        params.radiusKm !== undefined &&
        s.lat !== null &&
        s.lng !== null
      ) {
        const d = distM([params.lng, params.lat], [s.lng, s.lat]);
        if (d > params.radiusKm * 1000) return false;
      }

      return true;
    });

    // Compute distance if coordinates provided
    const withDist = filtered.map((s) => {
      let distance_km: number | null = null;
      if (
        params.lat !== undefined &&
        params.lng !== undefined &&
        s.lat !== null &&
        s.lng !== null
      ) {
        distance_km = Math.round((distM([params.lng, params.lat], [s.lng, s.lat]) / 1000) * 10) / 10;
      }
      return {
        id: s.id,
        city: s.city,
        name: s.name,
        developer: s.developer,
        locality: s.locality,
        pincode: s.pincode,
        lat: s.lat,
        lng: s.lng,
        kind: s.kind,
        status: s.status,
        possession: s.possession,
        units: s.units,
        towers: s.towers,
        acres: s.acres,
        price_min: s.price_min,
        price_max: s.price_max,
        psf_now: s.psf_now,
        amenities: s.amenities,
        images: s.images,
        rating: s.rating,
        rating_count: s.rating_count,
        review_count: s.review_count,
        score: s.score,
        score_parts: s.score_parts,
        nearby: s.nearby,
        prices: bhkPricesBySoc.get(s.id) || {},
        distance_km,
      };
    });

    // Mode-aware sorts
    const medianFor = (c: CompactSocietyCard, key: 'buy_median' | 'rent_median') => {
      const vals = Object.values(c.prices)
        .map((p) => p[key])
        .filter((v): v is number => typeof v === 'number');
      return vals.length ? Math.min(...vals) : Infinity;
    };
    if (params.sort === 'rent' || (params.sort === 'price' && mode === 'rent')) {
      withDist.sort((a, b) => medianFor(a, 'rent_median') - medianFor(b, 'rent_median'));
    }

    // Distance sort if requested
    if (params.sort === 'distance' && params.lat !== undefined && params.lng !== undefined) {
      withDist.sort((a, b) => (a.distance_km ?? Infinity) - (b.distance_km ?? Infinity));
    }

    const total = withDist.length;
    const paginated = withDist.slice(offset, offset + limit);

    return {
      societies: paginated,
      total,
      limit,
      offset,
    };
  }

  /**
   * Get single society with full relational details.
   */
  static async getSocietyById(id: string): Promise<FullSocietyDetail | null> {
    const db = getDb();
    const soc = await db.query.societies.findFirst({
      where: eq(societies.id, id),
      with: {
        unitTypes: true,
        bhkPrices: true,
        listings: true,
        reviews: true,
      },
    });

    if (!soc) return null;

    return {
      ...soc,
      unit_types: soc.unitTypes || [],
      bhk_prices: soc.bhkPrices || [],
      listings: soc.listings || [],
      reviews: soc.reviews || [],
    };
  }

  /**
   * Get localities for a city with society counts and median pricing.
   */
  static async getLocalities(citySlug = 'pune'): Promise<LocalitySummary[]> {
    const db = getDb();
    const city = citySlug.toLowerCase();

    const socList = await db
      .select({
        locality: societies.locality,
        price_min: societies.price_min,
        price_max: societies.price_max,
        psf_now: societies.psf_now,
      })
      .from(societies)
      .where(and(eq(societies.city, city), sql`${societies.locality} is not null`));

    const byLoc = new Map<
      string,
      { count: number; prices: number[]; psfs: number[] }
    >();

    for (const s of socList) {
      const loc = s.locality!;
      const entry = byLoc.get(loc) || { count: 0, prices: [], psfs: [] };
      entry.count++;
      if (s.price_min) entry.prices.push(s.price_min);
      if (s.price_max) entry.prices.push(s.price_max);
      if (s.psf_now) entry.psfs.push(s.psf_now);
      byLoc.set(loc, entry);
    }

    const out: LocalitySummary[] = [];
    for (const [loc, data] of byLoc.entries()) {
      data.prices.sort((a, b) => a - b);
      data.psfs.sort((a, b) => a - b);

      const medianPrice =
        data.prices.length > 0
          ? data.prices[Math.floor(data.prices.length / 2)]
          : null;
      const medianPsf =
        data.psfs.length > 0
          ? data.psfs[Math.floor(data.psfs.length / 2)]
          : null;

      out.push({
        locality: loc,
        city,
        societies_count: data.count,
        median_price: medianPrice,
        median_psf: medianPsf,
      });
    }

    out.sort((a, b) => b.societies_count - a.societies_count);
    return out;
  }

  /**
   * Compare 2 to 5 societies side by side.
   */
  static async compareSocieties(ids: string[]): Promise<FullSocietyDetail[]> {
    const validIds = ids.slice(0, 5);
    if (validIds.length === 0) return [];

    const db = getDb();
    const results = await db.query.societies.findMany({
      where: inArray(societies.id, validIds),
      with: {
        unitTypes: true,
        bhkPrices: true,
        listings: true,
        reviews: true,
      },
    });

    return results.map((soc) => ({
      ...soc,
      unit_types: soc.unitTypes || [],
      bhk_prices: soc.bhkPrices || [],
      listings: soc.listings || [],
      reviews: soc.reviews || [],
    }));
  }
}
