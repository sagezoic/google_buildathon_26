# Product: REALDHA

<!-- impeccable:product-schema 1 -->

## Platform

web (desktop & mobile responsive)

## Stack

Vite 8 + React 19 + TypeScript + Tailwind CSS 4 in `realdha-ui/`.
Visual design system inspired by **Lofty.ai**'s world-class real estate marketplace and asset passport architecture, elevated with institutional precision for Maharashtra land revenue records.
Deployed to Google Cloud Run (Dockerfile + nginx). Backend is a separate Bun + Elysia service in `backend/`.

## Product Vision & Positioning

REALDHA unifies the consumer-grade elegance, transparent yield analytics, and liquid marketplace UX of global platforms like **Lofty** with the sovereign regulatory infrastructure required for Indian real estate (Maharashtra Land Revenue Code 1966, Registration Act 1908, MahaRERA Act 2016).

Where global tokenization platforms stop at the investment vehicle without solving title forgery, and where local portals stop at unverified marketing listings, REALDHA provides:
1. **The Digital Property Passport:** A persistent digital identity (`RA-PUN-001-A-18-04`) containing physical, visual, legal, and commercial ground truth.
2. **Lofty-Grade Search & Discovery:** Multi-category icon filtering (High-Rise, NA Plots, Resale, Commercial Logistics, Clean Mortgage, Cash Flowing), transparent rental yields, valuation benchmarks, and rich media carousels.
3. **Automated AI Title Verification:** Vertex AI Gemini multimodal OCR extracting Marathi Devanagari and Modi script 7/12 extracts, Index II deeds, Ferfar mutation entries, and municipal sanctioned plans.
4. **Cryptographic Proof on Ethereum:** SHA-256 document fingerprints anchored via Google Cloud KMS to an immutable ledger.

## UX Architecture (Referencing Lofty Reference Design)

### 1. Property Search & Marketplace (Lofty Search Reference)
- **Visual World:** Dark obsidian / deep midnight canvas (`#070A13` / `#0A0E1A`), elevated translucent cards (`#11162B`), electric indigo accents (`#5252EE` / `#6366F1`), and high-contrast typography.
- **Top Navigation Bar:**
  - Modern geometric brand logo (`REALDHA`).
  - Centered rounded search pill (`Search address, city, or REALDHA ID...`).
  - View navigation links: `Marketplace`, `Registry Search`, `Upload & Verify`.
  - Right actions: `Log In` and vibrant purple `Sign Up / Connect`.
- **Category Icon Filter Bar:**
  - Dropdowns: `All Markets ⌵` (Pune, Mumbai, Lonavala, Thane), `All Types ⌵`.
  - Icon category pills with smooth horizontal scrolling:
    - `Verified Title` (Shield Check)
    - `High-Rise Apartments` (Building)
    - `NA Land Parcels` (Trees / Land)
    - `Resale Flats` (Home)
    - `Commercial / Warehouses` (Store / Warehouse)
    - `Cash Flowing / Leased` (Banknote)
    - `No Mortgage / Clean Lien` (Check Circle)
    - `Favorites` (Heart)
  - Control strip: `Filters` modal trigger, Sort `Default ⇅`, and Layout toggle (`Grid` vs `List`).
- **Social Proof / Metrics Ticker:**
  - `₹240Cr+ Assets Indexed · 1,420+ Verified Units · 100% On-Chain Proof · 4.9★ MahaRERA Accuracy`.
- **Property Card Grid (5-column responsive):**
  - High-resolution architectural render / photo carousel with pagination dots.
  - Category and status badge overlays: `Verified Title` (emerald), `High-Rise` (indigo), `No Mortgage` (slate), `MahaRERA Registered`.
  - Top-right favorite toggle (`♡`).
  - Unit title in bold white (`Unit A-1804 Amanora` / `333 Illinois Ave`) and locality (`Hadapsar, Pune 411028`).
  - Pricing and valuation line: `₹1.65 Cr` (or `₹1,000 /token`), `5.1% avg yield`, `Clean 30-Yr Title` / `3% Overvalued`.
  - Social metric: `👥 271 views / investors`.
- **Floating AI Trigger:** Bottom-right floating action button (`✦`) launching the Vertex AI Property Assistant.

