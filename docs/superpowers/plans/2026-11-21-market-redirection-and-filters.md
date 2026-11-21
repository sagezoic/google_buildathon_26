# Market Component Navigation, Backend API Integration, and Filter Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix `/market` society card navigation to route to `/market/:id` instead of `/marketplace`, wire `/market/:id` (`GP-22-MarketDetail`) to live backend API data with retained financial token analytics, and resolve filter synchronization, rental sorting, and city-scoped watchlist bugs.

**Architecture:** 
1. Use React Router `Link` in `GP-21-Market.tsx` to target canonical `/market/:id`.
2. Connect `GP-22-MarketDetail.tsx` to `GET /api/flats/societies/:id` via `fetchSociety(id)` from `flats-api.ts`, using `useParams<{ id: string }>()`, rendering complete relational property details (photos, BHK pricing, listings, nearby POIs, reviews) while retaining the token/financial chart widgets in a dedicated card.
3. Synchronize `GP-21-Market.tsx` filter state with URL `useSearchParams`, map rental price sorting to `sort: 'rent'`, scope the watchlist tab to the active city, and provide BHK filter buttons and an empty-state reset button.

**Tech Stack:** React 19, Vite, React Router v7, TypeScript, Tailwind CSS, Lucide React, Bun (backend API).

**Spec:** `docs/superpowers/specs/2026-11-21-market-redirection-and-filters-design.md`

## Global Constraints

- Never hardcode backend URLs; all requests must proxy through `/api/flats/*`.
- Maintain existing styling conventions and design system tokens (`tokens.css`, `Screen`, `Card`, `Button`, `Pill`).
- Keep `npm run lint` (`oxlint`) and `npm run build` (`tsc -b && vite build`) passing with zero errors.

## Review Focus

1. **Missing or Invalid ID:** Opening `/market/:id` with a non-existent or malformed ID must display a graceful error card with a "Back to Market" button and a retry option, without throwing an uncaught exception.
2. **Missing Relational Arrays:** Societies without unit types, listings, nearby POIs, or reviews must render fallback placeholders or cleanly hide empty sections instead of crashing on `undefined.map()`.
3. **Rental Sort Mapping:** When `mode === 'rent'` and sorting by "Price: low to high", the query sent to `/api/flats/societies` must be `sort=rent` (not `sort=price`), properly sorting by monthly rent.
4. **URL Query Param Deserialization:** Direct deep links to `/market?city=mumbai&mode=rent&sort=price&bhk=2` must initialize all dropdowns and request data matching those parameters accurately.
5. **Watchlist City Isolation:** Switching between cities while on the Watchlist tab must only display saved societies belonging to the currently selected city, and not show 0 results due to unmatching search/kind filters.

---

### Task 1: Fix Society Tile Navigation in `GP-21-Market.tsx`

**Files:**
- Modify: `realdha-ui/src/routes/market/GP-21-Market.tsx:86-135`

**Interfaces:**
- Consumes: `SocietyCard` from `../../lib/flats-api`, `Link` from `react-router`
- Produces: Navigation links to `/market/:id`

- [ ] **Step 1: Replace legacy `/marketplace` link with React Router `Link`**

In `realdha-ui/src/routes/market/GP-21-Market.tsx`:
- Import `Link` from `react-router`.
- In `SocietyTile`, change `href`:
  ```tsx
  const href = `/market/${encodeURIComponent(s.id)}`
  ```
- Replace `<a href={href} className="card-link ...">{s.name}</a>` with:
  ```tsx
  <Link to={href} className="card-link text-text no-underline outline-none after:absolute after:inset-0 after:content-['']">{s.name}</Link>
  ```
- Make sure clicking anywhere on the card tile navigates via React Router to `/market/:id` without page reload or redirection to `/marketplace`.

- [ ] **Step 2: Verify in shell**

Run: `cd realdha-ui && npm run lint`
Expected: PASS with 0 errors.

---

### Task 2: Extend `flats-api.ts` Query Capabilities & Rent Sort Mapping

**Files:**
- Modify: `realdha-ui/src/lib/flats-api.ts:93-122`
- Modify: `realdha-ui/src/lib/useSocieties.ts:10-34`

