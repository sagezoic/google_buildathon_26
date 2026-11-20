export interface CityConfig {
  name: string;
  slug: string;
  magicbricks: string;
  bbox: [number, number, number, number]; // [south, west, north, east]
  center: [number, number]; // [lng, lat]
  zoom?: number;
}

export const CITIES: Record<string, CityConfig> = {
  pune: {
    name: 'Pune',
    slug: 'pune',
    magicbricks: 'pune',
    bbox: [18.40, 73.65, 18.75, 74.10],
    center: [73.8567, 18.5204],
    zoom: 12.0,
  },
  gurgaon: {
    name: 'Gurugram',
    slug: 'gurgaon',
    magicbricks: 'gurgaon',
    bbox: [28.33, 76.88, 28.55, 77.16],
    center: [77.065, 28.425],
    zoom: 12.4,
  },
};

export function getCityConfig(slug: string): CityConfig {
  const city = CITIES[slug.toLowerCase()];
  if (!city) {
    throw new Error(`Unsupported city: ${slug}. Available cities: ${Object.keys(CITIES).join(', ')}`);
  }
  return city;
}
