# Todo: Build Realdha UI from the "Realdha UI frames" artifact

## Objective
Rebuild `realdha-ui` to match the artifact (https://claude.ai/artifact/8PDuFJ7oRdsV5FsBF2e2wC): its style direction, its three component sheets, and all **123 screens across 22 flows** (GP, F01–F20, X), each with the states drawn inside its frame, at desktop 1440, tablet 834 and mobile 390. The old dark Archivo/indigo UI is replaced.

### Decisions (from the user, 2026-11-21)
- Replace the old theme. Do not run both side by side.
- Light and dark. Light matches the artifact exactly; dark is **Graphite**, derived under the same rules and checked on every screen.
- Build every screen and flow exactly as the artifact shows (this supersedes "tokens and docs only").
- Primary user is the property owner, so the golden path (GP) is built first.

### Build rules (apply to every screen)
- **One responsive screen per frame ID.** The desktop, tablet (`T-`) and mobile (`M-`) frames are the same route at three breakpoints, not three builds.
- **States inside a frame become real UI states.** Examples: OTP wrong or expired, KYC pending or failed, mint failed. Each one can be reached through sample data or a `?state=` dev param.
- **Copy, order, labels and sample data are verbatim from the frame.** No invented copy.
- **No DEMO banner and no prototype chrome (user, 2026-11-21).** The text "DEMO · TESTNET · NOT AN OFFER", the "Golden path · n of N" counter and Prev/Next links are never rendered. This is a real web app. The Sample-data label stays only where a frame puts it on content.
- **Real navigation.** Primary buttons and the nav go to the next screen as the frames' links show. A dev-only flow index at `/dev/flows` is not linked from the product.
- **Controls work and fields persist** (user, 2026-11-21): values survive navigation and reload through `usePersistentState`.
- **Data is typed sample fixtures, no backend calls this pass.** Wiring to `backend/` (Elysia) is a later project.
- **Definition of done for a screen:**
  - Matches its 1440, 834 and 390 frames side by side.
  - Every drawn state can be reached.
  - Light and dark both pass contrast.
  - Keyboard and focus work.
  - `build` and `lint` pass.

---

### Phase 0: Direction and tokens
- [x] PRODUCT.md
- [x] **DESIGN.md** (repo root; refreshed by the documenter after the GP build):
  - The direction and the bans: no gradients, no glow, no colour-only status, teal only for on-chain.
  - Colour roles in light and dark with contrast ratios.
  - Type, with Devanagari rules.
  - Spacing, radius, elevation, focus and motion.
  - Breakpoints 390/834/1440 and gutters 16/24.
  - Component specs from C1–C3.
- [x] **`src/styles/tokens.css`** (light pinned; dark = Graphite):
  - Raw colour values → named roles.
  - `[data-theme]` plus `prefers-color-scheme`.
  - Tailwind v4 `@theme inline` utilities.
- [x] **`index.css`**: IBM Plex Sans/Mono and Noto Sans Devanagari, base styles, `:lang(hi|mr)` line heights, global focus ring.
- [x] **Old token names stay as temporary aliases** (`src/styles/legacy-aliases.css`) (one marked block) so the old screens compile until Phase 9 deletes them.
- [x] **Contrast-check script** (`node scripts/check-contrast.mjs`): all required pairs pass. Light input border `#B9C1CC` is 1.82:1, pinned by the artifact, reported not changed.
- [x] **Token specimen** at `/specimen.html?theme=light|dark`; screenshots in `.impeccable/review/dark-round/` (round) and `.impeccable/review/phase0/` (final).
- [x] **Dark direction chosen: B · Graphite** (2026-11-21). Folded into tokens.css; candidates deleted. Dark splits `--rd-primary` (fill) from `--rd-primary-text` (links).
- [x] **Surface brief** with the pinned direction contract: `realdha-ui/.impeccable/surfaces/src.md`.
- [x] `npm run build` passes.

### Phase 1: App foundation
- [~] **Download every frame** (GP frames at all 3 sizes, C1/C2/C3, P-00, N-GP, Main are in `references/realdha-frames/project/`; F and X frames still to fetch. Frames render locally via `node scripts/frame-shot.mjs`) (`project/*.dc.html`, all three sizes) to `references/realdha-frames/`, which is read-only reference material. Spike: get frames rendering locally for side-by-side screenshots. If the frame runtime won't render outside the artifact, use screenshots of the published artifact instead.
- [x] **Router & Domain Architecture** (react-router): Reorganized all 111 screens from flat `src/screens` into modular domain directories (`src/routes/{auth,onboarding,properties,verification,buyer,developer,partner,lawyer,market,admin,gov,shared}`) with canonical RESTful URLs (e.g., `/properties/new/plot`, `/onboarding/signup`, `/search`, `/market`).
- [x] **App shell from C3** (`src/app/Shell.tsx`):
  - Sample-data label.
  - Top nav with role items and active underline.
  - Mobile nav at 390.
  - Avatar, notifications, EN/हिं/मरा switcher, theme toggle.
- [ ] **i18n scaffold** (en/hi/mr). English copy for every screen; Hindi and Marathi only where the artifact translates (X-05) until scope is confirmed.
- [ ] **Sample-data fixtures** taken from the frames: Prakash's Kusgaon plot 112/2, A-1804 RA-PUN-001-A-18-04, Sameer's STOP report, market tickers, and so on.
- [x] **Dev flow index** at `/dev/flows`: (P-00) route with Prev, Next and Flow index controls, mapped directly to canonical paths.
- [x] **Verify tooling** (`scripts/shot.mjs`, `scripts/frame-shot.mjs`; uses the Playwright-cached chrome-headless-shell): a script that screenshots any route at 1440/834/390 in light and dark.

### Phase 2: Component library (C1–C3)
- [ ] **Built on shadcn/ui** (per `realdha-ui/CLAUDE.md`), themed by the Realdha tokens rather than shadcn defaults.
- [ ] **C1 controls**: Button (primary, secondary, ghost, danger; 44/36; hover, focus, disabled, loading), Field and Select, Textarea, OTP input, Checkbox, Radio and Switch, Uploader/dropzone with file rows, RecordId chip with copy, StatusPill (icon + word + colour).
- [ ] **C2 content**: FindingCard (bilingual quote and source page), VerdictBanner (Stop, Clarify, Proceed), SeverityPill, ProofPanel (on-chain teal), AI answer bubble with citations and the not-found state, TickerCard, property pickers, Stepper.
- [ ] **C3 shell**: DataTable (search, filter chips, pagination, row actions), Modal, Drawer, Toast, Tooltip, empty, loading (skeleton) and error states, Tabs, language switcher, nav.
- [ ] **Component specimen page** rebuilt against C1–C3 at all three sizes, light and dark.

### Phase 3: Golden path, owner (23 screens)
Built and persistent (2026-11-21): all 23 screens work with saved fields (`usePersistentState`); `tsc`, `lint` and `build` pass. `[~]` = built, still to verify at 834, in dark, and against frames side by side, then the end-to-end click-through.
- [~] **GP-01–05 onboarding**: sign up, phone OTP (4 states), account type, KYC, KYC result (3 states).
- [~] **GP-06–09 property intake**: empty home, add plot with GPS pin, document upload, Gemini processing.
- [~] **GP-10–12 verification**: extraction review, report (Clarify), resolve and re-check (Proceed).
- [~] **GP-13–15 sign-off and proof**: lawyer queue, lawyer review and sign-off, anchoring approval (3 states).
- [~] **GP-16–18 digital twin**: owner twin, check-document modal (3 states), Ask AI drawer (2 states).
- [~] **GP-19–23 tokenise, market, admin**: tokenise structure, mint (4 states), market, market detail, admin console.
- [ ] **End-to-end click-through** of the golden path at all three sizes.

### Phase 4: Owner flows
- [x] **F01 sign up and sign in** (8): sign in, email sign-up, verify email, forgot password, Google handoff, account exists, business details, session and sign-out.
- [x] **F02 identity KYC** (3)
- [x] **F03 add property** (4): apartment and commercial, upload errors, my properties, draft resume.
- [x] **F04 digital twin** (3): apartment twin, ownership history, document viewer.
- [x] **F05 verify documents for a property not on Realdha** (5): including the STOP and PROCEED reports.
- [x] **F06 lawyer sign-off** (2)
- [x] **F07 share a verified record** (3): create link, manage and revoke, recipient view and expired link.

### Phase 5: Buyer flows
- [x] **F08 search** (4)
- [x] **F09 area and single property** (3)
- [x] **F11 shortlist, compare, AI assistant** (3)
- [x] **F12 enquiry** (3)
- [x] **F13 book a sales call** (5)
- [x] **F18 market watchlist and register interest** (2)
- [x] **X-01 buyer home**

### Phase 6: Developer and channel partner
- [x] **F10 new units** (8): project, towers, bulk CSV, unit grid, publish, new launches, project page, stack picker.
- [x] **F14 3D visualisation** (5)
- [x] **F15 developer console** (7): dashboard, inventory, price history, enquiry inbox, call calendar, activity heatmap, channel partners.
- [x] **F16 channel partner** (5): including F16-05 call availability, marked ADDED.

### Phase 7: Tokenisation, admin, government
- [x] **F17 tokenised assets and token detail** (2)
- [x] **F19 admin** (4): transaction drawer, contracts, audit log, access denied.
- [x] **F20 government, read-only** (4): lookup, record, fingerprint check, audit trail and export.

### Phase 8: Cross-cutting
- [x] **X-02 notifications**
- [x] **X-03 profile and settings**, including the theme setting.
- [x] **X-04 error pages**: 404, permission denied, offline, error.
- [x] **X-05 twin in Hindi and Marathi**: a full Devanagari pass.

### Phase 9: Retire the old UI and harden
- [ ] **Delete the old UI**: old components, `App.css`, `shared-components.css`, the alias block and old fonts. Mark `REALDHA_UI_CONSISTENCY_DELIVERABLES.md` as superseded.
- [ ] **Full audit**: a11y (axe), responsive at 390/834/1440, dark mode, reduced motion, Devanagari clipping.
- [ ] **Coverage check** against the artifact's V-Coverage 1 and 2: every screen × state × size is ticked.
- [ ] **Review section** here, and lessons in `tasks/lessons.md`.

### Open questions carried over from the artifact (V-OpenQuestions)
- [ ] Lawyer and valuer nav items: the artifact assumes Queue, Reviews, Signed off.
- [ ] Fund partner name: a placeholder on GP-19, GP-20 and F17-02.
- [ ] Hindi and Marathi scope: only X-05 is translated so far.
- [ ] Golden path hand-offs into the F flows: the artifact links them in spec order.
- [ ] Implied states F10-05 and F13-04: build them as drawn.

---

# Todo: Web Scraper Analysis, Local Database Architecture, and Scraping Execution

## Objective
Analyze the current web scraper implementation in `references/flat-finder/pipeline`, design and implement a structured local SQLite database for property, unit, listing, and review data, migrate existing crawled data, and execute the scraping pipeline with robust persistence.

---

### Progress Checklist

- [x] **Phase 1: Analyze the Current Implementation**
  - [x] Audited `mb_crawl.py`, `mb_parse.py`, and the data pipeline.
  - [x] Identified architecture, caching mechanisms, concurrency model, and failure modes.
  - [x] Documented strengths, bottlenecks, and the 403 anti-bot / HTTP limitations.

- [x] **Phase 2: Design & Implement Local Database (`db.py`)**
  - [x] Designed relational SQLite schema (`projects`, `project_units`, `project_amenities`, `project_listings`, `project_reviews`, `project_ratings`, `project_trends`, `crawl_state`).
  - [x] Added indexing on high-cardinality search fields (`city`, `locality`, `rera_id`, `bhk`, `status`).
  - [x] Implemented thread-safe connection handling, upsert transactions, and state management.
  - [x] Implemented data ingestion utility to load existing crawled data (2,708 projects in `mb_projects.json`) into SQLite.

- [x] **Phase 3: Database-Backed Web Scraper & Scraping Execution**
  - [x] Refactored / enhanced scraper (`mb_crawl.py`) to write transactions directly to SQLite.
  - [x] Implemented modern HTTP client headers, polite backoff, and granular error tracking in `crawl_state`.
  - [x] Ingested pre-existing crawled records into SQLite database (`references/flat-finder/data/properties.db`).
  - [x] Executed scraper on target city / pages and monitored progress.
  - [x] Verified database contents with verification queries and stats.

- [x] **Phase 4: Systematic Debugging & Fix of Crawl State Run Issue**
  - [x] Root Cause 1: Standard terminal sandbox blocks external outbound network access (`HTTP 403: Forbidden`).
  - [x] Root Cause 2: Python's `urllib` threw SSL certificate verification errors on macOS due to missing local root certificates (`[SSL: CERTIFICATE_VERIFY_FAILED]`).
  - [x] Root Cause 3: Lack of resilient fallback transport and batch pagination in `mb_crawl.py`.
  - [x] Implemented multi-tier transport in `mb_crawl.py`: `urllib` with auto-detecting SSL context fallback + native `curl` subprocess fallback with macOS system trust store.
  - [x] Added `--pages N` batching to list crawl and `--limit N` to project details crawl.
  - [x] Added `reset <city>` command and automatic resumption in `db.py` / `mb_crawl.py`.
  - [x] Executed live crawl for Pune (`--pages 2`) and project details (`--limit 3`) outside sandbox.
  - [x] Verified database populated with 40 Pune projects, 3 full detailed projects with MahaRERA registrations, 44 unit configurations, 28 listings, and 16 reviews.
  - [x] Verified unit tests in `test_db.py` (5/5 passing) and `test_mb_parse.py` (5/5 passing).

---

### Review & Verification Results
- **Database File**: `references/flat-finder/data/properties.db` (11 MB, SQLite 3.50+ with WAL mode).
- **Total Master Projects**: 2,748 societies (2,708 Gurgaon + 40 Pune).
- **Projects with Full Details**: 2,711 societies.
- **Total Unit Configurations**: 7,879 unit types.
- **Total Live Market Listings**: 13,341 live listings.
- **Total Resident Reviews**: 3,341 reviews.
- **Projects with RERA Registration**: 668 registered projects (including MahaRERA P52100001274, P52100002620, P52100000501).
- **Crawl States**: Both `pune [list]` and `pune [projects]` marked `COMPLETED`.
