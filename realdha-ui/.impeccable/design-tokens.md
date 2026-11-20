# REALDHA UI Design Tokens & Component System

## Color Palette (Dark Theme)

### Brand & Semantic Colors
```css
--color-ind: #5252EE     /* Primary Indigo (Brand, CTAs, Interactive) */
--color-red: #EF4444     /* Error, Critical Flags, Mortgage Issues */
--color-grn: #10B981     /* Success, Verified, Clear Title */
--color-amb: #F59E0B     /* Warning, Area Discrepancies, Caution */
--color-ink: #FFFFFF     /* Primary Text (Dark Mode) */
--color-g: #080C18       /* Background Base */
--color-pap: #0E1426     /* Secondary Background / Surface */
--color-rule: rgba(255, 255, 255, 0.08)  /* Borders / Dividers */
```

### Extended Palette
```css
/* Secondary Interactive */
#6366F1 (Violet for stamps)
#7879F1 (Lighter indigo for accents)
#4A154B (Official Violet Revenue Stamp)

/* Status Colors Extended */
#A86400 (Amber dark for warnings)
#C3271F (Red dark for critical issues)
#e6f4ea (Green light bg - success states)
#fef7e0 (Amber light bg - warnings)
#fce8e6 (Red light bg - errors)
#f7f8fd (Indigo tint - hover states)
#edf0fc (Indigo light - active selections)
```

## Typography

### Font Families
```css
--font-sans: 'Archivo', sans-serif          /* Primary Interface */
--font-narrow: 'Archivo Narrow', sans-serif /* Monospace/Numeric Data */
--font-devanagari: 'Mukta', sans-serif      /* Marathi/Hindi Script */
```

### Font Scales
```css
/* Headlines */
46px/800 -0.03em  /* Landing Hero Title */
36px/800 -0.02em  /* Section Headlines */
24px/800 -0.01em  /* Page Titles */
22px/800          /* Card Headers */
20px/800          /* Panel Headers */
18px/800          /* Subsection Titles */

/* Body Text */
16px/400 1.65     /* Hero Description, Long Form */
15px/500          /* Primary Search Input */
14px/500 1.3      /* Body Text Standard */
13px/700          /* Buttons, Labels */
13px/500 1.45     /* Chat Messages */
12px/600          /* Secondary Labels */
11px/700          /* Uppercase Labels, Tags */
11px/600 0.04em   /* Small Caps, Metadata */
10px/600          /* Micro Labels */

/* Devanagari */
22px/800 Mukta    /* Panel Headers (Devanagari) */
18px/800 Mukta    /* Government Emblem */
16px/800 Mukta    /* Section Subheads (Devanagari) */
14px/800 Mukta    /* Devanagari Body */
13px Mukta        /* Small Devanagari Labels */

/* Monospace/Data */
18px/700 Narrow   /* Key Metrics */
16px/700 Narrow   /* Pricing Data */
14px/700 Narrow   /* REALDHA IDs */
13px/700 Narrow   /* Document References */
12px/700 Narrow   /* Code, Hashes */
```

### Numeric (.n class)
```css
.n {
  font-variant-numeric: tabular-nums;
}
```

## Spacing Scale

### Component Padding
```css
/* Container Padding */
72px (Section Vertical)
56px (Hero Top)
40px (Section Horizontal)
28px (Header Horizontal)
20px (Panel / Card)
16px (Compact Panel)
12px (Tight Card)

/* Component Gaps */
48px (Major Section Gaps)
24px (Card Grid Gaps)
20px (Element Groups)
16px (Related Items)
12px (Inline Elements)
8px (Tight Lists)
6px (Chip Spacing)
4px (Micro Spacing)
```

## Border Radius

```css
99px  (Pills / Fully Rounded)
4px   (Large Cards, Modals)
3px   (Modal Cards)
2px   (Standard Buttons, Cards, Inputs)
0px   (Sharp / Government Forms)
```

