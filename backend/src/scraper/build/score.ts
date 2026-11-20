import type { NearbyStats } from './nearby';

export interface ScoreResult {
  score: number;
  score_parts: Record<string, number>;
}

/**
 * Calculates Flat Finder score (0-10) based on:
 * - residents rating (weight 0.5)
 * - what is nearby (weight 0.3)
 * - amenities count (weight 0.2)
 * Normalized across present parts.
 */
export function calculateScore(society: {
  rating?: number | null;
  amenities?: string[] | null;
  nearby?: Record<string, NearbyStats> | null;
}): ScoreResult {
  const parts: Record<string, number> = {};

  if (society.rating && society.rating > 0) {
    parts.residents = Math.round(society.rating * 2 * 10) / 10;
  }

  const nb = society.nearby || {};
  const reach = [
    (nb.park?.m ?? 9e9) <= 500,
    (nb.metro?.m ?? 9e9) <= 1500 || (nb.rail?.m ?? 9e9) <= 1500,
    (nb.school?.m ?? 9e9) <= 1000,
    (nb.hospital?.m ?? 9e9) <= 2000,
    (nb.shopping?.m ?? 9e9) <= 1500,
  ];
  const reachCount = reach.filter(Boolean).length;
  parts.nearby = Math.round(((10 * reachCount) / reach.length) * 10) / 10;

  const amenCount = society.amenities?.length || 0;
  parts.amenities = Math.round(Math.min(10, amenCount / 3) * 10) / 10;

  const weights: Record<string, number> = {
    residents: 0.5,
    nearby: 0.3,
    amenities: 0.2,
  };

  let totalWeight = 0;
  let weightedSum = 0;

  for (const [k, partScore] of Object.entries(parts)) {
    const w = weights[k] || 0;
    totalWeight += w;
    weightedSum += partScore * w;
  }

  const score = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 10) / 10 : 0;

  return {
    score,
    score_parts: parts,
  };
}
