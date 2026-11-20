# REALDHA Component Patterns Visual Reference

## Quick Reference Guide
This document provides copy-paste ready code snippets for all unified UI components, extracted from the home screen (LandingPage.tsx) reference design.

---

## 1. Official Revenue Stamp Verdict Banner

### Usage
Property verification results, document audit verdicts, upload completion status

### Code
```tsx
import { Stamp, ShieldCheck, AlertTriangle } from 'lucide-react'

<div className="verdict-stamp-component">
  <div className="verdict-stamp-seal clear-status">
    {/* Options: clear-status | warning-status | critical-status */}
    <div className="verdict-stamp-seal-inner">
      <span className="verdict-seal-dv dv">प्रमाणित</span>
      <span className="verdict-seal-en">VERIFIED</span>
      <small className="verdict-seal-date n">20-NOV-2026</small>
    </div>
  </div>
  <div className="verdict-stamp-content">
    <div className="verdict-title-row">
      <Stamp className="verdict-icon" size={18} />
      <h3 className="verdict-primary-title clear-status">
        प्रमाणित · CLEAR TO PROCEED
      </h3>
    </div>
    <p className="verdict-subtitle">
      30-year search report unbroken with zero encumbrance.
    </p>
    <div className="verdict-meta-row n">
      <span>Serial: MH-REV-00194</span>
      <span className="bullet">·</span>
      <span>Tx: 0x7f9a...3b21</span>
    </div>
  </div>
</div>
```

### Variants

#### Clear Title (Green)
```tsx
<div className="verdict-stamp-seal clear-status">
  <div className="verdict-stamp-seal-inner">
    <span className="verdict-seal-dv dv">प्रमाणित</span>
    <span className="verdict-seal-en">VERIFIED</span>
    <small className="verdict-seal-date n">20-NOV-2026</small>
  </div>
</div>
```

#### Area Discrepancy (Amber)
```tsx
<div className="verdict-stamp-seal warning-status">
  <div className="verdict-stamp-seal-inner">
    <span className="verdict-seal-dv dv">सावधान</span>
    <span className="verdict-seal-en">DISCREPANCY</span>
    <small className="verdict-seal-date n">20-NOV-2026</small>
  </div>
</div>
```

#### Critical Issue (Red)
```tsx
<div className="verdict-stamp-seal critical-status">
  <div className="verdict-stamp-seal-inner">
    <span className="verdict-seal-dv dv">दोष</span>
    <span className="verdict-seal-en">DEFECT</span>
    <small className="verdict-seal-date n">20-NOV-2026</small>
  </div>
</div>
```

#### Compact Variant (For Cards)
```tsx
<div className="verdict-stamp-component compact">
  {/* Same structure, automatically scales to 56px seal */}
</div>
```

---

## 2. Document Upload Dropzone

### Usage
File upload interfaces, document ingestion entry points

### Code
```tsx
import { Upload } from 'lucide-react'

<div className="interactive-dropzone" onClick={handleFileSelect}>
  <div className="dropzone-icon-circle">
    <Upload size={32} />
  </div>
  <h3 className="dropzone-heading">
    Drop Property Document PDF or Image
  </h3>
  <p className="dropzone-sub">
    Upload Marathi Village Form VII/XII (सातबारा), Index II, Ferfar mutation,
    PMC/PCMC sanctioned plans, or Bank NOC (PDF, PNG, TIFF up to 50MB)
  </p>
  <span className="dropzone-action-btn">
    Select File from Device
  </span>
</div>
```

### With Hidden File Input
```tsx
<input
  type="file"
  ref={fileInputRef}
  style={{ display: 'none' }}
  onChange={handleFileChange}
  accept=".pdf,.png,.jpg,.jpeg,.tiff"
/>
<div
  className="interactive-dropzone"
  onClick={() => fileInputRef.current?.click()}
>
  {/* Dropzone content */}
</div>
```

---

## 3. Verification Pipeline Stepper

### Usage
Multi-step upload progress, document processing stages

### Code
```tsx
import { Upload, FileSearch, Layers, ShieldCheck, Lock, Check } from 'lucide-react'

const steps = [
  {
    number: '1',
    title: 'Document Ingestion & Image Pre-processing',
    description: 'Noise reduction, orientation rectification, DPI enhancement',
    status: 'completed', // 'pending' | 'active' | 'completed'
  },
  // ... more steps
]

<div className="verification-pipeline">
  {steps.map((step, i) => (
    <div className={`pipeline-step ${step.status}`} key={i}>
      <div className="pipeline-step-indicator">
        {step.status === 'completed' ? (
          <Check size={14} />
        ) : (
          step.number
        )}
      </div>
      <div className="pipeline-step-content">
        <strong className="pipeline-step-title">{step.title}</strong>
        <span className="pipeline-step-description">{step.description}</span>
      </div>
    </div>
  ))}
</div>
```