## Shadows

```css
/* Elevation Layers */
0 2px 6px rgba(0, 0, 0, 0.15)       /* Subtle Lift */
0 4px 16px rgba(0, 0, 0, 0.05)      /* Card Hover */
0 8px 24px rgba(0, 0, 0, 0.08)      /* Elevated Card */
0 12px 32px rgba(34, 48, 122, 0.15) /* Primary CTA Hover */
0 16px 40px rgba(0, 0, 0, 0.3)      /* Modal Backdrop */
0 -4px 16px rgba(0, 0, 0, 0.08)     /* Drawer Top Shadow */
0 -12px 36px rgba(0, 0, 0, 0.25)    /* Drawer Expanded */
```

## Component Tokens

### Buttons

#### Primary Button (Solid Fill)
```css
.btn-primary-large, .btn-primary {
  background: var(--color-ind);
  color: #fff;
  border: 1px solid var(--color-ind);
  font: 700 14px/13px var(--font-sans);
  padding: 12px 24px / 0 16px;
  box-shadow: 0 2px 6px rgba(34, 48, 122, 0.2);
  transition: all 0.15s ease;
}
.btn-primary:hover {
  background: #17235a;
  transform: translateY(-1px);
}
```

#### Secondary Button (White/Light)
```css
.btn-secondary-large, .btn-secondary {
  background: #fff;
  color: var(--color-ink);
  border: 1px solid var(--color-rule);
  font: 700 14px var(--font-sans);
  padding: 12px 22px / 0 16px;
}
.btn-secondary:hover {
  background: var(--color-pap);
  border-color: var(--color-ind);
}
```

#### Outline Button (Ghost)
```css
.btn-outline-large {
  background: transparent;
  color: var(--color-ind);
  border: 1px solid var(--color-ind);
  font: 700 14px var(--font-sans);
  padding: 12px 20px;
}
.btn-outline-large:hover {
  background: #edf0fc;
}
```

### Input Fields

#### Search Input (Header)
```css
.lofty-header-search-input {
  height: 44px;
  border: 1px solid rgba(255,255,255,0.15);
  background: rgba(255,255,255,0.08);
  border-radius: 99px;
  padding: 0 20px;
  font: 500 15px var(--font-sans);
  color: var(--color-ink);
}
.lofty-header-search-input:focus {
  background: rgba(255,255,255,0.12);
  border-color: rgba(255,255,255,0.3);
}
```

#### Standard Input
```css
.drawer-input {
  height: 36px;
  border: 1.5px solid var(--color-ink);
  background: #fff;
  padding: 0 12px;
  font: 500 13px var(--font-sans);
  border-radius: 2px;
}
.drawer-input:focus {
  border-color: var(--color-ind);
  box-shadow: 0 0 0 2px rgba(34, 48, 122, 0.15);
}
```

### Status Badges & Pills

#### Status Pills (Small)
```css
.status-pill {
  padding: 1px 6px;
  border-radius: 2px;
  font: 700 10px var(--font-sans);
}
.status-pill.verified { background: #e6f4ea; color: var(--color-grn); }
.status-pill.flagged  { background: #fce8e6; color: var(--color-red); }
.status-pill.pending  { background: #fef7e0; color: var(--color-amb); }
```

#### Category Pills (Medium)
```css
.detail-tag-pill {
  padding: 3px 10px;
  border-radius: 99px;
  font: 700 11px var(--font-sans);
}
.pill-indigo  { background: #edf0fc; color: var(--color-ind); }
.pill-emerald { background: #e6f4ea; color: var(--color-grn); }
.pill-purple  { background: #f3e8f7; color: #7b1fa2; }
.pill-slate   { background: var(--color-pap); color: #cbd5e1; }
```

