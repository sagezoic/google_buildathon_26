# OpenStreetMap (OSM) Live Map Preview & Region Area Creator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate a unified, high-performance OpenStreetMap (OSM) live map preview and interactive Region Area Creator component suite across the Realdha platform, replacing static image and SVG mockups with live vector/raster maps, interactive markers, cadastral boundary polygons, and geodesic area editing.

**Architecture:** A modular React component suite built on `maplibre-gl` utilizing OpenFreeMap vector planet tiles (`https://tiles.openfreemap.org/planet`, © OpenStreetMap contributors) and OpenStreetMap raster tiles, styled cleanly with Realdha tokens (`--rd-primary`, `--rd-surface`, `--rd-line`), paired with an interactive Shoelace-formula geodesic polygon editor (`OsmPolygonEditor`) for parcel land demarcation.

**Tech Stack:** React 19, TypeScript, `maplibre-gl`, `@types/geojson`, Tailwind CSS, Lucide icons, Vite.

**Spec:** [docs/superpowers/plans/2026-11-21-osm-map-integration.md](file:///Users/light/Documents/competitions/google_buildathon/docs/superpowers/plans/2026-11-21-osm-map-integration.md)

## Global Constraints

- Must work without proprietary/paid API tokens (Mapbox, Google Maps API key not required; uses free OSM / OpenFreeMap and Esri imagery).
- WebGL contexts must be safely disposed on unmount (`map.remove()`) to prevent browser context limits and memory leaks.
- Keyboard accessibility: Pin and polygon vertices must support focus and keyboard arrow nudging.
- Clean code-splitting: Lazy-load map components where possible to keep initial bundle sizes lean.
- Zero breaking changes to existing route contracts, persistent state keys (`property.draft`, `property.findings`, etc.), or styling tokens.
- Strict TypeScript verification (`tsc -b`) and linting (`oxlint`) must pass without errors.

## Review Focus

1. **Multiple Map Instantiations / Memory Leaks**: Mounting/unmounting between tab switches or routes must cleanly call `map.remove()` and cancel ongoing animation frames.
2. **Reduced Motion**: Verify `prefers-reduced-motion` suppresses pitch/zoom ease animations.
3. **Polygon Self-Intersection & Coordinate Clamping**: The region area creator must reject or visually flag complex self-intersecting self-loops and ensure coordinates stay within valid lat `[-90, 90]` and lng `[-180, 180]`.
4. **Mobile Touch & Drag Conflicts**: In mobile layouts, map touch gestures (panning, vertex dragging) must not block page scrolling unintentionally; require two-finger pan or an explicit interactive mode.
5. **Tile Fallback & Error State**: When vector tiles or network requests fail, render an accessible fallback status banner without crashing the application.

---

### Task 1: Foundation & Geodesic Geometry Utilities

Create shared OSM map configuration, tile styles, coordinate projection math, and geodesic area calculation utilities.

**Files:**
- Create: `realdha-ui/src/components/map/osm-styles.ts`
- Create: `realdha-ui/src/components/map/osm-geometry.ts`
- Test: `realdha-ui/src/components/map/__tests__/osm-geometry.test.ts` (or validation script in bun/vite)

- [ ] **Step 1: Implement `osm-geometry.ts`**
  - Implement planar and spherical distance helpers (`distMeters([lng1, lat1], [lng2, lat2])`).
  - Implement spherical Shoelace formula for computing polygon area in square meters.
  - Implement conversion helpers: `sqmToUnit(sqm, 'sqft' | 'sqm' | 'guntha' | 'acre')` and `unitToSqm(val, unit)`.
  - Implement midpoint calculator for adding vertices along polygon edges.
  - Implement bounding box calculator `boundsFromCoords(coords)`.
- [ ] **Step 2: Implement `osm-styles.ts`**
  - Define tile source configurations:
    - OpenFreeMap vector planet: `https://tiles.openfreemap.org/planet`
    - Standard OpenStreetMap raster: `https://tile.openstreetmap.org/{z}/{x}/{y}.png`
    - Esri World Imagery raster: `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`
  - Define style themes: `streets`, `satellite`, `night`, `light` matching Realdha CSS design tokens.
  - Export layer helper definitions (road lines, building fill-extrusions, labels).
- [ ] **Step 3: Verification**
  - Run typecheck and unit calculation verification to ensure conversions between sq ft, sqm, guntha, and acre are exact to 4 decimal places.

---

### Task 2: Core `OsmMap` Base Component & Marker Layers

Create the generic `OsmMap` container and flexible marker/popup layers.

**Files:**
- Create: `realdha-ui/src/components/map/OsmMap.tsx`
- Create: `realdha-ui/src/components/map/OsmMarker.tsx`
- Create: `realdha-ui/src/components/map/types.ts`

- [ ] **Step 1: Implement `types.ts`**
  - Define `GeoPoint = { lat: number; lng: number }`.
  - Define `MapTheme = 'streets' | 'satellite' | 'night' | 'light'`.
  - Define `OsmMapProps` (center, zoom, minZoom, maxZoom, pitch, interactive, theme, controls, onMove, onClick, className, children).
- [ ] **Step 2: Implement `OsmMap.tsx`**
  - Wrap MapLibre GL Map initialization with error boundaries and WebGL feature detection.
  - Setup worker URL from `maplibre-gl/dist/maplibre-gl-worker.mjs`.
  - Attach resize observer so map resizes correctly when containers flex or split drawers open.
  - Provide a clean cleanup in `useEffect` unmount (`map.remove()`).
  - Add optional UI controls: NavigationControl (zoom +/-), ScaleControl (metric), theme selector pills.
- [ ] **Step 3: Implement `OsmMarker.tsx`**
  - Create reusable Marker component mounting custom React DOM nodes into MapLibre markers.
  - Support draggable mode with keyboard accessibility (`Arrow` key nudging with `aria-label`).
  - Support custom pin variants: `PriceChip`, `VerifiedBadge`, `ClusterCount`, `PoiIcon`.
- [ ] **Step 4: Verification**
  - Build and lint to ensure no memory leaks, strict TS adherence, and zero console errors.

---

### Task 3: Interactive Region Area Creator (`OsmPolygonEditor`)

Build the interactive land parcel boundary creator and vertex editor.

**Files:**
- Create: `realdha-ui/src/components/map/OsmPolygonEditor.tsx`
- Modify: `realdha-ui/src/components/ui/plot-map.tsx`
- Modify: `realdha-ui/src/routes/properties/intake/GP-07-AddProperty.tsx`
- Modify: `realdha-ui/src/routes/developer/new-project/F10-01-CreateProject.tsx`

- [ ] **Step 1: Implement `OsmPolygonEditor.tsx`**
  - Support two creation workflows:
    - **Mode A (Preset area)**: Center pin + stated area generates a boundary rectangle that can be rotated/scaled.
    - **Mode B (Freeform polygon demarcation)**: User clicks to draw vertices; clicking first vertex closes the polygon; each vertex is draggable; edge midpoints allow inserting new vertices; double-click/right-click deletes a vertex.
  - Live computation badge showing current perimeter and calculated area (`3,200 sq ft · 2.97 guntha · 297.3 sq m`).
  - Coordinate undo/reset buttons and clear action.
- [ ] **Step 2: Upgrade `GP-07-AddProperty.tsx`**
  - Integrate `OsmPolygonEditor` into the plot location step.
  - Allow the user to switch between "Quick Area Estimate" and "Demarcate Boundary Points".
  - Persist coordinates in `usePropertyDraft` (storing polygon coordinates in GeoJSON format alongside center pin).
- [ ] **Step 3: Upgrade `F10-01-CreateProject.tsx`**
  - Replace the placeholder box (`Pune · Baner (50%, 75%)`) with `OsmMap` + `OsmPolygonEditor`.
  - Allow developer to mark the multi-tower site boundary and position the project pin.
- [ ] **Step 4: Verification**
  - Test dragging vertices, changing area units, and verifying the draft state properly preserves the polygon data across step transitions.

---

### Task 4: Digital Twin & Cadastral Survey Boundary Overlays

Replace the static mockups in the Digital Twin and government verification screens with genuine geospatial cadastral views.

**Files:**
- Create: `realdha-ui/src/components/map/OsmCadastralView.tsx`
- Modify: `realdha-ui/src/routes/parts/TwinPage.tsx`
- Modify: `realdha-ui/src/routes/properties/twin/F04-01-ApartmentTwin.tsx`

- [ ] **Step 1: Implement `OsmCadastralView.tsx`**
  - Displays land parcel boundaries with high-contrast styling (dashed cadastre line, vertex corner pins, survey boundary callouts).
  - Integrates base tile switcher: high-resolution satellite imagery vs OpenStreetMap streets.
  - Adds compass orientation needle and metric scale bar.
- [ ] **Step 2: Replace Mock Map in `TwinPage.tsx`**
  - In `MapPanel`, replace the Unsplash photo and SVG `<path d="M240 110 L440 92...">` with `OsmCadastralView`.
  - Center on Kusgaon Plot Gat 112/2 (`lat: 18.7546, lng: 73.4062`).
  - Render corner coordinates, survey number label, and interactive Satellite / Cadastral boundary views.
- [ ] **Step 3: Add Macro Location & Orientation View to `F04-01-ApartmentTwin.tsx`**
  - Add a "Macro Location & Solar Orientation" card displaying the building footprint, East-facing orientation towards Baner Hill, and true north compass indicator.
- [ ] **Step 4: Verification**
  - Check `TwinPage` across GP-16 (Digital Twin), GP-17 (Check Doc), and GP-18 (Ask AI) routes to ensure consistent, responsive rendering.

---

### Task 5: Buyer Search & Locality Profile Integration

Integrate live OSM map previews with clustering into buyer discovery screens.

**Files:**
- Modify: `realdha-ui/src/routes/buyer/F08-02-Results.tsx`
- Modify: `realdha-ui/src/routes/buyer/F09-01-AreaView.tsx`
- Modify: `realdha-ui/src/routes/buyer/F09-03-PropertyBuyer.tsx`
- Modify: `realdha-ui/src/routes/developer/F10-07-ProjectPage.tsx`

- [ ] **Step 1: Upgrade `F08-02-Results.tsx` (Search Results)**
  - Replace the fake `div` and hardcoded `PINS` array with `OsmMap`.
  - Render interactive markers for filtered properties with price badges (`₹1.4 Cr`, `₹92 L`).
  - Clicking a marker centers on the property and opens a preview card; hovering a list card highlights the corresponding map pin.
  - Keep responsive split view: side-by-side on desktop (`xl`), toggleable `List | Map` on mobile.
- [ ] **Step 2: Upgrade `F09-01-AreaView.tsx` (Locality Profile)**
  - Replace static image and SVG curves with `OsmMap` focused on Baner / selected locality (`lat: 18.5590, lng: 73.7868`).
  - Render verified cluster badges with property counts (`24`, `18`, `31`).
  - Clicking a cluster filters and routes directly to `F09-02-AreaList.tsx`.
- [ ] **Step 3: Add Neighborhood Preview to `F09-03-PropertyBuyer.tsx` & `F10-07-ProjectPage.tsx`**
  - Add a collapsible "Location & Neighborhood" section to Unit A-1804 and Baner Heights project page with nearby amenities (metro station, schools, parks) using the OSM POI definitions.
- [ ] **Step 4: Verification**
  - Test filtering, zooming, cluster clicking, and mobile `List / Map` toggle switching in results and area views.

---

### Task 6: Market Explorer Wire-up & Quality Assurance

Mount the 3D society map in the Market Explorer and execute full system verification.

**Files:**
- Modify: `realdha-ui/src/routes/market/GP-21-Market.tsx`
- Run: `realdha-ui/src/components/ui/market-map.tsx`

- [ ] **Step 1: Wire `MarketMap` into `GP-21-Market.tsx`**
  - Add a View switcher in `GP-21-Market.tsx` (`Grid` vs `Split Map` vs `Full Map`).
  - When Map view is active, render `MarketMap` using the live filtered societies from `useSocieties`.
  - Ensure selecting a society in the map highlights it in the list/details panel.
- [ ] **Step 2: Full Build & Lint Verification**
  - Run `npm run lint` (`oxlint`) in `realdha-ui`.
  - Run `npm run build` (`tsc -b && vite build`) in `realdha-ui`.
  - Verify chunk sizes and lazy-loaded assets.
- [ ] **Step 3: End-to-End Visual & Functional Sanity Check**
  - Check plot boundary creator in GP-07.
  - Check cadastral view in GP-16.
  - Check interactive map in F08-02.
  - Check locality clusters in F09-01.
