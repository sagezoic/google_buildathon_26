# REALDHA UI Consistency Implementation Guide

## Overview
This document provides a comprehensive implementation plan for applying consistent UI tokens, colors, and component patterns across all REALDHA screens, with special focus on the home screen patterns, Upload & Verify components.

## Design Token System

### Core Color Palette (Dark Theme)
The application uses a dark theme with the following semantic color system:

```css
--color-ind: #5252EE    /* Primary Brand Blue */
--color-red: #EF4444    /* Critical Alerts */
--color-grn: #10B981    /* Success States */
--color-amb: #F59E0B    /* Warnings */
--color-ink: #FFFFFF    /* Primary Text */
--color-g: #080C18      /* Background Base */
--color-pap: #0E1426    /* Surface Layer */
--color-rule: rgba(255, 255, 255, 0.08)  /* Borders */
```

## File Structure

```
realdha-ui/src/
├── index.css                      # Global theme variables
├── App.css                        # Main application styles
├── components/
│   ├── shared-components.css      # NEW: Unified component patterns
│   ├── LandingPage.tsx            # Home screen (reference design)
│   ├── PropertySearch.tsx         # Marketplace (Lofty style)
│   ├── PropertyDetails.tsx        # Details page
│   ├── UploadVerifyFlow.tsx       # Full-page upload studio
│   ├── UploadVerifyModal.tsx      # Quick upload dialog
│   ├── Header.tsx                 # Universal navigation
│   └── ...other components
└── .impeccable/
    ├── design-tokens.md           # Complete design token reference
    └── ui-consistency-implementation.md  # This file
```

## Key Consistent Patterns from Home Screen

### 1. Hero Section Pattern
**Used in:** LandingPage, Upload Studio Header

```tsx
<section className="landing-hero">
  <div className="hero-content">
    <h1 className="hero-title">
      Main Title
      <span className="hero-dv-sub dv">मराठी शीर्षक</span>
    </h1>
    <p className="hero-description">Description text...</p>
    {/* CTA buttons */}
  </div>
  <div className="hero-preview-card">{/* Preview */}</div>
</section>
```

**Tokens:**
- Title: `800 46px/1.12 var(--font-sans)`
- Devanagari subtitle: `.dv` class
- Description: `400 16px/1.65`
- Grid: `1.25fr 0.95fr` (content | preview)

### 2. Official Revenue Stamp Component
**Used in:** PropertyDetails, UploadVerifyFlow, UploadVerifyModal, Landing Preview

**NEW UNIFIED COMPONENT:**
```tsx
<div className="verdict-stamp-component">
  <div className="verdict-stamp-seal clear-status">
    <div className="verdict-stamp-seal-inner">
      <span className="verdict-seal-dv dv">प्रमाणित</span>
      <span className="verdict-seal-en">VERIFIED</span>
      <small className="verdict-seal-date n">20-NOV-2026</small>
    </div>
  </div>
  <div className="verdict-stamp-content">
    <div className="verdict-title-row">
      <Stamp className="verdict-icon" />
      <h3 className="verdict-primary-title clear-status">
        Title in Devanagari · English
      </h3>
    </div>
    <p className="verdict-subtitle">Subtitle description...</p>
    <div className="verdict-meta-row n">
      <span>Serial: XYZ123</span>
      <span className="bullet">·</span>
      <span>Tx: 0x7f9a...</span>
    </div>
  </div>
</div>
```

