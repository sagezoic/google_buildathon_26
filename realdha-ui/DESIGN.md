# Design System: REALDHA (Sovereign Land Registry & Deed Craft)

<!-- impeccable:design-schema 1 -->

## Visual World

**Terracotta Brick, Midnight Deed, and Marigold Proof**
Directly derived from the official Realdha logo emblem in `realdha-ui/public/logo.png`. Replaces generic corporate blues with an authentic, grounded Indian land records palette.

- **Canvas & Surfaces:**
  - Light Canvas: `#F5F6F8` (Crisp clean off-white ground)
  - Light Surface: `#FFFFFF` (Crisp deed cards and panels)
  - Dark Canvas: `#101924` (Deep obsidian midnight slate from the logo's backing deed folder)
  - Dark Surface: `#16222F` (Elevated midnight slate card surface)
  - Hairline Borders: `#D8DDE4` (Light) / `#253446` (Dark)
  - Line Strong: `#B9C1CC` (Light) / `#62758E` (Dark)
- **Brand & Accent Colors:**
  - Primary Brand & Action: `#94382E` (Terracotta Brick / Revenue Stamp, hover: `#752A22`)
  - Primary Action (Dark Mode): `#C0483A` (Vibrant terracotta fill, hover: `#AD3F32`)
  - Primary Text (Dark Mode): `#E88B7D` (Accessible terracotta link & active nav text)
  - On-Chain / Gold Proof: `#B45309` (Marigold Gold / Auspicious Amber checkmark emblem from the logo)
  - On-Chain (Dark Mode): `#E08B16` (Glow gold seal, ink: `#F7C06D`, tint: `#2B1E0C`)
  - Verified Emerald: `#1E7A4B` (Background: `#E4F3EA`, ink: `#14573A`)
  - Warning Amber: `#B45309` (Background: `#FEF3C7`, ink: `#78350F`)
  - Critical / Danger: `#B42318` (Background: `#FDE9E7`, ink: `#8A1B12`)
- **Typography Scale:**
  - Display / Hero Title: `IBM Plex Sans Variable` 600, 36px–44px, tracking -0.02em
  - Section Headings: `IBM Plex Sans Variable` 600, 22px–28px, tracking -0.01em
  - Body Text: `IBM Plex Sans Variable` 400–500, 14px–16px, line-height 1.5
  - Tabular Numbers & Codes: `IBM Plex Mono` 500, `font-variant-numeric: tabular-nums`
  - Devanagari Terminology: `Noto Sans Devanagari Variable` 500–600 (`:lang(hi)`, `:lang(mr)` line-height 1.7)

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
  - Assistant Trigger: White pill button `✦ Ask about this property` directly below the card.
- **Floating AI Trigger Button:**
  - Electric violet circular button (`✦`) in bottom-right corner that launches the Gemini Property Assistant drawer from anywhere.