**Interfaces:**
- Consumes: Backend `/api/flats/societies` query parameters (`city`, `q`, `mode`, `kind`, `ready`, `sort`, `bhk`, `limit`, `offset`)
- Produces: Updated `SocietyQuery` interface supporting `bhk?: number | number[]`, `ready?: boolean`, and auto-mapping `mode === 'rent' && sort === 'price'` to `'rent'`.

- [ ] **Step 1: Update `SocietyQuery` and `fetchSocieties` in `flats-api.ts`**

In `realdha-ui/src/lib/flats-api.ts`:
- Update `SocietyQuery` interface:
  ```ts
  export interface SocietyQuery {
    city?: string
    q?: string
    mode?: FlatMode
    kind?: string
    ready?: boolean
    sort?: FlatSort
    bhk?: number | number[]
    limit?: number
    offset?: number
  }
  ```
- In `fetchSocieties(query: SocietyQuery, signal?: AbortSignal)`:
  - If `query.mode === 'rent' && query.sort === 'price'`, set `p.set('sort', 'rent')`. Otherwise if `query.sort`, set `p.set('sort', query.sort)`.
  - If `query.bhk`:
    - If array, `p.set('bhk', query.bhk.join(','))`.
    - If number, `p.set('bhk', String(query.bhk))`.
  - If `query.ready !== undefined`, `p.set('ready', query.ready ? 'true' : 'false')`.

- [ ] **Step 2: Update `useSocieties.ts` dependency handling**

In `realdha-ui/src/lib/useSocieties.ts`:
- Extract `bhk` from `query`.
- Include `bhk` in `fetchSocieties({ city, q, mode, kind, ready, sort, bhk, limit, offset }, controller.signal)` and the `useEffect` dependency array.

- [ ] **Step 3: Verify build**

Run: `cd realdha-ui && npm run lint && npm run build`
Expected: PASS with 0 errors.

---

### Task 3: Build Backend-Connected `/market/:id` Screen in `GP-22-MarketDetail.tsx`

**Files:**
- Modify: `realdha-ui/src/routes/market/GP-22-MarketDetail.tsx`

**Interfaces:**
- Consumes:
  - `useParams<{ id: string }>()` from `react-router`
  - `fetchSociety(id)` from `../../lib/flats-api`
  - `cardBadges`, `formatInr`, `grossYield`, `lowestRent`, `type SocietyDetailData` from `../../lib/flats-api`
  - `usePersistentState` from `../../app/persist`
  - `Screen` from `../../app/Shell`
  - `Card`, `Button`, `Pill`, `RecordId` components
  - `Delta` from `../../components/ui/market`
  - `RANGES`, `X_LABELS`, `seriesFor`, `type Range` from `../../data/fixtures/market`
- Produces: Complete responsive society detail screen at `/market/:id`.

- [ ] **Step 1: Implement `GP-22-MarketDetail.tsx` with live API fetch, states, and dual views**