**Status Variants:**
- `.clear-status` - Violet (#4A154B)
- `.warning-status` - Amber (#A86400)
- `.critical-status` - Red (#C3271F)

### 3. Upload & Verify Dropzone
**Used in:** UploadVerifyFlow, UploadVerifyModal

**Pattern:**
```tsx
<div className="interactive-dropzone" onClick={handleUpload}>
  <div className="dropzone-icon-circle">
    <Upload size={32} />
  </div>
  <h3 className="dropzone-heading">Drop Document PDF Here</h3>
  <p className="dropzone-sub">Supports Marathi 7/12, Index II...</p>
  <span className="dropzone-action-btn">Select File from Device</span>
</div>
```

**Tokens:**
- Border: `2px dashed var(--color-ind)`
- Icon circle: `56px diameter, #edf0fc background`
- Hover: background `#edf0fc`

### 4. Bilingual Text Display
**Used in:** Document extracts, translations

**NEW UNIFIED COMPONENT:**
```tsx
<div className="bilingual-excerpt">
  <div className="bilingual-column">
    <div className="bilingual-column-header">
      <span className="bilingual-column-title dv">मूळ मराठी</span>
    </div>
    <blockquote className="bilingual-text marathi-text dv">
      पुणे महानगरपालिका...
    </blockquote>
  </div>
  <div className="bilingual-column">
    <div className="bilingual-column-header">
      <span className="bilingual-column-title">English Translation</span>
      <span className="bilingual-certified-badge">Certified</span>
    </div>
    <blockquote className="bilingual-text english-text">
      Pune Municipal Corporation...
    </blockquote>
  </div>
</div>
```

### 5. Document/Finding Cards
**Used in:** Findings lists, dossier, sample selection

**NEW UNIFIED COMPONENT:**
```tsx
<div className="document-card">
  <div className="document-card-header">
    <div className="document-card-left">
      <FileText className="document-icon" />
      <div className="document-info">
        <h4 className="document-title">Document Name</h4>
        <div className="document-meta">
          <span>Authority · Date</span>
        </div>
      </div>
    </div>
    <span className="document-status-badge verified">Verified</span>
  </div>
  <div className="document-card-body">
    <p className="document-quote">"Excerpt text..."</p>
    <div className="document-citation">
      <FileText size={12} />
      <span>Source: Page 2</span>
    </div>
  </div>
</div>
```

**States:**
- Default: white background, gray border
- Hover: indigo border, slight transform
- Selected: indigo background tint

### 6. Verification Pipeline Steps
**Used in:** UploadVerifyFlow, UploadVerifyModal

**NEW UNIFIED COMPONENT:**
```tsx
<div className="verification-pipeline">
  {steps.map((step, i) => (
    <div className={`pipeline-step ${step.status}`} key={i}>
      <div className="pipeline-step-indicator">
        {step.completed ? <Check /> : step.number}
      </div>
      <div className="pipeline-step-content">
        <strong className="pipeline-step-title">{step.title}</strong>
        <span className="pipeline-step-description">{step.desc}</span>
      </div>
    </div>
  ))}
</div>
```

**States:**
- Pending: `opacity: 0.4`
- Active: `opacity: 1`, indigo indicator
- Completed: `opacity: 0.9`, green indicator

### 7. Cryptographic Hash Display
**Used in:** Ledger anchoring, blockchain proof

**NEW UNIFIED COMPONENT:**
```tsx
<div className="cryptographic-proof-card">
  <div className="crypto-proof-header">
    <div className="crypto-proof-title">
      <Lock size={14} />
      <span>Cryptographic Fingerprint</span>
    </div>
    <button className="crypto-copy-button" onClick={handleCopy}>
      <Copy size={12} />
      <span>Copy Hash</span>
    </button>
  </div>
  <code className="crypto-hash-display">
    <span className="crypto-hash-label">SHA-256:</span>
    e3b0c44298fc1c149afbf4c8996fb92427ae41e4...
  </code>
  <div className="crypto-metadata">
    <div className="crypto-meta-item">
      <span className="crypto-status-dot verified" />
      <span>Cloud KMS Signed</span>
    </div>
    <span>·</span>
    <span>Tx: 0x7f9a...3b21</span>
  </div>
</div>
```

### 8. Extracted Fields Table
**Used in:** Entity extraction results

**NEW UNIFIED COMPONENT:**
```tsx
<div className="extracted-fields-table">
  <div className="extracted-fields-header">
    <FileText size={16} />
    <span>Structured Entity Extraction</span>
  </div>
  <div className="extracted-fields-body">
    {fields.map((field) => (
      <div className="extracted-field-row" key={field.key}>
        <span className="field-key">{field.label}</span>
        <strong className={`field-value ${field.status}`}>
          {field.value}
        </strong>
      </div>
    ))}
  </div>
</div>
```

## Implementation Steps

### Phase 1: Import Shared Components CSS
Add to main entry point or App.tsx:

```tsx
import './components/shared-components.css';
```

### Phase 2: Refactor Upload Components

#### UploadVerifyFlow.tsx Changes

**Before:**
```tsx
<div className="studio-verdict-banner">
  <div className="stamp-seal-outer">...</div>
  <div className="verdict-banner-text">...</div>
</div>
```

**After:**
```tsx
<div className="verdict-stamp-component">
  <div className="verdict-stamp-seal clear-status">
    <div className="verdict-stamp-seal-inner">
      <span className="verdict-seal-dv dv">प्रमाणित</span>
      <span className="verdict-seal-en">VERIFIED</span>
      <small className="verdict-seal-date n">{scenario.stamp.date}</small>
    </div>
  </div>
  <div className="verdict-stamp-content">
    <div className="verdict-title-row">
      <Stamp className="verdict-icon" size={18} />
      <h3 className="verdict-primary-title clear-status">
        {scenario.stamp.title}
      </h3>
    </div>
    <p className="verdict-subtitle">{scenario.stamp.subtitle}</p>
    <div className="verdict-meta-row n">
      <span>Serial: {scenario.stamp.serialNo}</span>
      <span className="bullet">·</span>
      <span>Tx: {scenario.txHash.slice(0, 14)}...</span>
    </div>
  </div>
</div>
```

**Replace `.extracted-fields-box` with `.extracted-fields-table`**

**Replace `.bilingual-text-box` with `.bilingual-excerpt`**

**Replace `.crypto-anchor-box` with `.cryptographic-proof-card`**

**Replace `.pipeline-steps-list` with `.verification-pipeline`**

#### UploadVerifyModal.tsx Changes

Similar refactoring using the new unified components:
- Use `.verification-pipeline` for scan stepper
- Use `.verdict-stamp-component.compact` for result stamp
- Use `.extracted-fields-table` for entity display

### Phase 3: Update PropertyDetails.tsx

Replace existing verdict banner with unified component:

```tsx
// Replace .details-verdict-banner
<div className="verdict-stamp-component">
  {/* Use unified component */}
</div>
```

### Phase 4: Update Other Components

Apply consistent patterns to:
- DocumentDossierModal.tsx (document cards)
- GeminiDrawer.tsx (citation pills)
- ShareModal.tsx (hash display)

## Testing Checklist

### Visual Consistency
- [ ] All verdict stamps use identical circular seal design
- [ ] Colors match across all status types (clear/warning/critical)
- [ ] Devanagari + English labels consistent
- [ ] All hash displays use monospace font
- [ ] All pipeline steppers have matching indicator styles

### Component Behavior
- [ ] Hover states work uniformly
- [ ] Copy buttons show correct feedback
- [ ] Status transitions animate smoothly
- [ ] Responsive breakpoints consistent

### Accessibility
- [ ] Color contrast ratios meet WCAG AA
- [ ] All interactive elements keyboard accessible
- [ ] Screen reader labels accurate
- [ ] Focus indicators visible

## Color Usage Matrix

| Component | Clear | Warning | Critical | Info |
|-----------|-------|---------|----------|------|
| Verdict Stamp Border | #4A154B | #A86400 | #C3271F | #5252EE |
| Status Badge BG | #e6f4ea | #fef7e0 | #fce8e6 | #edf0fc |
| Status Badge Text | #10B981 | #F59E0B | #EF4444 | #5252EE |
| Progress Bar Fill | #10B981 | #F59E0B | #EF4444 | #5252EE |

## Typography Scale Enforcement

### Headlines
```
46px/800 - Landing Hero
36px/800 - Section Titles
32px/800 - Page Titles
24px/800 - Panel Headers
22px/800 - Card Headers (Devanagari)
18px/800 - Subsections
```

### Body Text
```
16px/400 1.65 - Long Form
15px/500 - Search Input
14px/500 1.3 - Body Standard
13px/700 - Buttons, Labels
13px/500 1.45 - Chat
12px/600 - Secondary Labels
```

### Data / Monospace
```
18px/700 Narrow - Key Metrics
16px/700 Narrow - Pricing
14px/700 Narrow - REALDHA IDs
13px/700 Narrow - References
12px/700 Narrow - Hashes
```

## Common Pitfalls to Avoid

1. **Don't mix stamp styles** - Use only `.verdict-stamp-component`
2. **Don't create custom progress bars** - Use `.progress-indicator`
3. **Don't inline border colors** - Use status class variants
4. **Always use `.n` for numbers** - Tabular figure spacing
5. **Always use `.dv` for Marathi** - Proper font rendering
6. **Don't skip hover states** - Maintain interactivity cues
7. **Don't use hardcoded colors** - Reference CSS variables

## Migration Priority

### High Priority (Week 1)
1. UploadVerifyFlow.tsx → Unified verdict, pipeline, bilingual
2. UploadVerifyModal.tsx → Unified verdict, pipeline
3. PropertyDetails.tsx → Unified verdict banner

### Medium Priority (Week 2)
4. DocumentDossierModal.tsx → Document cards
5. GeminiDrawer.tsx → Citation styling
6. ShareModal.tsx → Hash display

### Low Priority (Week 3)
7. Global search autocomplete styling
8. Misc modals and dialogs
9. Footer consistency

## Responsive Considerations

### Breakpoints
```css
1440px - Max content container width
1280px - Grid column adjustment
1024px - Tablet layout
768px - Mobile stacking
```

### Mobile Adaptations
- Bilingual excerpt: stack columns vertically
- Verdict stamp: use `.compact` variant
- Pipeline steps: reduce gap, smaller indicators
- Hash display: smaller font, truncate

## Performance Notes

- Shared CSS is ~8KB minified
- No JavaScript overhead
- Pure CSS transitions
- GPU-accelerated transforms
- Minimal repaints on hover

## Documentation Links

- **Complete Design Tokens:** `.impeccable/design-tokens.md`
- **Component CSS:** `src/components/shared-components.css`
- **Main Styles:** `src/App.css`
- **Global Theme:** `src/index.css`

## Support & Questions

For questions about implementation:
1. Reference `LandingPage.tsx` for canonical patterns
2. Check `design-tokens.md` for complete token catalog
3. Review `PropertyDetails.tsx` for complex layouts
4. Inspect `shared-components.css` for component structure

---

**Last Updated:** December 2024
**Version:** 1.0
**Status:** Ready for Implementation
