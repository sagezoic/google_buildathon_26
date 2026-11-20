---
name: realdha-flat-finder
description: Architecture, scraper pipeline, database schema, and API patterns for Realdha Flat Finder (Pune & new cities).
---

# Realdha Flat Finder (Pune & Multi-City)

## When to Use
Use this skill when:
- Adding or configuring a new city for the Realdha Flat Finder (e.g., Mumbai, Bengaluru, Hyderabad).
- Running, debugging, or extending the Magicbricks + OpenStreetMap scraping pipeline.
- Modifying the PostgreSQL database schema (Drizzle ORM) or running migrations.
- Working on the Flat Finder search, filtering, comparison, and detail APIs in Elysia.
- Updating scoring, pricing yield models, outlier detection, or nearby POI thresholds.

---

## Architecture Map

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Data Acquisition & Build                        │
├───────────────────────────────┬────────────────────────────────────────┤
│ Magicbricks Listing Pages     │ OpenStreetMap Overpass API             │
│ (residential-projects-...-N)  │ (leisure=park, railway, school, etc.)  │
└──────────────┬────────────────┴───────────────────┬────────────────────┘
               │                                    │
               ▼                                    ▼
       mb/parse-list.ts                       osm/overpass.ts
               │                                    │
               ▼                                    ▼
       mb/parse-project.ts                  pois (Postgres)
               │                                    │
               └─────────────────┬──────────────────┘
                                 │
                                 ▼
                     build/ (dedupe, pricing, nearby, score)
                                 │
                                 ▼
              Postgres Database (via Drizzle ORM / Bun SQL)
       [societies, unit_types, listings, bhk_prices, reviews, pois]
                                 │
                                 ▼
                    Elysia REST API (modules/flats/)
    GET /api/flats/cities        GET /api/flats/societies
    GET /api/flats/societies/:id GET /api/flats/localities
    GET /api/flats/compare
