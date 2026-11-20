import { useState } from 'react'
import {
  ShieldCheck,
  AlertTriangle,
  Search,
  FileCheck2,
  FileSearch,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock,
  Compass,
  Stamp,
  Upload,
} from 'lucide-react'
import type { Scenario } from '../data/scenarios'

interface LandingPageProps {
  scenarios: Scenario[]
  activeScenario: Scenario
  onSelectScenario: (s: Scenario) => void
  onNavigate: (view: 'landing' | 'search' | 'passport' | 'upload') => void
  onOpenUploadModal: () => void
  onOpenTourModal: () => void
}

export function LandingPage({
  scenarios,
  activeScenario,
  onSelectScenario,
  onNavigate,
  onOpenUploadModal,
  onOpenTourModal,
}: LandingPageProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredScenarios = scenarios.filter(
    (s) =>
      s.realdhaId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.unit.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleLaunchCase = (s: Scenario) => {
    onSelectScenario(s)
    onNavigate('passport')
  }

  return (
    <div className="landing-container">
      {/* 1. HERO SECTION */}
      <section className="landing-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            The Digital Property Passport for Indian Real Estate
            <span className="hero-dv-sub dv">महाराष्ट्र शासन महसूल अभिलेख व डिजिटल मालमत्ता नोंदणी</span>
          </h1>

          <p className="hero-description">
            Every parcel, tower, and unit deserves one persistent digital identity. REALDHA anchors
            Maharashtra land records, 30-year title chains, and spatial digital twins on Google Cloud
            and Ethereum—transforming due diligence from months of paper searches to seconds of verified proof.
          </p>

          {/* Quick Search Bar */}
          <div className="hero-search-box">
            <div className="hero-search-input-wrap">
              <Search className="hero-search-icon" size={20} />
              <input
                type="text"
                className="hero-search-input"
                placeholder="Search by REALDHA ID (e.g. RA-PUN-001-A-18-04), Project, or Locality..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onNavigate('search')
                  }
                }}
              />
              <button
                type="button"
                className="hero-search-btn"
                onClick={() => onNavigate('search')}
              >
                Search Registry
              </button>
            </div>

            {/* Live Autocomplete Results when typing */}
            {searchQuery.trim().length > 0 && (
              <div className="hero-search-live-dropdown">
                {filteredScenarios.length > 0 ? (
                  filteredScenarios.map((s) => (
                    <div
                      key={s.id}
                      className="live-search-item"
                      onClick={() => handleLaunchCase(s)}
                    >
                      <strong className="n text-ind">{s.realdhaId}</strong>
                      <span>{s.unit}</span>
                      <small>{s.project}, {s.location}</small>
                      <span className={`item-badge ${s.stamp.type}`}>{s.stamp.title.split('·')[0]}</span>
                    </div>
                  ))
                ) : (
                  <div className="live-search-empty">No matching verified properties found.</div>
                )}
              </div>
            )}

            {/* Quick Suggestion Chips */}
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
          </div>

          {/* Primary Action Buttons */}
          <div className="hero-actions">
            <button
              type="button"
              className="btn-primary-large"
              onClick={() => onNavigate('passport')}
            >
              <span>Explore Verified Passport</span>
              <ArrowRight size={18} />
            </button>
            <button
              type="button"
              className="btn-secondary-large"
              onClick={() => onNavigate('upload')}
            >
              <FileCheck2 size={18} />
              <span>Upload &amp; Verify Studio</span>
            </button>
            <button
              type="button"
              className="btn-outline-large"
              onClick={onOpenUploadModal}
              title="Quick upload modal dialog"
            >
              <Upload size={16} />
              <span>Quick Upload</span>
            </button>
            <button
              type="button"
              className="btn-outline-large"
              onClick={onOpenTourModal}
            >
              <Sparkles size={18} />
              <span>Interactive Tour</span>
            </button>
          </div>
        </div>

        {/* Hero Interactive Teaser Card */}
        <div className="hero-preview-card" onClick={() => handleLaunchCase(activeScenario)}>
          <div className="preview-top-bar">
            <div className="preview-id-badge n">
              <span className="dv">मालमत्ता संकेतांक</span>
              <strong>{activeScenario.realdhaId}</strong>
            </div>
            <div className={`preview-verdict-pill ${activeScenario.stamp.type}`}>
              {activeScenario.stamp.type === 'clear' ? (
                <ShieldCheck size={14} />
              ) : (
                <AlertTriangle size={14} />
              )}
              <span>{activeScenario.stamp.title.split('·')[0]}</span>
            </div>
          </div>

          <div className="preview-body">
            {/* Property Photo Header */}
            <div className="preview-image-banner">
              <img
                src={activeScenario.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80'}
                alt={activeScenario.streetAddress || activeScenario.unit}
                className="preview-hero-img"
              />
              <div className="preview-image-badges">
                {activeScenario.categoryPills?.slice(0, 3).map((p, i) => (
                  <span key={i} className="preview-pill-badge">{p}</span>
                ))}
              </div>
            </div>

            <div className="preview-header-info">
              <h3 className="preview-unit">{activeScenario.streetAddress || activeScenario.unit}</h3>
              <p className="preview-loc">{activeScenario.cityStateZip || `${activeScenario.project}, ${activeScenario.location}`}</p>
            </div>

            {/* Micro Visual Preview */}
            <div className="preview-viewport-box">
              <div className="preview-stamp-seal" style={{ borderColor: activeScenario.stamp.stampColor, color: activeScenario.stamp.stampColor }}>
                <span className="preview-seal-dv dv">{activeScenario.stamp.sealMarathi.split('·')[1]?.trim() || 'प्रमाणित'}</span>
                <span className="preview-seal-en">{activeScenario.stamp.sealEnglish.split('·')[1]?.trim() || 'VERIFIED'}</span>
                <small className="n">{activeScenario.stamp.date}</small>
              </div>
              <div className="preview-meta-grid">
                <div className="p-meta">
                  <i>CARPET AREA</i>
                  <strong className="n">{activeScenario.carpet}</strong>
                </div>
                <div className="p-meta">
                  <i>ORIENTATION</i>
                  <strong>{activeScenario.facing} Facing</strong>
                </div>
                <div className="p-meta">
                  <i>ASKING PRICE</i>
                  <strong className="n text-indigo">{activeScenario.asking}</strong>
                </div>
                <div className="p-meta">
                  <i>AVG YIELD</i>
                  <strong className="n text-indigo">{activeScenario.avgRentalYield || '5.1%'}</strong>
                </div>
              </div>
            </div>

            <div className="preview-finding-preview">
              <div className="finding-preview-label">
                <Stamp size={14} />
                <span>Primary Legal Finding</span>
              </div>
              <p className="finding-preview-quote">
                &ldquo;{activeScenario.findings[0]?.title || activeScenario.stamp.subtitle}&rdquo;
              </p>
            </div>

            <div className="preview-cta-strip">
              <span>Inspect Full Digital Property Passport</span>
              <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE VALUE PILLARS (THE 4 LAYERS) */}
      <section className="landing-section pillars-section">
        <div className="section-head">
          <h2 className="section-headline">
            One Persistent Record. Four Grounded Truths.
            <span className="section-dv-sub dv">एकल डिजिटल अभिलेख रचना</span>
          </h2>
          <p className="section-subhead">
            Indian property due diligence is notoriously broken because drawings, land revenue extracts,
            agreements, and inventory sit in disconnected silos. REALDHA links them into one permanent graph.
          </p>
        </div>

        <div className="pillars-grid">
          <div className="pillar-card">
            <div className="pillar-header">
              <div className="pillar-icon-box">
                <Lock size={22} />
              </div>
              <span className="pillar-num n">01</span>
            </div>
            <h3 className="pillar-title">Persistent Digital Identity</h3>
            <p className="pillar-text">
              Every unit, plot, and building receives a permanent REALDHA ID (e.g. <code className="n">RA-PUN-001-A-18-04</code>).
              Physical specifications, chain of title, and transactions permanently attach to this persistent record.
            </p>
            <div className="pillar-tag n">Unique Index Key</div>
          </div>

          <div className="pillar-card">
            <div className="pillar-header">
              <div className="pillar-icon-box">
                <Compass size={22} />
              </div>
              <span className="pillar-num n">02</span>
            </div>
            <h3 className="pillar-title">Spatial Truth &amp; Digital Twin</h3>
            <p className="pillar-text">
              Real orientation, verified sanctioned carpet area, true floor elevation (54m), morning/evening sun
              path, and balcony views. Built from engineering drawings, not misleading marketing CGI.
            </p>
            <div className="pillar-tag">Architectural Precision</div>
          </div>

          <div className="pillar-card">
            <div className="pillar-header">
              <div className="pillar-icon-box">
                <FileSearch size={22} />
              </div>
              <span className="pillar-num n">03</span>
            </div>
            <h3 className="pillar-title">Agentic Multilingual Verification</h3>
            <p className="pillar-text">
              Gemini OCR &amp; Document AI parse Marathi Modi script, 7/12 extracts, Index II, and Ferfar mutations.
              Instant cross-referencing flags area discrepancies, unsigned heir releases, and undisclosed mortgages.
            </p>
            <div className="pillar-tag">Vertex AI + Document AI</div>
          </div>

          <div className="pillar-card">
            <div className="pillar-header">
              <div className="pillar-icon-box">
                <ShieldCheck size={22} />
              </div>
              <span className="pillar-num n">04</span>
            </div>
            <h3 className="pillar-title">Tamper-Evident Ledger Anchoring</h3>
            <p className="pillar-text">
              Verified document fingerprints (SHA-256) are anchored via Google Cloud KMS to an Ethereum ledger.
              Provides irrefutable mathematical proof that records have not been altered since verification.
            </p>
            <div className="pillar-tag n">Cloud KMS + Ethereum</div>
          </div>
        </div>
      </section>

      {/* 3. BENCHMARK CASE STUDIES (JUDGE SCENARIOS) */}
      <section className="landing-section cases-section">
        <div className="section-head">
          <h2 className="section-headline">
            Battle-Tested Against Real Title Scenarios
            <span className="section-dv-sub dv">प्रात्यक्षिक पडताळणी प्रकरणे</span>
          </h2>
          <p className="section-subhead">
            Explore the four real-world Maharashtra property cases developed from field legal audits.
            Switch between clean titles, area discrepancies, missing legal heirs, and unreleased bank loans.
          </p>
        </div>

        <div className="cases-grid">
          {scenarios.slice(0, 4).map((s, idx) => (
            <div
              key={s.id}
              className={`case-card ${s.stamp.type}`}
              onClick={() => handleLaunchCase(s)}
            >
              <div className="case-card-img-wrap">
                <img
                  src={s.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'}
                  alt={s.project}
                  className="case-img"
                  loading="lazy"
                />
                <div className="case-card-overlay-badge">
                  <span className="case-num n">Case #{idx + 1}</span>
                  <div className={`case-stamp-pill ${s.stamp.type}`}>
                    {s.stamp.type === 'clear' ? <ShieldCheck size={13} /> : <AlertTriangle size={13} />}
                    <span>{s.stamp.type === 'clear' ? 'Clear' : 'Flagged'}</span>
                  </div>
                </div>
              </div>

              <div className="case-card-body">
                <h3 className="case-title">{s.streetAddress || s.project}</h3>
                <p className="case-location">{s.cityStateZip || `${s.location} · ${s.unit}`}</p>

                <div className="case-verdict-box">
                  <strong className="case-verdict-title" style={{ color: s.stamp.stampColor }}>
                    {s.stamp.title}
                  </strong>
                  <p className="case-verdict-desc">{s.stamp.subtitle}</p>
                </div>

                <div className="case-specs-row n">
                  <div className="c-spec">
                    <span>Carpet</span>
                    <strong>{s.carpet}</strong>
                  </div>
                  <div className="c-spec">
                    <span>Yield</span>
                    <strong className="text-indigo">{s.avgRentalYield || '5.1%'}</strong>
                  </div>
                  <div className="c-spec">
                    <span>Asking</span>
                    <strong className="text-indigo">{s.asking}</strong>
                  </div>
                </div>

                <div className="case-card-footer">
                  <span className="case-cta-text">Inspect Property Passport</span>
                  <ArrowRight size={14} className="case-cta-arrow" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. HOW AI VERIFICATION WORKS (PIPELINE) */}
      <section className="landing-section workflow-section">
        <div className="section-head">
          <h2 className="section-headline">
            From Marathi Paper Records to Cryptographic Proof
            <span className="section-dv-sub dv">पडताळणी कार्यप्रणाली</span>
          </h2>
          <p className="section-subhead">
            How REALDHA processes Maharashtra land records into institutional audit dossiers in seconds.
          </p>
        </div>

        <div className="workflow-steps">
          <div className="workflow-step">
            <div className="step-num-circle n">1</div>
            <div className="step-body">
              <h4>Document Ingestion</h4>
              <p>Drag &amp; drop PDF scans of 7/12 (सातबारा), Index II, MahaRERA certificates, PMC sanctioned plans, or Ferfar mutations.</p>
            </div>
          </div>

          <div className="workflow-step">
            <div className="step-num-circle n">2</div>
            <div className="step-body">
              <h4>Gemini Multimodal OCR</h4>
              <p>Extracts Marathi Devanagari text, Modi script notations, survey/Gat numbers, parcel boundaries (चतुःसीमा), and ownership shares.</p>
            </div>
          </div>

          <div className="workflow-step">
            <div className="step-num-circle n">3</div>
            <div className="step-body">
              <h4>Cross-Registry Reconciliation</h4>
              <p>Cross-references extracted carpet area with sanctioned plans; verifies 30-year unbroken chain of title and bank NOC releases.</p>
            </div>
          </div>

          <div className="workflow-step">
            <div className="step-num-circle n">4</div>
            <div className="step-body">
              <h4>Tamper-Proof Ledger Stamp</h4>
              <p>Computes SHA-256 fingerprint, signs via Google Cloud KMS, and commits anchor hash to the Ethereum blockchain.</p>
            </div>
          </div>

          <div className="workflow-step">
            <div className="step-num-circle n">5</div>
            <div className="step-body">
              <h4>Revenue Verdict &amp; Grounded Q&amp;A</h4>
              <p>Issues official violet revenue stamp report and unlocks interactive Gemini Assistant citing exact clauses and page numbers.</p>
            </div>
          </div>
        </div>

        <div className="workflow-cta-banner">
          <div className="cta-left">
            <h3>Test the Document Verification Engine Live</h3>
            <p>Upload any Marathi property document or choose from our pre-loaded test extracts.</p>
          </div>
          <div className="cta-right">
            <button
              type="button"
              className="btn-primary-large"
              onClick={() => onNavigate('upload')}
            >
              <FileCheck2 size={18} />
              <span>Launch Upload &amp; Verify Studio</span>
            </button>
          </div>
        </div>
      </section>

      {/* 5. INSTITUTIONAL ARCHITECTURE & COMPLIANCE */}
      <section className="landing-section architecture-section">
        <div className="arch-inner">
          <div className="arch-text">
            <h2 className="section-headline">
              Engineered for Institutional Reliability
              <span className="section-dv-sub dv">तांत्रिक पायाभूत रचना</span>
            </h2>
            <p className="arch-desc">
              Built on Google Cloud Vertex AI, Document AI, Cloud Run, and Cloud KMS, compliant with the
              Maharashtra Land Revenue Code 1966, Transfer of Property Act, and MahaRERA regulations.
            </p>

            <div className="arch-points">
              <div className="arch-point">
                <CheckCircle2 size={18} className="text-grn" />
                <div>
                  <strong>Human-in-the-Loop Legal Sign-off</strong>
                  <p>AI extracts, translates, and highlights discrepancies; advocate and valuer sign off before on-chain anchoring.</p>
                </div>
              </div>
              <div className="arch-point">
                <CheckCircle2 size={18} className="text-grn" />
                <div>
                  <strong>Bilingual Ground-Truth Citations</strong>
                  <p>Every finding quotes the original Marathi legal text alongside certified English translation and exact page number.</p>
                </div>
              </div>
              <div className="arch-point">
                <CheckCircle2 size={18} className="text-grn" />
                <div>
                  <strong>Data Residency &amp; DPDP Act Compliance</strong>
                  <p>All sensitive records and KYC data stored encrypted in Google Cloud Mumbai (asia-south1); zero PII on-chain.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="arch-card">
            <div className="arch-card-header">
              <span className="dv">सिस्टम आर्किटेक्चर सारांश</span>
              <span className="n">STACK SPECIFICATION</span>
            </div>
            <div className="arch-table">
              <div className="arch-row">
                <span className="arch-key">Compute</span>
                <span className="arch-val">Google Cloud Run (Asia South 1)</span>
              </div>
              <div className="arch-row">
                <span className="arch-key">Document AI</span>
                <span className="arch-val">Gemini 1.5 Pro on Vertex AI</span>
              </div>
              <div className="arch-row">
                <span className="arch-key">Key Management</span>
                <span className="arch-val">Google Cloud KMS (HSM Level 3)</span>
              </div>
              <div className="arch-row">
                <span className="arch-key">Ledger Anchor</span>
                <span className="arch-val">Ethereum Mainnet / Private Rollup</span>
              </div>
              <div className="arch-row">
                <span className="arch-key">Spatial Engine</span>
                <span className="arch-val">Vector SVG Architectural Twin</span>
              </div>
              <div className="arch-row">
                <span className="arch-key">Primary Market</span>
                <span className="arch-val">Pune Division · Maharashtra</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. INSTITUTIONAL FOOTER */}
      <footer className="landing-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              REALDHA
              <small className="dv">रियलढा</small>
            </div>
            <p className="footer-tagline">
              Digital Property Infrastructure for Maharashtra &amp; Indian Real Estate.
              Pune · Mumbai · Lonavala · Thane
            </p>
          </div>

          <div className="footer-nav-col">
            <span className="footer-col-title">Navigation</span>
            <button type="button" onClick={() => onNavigate('landing')}>Overview</button>
            <button type="button" onClick={() => onNavigate('search')}>Property Registry</button>
            <button type="button" onClick={() => onNavigate('passport')}>Digital Passport</button>
            <button type="button" onClick={() => onNavigate('upload')}>Upload &amp; Verify</button>
          </div>

          <div className="footer-nav-col">
            <span className="footer-col-title">Test Scenarios</span>
            {scenarios.map((s) => (
              <button key={s.id} type="button" onClick={() => handleLaunchCase(s)}>
                {s.project.split(' ')[0]} ({s.unit.split('·')[0].trim()})
              </button>
            ))}
          </div>

          <div className="footer-nav-col">
            <span className="footer-col-title">Legal Framework</span>
            <span>MahaRERA Act 2016</span>
            <span>Maharashtra Land Revenue Code 1966</span>
            <span>Registration Act 1908 (Index II)</span>
            <span>Digital Personal Data Protection Act</span>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="legal-disclaimer">
            Disclaimer: REALDHA provides automated verification assistance and spatial digital twin records.
            AI findings and document extracts do not constitute formal legal title opinions or valuations.
            All legal decisions require licensed advocate and valuer sign-off.
          </p>
          <div className="footer-copy n">
            © 2026 REALDHA Technologies Private Limited · Google Buildathon India
          </div>
        </div>
      </footer>
    </div>
  )
}