### 2. Property Details & Digital Passport (Lofty Detail Reference)
- **Hero Media Layout:** Full-width split media gallery with prominent `View all photos & 3D Twin` trigger.
- **Left Main Column:**
  - Tag pill strip (`High-Rise`, `No Mortgage`, `MahaRERA Sanctioned`).
  - Massive bold title (`Unit A-1804 Amanora`) with favorite `♡` and alert `🔔` actions.
  - Locality subtitle (`Hadapsar, Pune 411028`).
  - Core specification badges: `🛏 3 Beds`, `🛁 3 Baths`, `📐 1,180 Sqft`, `🏢 18th Floor`, `🧭 East Facing`.
  - Synchronized navigation tabs:
    - `Price & Valuation`
    - `Yield & Commercials`
    - `Verification & 30-Yr Title`
    - `Spatial Twin & Sun Simulator`
    - `Document Dossier & Marathi Records`
  - Deep institutional content: Interactive vector 3D twin, room dimensions, sunlight angle simulator, official violet revenue stamp verdict, 30-year unbroken chain timeline, and bilingual Marathi-to-English legal excerpts.
- **Right Floating Column (Elevated Action Card):**
  - Crisp elevated white card (`#FFFFFF`) with dark slate typography (`#0F172A`) creating maximum visual hierarchy.
  - Pricing header: `₹1.65 Cr` (or `₹1,000 /token`), top-right: `👥 271 interested`.
  - Trust badge: `Verified on Ethereum via Google Cloud KMS`.
  - Metric breakdown table:
    - `Avg Rental Yield ⓘ`: `5.09%` (₹70,000 / mo)
    - `Current Occupancy / Yield ⓘ`: `Vacant / Ready to Move`
    - `Valuation Benchmark`: Sanctioned ₹1.65 Cr vs Circle Rate ₹1.58 Cr (`4% Premium`)
    - `30-Year Title Chain`: `Unbroken (1996–2026)`
    - `MahaRERA Plan`: `1,180 sq ft Carpet (Exact Match)`
  - Action buttons:
    - Primary vibrant purple button: `Buy / Inspect Passport`
    - Secondary crisp outline button: `Download Due Diligence Dossier`
  - Integrated Assistant prompt below card:
    - White pill button: `✦ Ask about this property` (instant conversational Q&A citing source clauses).

---

## Benchmark Case Studies (The 4 Evaluation Scenarios)

1. **Pune High-Rise (Amanora Park Town, Unit A-1804) · Clear Record**
   - 3 BHK, 1,180 sq ft carpet, 18th floor, East-facing, ₹1.65 Cr.
   - Clean 30-year unbroken title chain, MahaRERA P52100018892 match, zero encumbrance, Bank NOC on file.
2. **Lonavala NA Land Plot (Gat #84, Tungarli) · Area Mismatch Flag**
   - Residential NA plot, asking ₹85 Lakh.
   - 7/12 Marathi extract records 418 sq m, but seller draft claims 465 sq m. Gemini flags 47 sq m discrepancy: *"Stop and Clarify"*.
3. **Pune Resale Flat (Mayur Nagari, Kothrud) · Missing Legal Heir Flag**
   - 2 BHK, 920 sq ft, ₹92 Lakh.
   - Ferfar mutation entry #4120 reveals 3 co-heirs after demise of original owner; daughter Mangala's registered relinquishment deed is missing.
4. **Bhiwandi Leased Warehouse (Logistics Corridor, Unit W-04) · Unreleased Mortgage Flag**
   - 22,500 sq ft industrial warehouse, 8.4% yield, asking ₹7.20 Cr.
   - Active 2019 Union Bank ₹1.85 Cr commercial mortgage remains unreleased on property card.

---

## Hard Constraints & Core Principles

- **AI extracts and flags; licensed advocates sign off.** Never issue legal title or formal valuations automatically.
- **Cryptographic anchoring via Cloud KMS.** Document fingerprints on Ethereum are tamper-evident proofs of state, not cryptocurrency tokens.
- **Bilingual Marathi/English Ground Truth.** Every finding cites the original Devanagari text, clause, and page number alongside certified English translations.
- **Self-Contained Spatial Engine.** Interactive SVG architectural floor plans, tower massing models, and solar orientation engines run completely offline without external tile or mapping dependencies.
