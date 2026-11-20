import { useState } from 'react'
import { CheckCircle2, AlertTriangle, ShieldCheck, FileText, ChevronRight, Stamp } from 'lucide-react'
import type { Scenario, DocumentRecord } from '../data/scenarios'

interface VerificationPanelProps {
  scenario: Scenario
  onOpenDocument: (doc: DocumentRecord) => void
}

export function VerificationPanel({ scenario, onOpenDocument }: VerificationPanelProps) {
  const [selectedFinding, setSelectedFinding] = useState<string | null>(null)

  return (
    <section className="panel verification-panel">
      {/* Header */}
      <div className="panel-header">
        <div>
          <span className="dv">पडताळणी</span>{' '}
          <em>Verification &amp; Audit Dossier</em>
        </div>
        <div className="serial-badge n">
          <span>{scenario.stamp.serialNo}</span>
        </div>
      </div>

      {/* Official Revenue Stamp Verdict Banner (Replaces arbitrary 98/100 score) */}
      <div className={`verdict-stamp-banner ${scenario.stamp.type}`}>
        <div className="stamp-seal-outer" style={{ borderColor: scenario.stamp.stampColor, color: scenario.stamp.stampColor }}>
          <div className="stamp-seal-inner">
            <span className="stamp-seal-dv dv">{scenario.stamp.sealMarathi.split('·')[1]?.trim() || 'प्रमाणित'}</span>
            <span className="stamp-seal-en">{scenario.stamp.sealEnglish.split('·')[1]?.trim() || 'VERIFIED'}</span>
            <small className="n">{scenario.stamp.date}</small>
          </div>
        </div>
        <div className="verdict-stamp-text">
          <div className="verdict-stamp-title-row">
            <Stamp size={16} style={{ color: scenario.stamp.stampColor }} />
            <h3 className="verdict-stamp-title" style={{ color: scenario.stamp.stampColor }}>
              {scenario.stamp.title}
            </h3>
          </div>
          <p className="verdict-stamp-subtitle">{scenario.stamp.subtitle}</p>
          <div className="stamp-authority-tag">
            <span>District Collectorate Registry · Pune Division</span>
          </div>
        </div>
      </div>

      {/* Append-Only Numbered Audit Findings */}
      <div className="findings-section">
        <div className="section-label-row">
          <span className="dv">नोंदवलेले निष्कर्ष</span>
          <span className="section-sub">Append-Only Audit Entries ({scenario.findings.length + (scenario.note ? 1 : 0)})</span>
        </div>

        <div className="findings-list">
          {scenario.findings.map((finding, idx) => (
            <div
              key={finding.id}
              className={`finding-card ${finding.status} ${selectedFinding === finding.id ? 'expanded' : ''}`}
              onClick={() => setSelectedFinding(selectedFinding === finding.id ? null : finding.id)}
            >
              <div className="finding-top-row">
                <span className="finding-idx n">{idx + 1}.</span>
                <div className="finding-icon-wrap">
                  {finding.status === 'pass' && <CheckCircle2 size={16} className="text-grn" />}
                  {finding.status === 'alert' && <AlertTriangle size={16} className="text-red" />}
                  {finding.status === 'note' && <AlertTriangle size={16} className="text-amb" />}
                </div>
                <strong className="finding-title">{finding.title}</strong>
              </div>

              <div className="finding-body">
                <blockquote className="finding-quote">
                  &ldquo;{finding.quote}&rdquo;
                </blockquote>
                <div className="finding-citation-row">
                  <span className="citation-tag">
                    <FileText size={12} />
                    {finding.sourceDoc} · {finding.page}
                  </span>
                  <span className="clause-tag">{finding.clause}</span>
                </div>
              </div>
            </div>
          ))}

          {/* Critical Note / Alert if present (craft-floor compliant: full border & tint, no side stripe) */}
          {scenario.note && (
            <div className={`critical-callout-card ${scenario.note.status}`}>
              <div className="callout-header">
                <AlertTriangle size={16} />
                <strong>{scenario.note.title}</strong>
              </div>
              <p className="callout-quote">&ldquo;{scenario.note.quote}&rdquo;</p>
              <div className="callout-source">
                <span>Source: {scenario.note.sourceDoc} ({scenario.note.page})</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cryptographic Ledger Anchor */}
      <div
        className="ledger-fingerprint-box"
        onClick={() => {
          if (scenario.documents[0]) onOpenDocument(scenario.documents[0])
        }}
        title="Click to inspect cryptographic ledger proof"
      >
        <div className="fingerprint-header">
          <div className="fingerprint-title">
            <ShieldCheck size={16} />
            <span>Ethereum Ledger SHA-256 Anchor</span>
          </div>
          <span className="fingerprint-network">Block #{scenario.blockNumber}</span>
        </div>
        <div className="fingerprint-hashes n">
          <div>
            <i>SHA-256</i>
            <code>{scenario.sha256.slice(0, 16)}…{scenario.sha256.slice(-12)}</code>
          </div>
          <div>
            <i>Tx Hash</i>
            <code>{scenario.txHash.slice(0, 14)}…{scenario.txHash.slice(-10)}</code>
          </div>
        </div>
      </div>

      {/* Document Chain Dossier */}
      <div className="document-dossier-section">
        <div className="section-label-row">
          <span className="dv">दस्तऐवज साखळी</span>
          <span className="section-sub">Document Chain Dossier (Click to Inspect)</span>
        </div>

        <div className="dossier-cards-list">
          {scenario.documents.map((doc, idx) => (
            <div
              key={doc.id}
              className="dossier-card-row"
              onClick={() => onOpenDocument(doc)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onOpenDocument(doc)
              }}
            >
              <span className="doc-num n">{idx + 1}.</span>
              <FileText size={16} className="doc-icon" />
              <div className="doc-info">
                <strong className="doc-name-text">{doc.name}</strong>
                <span className="doc-authority-text">{doc.authority} · {doc.date}</span>
              </div>
              <span className={`doc-status-tag ${doc.status}`}>
                {doc.type}
              </span>
              <ChevronRight size={14} className="doc-arrow" />
            </div>
          ))}
        </div>
      </div>

      {/* Institutional Lawyer Sign-off */}
      <div className="lawyer-signoff-box">
        <div className="lawyer-header-row">
          <div className="lawyer-status-pill">
            <span className="dv">वकील स्वाक्षरी</span>
            <span className={`signoff-tag ${scenario.lawyerSignOff.status}`}>
              {scenario.lawyerSignOff.status.toUpperCase()}
            </span>
          </div>
          {scenario.lawyerSignOff.advocateName && (
            <span className="advocate-name">{scenario.lawyerSignOff.advocateName}</span>
          )}
        </div>
        <p className="lawyer-notes-text">{scenario.lawyerSignOff.notes}</p>
      </div>
    </section>
  )
}
