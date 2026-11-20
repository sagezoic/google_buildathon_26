# Todo: Redesign Entire UI & PRODUCT.md to match Lofty Reference

## Objective
Redesigned the entire `realdha-ui` application and `PRODUCT.md` based on the user-provided Lofty screenshots (`Screenshot 2026-11-21 at 12.05.33 AM.png` and `Screenshot 2026-11-21 at 12.05.40 AM.png`):
- Modern dark-mode institutional aesthetic (`#070A13` / `#080C18` background, glass surfaces, electric indigo/violet `#5252EE` accents, crisp elevated white action cards).
- Lofty-style Property Search & Marketplace directory with category icon filters, market dropdowns, social proof metrics banner, and 5-column photo carousel cards with status pills and pricing/yield metrics.
- Lofty-style Property Details / Passport page with full-width hero gallery, left specs & legal verification tabs, floating white valuation & buy/inspect card, and `✦ Ask about this property` Gemini integration.
- Grounded in REALDHA's core purpose: Maharashtra 30-year title chains, 7/12 & Ferfar mutations, MahaRERA compliance, spatial digital twins, and Cloud KMS Ethereum ledger proof.

### Progress Checklist

- [x] **Phase 1: Update PRODUCT.md and DESIGN.md**
  - [x] Updated `realdha-ui/PRODUCT.md` to reflect the modernized digital property marketplace & passport platform positioning (unifying Lofty's fractional/verified tokenized property layer with Maharashtra land governance).
  - [x] Wrote `realdha-ui/DESIGN.md` defining the new visual system: color tokens, typography, component specifications, glassmorphism, floating elevated white cards, photo carousels, and responsive grid layouts.

- [x] **Phase 2: Redesign Design Tokens & Global CSS (`index.css` & `App.css`)**
  - [x] Updated theme tokens in `index.css`: dark midnight canvas (`#080C18`, `#0E1426`), electric indigo (`#5252EE`, `#6366F1`), high-contrast text hierarchy (`#FFFFFF`, `#94A3B8`, `#64748B`), and subtle border strokes.
  - [x] Styled Lofty-inspired top navbar with rounded pill search bar, brand logo, and `Log In` / `Sign Up` buttons.
  - [x] Styled category filter bar with icons (`Cash Flowing`, `High-Rise`, `Single Family`, `Vacation Rentals`, `Commercial`, `Owner Occupied`, `Seller Buyback`, `No Mortgage`, `Favorites`), `All Markets`, `Filters`, and `Default ⇅` / `Grid` / `List` toggles.
  - [x] Styled social proof metrics bar (`₹240Cr+ Indexed · ₹36Cr+ Due Diligence · 1,420+ Units · 4.9★ MahaRERA Score`).
  - [x] Styled floating bottom-right `✦` AI assistant button.

- [x] **Phase 3: Redesign Property Search / Marketplace (`PropertySearch.tsx`)**
  - [x] Rebuilt `PropertySearch.tsx` to match Screenshot 2:
    - Top search bar & category icon pills with horizontal scroll.
    - Social proof ticker.
    - Card grid matching Lofty cards: photo carousel with pagination dots, category & status badges overlay (`Verified Title`, `Commercial`, `Cash Flowing`, `No Mortgage`), heart/favorite toggle, property address & city/zip, price per share/unit (`$50.02 /share` / `₹1.65 Cr`), yield / valuation metric (`6.9% avg yield · 7% Overvalued`), investor count (`👥 131 investors`).
    - Grid and List view switching.
    - Clicking any card opens the detailed property view (Screenshot 1).

- [x] **Phase 4: Redesign Property Details / Passport View (`PropertyDetails.tsx` / `App.tsx`)**
  - [x] Rebuilt the property view to match Screenshot 1:
    - Hero split gallery with `View all photos & 3D Twin` button.
    - Left column:
      - Tag pills (`Multi Family`, `No Mortgage`, `MahaRERA Registered`).
      - Massive white title (`333 Illinois Ave` / `Unit A-1804 Amanora`) with heart `♡` and notification `🔔` icons.
      - Location (`Lorain, Ohio 44052` / `Hadapsar, Pune 411028`).
      - Specs row with icons: `🛏 3 Beds`, `🛁 3 Baths`, `📐 1,180 Sqft`, `🏢 18th Floor`, `🧭 East Facing`.
      - Tab bar: `Price`, `Yield & Financials`, `Verification & 30-Yr Title`, `Spatial Twin & Floor Plan`, `Documents`.
      - Detailed tab panels: Interactive 3D/floor plan SVG, 30-year title timeline, revenue stamp verdict, Marathi 7/12 & Ferfar excerpts.
    - Right column:
      - Elevated floating white card with dark text:
        - Price: `$30.71 /share` / `₹1,000 /token`, investor count `👥 271`.
        - Promotion/verification banner: `Verified on Ethereum via Google Cloud KMS`.
        - Metrics table: Avg Rental Yield, Current Rental Yield, Valuation check (Market vs Fair Value), 30-Year Title Status, MahaRERA Sanctioned Plan match.
        - Primary vibrant blue button: `Buy / Inspect Passport`.
        - Secondary outline button: `Download Dossier`.
      - Below card: White pill button `✦ Ask about this property` (opens Gemini Assistant drawer).

- [x] **Phase 5: Polish All Remaining Views & Modals According to the Home UI**
  - [x] **Upload & Verify Studio (`?view=upload` & `?view=upload&scenario=pune-resale`)**:
    - Replaced all `#fff` backgrounds with `#0E1426` obsidian panels and `#11162B` test cards.
    - Elevated right-side `.dossier-card` into the signature Lofty high-contrast crisp white action card (`#FFFFFF` background, `#0F172A` text, shadow `0 20px 48px -8px rgba(0,0,0,0.6)`).
    - Wired query param synchronization so `?scenario=pune-resale` automatically pre-selects the Pune Resale Flat test sample (`sample-resale`), displaying the missing legal heir release defect on Ferfar #4120.
    - Fixed state synchronization to eliminate cascading re-renders (0 React warnings).
  - [x] **Landing Page (`?view=landing` & `?view=landing&scenario=pune-resale`)**:
    - Converted hero, search box, live dropdown, value pillars, case studies grid, workflow steps, and architecture specs from old light styling to Midnight Glass & Electric Indigo.
    - Featured property teaser card dynamically displays the active scenario photo banner and pricing/yield metrics.
    - Enforced Craft Floor rule: eliminated kickers/eyebrows above headings across all sections.
  - [x] **Interactive Global Modals**:
    - Redesigned `DocumentDossierModal`, `UploadVerifyModal`, `ShareModal`, and `TourModal` with `#0E1426` glass surfaces, subtle white border strokes, high-contrast labels, and dark scrollbars.
  - [x] **Browser Surfaces & Theming**:
    - Updated global scrollbars (`scrollbar-color: #252D4A #0B1020`) and text selection (`background: #5252EE; color: #FFFFFF`).

- [x] **Phase 6: Verification & QA**
  - [x] `npm run build`: Vite + TypeScript compiled production client in 175ms with 0 errors.
  - [x] `npx oxlint`: 0 warnings and 0 errors.
  - [x] URLs tested and verified for scenario state synchronization.
