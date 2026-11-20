import fs from 'fs/promises';
import path from 'path';
import { getCityConfig, type CityConfig } from '../cities';
import { sleep } from '../http';

const MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
];

const DEFAULT_CACHE_DIR = path.resolve(__dirname, '../../../.cache/osm');

export interface OverpassPoi {
  city: string;
  type: string; // park | metro | rail | school | hospital | shopping
  name?: string | null;
  lat: number;
  lng: number;
}

export function poiKind(tags: Record<string, string>): string | null {
  if (tags.leisure === 'park') return 'park';
  if (
    tags.station === 'subway' ||
    (tags.name || '').toLowerCase().includes('metro') ||
    tags.subway === 'yes'
  ) {
    return 'metro';
  }
  if (tags.railway === 'station' || tags.railway === 'halt') return 'rail';
  if (tags.amenity === 'school' || tags.amenity === 'hospital') return tags.amenity;
  if (tags.shop === 'mall' || tags.shop === 'supermarket') return 'shopping';
  return null;
}

export async function fetchOverpassPois(
  citySlug: string,
  cacheDir = DEFAULT_CACHE_DIR
): Promise<OverpassPoi[]> {
  const city = getCityConfig(citySlug);
  const [south, west, north, east] = city.bbox;
  const bb = `(${south},${west},${north},${east})`;

  const query = `[out:json][timeout:280];(
    way["leisure"="park"]${bb};relation["leisure"="park"]${bb};node["leisure"="park"]${bb};
    node["railway"="station"]${bb};node["station"="subway"]${bb};node["railway"="halt"]${bb};
    node["amenity"="school"]${bb};way["amenity"="school"]${bb};
    node["amenity"="hospital"]${bb};way["amenity"="hospital"]${bb};
    node["shop"="mall"]${bb};way["shop"="mall"]${bb};way["shop"="supermarket"]${bb};node["shop"="supermarket"]${bb};
  );out center tags;`;

  await fs.mkdir(cacheDir, { recursive: true });
  const cacheFile = path.join(cacheDir, `${city.slug}_pois.json`);

  // Check cache
  try {
    const raw = await fs.readFile(cacheFile, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      console.log(`[osm/overpass] Using cached POIs (${parsed.length} items) for ${city.name}`);
      return parsed;
    }
  } catch {
    // Cache miss
  }

  console.log(`[osm/overpass] Querying Overpass for ${city.name} [bbox: ${bb}]...`);
  const body = new URLSearchParams({ data: query }).toString();

  let data: any = null;
  const attempts = [...MIRRORS, ...MIRRORS];

  for (let i = 0; i < attempts.length; i++) {
    const mirror = attempts[i];
    try {
      console.log(`[osm/overpass] Trying mirror: ${mirror}`);
      const res = await fetch(mirror, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'realdha-flat-finder/1.0',
        },
        body,
        signal: AbortSignal.timeout(60000),
      });

      if (res.ok) {
        data = await res.json();
        break;
      }
      console.warn(`[osm/overpass] Mirror ${mirror} returned ${res.status}`);
    } catch (err) {
      console.warn(`[osm/overpass] Mirror ${mirror} failed:`, err);
    }
    if (i < attempts.length - 1) {
      await sleep(3000);
    }
  }

  if (!data || !Array.isArray(data.elements)) {
    console.warn(`[osm/overpass] All Overpass mirrors failed or timed out for ${city.name}. Returning empty list.`);
    return [];
  }

  const pois: OverpassPoi[] = [];
  for (const el of data.elements) {
    const center = el.center || (el.lat !== undefined ? { lat: el.lat, lon: el.lon } : null);
    const tags = el.tags || {};
    const kind = poiKind(tags);

    if (center && kind) {
      pois.push({
        city: city.slug,
        type: kind,
        name: tags.name || null,
        lat: Math.round(center.lat * 100000) / 100000,
        lng: Math.round(center.lon * 100000) / 100000,
      });
    }
  }

  try {
    await fs.writeFile(cacheFile, JSON.stringify(pois, null, 2));
  } catch (err) {
    console.warn(`[osm/overpass] Failed to write POI cache:`, err);
  }

  console.log(`[osm/overpass] Fetched and cached ${pois.length} POIs for ${city.name}.`);
  return pois;
}
