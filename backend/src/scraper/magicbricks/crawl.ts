import { eq, and, sql } from 'drizzle-orm';
import { getDb } from '../../db/client';
import {
  societies,
  unitTypes,
  listings,
  bhkPrices,
  reviews,
  pois,
  type NewSociety,
  type NewListing,
  type NewUnitType,
  type NewReview,
  type NewBhkPrice,
} from '../../db/schema';
import { getCityConfig } from '../cities';
import { fetchWithCache } from '../http';
import { parseListPage, parseTotal, cardToProject } from './parse-list';
import { parseProjectPage } from './parse-project';
import { fetchOverpassPois } from '../osm/overpass';
import { dedupe, kindOf } from '../build/dedupe';
import { listingStats, fitYields, flagOutliers, addEstimates } from '../build/pricing';
import { calculateNearby } from '../build/nearby';
import { calculateScore } from '../build/score';

import type { BhkPriceData } from '../build/pricing';

export interface CrawlOptions {
  pages?: number;
  limit?: number;
}

export interface StageCounts {
  list_pages?: number;
  projects_listed?: number;
  projects_scraped?: number;
  pois_collected?: number;
  societies_built?: number;
  listings_saved?: number;
  bhk_prices_computed?: number;
}

/**
 * Stage 1: Crawl Magicbricks listing pages and upsert society stubs into PostgreSQL.
 */
export async function crawlList(
  citySlug: string,
  options: CrawlOptions = {}
): Promise<{ totalListed: number; pagesScraped: number }> {
  const city = getCityConfig(citySlug);
  const db = getDb();
  const listUrlPattern = `https://www.magicbricks.com/residential-projects-in-${city.magicbricks}-nprid/page-`;

  console.log(`[scraper/list] Crawling listing pages for ${city.name}...`);
  const firstHtml = await fetchWithCache(listUrlPattern + '1', { subDir: 'mb' });
  if (!firstHtml) {
    throw new Error(`Failed to fetch page 1 for city ${city.name}`);
  }

  const totalCount = parseTotal(firstHtml) || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / 20));
  const pagesToCrawl = options.pages ? Math.min(options.pages, totalPages) : totalPages;

  console.log(
    `[scraper/list] Total reported: ${totalCount} projects across ${totalPages} pages. Crawling ${pagesToCrawl} page(s)...`
  );

  const seen = new Set<string>();
  let totalListed = 0;

  for (let p = 1; p <= pagesToCrawl; p++) {
    const pageUrl = `${listUrlPattern}${p}`;
    const html = p === 1 ? firstHtml : await fetchWithCache(pageUrl, { subDir: 'mb' });
    if (!html) continue;

    const cards = parseListPage(html);
    const toUpsert: NewSociety[] = [];

    for (const c of cards) {
      const psmid = String(c.psmid || '');
      if (!psmid || seen.has(psmid)) continue;
      seen.add(psmid);

      const proj = cardToProject(c);
      const societyId = `mb_${proj.mb_id}`;

      toUpsert.push({
        id: societyId,
        city: city.slug,
        name: proj.name,
        developer: proj.developer,
        locality: proj.locality,
        pincode: proj.pincode,
        status: proj.status,
        possession: proj.possession,
        units: proj.units,
        towers: proj.towers,
        acres: proj.acres,
        price_min: proj.price_min,
        price_max: proj.price_max,
        amenities: [],
        url: proj.url,
        brochure_url: proj.brochure_url,
        images: proj.images,
        scraped_at: new Date(),
        updated_at: new Date(),
      });
    }

    if (toUpsert.length > 0) {
      await db
        .insert(societies)
        .values(toUpsert)
        .onConflictDoUpdate({
          target: societies.id,
          set: {
            name: sql`excluded.name`,
            developer: sql`excluded.developer`,
            locality: sql`excluded.locality`,
            pincode: sql`excluded.pincode`,
            status: sql`excluded.status`,
            possession: sql`excluded.possession`,
            units: sql`excluded.units`,
            towers: sql`excluded.towers`,
            acres: sql`excluded.acres`,
            price_min: sql`excluded.price_min`,
            price_max: sql`excluded.price_max`,
            url: sql`excluded.url`,
            brochure_url: sql`excluded.brochure_url`,
            images: sql`excluded.images`,
            scraped_at: sql`excluded.scraped_at`,
            updated_at: sql`excluded.updated_at`,
          },
        });
      totalListed += toUpsert.length;
    }

    console.log(`[scraper/list] Page ${p}/${pagesToCrawl}: ${cards.length} cards, total unique: ${seen.size}`);
  }

  return { totalListed, pagesScraped: pagesToCrawl };
}