### With Progress Bar
```tsx
<div className="progress-indicator">
  <div className="progress-indicator-header">
    <span className="progress-label">Processing...</span>
    <span className="progress-percentage n">{progress}%</span>
  </div>
  <div className="progress-bar-track">
    <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
  </div>
</div>

{/* Progress bar with status colors */}
<div className="progress-bar-fill success" style={{ width: '100%' }} />
<div className="progress-bar-fill warning" style={{ width: '75%' }} />
<div className="progress-bar-fill error" style={{ width: '50%' }} />
```

---

## 4. Bilingual Text Display (Marathi ↔ English)

### Usage
Document excerpts, translations, original + certified text

### Code
```tsx
import { FileText } from 'lucide-react'

<div className="bilingual-excerpt">
  <div className="bilingual-column">
    <div className="bilingual-column-header">
      <span className="bilingual-column-title">
        <span className="dv">मूळ मराठी दस्तऐवज उतारा</span>
        (Original Marathi Excerpt)
      </span>
    </div>
    <blockquote className="bilingual-text marathi-text dv">
      &ldquo;पुणे महानगरपालिका नगररचना व बांधकाम विकास विभाग. मंजूर रेखांकन
      व सदनिका चटई क्षेत्र १०९.६० चौ.मी. (१,१८० चौ.फूट).&rdquo;
    </blockquote>
  </div>

  <div className="bilingual-column">
    <div className="bilingual-column-header">
      <span className="bilingual-column-title">
        Certified English Translation
        (Vertex AI Ground Truth)
      </span>
      <span className="bilingual-certified-badge">Certified</span>
    </div>
    <blockquote className="bilingual-text english-text">
      &ldquo;Pune Municipal Corporation Town Planning &amp; Building Dept.
      Sanctioned layout and unit carpet area 109.60 sq m (1,180 sq ft).&rdquo;
    </blockquote>
  </div>
</div>
```

### Single Column Variant
```tsx
<div className="bilingual-excerpt single-column">
  <div className="bilingual-column">
    {/* Only one column, full width */}
  </div>
</div>
```

---

## 5. Document / Finding Card

### Usage
Audit findings, document lists, sample selection

### Code
```tsx
import { FileText, AlertTriangle, CheckCircle2 } from 'lucide-react'

<div className="document-card" onClick={handleClick}>
  <div className="document-card-header">
    <div className="document-card-left">
      <FileText className="document-icon" size={18} />
      <div className="document-info">
        <h4 className="document-title">
          Commencement Certificate & Sanctioned Floor Plan (PMC)
        </h4>
        <div className="document-meta">
          <span>Pune Municipal Corporation</span>
          <span>·</span>
          <span className="n">4.8 MB (PDF)</span>
        </div>
      </div>
    </div>
    <span className="document-status-badge verified">Verified</span>
  </div>

  <div className="document-card-body">
    <p className="document-quote">
      &ldquo;Sanctioned layout and unit carpet area 109.60 sq m (1,180 sq ft).
      30-year search report clean without encumbrance.&rdquo;
    </p>
    <div className="document-citation">
      <FileText size={12} />
      <span>7/12 Extract · Page 2 · Clause 4.2</span>
    </div>
  </div>
</div>
```

### Status Badge Variants
```tsx
<span className="document-status-badge verified">Verified</span>
<span className="document-status-badge flagged">Discrepancy</span>
<span className="document-status-badge critical">Critical</span>
```

### Finding Card with Status Icon
```tsx
<div className="document-card">
  <div className="document-card-header">
    <div className="document-card-left">
      <CheckCircle2 className="document-icon status-clear" size={18} />
      {/* Or: <AlertTriangle className="document-icon status-warning" /> */}
      <div className="document-info">
        <h4 className="document-title">Finding Title</h4>
        <div className="document-meta">
          <span>Source Document</span>
        </div>
      </div>
    </div>
  </div>
  <div className="document-card-body">
    <p className="document-quote">&ldquo;Finding detail...&rdquo;</p>
  </div>
</div>
```

---

## 6. Cryptographic Hash / Ledger Proof

### Usage
Blockchain anchoring, document fingerprints, tamper-evident proofs