#### Official Revenue Stamp
```css
.stamp-seal-outer {
  width: 72px;
  height: 72px;
  border: 2.5px solid #4A154B;
  border-radius: 50%;
  padding: 3px;
}
.stamp-seal-inner {
  border: 1px dashed currentColor;
  border-radius: 50%;
  background: #fbf5fc;
  text-align: center;
}
.stamp-seal-dv { font: 800 12px var(--font-devanagari); }
.stamp-seal-en { font: 800 9px var(--font-sans); letter-spacing: 0.08em; }
```

### Cards & Surfaces

#### Elevated Card (Lofty Style)
```css
.lofty-card {
  background: #fff;
  border: 1px solid var(--color-rule);
  border-radius: 2px;
  overflow: hidden;
  transition: all 0.2s ease;
  cursor: pointer;
}
.lofty-card:hover {
  transform: translateY(-2px);
  border-color: var(--color-ind);
  box-shadow: 0 8px 24px rgba(34, 48, 122, 0.08);
}
```

#### Modal Card
```css
.modal-card {
  background: #fff;
  border: 2px solid var(--color-ink);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.3);
  border-radius: 3px;
  max-height: 90vh;
}
```

#### Panel (Document-Style)
```css
.panel {
  padding: 16px 20px;
  border-right: 1px solid var(--color-rule);
  background: var(--color-g);
}
```

### Interactive States

#### Hover Transform
```css
transform: translateY(-1px) / translateY(-2px);
box-shadow: (elevated);
```

#### Active Selection
```css
background: #edf0fc;
border-color: var(--color-ind);
border-width: 1.5px;
```

#### Focus States
```css
outline: 2px solid var(--color-ind);
outline-offset: 2px;
box-shadow: 0 0 0 2px rgba(34, 48, 122, 0.15);
```

## Layout Grid Specifications

### Main 3-Column Passport Layout
```css
.main-grid {
  display: grid;
  grid-template-columns: 420px 1fr 480px;
  /* Explore | Schedule | Verification */
}
```

### Landing Page Grids
```css
/* Hero */
grid-template-columns: 1.25fr 0.95fr;  /* Content | Preview Card */

/* Pillars */
grid-template-columns: repeat(4, 1fr);  /* 4 Value Pillars */

/* Cases */
grid-template-columns: repeat(4, 1fr);  /* 4 Test Scenarios */
```

### Property Marketplace (Lofty Style)
```css
.lofty-cards-grid.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}
```

### Details 2-Column
```css
.lofty-details-grid {
  display: grid;
  grid-template-columns: 1fr 420px;  /* Content | Floating Action Card */
  gap: 48px;
}
```

## Icon Sizes

```css
/* Hero / Large */
36px (Dropzone Icons)
32px (Large Feature Icons)

/* Standard UI */
22px (Panel Header Icons)
20px (Title Action Icons)
18px (Specification Icons, Category Icons)
16px (Button Icons, Input Icons)
15px (Small Button Icons)
14px (Inline Icons, Citation Icons)
13px (Pill Icons, Micro Badges)
12px (Info Icons, Tooltip Icons)

/* Micro */
10px (Tick Marks, Dots)
```

## Z-Index Layers

```css
1000  Modal Backdrop
100   Search Dropdown, Tooltips
50    Gemini Drawer (Global Bottom)
20    Header (Sticky Top)
10    Floating FAB
1     Default Interactive
```

## Animation & Transitions

### Timing Functions
```css
ease        (default hover states)
ease-out    (fade in, slide up)
ease-in-out (drawer expand/collapse)
cubic-bezier(0.16, 1, 0.3, 1)  (drawer smooth open)
```

### Durations
```css
0.12s  (Micro: button hover, pill selection)
0.15s  (Standard: card hover, input focus)
0.2s   (Cards, transform effects)
0.25s  (Panel transitions, drawer toggle)
0.3s   (Progress bar fills)
```

