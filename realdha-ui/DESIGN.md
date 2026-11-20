# Design System: REALDHA (Lofty-Inspired Modern Institutional Dark)

<!-- impeccable:design-schema 1 -->

## Visual World

**Midnight Glass & Electric Indigo**
Inspired by Lofty's world-class real estate investment and property search marketplace, elevated with institutional-grade data density for Indian land records and title verification.

- **Canvas & Surfaces:**
  - Base Background: `#070A13` (Deep Obsidian / Midnight)
  - Card & Container Surface: `#0E1426` (Subtle midnight navy)
  - Translucent Glass Overlays: `rgba(18, 24, 45, 0.75)` with `backdrop-filter: blur(12px)`
  - Border Stroke: `1px solid rgba(255, 255, 255, 0.09)`
  - Border Hover: `1px solid rgba(99, 102, 241, 0.45)`
- **Floating Elevated Action Card (Screenshot 1 Reference):**
  - Pure crisp white card (`#FFFFFF`) with dark slate typography (`#0F172A`)
  - Elevated box-shadow: `0 20px 40px -8px rgba(0, 0, 0, 0.45)`
  - High-conversion contrast against the dark midnight canvas
- **Brand & Accent Colors:**
  - Primary Electric Indigo: `#5252EE` (Hover: `#4343DB`)
  - Accent Violet / Glow: `#6366F1` (Hover: `#4F46E5`)
  - Revenue Stamp Deep Violet: `#4A154B`
  - Verified Emerald: `#10B981` (Background: `rgba(16, 185, 129, 0.12)`)
  - Warning / Area Mismatch Amber: `#F59E0B` (Background: `rgba(245, 158, 11, 0.12)`)
  - Critical / Mortgage Rose Red: `#EF4444` (Background: `rgba(239, 68, 68, 0.12)`)
- **Typography Scale:**
  - Display / Hero Title: `Archivo` 800, 36px–48px, tracking -0.03em
  - Section Headings: `Archivo` 700–800, 22px–28px, tracking -0.02em
  - Body Text: `Archivo` 400–500, 14px–16px, line-height 1.55
  - Tabular Numbers & Codes: `Archivo Narrow` 700 (`.n`), `font-variant-numeric: tabular-nums`
  - Devanagari Terminology: `Mukta` 700–800 (`.dv`)

## Core Interface Paradigms

### 1. Marketplace & Search Directory (Screenshot 2 Reference)
- **Top Navigation Bar:**
  - REALDHA geometric logo with integrated house silhouette.
  - Centered rounded pill search bar: `Search address, city, or REALDHA ID...`.
  - Right action group: `Log In` link and vibrant purple `Sign Up / Connect Wallet` pill button.
- **Horizontal Category Filter Bar:**
  - Clean SVG line icons paired with category labels:
    - `Verified Title` (Shield Check)
    - `High-Rise` (Building)
    - `NA Plots` (Trees)
    - `Resale Flats` (Home)
    - `Commercial / Warehouses` (Store)
    - `Cash Flowing` (Banknote)
    - `No Mortgage` (Check Circle)
    - `Favorites` (Heart)
  - Control pills: `All Markets ⌵`, `All Types ⌵`, `Filters` slider, `Default ⇅` sort, and `Grid` vs `List` segmented control.
- **Social Proof Ticker:**
  - Subtle centered stats line: `₹240Cr+ Assets Indexed · 1,420+ Verified Units · 100% On-Chain Proof · 4.9★ MahaRERA Accuracy`.
- **Property Cards Grid (Responsive 3–5 columns):**
  - High-res photo & twin render carousels with 3 pagination dots at the bottom.
  - Badge overlays in top-left: `Commercial`, `Cash Flowing`, `No Mortgage`, `Verified Title`.
  - Top-right floating heart icon (`♡`) for favoriting.
  - White bold property address (`2820 Rucker Ave` / `Unit A-1804 Amanora`).
  - Secondary location line (`Hadapsar, Pune 411028`).
  - Pricing & Yield Line: Bold white price (`₹1.65 Cr` / `₹1,000 /token`) paired with electric violet yield (`5.1% avg yield`) and valuation tag (`Clean 30-Yr Title` / `19% Undervalued`).
  - Social metric: `👥 271 investors`.

### 2. Property Details & Digital Passport (Screenshot 1 Reference)
- **Hero Split Gallery:** Edge-to-edge media showcase with `View all photos & 3D Twin` rounded button in the top right.
- **Left Details Column:**
  - Badge pills: `Multi Family` / `High-Rise`, `No Mortgage`, `MahaRERA Sanctioned`.
  - Large title: `333 Illinois Ave` / `Unit A-1804 Amanora` with heart `♡` and bell `🔔` icons.
  - Location line: `Hadapsar, Pune 411028`.
  - Core specification pills: `🛏 3 Beds`, `🛁 3 Baths`, `📐 1,180 Sqft`, `🏢 18th Floor`.
  - Horizontal Tab Navigation: `Price & Valuation`, `Yield & Commercials`, `Verification & 30-Yr Title`, `Spatial Twin & Floor Plan`, `Document Dossier`.
- **Right Floating Action Card:**
  - Elevated crisp white card with dark slate text.
  - Bold price: `₹1.65 Cr` (or `₹1,000 /share`), top-right investor count: `👥 271`.
  - Trust promotion banner: `Verified on Ethereum via Google Cloud KMS`.
  - Detailed financial & legal breakdown rows:
    - Avg Rental Yield: `5.09%` (₹70,000 / mo)
    - Current Occupancy: `Vacant / Ready to Move`
    - Valuation: Sanctioned vs Circle Rate (`4% Premium`)
    - 30-Year Title Chain: `Unbroken (1996–2026)`
    - MahaRERA Plan: `1,180 sq ft Carpet (Exact Match)`
  - Action buttons: Primary `Buy / Inspect Passport` (vibrant purple) and Secondary `Download Legal Dossier` (crisp white outline).
  - Assistant Trigger: Pill button `✦ Ask about this property` directly below the card.
- **Docked AI Assistant Toolbar:**
  - Grounded Vertex AI Gemini toolbar permanently docked at the bottom of the viewport with fast question chips and expandable overlay drawer.