/**
 * Stage 2: Crawl individual project pages and store details, unit types, listings, and reviews.
 */
export async function crawlProjects(
  citySlug: string,
  options: CrawlOptions = {}
): Promise<{ scrapedCount: number }> {
  const city = getCityConfig(citySlug);
  const db = getDb();

  let query = db
    .select({
      id: societies.id,
      name: societies.name,
      url: societies.url,
    })
    .from(societies)
    .where(eq(societies.city, city.slug));

  let projectList = await query;
  if (options.limit && options.limit > 0) {
    projectList = projectList.slice(0, options.limit);
  }

  console.log(`[scraper/projects] Crawling ${projectList.length} project page(s) for ${city.name}...`);
  let scrapedCount = 0;

  for (let i = 0; i < projectList.length; i++) {
    const p = projectList[i];
    if (!p.url) continue;

    try {
      const html = await fetchWithCache(p.url, { subDir: 'mb' });
      if (!html) continue;

      const details = parseProjectPage(html);

      // Update society record
      await db
        .update(societies)
        .set({
          lat: details.lat,
          lng: details.lng,
          rera_id: details.rera_id,
          towers: details.towers,
          units: details.units,
          status: details.status,
          amenities: details.amenities,
          config_text: details.config_text,
          rating: details.rating,
          rating_count: details.rating_count,
          review_count: details.review_count,
          ratings: details.ratings,
          locality_rating: details.locality_rating,
          trend: details.trend,
          description: details.description,
          psf_now: details.psf_now,
          updated_at: new Date(),
        })
        .where(eq(societies.id, p.id));

      // Re-populate unit types
      await db.delete(unitTypes).where(eq(unitTypes.society_id, p.id));
      const newUnitTypes: NewUnitType[] = [];

      for (const u of details.configs.units) {
        const bhk = u.bhk;
        const planPricing = bhk ? details.configs.by_bhk[bhk] : null;
        newUnitTypes.push({
          society_id: p.id,
          bhk,
          label: bhk ? `${bhk} BHK ${Math.round(u.sqft).toLocaleString()} sq ft` : `${Math.round(u.sqft).toLocaleString()} sq ft`,
          size_sqft: u.sqft,
          price_min: planPricing?.price_min ?? null,
          price_max: planPricing?.price_max ?? null,
          plan_images: planPricing?.plan_images ?? [],
        });
      }

      if (newUnitTypes.length > 0) {
        await db.insert(unitTypes).values(newUnitTypes);
      }

      // Re-populate listings
      await db.delete(listings).where(eq(listings.society_id, p.id));
      const newListings: NewListing[] = [];

      for (const l of details.sale_listings) {
        newListings.push({
          society_id: p.id,
          mode: 'sale',
          bhk: l.bhk,
          price: l.price,
          sqft: l.sqft,
          psf: l.psf,
          furnished: l.furnished,
          floor: l.floor,
          posted_at: l.posted,
        });
      }

      for (const l of details.rent_listings) {
        newListings.push({
          society_id: p.id,
          mode: 'rent',
          bhk: l.bhk,
          price: l.price,
          sqft: l.sqft,
          psf: l.psf,
          furnished: l.furnished,
          floor: l.floor,
          posted_at: l.posted,
        });
      }

      if (newListings.length > 0) {
        await db.insert(listings).values(newListings);
      }

      // Re-populate reviews
      await db.delete(reviews).where(eq(reviews.society_id, p.id));
      const newReviews: NewReview[] = [];

      for (const r of details.reviews) {
        newReviews.push({
          society_id: p.id,
          title: r.title,
          text: r.text,
          date: r.date,
          author: r.by,
          rating: r.rating,
        });
      }

      if (newReviews.length > 0) {
        await db.insert(reviews).values(newReviews);
      }

      scrapedCount++;
      if ((i + 1) % 25 === 0 || i === projectList.length - 1) {
        console.log(`[scraper/projects] Processed ${i + 1}/${projectList.length} projects.`);
      }
    } catch (err) {
      console.warn(`[scraper/projects] Error parsing project ${p.id} (${p.url}):`, err);
    }
  }

  return { scrapedCount };
}

