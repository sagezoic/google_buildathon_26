import { useState } from 'react'
import {
  Heart,
  Bell,
  Bed,
  Bath,
  Maximize2,
  Building,
  Image as ImageIcon,
  Compass,
  AlertTriangle,
  ArrowLeft,
  Share2,
  FileText,
  CheckCircle2,
  Stamp,
  Sparkles,
  Info,
  Users,
} from 'lucide-react'
import type { Scenario, DocumentRecord } from '../data/scenarios'

interface PropertyDetailsProps {
  scenario: Scenario
  scenarios: Scenario[]
  onSwitchScenario: (s: Scenario) => void
  onBackToMarketplace: () => void
  onOpenDocument: (doc: DocumentRecord) => void
  onOpenUpload: () => void
  onOpenShare: () => void
  onOpenAssistant: () => void
}

type DetailTab = 'price' | 'yield' | 'verification' | 'spatial' | 'documents'

export function PropertyDetails({
  scenario,
  onBackToMarketplace,
  onOpenDocument,
  onOpenShare,
  onOpenAssistant,
}: PropertyDetailsProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>('price')
  const [isFavorited, setIsFavorited] = useState(false)
  const [isAlertActive, setIsAlertActive] = useState(false)
  const [activeGalleryView, setActiveGalleryView] = useState<'photos' | 'floorplan'>('photos')

  const images = scenario.images || [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
  ]

  const address = scenario.streetAddress || scenario.unit
  const cityZip = scenario.cityStateZip || `${scenario.project}, ${scenario.location}`
  const tokenPrice = scenario.tokenPrice || '$30.71 /share'
  const beds = scenario.beds !== undefined ? scenario.beds : 3
  const baths = scenario.baths !== undefined ? scenario.baths : 2
  const sqft = scenario.carpet || '1,180 sq ft'
  const investors = scenario.investorCount || 271

  return (
    <div className="lofty-details-page">
      {/* 1. Back Navigation & Quick Actions Bar */}
      <div className="lofty-sub-navbar">
        <div className="lofty-sub-nav-container">
          <button
            type="button"
            className="lofty-back-btn"
            onClick={onBackToMarketplace}
          >
            <ArrowLeft size={16} />
            <span>Back to Property Marketplace</span>
          </button>

          <div className="lofty-sub-nav-actions">
            <span className="realdha-id-tag n">REALDHA ID: {scenario.realdhaId}</span>
            <button
              type="button"
              className="lofty-icon-pill-btn"
              onClick={onOpenShare}
            >
              <Share2 size={15} />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Hero Full-Width Split Media Gallery (Screenshot 1 Reference) */}
      <div className="lofty-hero-gallery">
        <div className="gallery-main-split">
          <div className="gallery-pane primary-pane">
            <img
              src={images[0]}
              alt={`${address} Exterior`}
              className="gallery-img"
            />
          </div>
          <div className="gallery-pane secondary-pane">
            <img
              src={images[1] || images[0]}
              alt={`${address} Interior View`}
              className="gallery-img"
            />
            {/* View All Photos Trigger Button (Screenshot 1 Reference) */}
            <button
              type="button"
              className="view-all-photos-btn"
              onClick={() => setActiveGalleryView(activeGalleryView === 'photos' ? 'floorplan' : 'photos')}
            >
              <ImageIcon size={16} />
              <span>View all photos &amp; 3D Twin</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main 2-Column Content Layout (Screenshot 1 Reference) */}
      <div className="lofty-details-content-container">
        <div className="lofty-details-grid">
          {/* LEFT COLUMN: Property Meta, Specs, Tabs & Comprehensive Audit */}
          <div className="lofty-details-left">
            {/* Category Badges Strip */}
            <div className="lofty-badge-row">
              {scenario.categoryPills && scenario.categoryPills.length > 0 ? (
                scenario.categoryPills.map((pill, idx) => (
                  <span
                    key={idx}
                    className={`detail-tag-pill ${
                      pill.includes('High-Rise') || pill.includes('Multi') ? 'pill-indigo' :
                      pill.includes('No Mortgage') || pill.includes('Verified') ? 'pill-emerald' :
                      pill.includes('Cash') ? 'pill-purple' :
                      'pill-slate'
                    }`}
                  >
                    {pill}
                  </span>
                ))
              ) : (
                <>
                  <span className="detail-tag-pill pill-indigo">Multi Family</span>
                  <span className="detail-tag-pill pill-emerald">No Mortgage</span>
                  <span className="detail-tag-pill pill-slate">MahaRERA Registered</span>
                </>
              )}
            </div>

            {/* Massive Bold Title & Quick Icons (Screenshot 1 Reference) */}
            <div className="lofty-title-row">
              <h1 className="lofty-property-heading">{address}</h1>
              <div className="lofty-title-icons">
                <button
                  type="button"
                  className={`title-action-btn ${isFavorited ? 'active' : ''}`}
                  onClick={() => setIsFavorited(!isFavorited)}
                  aria-label="Favorite property"
                >
                  <Heart size={20} fill={isFavorited ? '#EF4444' : 'none'} color={isFavorited ? '#EF4444' : '#FFFFFF'} />
                </button>
                <button
                  type="button"
                  className={`title-action-btn ${isAlertActive ? 'active' : ''}`}
                  onClick={() => setIsAlertActive(!isAlertActive)}
                  aria-label="Set property notification alerts"
                >
                  <Bell size={20} fill={isAlertActive ? '#6366F1' : 'none'} color={isAlertActive ? '#6366F1' : '#FFFFFF'} />
                </button>
              </div>
            </div>

            {/* Location Subtitle */}
            <p className="lofty-property-subloc">{cityZip}</p>

            {/* Core Specifications Row with Icons (Screenshot 1 Reference) */}
            <div className="lofty-specs-bar">
              {beds > 0 && (
                <div className="spec-item">
                  <Bed size={18} className="spec-icon" />
                  <span className="spec-val n">{beds} Beds</span>
                </div>
              )}
              {baths > 0 && (
                <div className="spec-item">
                  <Bath size={18} className="spec-icon" />
                  <span className="spec-val n">{baths} Baths</span>
                </div>
              )}
              <div className="spec-item">
                <Maximize2 size={18} className="spec-icon" />
                <span className="spec-val n">{sqft}</span>
              </div>
              <div className="spec-item">
                <Building size={18} className="spec-icon" />
                <span className="spec-val">{scenario.floor !== '—' ? scenario.floor : 'Ground Grade'}</span>
              </div>
              <div className="spec-item">
                <Compass size={18} className="spec-icon" />
                <span className="spec-val">{scenario.facing} Facing</span>
              </div>
            </div>

            {/* Secondary Navigation Tabs (Screenshot 1 Reference) */}
            <div className="lofty-secondary-tabs">
              <button
                type="button"
                className={`secondary-tab-btn ${activeTab === 'price' ? 'active' : ''}`}
                onClick={() => setActiveTab('price')}
              >
                Price
              </button>
              <button
                type="button"
                className={`secondary-tab-btn ${activeTab === 'yield' ? 'active' : ''}`}
                onClick={() => setActiveTab('yield')}
              >
                Yield &amp; Financials
              </button>
              <button
                type="button"
                className={`secondary-tab-btn ${activeTab === 'verification' ? 'active' : ''}`}
                onClick={() => setActiveTab('verification')}
              >
                Verification &amp; 30-Yr Title
              </button>
              <button
                type="button"
                className={`secondary-tab-btn ${activeTab === 'spatial' ? 'active' : ''}`}
                onClick={() => setActiveTab('spatial')}
              >
                Spatial Twin &amp; Floor Plan
              </button>
              <button
                type="button"
                className={`secondary-tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
                onClick={() => setActiveTab('documents')}
              >
                Documents ({scenario.documents.length})
              </button>
            </div>

            {/* TAB PANELS */}
            <div className="lofty-tab-content-area">
              {/* TAB 1: Price & Valuation */}
              {activeTab === 'price' && (
                <div className="tab-pane-price">
                  <div className="price-overview-grid">
                    <div className="price-card">
                      <span className="p-card-label">Total Asking Value</span>
                      <strong className="p-card-val n">{scenario.asking}</strong>
                      <small className="p-card-sub">Circle Rate: ₹1.58 Cr</small>
                    </div>
                    <div className="price-card">
                      <span className="p-card-label">Token / Share Unit</span>
                      <strong className="p-card-val n text-indigo">{tokenPrice}</strong>
                      <small className="p-card-sub">Liquid secondary market ready</small>
                    </div>
                    <div className="price-card">
                      <span className="p-card-label">Valuation Status</span>
                      <strong className={`p-card-val ${scenario.valuationDelta?.includes('Undervalued') ? 'text-grn' : scenario.valuationDelta?.includes('Overvalued') ? 'text-red' : 'text-grn'}`}>
                        {scenario.valuationDelta || 'Clean Market Benchmark'}
                      </strong>
                      <small className="p-card-sub">Independent Valuer Sign-off</small>
                    </div>
                  </div>

                  <div className="price-narrative-box">
                    <h4>Valuation Benchmark Analysis</h4>
                    <p>
                      Valuation benchmarked against PMC / Taluka Sub-Registrar circle rates, Index II registered transactions within a 500m radius over the past 24 months, and MahaRERA project inventory disclosures.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: Yield & Financials */}
              {activeTab === 'yield' && (
                <div className="tab-pane-yield">
                  <div className="yield-metrics-grid">
                    <div className="yield-kpi">
                      <span className="y-label">Projected Net Rental Yield</span>
                      <strong className="y-val n">{scenario.avgRentalYield || '5.09%'}</strong>
                      <span className="y-sub">Est. ₹70,000 / month gross rent</span>
                    </div>
                    <div className="yield-kpi">
                      <span className="y-label">Current Occupancy</span>
                      <strong className="y-val">{scenario.currentRentalYield !== '0%' ? 'Leased (Active Yield)' : 'Vacant (Ready to Move)'}</strong>
                      <span className="y-sub">Standard 11-month Maharashtra Leave &amp; License</span>
                    </div>
                    <div className="yield-kpi">
                      <span className="y-label">Maintenance &amp; Taxes</span>
                      <strong className="y-val n">₹4,200 / mo</strong>
                      <span className="y-sub">Paid to registered CHS / Society</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Verification & 30-Year Title (Core REALDHA Engine) */}
              {activeTab === 'verification' && (
                <div className="tab-pane-verification">
                  {/* Revenue Stamp Verdict Banner */}
                  <div className={`details-verdict-banner ${scenario.stamp.type}`}>
                    <div className="stamp-seal-badge" style={{ borderColor: scenario.stamp.stampColor, color: scenario.stamp.stampColor }}>
                      <span className="seal-dv dv">{scenario.stamp.sealMarathi.split('·')[1]?.trim() || 'प्रमाणित'}</span>
                      <span className="seal-en">{scenario.stamp.sealEnglish.split('·')[1]?.trim() || 'VERIFIED'}</span>
                      <small className="n">{scenario.stamp.date}</small>
                    </div>
                    <div className="verdict-banner-body">
                      <div className="verdict-title-line">
                        <Stamp size={18} style={{ color: scenario.stamp.stampColor }} />
                        <h3 className="verdict-title" style={{ color: scenario.stamp.stampColor }}>
                          {scenario.stamp.title}
                        </h3>
                      </div>
                      <p className="verdict-subtitle">{scenario.stamp.subtitle}</p>
                      <div className="verdict-meta n">
                        <span>Serial: {scenario.stamp.serialNo}</span>
                        <span className="bullet">·</span>
                        <span>Anchored on Ethereum: {scenario.txHash.slice(0, 14)}...</span>
                      </div>
                    </div>
                  </div>

                  {/* 30-Year Unbroken Chain Bar */}
                  <div className="title-chain-section">
                    <div className="chain-header">
                      <h4>30-Year Chain of Title (1996–2026)</h4>
                      <span className="chain-status-badge n">
                        {scenario.stamp.type === 'clear' ? '✓ Unbroken Presumptive Title' : '⚠ Action Item Flagged'}
                      </span>
                    </div>

                    <div className="chain-bar-track">
                      {scenario.titleChainBar.map((seg, i) => (
                        <div
                          key={i}
                          className="chain-bar-segment"
                          style={{ width: seg.width, background: seg.color }}
                          title={`${seg.years}: ${seg.holder} (${seg.transferType})`}
                        >
                          <span className="seg-label">{seg.years}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Audit Findings List */}
                  <div className="findings-container">
                    <h4>Append-Only Audit Findings ({scenario.findings.length})</h4>
                    <div className="findings-stack">
                      {scenario.findings.map((f, i) => (
                        <div key={f.id || i} className={`finding-box ${f.status}`}>
                          <div className="finding-box-top">
                            {f.status === 'pass' ? (
                              <CheckCircle2 size={16} className="text-grn" />
                            ) : (
                              <AlertTriangle size={16} className="text-amb" />
                            )}
                            <strong>{f.title}</strong>
                          </div>
                          <blockquote className="finding-box-quote">
                            &ldquo;{f.quote}&rdquo;
                          </blockquote>
                          <div className="finding-box-citation">
                            <FileText size={12} />
                            <span>{f.sourceDoc} · {f.page} · {f.clause}</span>
                          </div>
                        </div>
                      ))}

                      {scenario.note && (
                        <div className={`finding-box critical-callout ${scenario.note.status}`}>
                          <div className="finding-box-top">
                            <AlertTriangle size={16} className="text-amb" />
                            <strong>{scenario.note.title}</strong>
                          </div>
                          <blockquote className="finding-box-quote">
                            &ldquo;{scenario.note.quote}&rdquo;
                          </blockquote>
                          <div className="finding-box-citation">
                            <span>Source: {scenario.note.sourceDoc} ({scenario.note.page})</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Spatial Twin & Floor Plan */}
              {activeTab === 'spatial' && (
                <div className="tab-pane-spatial">
                  <div className="spatial-svg-card">
                    <div className="spatial-card-head">
                      <h4>Indicative Architectural Floor Layout</h4>
                      <span className="orientation-pill">Compass: {scenario.floorPlan.compassOrientation}</span>
                    </div>

                    {/* SVG Floorplan Viewport */}
                    <div className="floorplan-viewport">
                      <svg viewBox="0 0 320 220" className="floorplan-svg">
                        <rect x="10" y="10" width="300" height="200" fill="#0E1426" stroke="#252D4A" strokeWidth="2" rx="4" />
                        {scenario.floorPlan.rooms.map((room, idx) => (
                          <g key={idx}>
                            <rect
                              x={room.x}
                              y={room.y}
                              width={room.w}
                              height={room.h}
                              fill="rgba(99, 102, 241, 0.12)"
                              stroke="#6366F1"
                              strokeWidth="1.5"
                              rx="2"
                            />
                            <text
                              x={room.x + room.w / 2}
                              y={room.y + room.h / 2 - 4}
                              textAnchor="middle"
                              fill="#FFFFFF"
                              fontSize="9"
                              fontWeight="bold"
                            >
                              {room.name.split('(')[0]}
                            </text>
                            <text
                              x={room.x + room.w / 2}
                              y={room.y + room.h / 2 + 10}
                              textAnchor="middle"
                              fill="#94A3B8"
                              fontSize="8"
                            >
                              {room.dimensions}
                            </text>
                          </g>
                        ))}
                      </svg>
                    </div>

                    <div className="sun-simulator-box">
                      <div className="sun-title">
                        <Compass size={15} />
                        <span>Sunlight &amp; Orientation Analysis</span>
                      </div>
                      <p className="sun-desc">
                        <strong>Morning Light:</strong> {scenario.lightSimulation.morningDesc}
                      </p>
                      <p className="sun-desc">
                        <strong>Afternoon Light:</strong> {scenario.lightSimulation.afternoonDesc}
                      </p>
                      <p className="sun-desc">
                        <strong>Balcony View:</strong> {scenario.lightSimulation.balconyView}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: Documents Dossier */}
              {activeTab === 'documents' && (
                <div className="tab-pane-documents">
                  <div className="dossier-list">
                    {scenario.documents.length === 0 ? (
                      <p className="empty-docs-msg">All preliminary municipal certificates and approvals are verified on file.</p>
                    ) : (
                      scenario.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="dossier-item-card"
                          onClick={() => onOpenDocument(doc)}
                        >
                          <div className="doc-item-left">
                            <FileText size={20} className="doc-icon" />
                            <div>
                              <strong className="doc-name">{doc.name}</strong>
                              <span className="doc-meta">{doc.authority} · {doc.date}</span>
                            </div>
                          </div>
                          <div className="doc-item-right">
                            <span className="doc-status-badge verified">Verified</span>
                            <span className="inspect-link">Inspect Excerpt →</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Elevated Floating White Action Card (Screenshot 1 Reference) */}
          <div className="lofty-details-right">
            <div className="lofty-floating-action-card">
              {/* Card Header: Price & Investors */}
              <div className="floating-card-header">
                <div className="floating-price-wrap">
                  <strong className="floating-price-main n">{tokenPrice}</strong>
                </div>
                <div className="floating-investors-pill n">
                  <Users size={14} />
                  <span>{investors}</span>
                </div>
              </div>

              {/* Sub Promo Banner */}
              <div className="floating-card-promo">
                <span>Verified on Ethereum via Google Cloud KMS</span>
              </div>

              {/* Key Financial & Verification Metrics Table (Screenshot 1 Reference) */}
              <div className="floating-metrics-table">
                <div className="f-metric-row">
                  <span className="f-metric-key">
                    Avg Rental Yield <Info size={12} className="info-icon" />
                  </span>
                  <strong className="f-metric-val n">{scenario.avgRentalYield || '5.09%'}</strong>
                </div>

                <div className="f-metric-row">
                  <span className="f-metric-key">
                    Current Rental Yield <Info size={12} className="info-icon" />
                  </span>
                  <strong className="f-metric-val n">{scenario.currentRentalYield || '0%'}</strong>
                </div>

                <div className="f-metric-row">
                  <span className="f-metric-key">Valuation</span>
                  <div className="f-val-composite">
                    <span className="market-vs-fair n">Mkt {scenario.asking} vs Fair ₹1.60 Cr</span>
                    <strong className={`val-delta-tag n ${scenario.valuationDelta?.includes('Undervalued') ? 'text-grn' : scenario.valuationDelta?.includes('Overvalued') ? 'text-red' : 'text-grn'}`}>
                      {scenario.valuationDelta || '3% Overvalued'}
                    </strong>
                  </div>
                </div>

                <div className="f-metric-row">
                  <span className="f-metric-key">30-Year Title</span>
                  <strong className="f-metric-val text-grn">Unbroken (1996–2026)</strong>
                </div>

                <div className="f-metric-row">
                  <span className="f-metric-key">MahaRERA Plan</span>
                  <strong className="f-metric-val n">{scenario.carpet} (Match)</strong>
                </div>
              </div>

              {/* Action Buttons: Buy / Inspect & Sell / Due Diligence (Screenshot 1 Reference) */}
              <div className="floating-action-buttons">
                <button
                  type="button"
                  className="floating-btn-buy"
                  onClick={() => setActiveTab('verification')}
                >
                  Buy / Inspect Passport
                </button>
                <button
                  type="button"
                  className="floating-btn-sell"
                  onClick={onOpenShare}
                >
                  Download Dossier
                </button>
              </div>
            </div>

            {/* Prompt Pill: Ask about this property (Screenshot 1 Reference) */}
            <button
              type="button"
              className="lofty-ask-property-pill"
              onClick={onOpenAssistant}
            >
              <Sparkles size={16} className="text-indigo" />
              <span>Ask about this property</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
