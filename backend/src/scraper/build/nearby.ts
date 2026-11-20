import { distM } from './geo';

export interface PoiRecord {
  type: string;
  name?: string | null;
  lat: number;
  lng: number;
}

export interface NearbyStats {
  m: number;
  name?: string;
  n?: number;
}

/**
 * Calculates nearest POIs of each category within 3000m and counts within 1000m.
 */
export function calculateNearby(
  society: { lat: number; lng: number },
  pois: PoiRecord[]
): Record<string, NearbyStats> {
  const here: [number, number] = [society.lng, society.lat];
  const near: Record<string, NearbyStats> = {};

  for (const q of pois) {
    const d = distM(here, [q.lng, q.lat]);
    if (d > 3000) continue;

    const k = q.type;
    const roundedDist = Math.round(d / 10) * 10;

    if (!near[k] || d < near[k].m) {
      near[k] = {
        m: roundedDist,
        name: q.name || undefined,
        n: near[k]?.n || 0,
      };
    }

    if (d <= 1000) {
      near[k].n = (near[k].n || 0) + 1;
    }
  }

  return near;
}
