# Design Specification: Market Component Redirection, Backend API Integration, and Filter Enhancements

- **Date:** 2026-11-21
- **Status:** Proposed (Awaiting Approval)
- **Target App:** `realdha-ui` (React 19, Vite, React Router v7)
- **Backend:** `backend` (Bun, Elysia, Drizzle ORM, Flat Finder API)

---

## 1. Intent & Context

When browsing properties on the `/market` route (`GP-21-Market.tsx`), clicking on any society card currently redirects to `/marketplace?view=society&society=...` via an unstyled raw anchor tag. This abandons the unified Realdha Shell and loads the legacy prototype component. Furthermore, the destination detail view (`GP-22-MarketDetail.tsx`) is disconnected from the backend API, displaying static sample financial tickers from hardcoded fixtures instead of actual society data. The filters on `/market` are also isolated in `localStorage` without URL synchronization, possess bugs in rental sorting, and cause watchlist disappearance across filters.

This design establishes proper React Router navigation to `/market/:id` (`GP-22-MarketDetail`), consumes the full JSON response from `GET /api/flats/societies/:id`, integrates property information with an optional financial/token metrics tab, and fixes the filtering behavior to respect city selection and URL state.

---

## 2. Goals, Non-Goals & Anti-Goals

### Goals
- **Fix Card Navigation:** Replace legacy `<a href="/marketplace?view=society...">` in `GP-21-Market.tsx` with React Router `<Link to={`/market/${encodeURIComponent(s.id)}`}>` to navigate to `/market/:id`.
- **Backend API Integration in Detail View:** In `GP-22-MarketDetail.tsx`, read `:id` via `useParams()`, fetch full society details using `fetchSociety(id)` from `GET /api/flats/societies/:id`, and handle loading/error states.
- **Rich Detail Display:** Render comprehensive society information including image gallery, Buy and Rent pricing, gross yield, Flat Finder score, BHK unit types table, active listings, nearby POIs (park, metro, school), and reviews.
- **Retain Financial & Token Metrics Card:** Keep the sample token price chart and financial metrics as a dedicated card/tab alongside the real property data.
- **Fix Filters in `/market`:**
  - Synchronize filter state (`city`, `mode`, `type`, `sort`, `q`, `bhk`, `ready`) with URL query params via `useSearchParams`.
  - Fix Rent mode price sorting (pass `sort: 'rent'` to backend when sorting by price in rent mode).
  - Ensure the "Watchlist" tab respects the currently selected city without losing bookmarked societies.
  - Add BHK filter controls (All, 1, 2, 3, 4+) and Ready to Move filter.
  - Provide a "Reset Filters" action on zero results.

### Non-Goals
- Modifying backend database schema or crawler scrapers (the backend already has the required data and endpoints).
- Replacing or deprecating `/dev/flows` or other prototype routes.

### Anti-Goals
- Hardcoding backend URLs (must continue using `/api/flats/*` proxy).
- Breaking existing styling or tokens in the Realdha design system.

---

## 3. Approaches Considered

### Approach A: Full `/market/:id` Screen Integration with Tabbed/Sectioned Layout (Recommended)
- Society cards navigate to `/market/:id` mapped to `GP-22-MarketDetail.tsx`.
- Calls `fetchSociety(id)` on mount.
- Layout displays primary property overview (photos, specs, unit types, active listings, nearby POIs, reviews) with a side-card or toggleable section for the token/financial chart widgets.
- Filters in `GP-21-Market` are driven by URL query params and support BHK, sort, and city-scoped watchlist.
- **Trade-off:** Requires updating `GP-22-MarketDetail.tsx` to handle both real data and the financial widget, but delivers a seamless, deep-linkable, production-grade experience.

### Approach B: Open Detail as an In-Page Modal/Drawer on `/market`
- Keeps users on `/market` and opens a drawer with society data.
- **Trade-off:** Violates canonical routing (`GP-22` is registered as `/market/:id`), breaks direct links, prevents bookmarking individual society pages, and cramps the rich data (unit types, listings, nearby amenities).

### Decision: Approach A is selected.

---

## 4. Architectural Details

### 4.1. Navigation (`GP-21-Market.tsx`)
- Import `Link` from `react-router`.
- Replace `const href = ...` with `/market/${encodeURIComponent(s.id)}`.
- Wrap title and image preview in `<Link to={...}>`.

### 4.2. Detail View Data Flow (`GP-22-MarketDetail.tsx`)
- Extract `id` with `const { id } = useParams<{ id: string }>()`.
- Call `fetchSociety(id)` using `AbortController` in `useEffect`.
- Data model consumed:
  ```ts
  interface SocietyDetailData extends SocietyCard {
    lat, lng, towers, acres, rating_count, nearby
    unit_types: Array<{ bhk, size_sqft, price_min, price_max }>
    bhk_prices: Array<{ bhk, buy_median, rent_median, psf, ... }>
    listings: Array<{ mode, bhk, price, sqft, psf, furnished, floor }>
    reviews: Array<{ title, text, author, rating, date }>
  }
  ```
- Render structure:
  - Header with Back to Market button (`/market`).
  - Hero Photo Carousel and Title / Badges (Verified, RERA ID, Flat Finder Score).
  - Price & Yield Summary (Buy range, Rent median, Yield %).
  - Relational Tabs / Sections:
    1. **Overview & Specs:** Developer, Locality, Units, Towers, Acres, Status, Possession.
    2. **BHK Configurations & Pricing:** Table of unit types, size ranges, median buy & rent prices.
    3. **Active Listings:** Filterable by Sale / Rent with floor, furnishing, and pricing.
    4. **Neighborhood & POIs:** Distances to Metro, Parks, Schools, Hospitals, Shopping.
    5. **Ratings & Reviews:** Overall score and user reviews.
    6. **Financial & Token Metrics (Retained Widget):** Historical price chart (1D, 1W, 1M, 1Y, All) with token pricing details and Sepolia testnet anchor status.
  - Action Panel: "Add to Watchlist" (synchronized with `market.watchlist.v2`), "Register Interest" (`path('F18-02')`), "Ask AI" (`path('GP-18', { id })`).

### 4.3. Filter Enhancements (`GP-21-Market.tsx`)
- Use `useSearchParams()` to reflect and read:
  - `city` (default `'pune'`)
  - `mode` (`'buy'` | `'rent'`, default `'buy'`)
  - `type` (kind: apartment, villa, etc.)
  - `bhk` (e.g. 1, 2, 3, 4)
  - `ready` (`'true'` | `'false'`)
  - `sort` (`'best'`, `'price'`, `'rating'`, `'name'`)
  - `q` (search query, debounced)
  - `tab` (`'all'` | `'watchlist'`)
- When `mode === 'rent'` and sort is set to price, backend request uses `sort: 'rent'`.
- Watchlist tab respects `city`: displays watchlisted societies for the selected city.
- Add BHK filter pill group (All, 1, 2, 3, 4+ BHK).
- Add "Clear all filters" button on empty search results.

---

## 5. Verification Plan
- `npm run lint` with `oxlint` ensuring clean imports, React hooks rules, and type compliance.
- `npm run build` (`tsc -b && vite build`) to confirm full compilation with zero bundle or type errors.
- Manual verification of routing:
  - Navigating to `/market` renders societies with working filters and URL sync.
  - Clicking any society card navigates to `/market/:id`.
  - `/market/:id` loads live society data from `/api/flats/societies/:id`.
  - Financial token widget is accessible and renders interactive chart.
  - Watchlist toggles persist and reflect accurately under the selected city.