### Code
```tsx
import { Lock, Copy, Check } from 'lucide-react'
import { useState } from 'react'

function CryptoProofCard() {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    const hash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    navigator.clipboard.writeText(hash)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="cryptographic-proof-card">
      <div className="crypto-proof-header">
        <div className="crypto-proof-title">
          <Lock size={14} className="status-clear" />
          <span>Cryptographic Ledger Fingerprint</span>
        </div>
        <button
          className={`crypto-copy-button ${copied ? 'copied' : ''}`}
          onClick={handleCopy}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          <span>{copied ? 'Hash Copied' : 'Copy Hash'}</span>
        </button>
      </div>

      <code className="crypto-hash-display n">
        <span className="crypto-hash-label">SHA-256:</span>
        e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
      </code>

      <div className="crypto-metadata n">
        <div className="crypto-meta-item">
          <span className="crypto-status-dot verified" />
          <span>Cloud KMS Signed</span>
        </div>
        <span>·</span>
        <span>Tx: 0x7f9a...3b21</span>
        <span>·</span>
        <span>Ethereum Mainnet</span>
      </div>
    </div>
  )
}
```

---

## 7. Extracted Fields / Entity Table

### Usage
OCR extraction results, document entity display

### Code
```tsx
import { FileText } from 'lucide-react'

<div className="extracted-fields-table">
  <div className="extracted-fields-header">
    <FileText size={16} />
    <span>Structured Entity Extraction (Bilingual Ground Truth)</span>
  </div>
  <div className="extracted-fields-body">
    <div className="extracted-field-row">
      <span className="field-key">Cadastral / Survey No.</span>
      <strong className="field-value numeric n">Survey No. 172/2 Part, Hadapsar</strong>
    </div>
    <div className="extracted-field-row">
      <span className="field-key">Stated / Document Area</span>
      <strong className="field-value numeric n">1,180 sq ft (109.60 sq m)</strong>
    </div>
    <div className="extracted-field-row">
      <span className="field-key">Sanctioned / Record Area</span>
      <strong className="field-value numeric match n">1,180 sq ft (Exact Match)</strong>
    </div>
    <div className="extracted-field-row">
      <span className="field-key">Registered Title Holder</span>
      <strong className="field-value">Amanora Infrastructure Ltd</strong>
    </div>
    <div className="extracted-field-row">
      <span className="field-key">Encumbrance / Lien Check</span>
      <strong className="field-value match">
        Nil (Bank NOC on file dated 14-Jan-2021)
      </strong>
    </div>
  </div>
</div>
```

### Field Value Status Classes
```tsx
<strong className="field-value match">Matches Official Record</strong>
<strong className="field-value mismatch">Area Discrepancy Detected</strong>
<strong className="field-value warning">Pending Verification</strong>
<strong className="field-value numeric n">1,180 sq ft</strong>
```

---

## 8. Section Header Pattern

### Usage
Landing page sections, page titles

### Code
```tsx
<div className="section-head">
  <h2 className="section-headline">
    One Persistent Record. Four Grounded Truths.
    <span className="section-dv-sub dv">एकल डिजिटल अभिलेख रचना</span>
  </h2>
  <p className="section-subhead">
    Indian property due diligence is notoriously broken because drawings,
    land revenue extracts, agreements, and inventory sit in disconnected silos.
    REALDHA links them into one permanent graph.
  </p>
</div>
```

---

## 9. Button Set Pattern

### Usage
Primary actions, CTAs, navigation

### Code
```tsx
import { ArrowRight, FileCheck2, Upload, Sparkles } from 'lucide-react'

<div className="hero-actions">
  <button type="button" className="btn-primary-large">
    <span>Explore Verified Passport</span>
    <ArrowRight size={18} />
  </button>

  <button type="button" className="btn-secondary-large">
    <FileCheck2 size={18} />
    <span>Upload &amp; Verify Studio</span>
  </button>

  <button type="button" className="btn-outline-large">
    <Upload size={16} />
    <span>Quick Upload</span>
  </button>

  <button type="button" className="btn-outline-large">
    <Sparkles size={18} />
    <span>Interactive Tour</span>
  </button>
</div>
```

### Individual Button Classes
```tsx
/* Solid Primary */
<button className="btn-primary-large">Primary Action</button>

/* White/Light Secondary */
<button className="btn-secondary-large">Secondary Action</button>

/* Ghost Outline */
<button className="btn-outline-large">Tertiary Action</button>
```

---

## 10. Status Badge Pills

### Usage
Category tags, status indicators, metadata labels

