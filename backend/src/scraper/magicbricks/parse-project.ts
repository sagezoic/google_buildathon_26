import { num, parseUnitInfo, extractJsonObject } from './parse-list';

export interface ProjectListing {
  bhk: number | null;
  price: number | null;
  sqft: number | null;
  psf: number | null;
  furnished: string | null;
  floor: string | null;
  posted: string;
}

export interface ProjectReview {
  title: string;
  text: string;
  date: string | null;
  by: string | null;
  rating: number | null;
}

export interface ProjectConfigs {
  units: Array<{ bhk: number | null; sqft: number; kind: string }>;
  by_bhk: Record<
    number,
    {
      price_min: number | null;
      price_max: number | null;
      plan_images: string[];
    }
  >;
}

export interface ParsedProjectDetails {
  lat: number | null;
  lng: number | null;
  rera_id: string | null;
  towers: number | null;
  units: number | null;
  status: string | null;
  amenities: string[];
  config_text: string | null;
  configs: ProjectConfigs;
  rating: number | null;
  rating_count: number | null;
  review_count: number | null;
  ratings: Record<string, number>;
  reviews: ProjectReview[];
  sale_count: number | null;
  rent_count: number | null;
  sale_listings: ProjectListing[];
  rent_listings: ProjectListing[];
  psf_now: number | null;
  trend: Array<[string, number]>;
  locality_rating: number | null;
  description: string | null;
}

const TAG_REGEX = /<[^>]+>/g;