/**
 * Stage 3: Fetch OpenStreetMap POIs and upsert into the pois table.
 */
export async function crawlOsm(citySlug: string): Promise<{ poisCount: number }> {
  const city = getCityConfig(citySlug);
  const db = getDb();

  console.log(`[scraper/osm] Fetching POIs for ${city.name}...`);
  const poisList = await fetchOverpassPois(city.slug);

  if (poisList.length > 0) {
    // Delete existing POIs for this city and insert new ones
    await db.delete(pois).where(eq(pois.city, city.slug));

    // Batch insert POIs in chunks of 500
    const chunkSize = 500;
    for (let i = 0; i < poisList.length; i += chunkSize) {
      const chunk = poisList.slice(i, i + chunkSize);
      await db.insert(pois).values(chunk);
    }
  }

  console.log(`[scraper/osm] Saved ${poisList.length} POIs for ${city.name} into DB.`);
  return { poisCount: poisList.length };
}

/**
 * Stage 4: Build stage - deduplication, kind detection, nearby POIs, pricing models & Flat Finder score.
 */
export async function runBuild(citySlug: string): Promise<{ builtCount: number }> {
  const city = getCityConfig(citySlug);
  const db = getDb();
  const [south, west, north, east] = city.bbox;

  console.log(`[scraper/build] Running build stage for ${city.name}...`);

  // 1. Load societies with coordinates within bounding box
  const allSocieties = await db
    .select()
    .from(societies)
    .where(eq(societies.city, city.slug));

  const located = allSocieties.filter(
    (s) =>
      s.lat !== null &&
      s.lng !== null &&
      south <= s.lat &&
      s.lat <= north &&
      west <= s.lng &&
      s.lng <= east
  );

  console.log(
    `[scraper/build] Found ${allSocieties.length} societies total, ${located.length} located inside ${city.name} bbox.`
  );

  // 2. Deduplicate close-by projects
  const deduped = dedupe(located as any[]);

  // 3. Load city POIs
  const cityPois = await db.select().from(pois).where(eq(pois.city, city.slug));

  // 4. Load all listings and unit types to calculate prices
  const allListings = await db.select().from(listings);
  const listingsBySociety = new Map<string, typeof allListings>();
  for (const l of allListings) {
    const list = listingsBySociety.get(l.society_id) || [];
    list.push(l);
    listingsBySociety.set(l.society_id, list);
  }

  const allUnitTypes = await db.select().from(unitTypes);
  const unitTypesBySociety = new Map<string, typeof allUnitTypes>();
  for (const u of allUnitTypes) {
    const list = unitTypesBySociety.get(u.society_id) || [];
    list.push(u);
    unitTypesBySociety.set(u.society_id, list);
  }

  // Prepare society pricing data structures
  const societiesWithPrices: Array<
    typeof deduped[number] & { prices: Record<number | string, BhkPriceData> }
  > = deduped.map((s) => {
    const sListings = listingsBySociety.get(s.id) || [];
    const saleListings = sListings.filter((l) => l.mode === 'sale');
    const rentListings = sListings.filter((l) => l.mode === 'rent');
    const prices = listingStats({
      sale_listings: saleListings,
      rent_listings: rentListings,
    });
    return {
      ...s,
      prices,
    };
  });

  // Fit rental yields and flag outlier typos
  const yieldModel = fitYields(societiesWithPrices);
  flagOutliers(societiesWithPrices);

  // Calculate locality median PSF
  const locPsf = new Map<string, number[]>();
  for (const s of societiesWithPrices) {
    if (!s.locality) continue;
    for (const b of Object.values(s.prices) as BhkPriceData[]) {
      if (b.psf && (!b.flags || !b.flags.buy)) {
        const arr = locPsf.get(s.locality) || [];
        arr.push(b.psf);
        locPsf.set(s.locality, arr);
      }
    }
  }

  // 5. Update each society with kind, nearby POIs, score, and compute BHK price estimates
  const bhkPriceInserts: NewBhkPrice[] = [];

  for (const s of societiesWithPrices) {
    const kind = kindOf(s).replace(/~$/, '');

    // Nearby POIs
    const nearby = calculateNearby({ lat: s.lat!, lng: s.lng! }, cityPois);

    // Score
    const scoreResult = calculateScore({
      rating: s.rating,
      amenities: s.amenities,
      nearby,
    });

    // Add estimates
    const sUnits = unitTypesBySociety.get(s.id) || [];
    const sizesByBhk: Record<number, number> = {};
    for (const u of sUnits) {
      if (u.bhk && u.size_sqft) {
        sizesByBhk[u.bhk] = u.size_sqft;
      }
    }

    const ownPsfs = (Object.values(s.prices) as BhkPriceData[])
      .map((p) => p.psf)
      .filter((p): p is number => typeof p === 'number' && p > 0);
    const locArr = s.locality ? locPsf.get(s.locality) : null;
    const locMedianPsf = locArr && locArr.length >= 3 ? locArr.sort((a, b) => a - b)[Math.floor(locArr.length / 2)] : null;
    const psfFallback = ownPsfs.length > 0 ? ownPsfs[0] : s.psf_now || locMedianPsf;

    if (['apartment', 'builder floor', 'villa'].includes(kind)) {
      addEstimates(s, yieldModel, sizesByBhk, psfFallback);
    }

    // Save to societies table
    await db
      .update(societies)
      .set({
        kind,
        nearby,
        score: scoreResult.score,
        score_parts: scoreResult.score_parts,
        updated_at: new Date(),
      })
      .where(eq(societies.id, s.id));

    // Prepare bhk_prices rows
    for (const [bhkStr, pData] of Object.entries(s.prices) as [string, BhkPriceData][]) {
      const bhk = parseInt(bhkStr, 10);
      bhkPriceInserts.push({
        society_id: s.id,
        bhk,
        buy_median: pData.buy?.median ?? pData.buy_est?.value ?? null,
        buy_min: pData.buy?.min ?? null,
        buy_max: pData.buy?.max ?? null,
        buy_n: pData.buy?.n ?? null,
        rent_median: pData.rent?.median ?? pData.rent_est?.value ?? null,
        rent_min: pData.rent?.min ?? null,
        rent_max: pData.rent?.max ?? null,
        rent_n: pData.rent?.n ?? null,
        psf: pData.psf ?? null,
        flags: pData.flags ?? null,
      });
    }
  }

  // Delete and bulk insert bhk_prices
  if (bhkPriceInserts.length > 0) {
    const societyIds = deduped.map((s) => s.id);
    // Delete in chunks of 500
    for (let i = 0; i < societyIds.length; i += 500) {
      const chunk = societyIds.slice(i, i + 500);
      for (const id of chunk) {
        await db.delete(bhkPrices).where(eq(bhkPrices.society_id, id));
      }
    }

    for (let i = 0; i < bhkPriceInserts.length; i += 500) {
      const chunk = bhkPriceInserts.slice(i, i + 500);
      await db.insert(bhkPrices).values(chunk);
    }
  }

  console.log(`[scraper/build] Completed build stage for ${deduped.length} societies.`);
  return { builtCount: deduped.length };
}