### Code
```tsx
{/* Small Status Pills */}
<span className="status-pill verified">Verified</span>
<span className="status-pill flagged">Discrepancy</span>
<span className="status-pill pending">Pending Review</span>

{/* Medium Category Pills */}
<span className="detail-tag-pill pill-indigo">Multi Family</span>
<span className="detail-tag-pill pill-emerald">No Mortgage</span>
<span className="detail-tag-pill pill-purple">Cash Flowing</span>
<span className="detail-tag-pill pill-slate">MahaRERA Registered</span>

{/* Card Badge Pills (Property Search) */}
<span className="card-badge-pill badge-blue">Commercial</span>
<span className="card-badge-pill badge-purple">Cash Flowing</span>
<span className="card-badge-pill badge-emerald">Verified Title</span>
<span className="card-badge-pill badge-teal">Vacation Rental</span>
```

---

## 11. Search Suggestion Chips

### Usage
Quick filters, pre-selected queries, benchmark scenarios

### Code
```tsx
<div className="hero-suggestions">
  <span className="sugg-label">Benchmark Test Scenarios:</span>
  {scenarios.map((s) => (
    <button
      key={s.id}
      type="button"
      className={`sugg-chip ${s.id === activeScenario.id ? 'active' : ''}`}
      onClick={() => handleLaunchCase(s)}
    >
      <span className="n">{s.realdhaId}</span>
      <span className="sugg-name">{s.project.split(' ')[0]}</span>
      <span className={`sugg-status ${s.stamp.type}`}>
        {s.stamp.type === 'clear' ? '✓ Clear' : '⚠ Flagged'}
      </span>
    </button>
  ))}
</div>
```

---

## 12. Sample Document Test Cards

### Usage
Pre-loaded document samples, test case selection

### Code
```tsx
import { FileText } from 'lucide-react'

<div className="sample-test-list">
  {samples.map((sample) => (
    <div
      key={sample.id}
      className={`sample-test-card ${selectedSample.id === sample.id ? 'selected' : ''}`}
      onClick={() => handleStartAnalysis(sample)}
    >
      <div className="sample-card-head">
        <span className="sample-doctype-tag">{sample.docType}</span>
        <span className={`sample-expected-pill ${sample.expectedStatus}`}>
          {sample.expectedStatus === 'clear' ? '✓ Clean Record' : '⚠ Discrepancy Flag'}
        </span>
      </div>
      <h4 className="sample-card-title">{sample.title}</h4>
      <div className="sample-card-meta">
        <span>{sample.authority}</span>
        <span className="bullet">·</span>
        <span className="n">{sample.fileSize}</span>
      </div>
    </div>
  ))}
</div>
```

---

## Utility Classes Reference

### Status Colors
```tsx
<span className="status-clear">Green Text</span>
<span className="status-warning">Amber Text</span>
<span className="status-critical">Red Text</span>
<span className="status-info">Indigo Text</span>

<div className="bg-status-clear">Green Background</div>
<div className="bg-status-warning">Amber Background</div>
<div className="bg-status-critical">Red Background</div>
<div className="bg-status-info">Indigo Background</div>
```

### Spacing
```tsx
<div className="gap-xs">{/* 4px gap */}</div>
<div className="gap-sm">{/* 8px gap */}</div>
<div className="gap-md">{/* 12px gap */}</div>
<div className="gap-lg">{/* 16px gap */}</div>
<div className="gap-xl">{/* 24px gap */}</div>
```

### Text Utilities
```tsx
<span className="n">123,456</span>           {/* Tabular nums */}
<span className="dv">मराठी</span>           {/* Devanagari font */}
<span className="text-mono">SHA-256</span>   {/* Monospace */}
<span className="text-uppercase">Label</span>
<div className="text-center">Centered</div>
```

### Layout
```tsx
<div className="flex-between">{/* Space-between row */}</div>
<div className="flex-center">{/* Centered row */}</div>
<div className="flex-col">{/* Column layout */}</div>
```

---

## Component Import Checklist

To use unified components, ensure these are imported:

```tsx
// In your component file
import '../shared-components.css'

// Or globally in App.tsx
import './components/shared-components.css'

// Icons (from lucide-react)
import {
  Upload, FileText, Lock, Copy, Check,
  Stamp, ShieldCheck, AlertTriangle,
  FileSearch, Layers,
} from 'lucide-react'
```

---

## Reference Implementation Files

- **Home Screen Pattern:** `src/components/LandingPage.tsx`
- **Details Page:** `src/components/PropertyDetails.tsx`
- **Upload Studio:** `src/components/UploadVerifyFlow.tsx`
- **Upload Modal:** `src/components/UploadVerifyModal.tsx`
- **Shared CSS:** `src/components/shared-components.css`
- **Main Styles:** `src/App.css`

---

**Last Updated:** December 2024  
**Version:** 1.0  
**Status:** Production Ready