In `realdha-ui/src/routes/market/GP-22-MarketDetail.tsx`:
1. Use `useParams<{ id: string }>()` to get `id`. Default to a known ID or `'mb_1'` if missing.
2. Maintain `society` state (`SocietyDetailData | null`), `loading` (boolean), `error` (`string | null`), `activePhoto` (number).
3. Synchronize `watchlist` with `usePersistentState<string[]>('market.watchlist.v2', [])`.
4. Retain `range` state (`Range`) and price series chart widget with sample data for on-chain / financial analytics.
5. In `useEffect`, call `fetchSociety(id, controller.signal)`.
6. Layout structure:
   - `<Screen id="GP-22">`
   - Back button: `<Link to={path('GP-21')} className="..."><ArrowLeft /> Back to Market</Link>`.
   - Error state: If fetch fails or 404, show Card with clear alert, retry button, and link back to `/market`.
   - Loading skeleton: If `loading && !society`, render an animated pulse skeleton.
   - When loaded:
     - **Header / Badges**: Name, locality, city, pincode, RERA ID, Flat Finder Score (`score.toFixed(1)}/10`), Verified badges.
     - **Hero Section**: Photo gallery with main image and clickable thumbnails.
     - **Pricing & Overview Card**:
       - Buy pricing range (`formatInr(price_min)` to `formatInr(price_max)`).
       - Rent pricing (`lowestRent(prices)`).
       - Estimated Gross Yield (`grossYield(...)%`).
       - Status, Possession date, Units count, Towers, Acres.
     - **Unit Types & Pricing Table**:
       - Render `society.unit_types` and `society.bhk_prices` displaying BHK configurations, sqft sizes, median buy price, median rent, and PSF.
     - **Active Listings Section**:
       - Show available units from `society.listings` with badge for Sale/Rent, floor, and furnishing.
     - **Nearby POIs & Neighborhood**:
       - Render `society.nearby` (distances to metro, park, school, hospital, shopping).
     - **Resident Reviews**:
       - Render list of `society.reviews` with rating stars, author, date, and review text.
     - **Token & Financial Metrics Widget (Sample Data)**:
       - Retain the interactive `PriceChart` with range buttons (1D, 1W, 1M, 1Y, All) and Sepolia testnet anchoring badge.
     - **Actions Sidebar / Bottom Bar**:
       - "Watchlist" toggle button (syncs with `market.watchlist.v2`).
       - "Register Interest" button linking to `path('F18-02')`.
       - "Ask AI" button linking to `path('GP-18', { id })`.

- [ ] **Step 2: Verify lint and build**

Run: `cd realdha-ui && npm run lint && npm run build`
Expected: PASS with 0 errors.

---

### Task 4: Fix Filters and Watchlist in `GP-21-Market.tsx`

**Files:**
- Modify: `realdha-ui/src/routes/market/GP-21-Market.tsx`

**Interfaces:**
- Consumes: `useSearchParams` from `react-router`, `useSocieties`, `fetchCities`
- Produces: Robust, URL-synchronized, city-scoped filtered market browse view.

- [ ] **Step 1: Bind filters to `useSearchParams` and add BHK & Ready filters**

In `realdha-ui/src/routes/market/GP-21-Market.tsx`:
1. Replace `usePersistentState<Filters>` with `useSearchParams()` for URL synchronization:
   - `city`: `searchParams.get('city') || 'pune'`
   - `tab`: `(searchParams.get('tab') as 'all' | 'watchlist') || 'all'`
   - `mode`: `(searchParams.get('mode') as FlatMode) || 'buy'`
   - `type`: `searchParams.get('type') || ''`
   - `sort`: `(searchParams.get('sort') as FlatSort) || 'best'`
   - `q`: `searchParams.get('q') || ''`
   - `bhk`: `searchParams.get('bhk') ? Number(searchParams.get('bhk')) : undefined`
   - `ready`: `searchParams.get('ready') === 'true'`
2. When updating any filter, update `searchParams` via `setSearchParams(newParams, { replace: true })` and reset `page` to 1.
3. Add BHK filter pill row: `All`, `1 BHK`, `2 BHK`, `3 BHK`, `4+ BHK`.
4. Fix Watchlist tab logic:
   - When `tab === 'watchlist'`:
     - Scope query by `city`.
     - Filter fetched results by `watch.includes(s.id)` and `s.city.toLowerCase() === city.toLowerCase()`.
     - If user has watched societies in this city, display them.
5. Add "Clear all filters" button when `rows.length === 0`.
6. Ensure debounced typing for `q` input so URL search params update cleanly.

- [ ] **Step 2: Verify lint and build**

Run: `cd realdha-ui && npm run lint && npm run build`
Expected: PASS with 0 errors.

---

### Task 5: End-to-End Build and Verification

**Files:**
- Check: All modified files in `realdha-ui/src/routes/market/` and `realdha-ui/src/lib/`

- [ ] **Step 1: Run comprehensive lint checks**

Run: `cd realdha-ui && npm run lint`
Expected: Clean output with 0 errors.

- [ ] **Step 2: Run full production build**

Run: `cd realdha-ui && npm run build`
Expected: `vite build` completes successfully with clean assets.

- [ ] **Step 3: Run backend test suite to ensure backend compatibility**

Run: `cd backend && bun test`
Expected: Backend tests continue to pass.
