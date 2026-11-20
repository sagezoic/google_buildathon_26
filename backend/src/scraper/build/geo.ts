const M_PER_DEG_LAT = 111320.0;

export function mPerDegLng(lat: number): number {
  return M_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180.0);
}

/**
 * Planar metre distance between two [lng, lat] points using local latitude projection.
 */
export function distM(a: [number, number], b: [number, number]): number {
  const dx = (a[0] - b[0]) * mPerDegLng((a[1] + b[1]) / 2);
  const dy = (a[1] - b[1]) * M_PER_DEG_LAT;
  return Math.hypot(dx, dy);
}