### Keyframes
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
```

## Responsive Breakpoints

```css
1440px  Max content width (landing sections)
1280px  Main grid adjustment (360px 1fr 420px)
1024px  Tablet breakpoint
768px   Mobile breakpoint
```

## Component Catalog Reference

### Core Components
1. **Header** (Universal Navigation)
2. **PropertySearch** (Lofty Marketplace Grid)
3. **PropertyDetails** (2-Column Details + Floating Card)
4. **LandingPage** (Hero + 4 Sections + Footer)
5. **UploadVerifyFlow** (2-Panel Studio Workspace)
6. **UploadVerifyModal** (Quick Modal Upload)
7. **DocumentDossierModal** (4-Tab Document Viewer)
8. **GeminiDrawer** (Bottom Expandable AI Assistant)
9. **ShareModal**, **TourModal** (Utility Modals)

### Shared UI Patterns
- **Revenue Stamp Verdict Banner** (Violet circular seal + title + subtitle)
- **Title Chain Bar** (30-year horizontal timeline)
- **Findings Cards** (Audit findings with citations)
- **Chaturima Grid** (Boundary neighbor layout)
- **Document Cards** (Clickable document list items)
- **Search Dropdown** (Autocomplete results overlay)
- **Status Badges** (Clear/Flagged/Pending pills)

## Upload & Verify Component Consistency

### Shared Visual Language
Both **UploadVerifyFlow** (full page studio) and **UploadVerifyModal** (quick dialog) share:

1. **Progress Pipeline Steps** (5-stage OCR → Entities → Reconciliation → Anchoring → Complete)
2. **Official Verdict Stamp** (Violet/Amber/Red circular seal with Devanagari + English)
3. **Bilingual Text Display** (Marathi original + English translation side-by-side)
4. **Extracted Fields Table** (Structured entity extraction results)
5. **Cryptographic Hash Box** (SHA-256 + Cloud KMS + Ethereum proof)

### Token Alignment Needed

#### Upload Studio (UploadVerifyFlow.tsx)
Currently uses custom classes that should align with global tokens:
- `.studio-header` → should use `.landing-section` padding (72px 40px)
- `.studio-verdict-banner` → should match `.verdict-stamp-banner` from Details
- `.extracted-fields-box` → should match `.entities-table` structure
- `.crypto-anchor-box` → should match `.ledger-fingerprint-box`

#### Upload Modal (UploadVerifyModal.tsx)
Uses consistent `.scan-progress-box`, `.step-item`, `.result-stamp` patterns.
Good alignment with global modal tokens.

---

## Recommended Consistency Improvements

### Priority 1: Verdict Banner Unification
Create single `.verdict-stamp-component` used across:
- PropertyDetails (Verification Tab)
- UploadVerifyFlow (Right Panel Result)
- UploadVerifyModal (Scan Result Card)
- LandingPage (Preview Card)

### Priority 2: Document/Finding Card Pattern
Unify `.finding-card`, `.dossier-card-row`, `.sample-test-card` into single `.document-card` component.

### Priority 3: Progress Pipeline
Extract `.pipeline-steps-list` / `.scan-stepper` into shared `.verification-pipeline-stepper` component.

### Priority 4: Bilingual Text Display
Create `.bilingual-excerpt` component for consistent Marathi ↔ English display.

### Priority 5: Hash/Ledger Proof Box
Unify `.crypto-anchor-box`, `.ledger-fingerprint-box`, `.hash-box-group` into `.cryptographic-proof-card`.

---

## Implementation Notes

- All color values reference CSS custom properties (`var(--color-ind)`)
- Font stacks use Google Fonts CDN (Archivo, Archivo Narrow, Mukta)
- Numeric data ALWAYS uses `.n` class for tabular figures
- Devanagari text ALWAYS uses `.dv` class + `var(--font-devanagari)`
- Interactive elements use `cursor: pointer` + `transition: all 0.15s ease`
- All borders use `var(--color-rule)` except where semantic color needed
- Modal backdrops use `backdrop-filter: blur(4px)` for depth
- Dark theme: all text is `var(--color-ink)` (white) on dark backgrounds