```

---

## 1. How to Add a New City

Cities are configured in `backend/src/scraper/cities.ts`.

To add a city (e.g. `mumbai`):
1. Determine the Magicbricks city slug (e.g. `mumbai`).
2. Define the geographic bounding box `[south, west, north, east]` and center coordinates `[lng, lat]`.
3. Add the entry to `CITIES`:

```typescript
export const CITIES: Record<string, CityConfig> = {
  mumbai: {
    name: 'Mumbai',
    slug: 'mumbai',
    magicbricks: 'mumbai',
    bbox: [18.89, 72.77, 19.30, 73.05], // [south, west, north, east]
    center: [72.88, 19.08],
    zoom: 11.4,
  },
};
```

---

## 2. Scrape Commands & Stages

The scraper CLI is invoked via Bun:
```bash
bun run scrape <city> [--stage list|projects|osm|build|all] [--pages N] [--limit N]
```

### Stages
- `list`: Crawls listing index pages (`residential-projects-in-<city>-nprid/page-N`), extracts cards via brace walking JSON parser, and upserts society stubs into `societies`.
- `projects`: Crawls individual project detail pages, parses `SERVER_PRELOADED_STATE_` for coordinates, RERA ID, towers, units, amenities, reviews, and active sale/rent listings.
- `osm`: Queries Overpass mirrors for parks, transit (metro/rail), schools, hospitals, and shopping centers within the city's bounding box and writes to `pois`.
- `build`:
  - Filters societies within city bbox.
  - Deduplicates phases and close duplicates (<400m apart).
  - Infers property kind (`apartment`, `villa`, `builder floor`, `plot`, `commercial`).
  - Computes nearby POIs (nearest distance & count within 1km).
  - Calculates Flat Finder score (0-10) weighted by residents (0.5), nearby reach (0.3), amenities (0.2).
  - Computes BHK listing statistics, fits rental yield model, flags outlier typos, and adds estimates (`addEstimates`).
  - Stores computed `bhk_prices` rows and updates `societies`.
- `all`: Runs `list` ➜ `projects` ➜ `osm` ➜ `build` sequentially.

### Re-running & Idempotency
All stages are idempotent and re-runnable. Upserts handle updates cleanly, and every run logs an audit record in `scrape_runs`.

---

## 3. Magicbricks URL Patterns & JSON Extraction (Fragility Notes)

Magicbricks embeds rich state in script tags:

1. **Listing Pages (`/residential-projects-in-<city>-nprid/page-N`)**:
   - Total count: `"totalCount":(\d+)`
   - Project cards: Embedded within script tags containing `"psmName":`.
   - Extractor: `extractJsonObject` walks backward from `"psmName":` to `{` and balances braces while respecting quoted strings and escape sequences.

2. **Project Detail Pages**:
   - Embedded state: `window.SERVER_PRELOADED_STATE_ = {...};`
   - Key JSON Paths:
     - Coordinates: `projectDetailData.prjMobileBean.infoBean.psmLatitude` / `psmLongitude`
     - Details: `projectDetailData.prjMobileBean.detailBean` (`reraId`, `units`, `towers`, `status`, `prjConfig`)
     - Amenities: `projectDetailData.prjMobileBean.amenitiesList[].amenityName`
     - Resident Ratings: `projectDetailData.prjMobileBean.ratingBean` (`psmAvgRt`, sub-ratings)
     - Resident Reviews: `projectPageSeoStaticData.projectReviews.resultList`
     - Sale & Rent Listings: `projectPageSeoStaticData.bhkDetailsDTO.bhkProjectDetailsMap.ALL.groupedResult` / `groupedRentResult`
     - Price Trend: `projectPageSeoStaticData.projectTrendsGraph.projectSrpPriceTrendDoc[].jsonProjectData`

> [!WARNING]
> Magicbricks frontend scripts occasionally change object wrappers. Always test parsers against saved fixtures in `backend/test/fixtures/` when updating parsing logic.

---

## 4. Database Schema Summary & Migration Workflow

Postgres schema is defined in `backend/src/db/schema.ts` using Drizzle ORM:
- `societies`: ID `mb_<psmid>`, core attributes, amenities, coordinates, rating, score, nearby POIs summary.
- `unit_types`: FK `society_id`, BHK, sqft size, price range, floor plan images.
- `listings`: FK `society_id`, mode (`sale` | `rent`), BHK, price, sqft, psf, furnished, floor.
- `bhk_prices`: FK `society_id`, BHK, buy median/min/max/n, rent median/min/max/n, psf, flags.
- `reviews`: FK `society_id`, title, text, date, author, rating.
- `pois`: City, type (`park`, `metro`, `rail`, `school`, `hospital`, `shopping`), name, lat, lng.
- `scrape_runs`: Audit history of scraper runs with stages, timestamps, counts, and errors.

### Migration Commands
```bash
# Generate SQL migration from schema.ts
bun run db:generate

# Execute migrations on the database
bun run db:migrate

# Launch Drizzle Studio UI
bun run db:studio
```

---

## 5. API Endpoints & Query Parameters

All endpoints are mounted under `/api/flats`:

### `GET /api/flats/cities`
Returns list of available cities with society counts.

### `GET /api/flats/societies`
Search and filter societies.
- `city`: City slug (default: `pune`).
- `q`: Search string in name, developer, or locality.
- `locality`: Locality name.
- `bhk`: Comma-separated BHK numbers (e.g. `2,3`).
- `kind`: Comma-separated kinds (`apartment`, `villa`, `builder floor`, `plot`).
- `mode`: `buy` or `rent` (default: `buy`).
- `minPrice`, `maxPrice`: Buy price in INR.
- `minRent`, `maxRent`: Monthly rent in INR.
- `minSqft`, `maxSqft`: Size in square feet.
- `amenities`: Comma-separated amenities (e.g. `gym,pool`).
- `ready`: Boolean (`true` for ready-to-move).
- `near`: Comma-separated POI types (`park`, `metro`, `school`, `hospital`, `shopping`).
- `minRating`: Minimum resident rating (1 to 5).
- `lat`, `lng`, `radiusKm`: Proximity search around coordinates.
- `sort`: `best` (default), `price`, `rent`, `size`, `rating`, `score`, `distance`, `name`.
- `limit` (max 100, default 20), `offset` (default 0).

### `GET /api/flats/societies/:id`
Returns full society detail including `unit_types`, `bhk_prices`, sample `listings`, and `reviews`.

### `GET /api/flats/localities?city=pune`
Returns locality aggregation with society counts and median prices.

### `GET /api/flats/compare?ids=mb_1,mb_2`
Returns side-by-side comparison of 2 to 5 societies with complete unit types and BHK pricing.

---

## 6. Elysia Route & Lazy DB Conventions

- **Lazy Connection**: `src/db/client.ts` uses `getDb()`, which connects only when called. Merely importing `app.ts` does not attempt to connect to Postgres. This ensures CI and unit tests pass without a database.
- **Route Definitions**: Use Elysia's type system `t` for parameter validation and OpenAPI schema generation.
- **Testing**:
  - Scraper unit tests (`backend/test/scraper.test.ts`) test HTML parsers without network or DB.
  - Algorithm unit tests (`backend/test/pricing.test.ts`, `backend/test/build.test.ts`) test pricing yields and deduplication.
  - Integration tests (`backend/test/flats.db.test.ts`) use `it.skipIf(!process.env.DATABASE_URL)` so CI without a database succeeds.

---

## 7. Gotchas & Operational Guidelines

1. **Polite Crawling & Rate Limits**:
   - `http.ts` enforces `SCRAPER_DELAY_MS` (default 1000ms), 3-retry exponential backoff, and a concurrency limit of 3.
   - Gzip cache in `backend/.cache/` prevents repeated downloads of the same URLs.
2. **Windows Path Compatibility**:
   - Always use `path.resolve` or `path.join` for cache directories and migration folders.
3. **No OCR/AI in Scope**:
   - Floor plan image OCR and brochure reading were in the Python prototype but are deliberately excluded from the Bun backend in favor of direct Magicbricks portal data and OSM POIs.