export function cleanText(html: string | null | undefined, maxLen: number): string {
  if (!html) return '';
  let t = html
    .replace(TAG_REGEX, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

  if (t.length > maxLen) {
    const sliced = t.slice(0, maxLen);
    const lastSpace = sliced.lastIndexOf(' ');
    t = (lastSpace > 0 ? sliced.slice(0, lastSpace) : sliced) + '…';
  }
  return t;
}

export const RATING_KEYS: Record<string, string> = {
  waterRt: 'water',
  electricityRt: 'power',
  backupRt: 'power backup',
  securityRt: 'security',
  maintenanceRt: 'maintenance',
  constQualityRt: 'construction',
  parkingRt: 'parking',
  sportsRt: 'sports',
  gardenRt: 'green areas',
  shopsRt: 'shops nearby',
  staffRt: 'staff',
  sewageRt: 'sewage',
};

export function parseListing(r: Record<string, any>): ProjectListing {
  const bedroomStr = String(r.bedroomD || '').trim();
  const bhk = /^\d+$/.test(bedroomStr) ? parseInt(bedroomStr, 10) : null;
  const posted = (r.postDateT ? String(r.postDateT) : '').slice(0, 10);

  return {
    bhk,
    price: num(r.price),
    sqft: num(r.caSqFt),
    psf: num(r.sqFtPrice),
    furnished: r.furnishedD ? String(r.furnishedD).trim() : null,
    floor: r.floorNo !== undefined && r.floorNo !== null ? String(r.floorNo) : null,
    posted,
  };
}

export function parseConfigs(state: Record<string, any>): ProjectConfigs {
  const pdd = state.projectDetailData || {};
  const units = parseUnitInfo(pdd.mUnitInfo || '');
  const pricing = state.projectPageSeoStaticData?.pdpUnitPricing || {};
  const plans: ProjectConfigs['by_bhk'] = {};

  for (const [key, rows] of Object.entries(pricing)) {
    const mm = key.match(/^(\d+)\s*BHK/i);
    if (!mm || !Array.isArray(rows)) continue;
    const b = parseInt(mm[1], 10);

    const minPrices = rows
      .map((r: any) => num(r.minPriceD))
      .filter((v): v is number => v !== null && v > 0);
    const maxPrices = rows
      .map((r: any) => num(r.maxPriceD))
      .filter((v): v is number => v !== null && v > 0);

    const planImagesSet = new Set<string>();
    for (const r of rows) {
      if (r && r.unitFlrPlanImg) {
        planImagesSet.add(`https://img.staticmb.com/mbimages/project/${r.unitFlrPlanImg}`);
      }
    }

    plans[b] = {
      price_min: minPrices.length > 0 ? Math.min(...minPrices) : null,
      price_max: maxPrices.length > 0 ? Math.max(...maxPrices) : null,
      plan_images: Array.from(planImagesSet).sort(),
    };
  }

  return { units, by_bhk: plans };
}

export function parseExtras(html: string, state: Record<string, any>): Omit<
  ParsedProjectDetails,
  'lat' | 'lng' | 'rera_id' | 'towers' | 'units' | 'status' | 'amenities' | 'config_text' | 'configs'
> {
  const seo = state.projectPageSeoStaticData || {};
  const mob = state.projectDetailData?.prjMobileBean || {};
  const rb = mob.ratingBean || {};
  const groups = seo.bhkDetailsDTO?.bhkProjectDetailsMap?.ALL || {};

  // Reviews
  const reviews: ProjectReview[] = [];
  const seenReviews = new Set<string>();
  const rawReviews = seo.projectReviews?.resultList || [];

  for (const r of rawReviews) {
    if (r.isSponsered === true || r.isSponsered === 'Y' || r.isSponsered === 'true' || r.isSponsered === 1) {
      continue;
    }
    if (reviews.length >= 6) break;

    const text = cleanText(r.reviewDescription, 320);
    const key = text.toLowerCase().replace(/\W+/g, '').slice(0, 60);
    if (text && !seenReviews.has(key)) {
      seenReviews.add(key);
      reviews.push({
        title: cleanText(r.reviewTitle, 90),
        text,
        date: r.reviewedOn ? String(r.reviewedOn) : null,
        by: r.userType ? String(r.userType) : null,
        rating: num(r.overAllRating),
      });
    }
  }

  // Trend graph
  const trend: Array<[string, number]> = [];
  const trendDocs = seo.projectTrendsGraph?.projectSrpPriceTrendDoc || [];
  for (const doc of trendDocs) {
    try {
      const data = JSON.parse(doc.jsonProjectData || '{}');
      if (data && typeof data === 'object') {
        for (const v of Object.values(data) as any[]) {
          const fiveY = v?.yoyGrowth?.fiveY || [];
          for (const q of fiveY) {
            if (q && q.qAvgP && q.qIdentifier) {
              trend.push([String(q.qIdentifier), Number(q.qAvgP)]);
            }
          }
        }
      }
    } catch {
      // Ignore JSON parse errors in trend docs
    }
  }

  // PSF now from priceTrendsCont
  const priceTrendsCont = String(mob.priceTrendsCont || '');
  const psfMatch = priceTrendsCont.match(/₹\s?([\d,]+)/);
  const psf_now = psfMatch ? parseFloat(psfMatch[1].replace(/,/g, '')) || null : null;

  // Ratings map
  const ratings: Record<string, number> = {};
  for (const [k, name] of Object.entries(RATING_KEYS)) {
    if (rb[k] !== undefined && rb[k] !== null) {
      const val = parseFloat(String(rb[k]));
      if (!Number.isNaN(val)) {
        ratings[name] = val;
      }
    }
  }

  // Locality rating
  const loc = seo.localityDetailsBean?.localityDetailDTO || {};
  const locality_rating = num(loc.ratingAvgCount);

  // Description
  const descRaw = mob.projectDescription?.fullDesc || '';
  const description = cleanText(descRaw, 600) || null;

  // Listings
  const saleListingsRaw = groups.groupedResult || [];
  const rentListingsRaw = groups.groupedRentResult || [];

  const sale_listings = saleListingsRaw
    .map(parseListing)
    .filter((l: ProjectListing) => l.price !== null && l.price > 0);
  const rent_listings = rentListingsRaw
    .map(parseListing)
    .filter((l: ProjectListing) => l.price !== null && l.price > 0);

  return {
    rating: num(rb.psmAvgRt),
    rating_count: /^\d+$/.test(String(rb.totalRating || '')) ? parseInt(String(rb.totalRating), 10) : null,
    review_count: /^\d+$/.test(String(rb.totalReview || '')) ? parseInt(String(rb.totalReview), 10) : null,
    ratings,
    reviews,
    sale_count: /^\d+$/.test(String(mob.sellCountProperty || ''))
      ? parseInt(String(mob.sellCountProperty), 10)
      : null,
    rent_count: /^\d+$/.test(String(mob.rentCountProperty || ''))
      ? parseInt(String(mob.rentCountProperty), 10)
      : null,
    sale_listings,
    rent_listings,
    psf_now,
    trend,
    locality_rating,
    description,
  };
}

export function parseProjectPage(html: string): ParsedProjectDetails {
  const marker = 'window.SERVER_PRELOADED_STATE_';
  const markerIdx = html.indexOf(marker);
  let state: Record<string, any> = {};

  if (markerIdx >= 0) {
    const eqIdx = html.indexOf('=', markerIdx);
    if (eqIdx >= 0) {
      const braceIdx = html.indexOf('{', eqIdx);
      if (braceIdx >= 0) {
        state = extractJsonObject(html, braceIdx) || {};
      }
    }
  }

  const pdd = state.projectDetailData || {};
  const mob = pdd.prjMobileBean || {};
  const info = mob.infoBean || {};
  const det = mob.detailBean || {};

  const lat = num(info.psmLatitude);
  const lng = num(info.psmLongitude);

  const amenitiesList = mob.amenitiesList || [];
  const amenities: string[] = amenitiesList
    .map((a: any) => (a && a.amenityName ? String(a.amenityName).trim() : ''))
    .filter(Boolean);

  const configs = parseConfigs(state);
  const extras = parseExtras(html, state);

  return {
    lat,
    lng,
    rera_id: det.reraId ? String(det.reraId).trim() : null,
    towers: num(det.towers),
    units: num(det.units),
    status: det.status ? String(det.status).trim() : null,
    amenities,
    config_text: det.prjConfig ? String(det.prjConfig).trim() : null,
    configs,
    ...extras,
  };
}
