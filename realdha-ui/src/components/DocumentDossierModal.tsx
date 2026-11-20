import { useState } from 'react'
import { X, FileText, CheckCircle2, AlertTriangle, ShieldCheck, Copy, Check, Globe } from 'lucide-react'
import type { DocumentRecord, Scenario } from '../data/scenarios'

interface DocumentDossierModalProps {
  document: DocumentRecord | null
  scenario: Scenario
  onClose: () => void
}

export function DocumentDossierModal({ document, scenario, onClose }: DocumentDossierModalProps) {
  const [activeTab, setActiveTab] = useState<'original' | 'translation' | 'entities' | 'blockchain'>('original')
  const [copiedHash, setCopiedHash] = useState(false)

  if (!document) return null

  const handleCopyHash = () => {
    navigator.clipboard.writeText(document.sha256)
    setCopiedHash(true)
    setTimeout(() => setCopiedHash(false), 2000)
  }

  const isFlagged = document.status === 'flagged'

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card dossier-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-header-info">
            <div className="modal-doc-badge">
              <FileText size={16} />
              <span>{document.type}</span>
              <span className={`status-pill ${document.status}`}>
                {document.status === 'verified' && <><CheckCircle2 size={12} /> Verified</>}
                {document.status === 'flagged' && <><AlertTriangle size={12} /> Discrepancy Flagged</>}
                {document.status === 'translated' && <><Globe size={12} /> Marathi Verified</>}
                {document.status === 'pending' && <><AlertTriangle size={12} /> Pending Sign-off</>}
              </span>
            </div>
            <h2 className="modal-title">{document.name}</h2>
            <p className="modal-subtitle">
              Authority: <strong>{document.authority}</strong> · Date: {document.date} · {document.pageCount} Pages · Property: <strong>{scenario.realdhaId}</strong>
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="dossier-nav-tabs">
          <button
            className={`dossier-tab ${activeTab === 'original' ? 'active' : ''}`}
            onClick={() => setActiveTab('original')}
          >
            <span>मूळ दस्तऐवज</span>
            <small>Original Marathi / Govt Record</small>
          </button>
          <button
            className={`dossier-tab ${activeTab === 'translation' ? 'active' : ''}`}
            onClick={() => setActiveTab('translation')}
          >
            <span>प्रमाणित भाषांतर</span>
            <small>Certified English Translation</small>
          </button>
          <button
            className={`dossier-tab ${activeTab === 'entities' ? 'active' : ''}`}
            onClick={() => setActiveTab('entities')}
          >
            <span>काढून घेतलेले घटक</span>
            <small>Extracted Metadata ({document.extractedFields.length})</small>
          </button>
          <button
            className={`dossier-tab ${activeTab === 'blockchain' ? 'active' : ''}`}
            onClick={() => setActiveTab('blockchain')}
          >
            <span>ब्लॉकचेन मुद्रा</span>
            <small>SHA-256 Ledger Fingerprint</small>
          </button>
        </div>

        {/* Tab Content */}
        <div className="dossier-tab-content">
          {activeTab === 'original' && (
            <div className="dossier-doc-view authentic-stamp-bg">
              <div className="govt-paper-header">
                <div className="govt-emblem">महाराष्ट्र शासन</div>
                <div className="govt-sub">MAHARASHTRA STATE PROPERTY REGISTER · अधिकृत नोंदवही</div>
                <div className="govt-ref">दस्त नोंदणी क्र. / Ref: {document.id.toUpperCase()} · साजा: {scenario.location}</div>
              </div>
              <div className="govt-paper-body">
                <p className="marathi-record-text dv">{document.originalExcerptMarathi}</p>
              </div>
              <div className="govt-paper-footer">
                <div className="seal-box">
                  <div className="seal-round">
                    <span>प्रमाणित</span>
                    <small>VERIFIED</small>
                  </div>
                  <div>
                    <strong>सक्षम प्राधिकारी शिक्का</strong>
                    <span>Competent Authority Seal · {document.authority}</span>
                  </div>
                </div>
                <div className="page-watermark">पृष्ठ १ पैकी {document.pageCount} · Page 1 of {document.pageCount}</div>
              </div>
            </div>
          )}

          {activeTab === 'translation' && (
            <div className="dossier-doc-view translation-view">
              <div className="translation-header">
                <div className="translation-badge">
                  <Globe size={14} />
                  <span>Vertex AI Document AI + Certified Legal Translation</span>
                </div>
                <span className="certified-badge">Certified Accurate · Verified against Land Registry</span>
              </div>
              <div className="translation-body">
                <blockquote className="translated-text">
                  {document.translatedExcerptEnglish}
                </blockquote>
                {isFlagged && (
                  <div className="flagged-alert-box">
                    <AlertTriangle size={18} />
                    <div>
                      <strong>Audit Warning: Discrepancy Found in this Document</strong>
                      <p>The extracted terms conflict with the sanctioned registry records. Legal advocate review required prior to executing sale agreement.</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="translation-meta">
                <span>Source Language: <strong>Marathi (मराठी)</strong></span>
                <span>Target Language: <strong>English</strong></span>
                <span>Verification Model: <strong>Gemini 1.5 Legal OCR Pipeline</strong></span>
              </div>
            </div>
          )}

          {activeTab === 'entities' && (
            <div className="dossier-doc-view entities-view">
              <div className="entities-summary">
                <span>The following key legal variables were extracted, typed, and cross-referenced by Gemini Document AI:</span>
              </div>
              <table className="entities-table">
                <thead>
                  <tr>
                    <th>Field Name (घटक)</th>
                    <th>Extracted Value (नोंदवलेले मूल्य)</th>
                    <th>Verification Match</th>
                  </tr>
                </thead>
                <tbody>
                  {document.extractedFields.map((field, idx) => (
                    <tr key={idx}>
                      <td className="field-label">{field.label}</td>
                      <td className="field-value">{field.value}</td>
                      <td className="field-status">
                        {isFlagged && field.label.toLowerCase().includes('area') ? (
                          <span className="badge-flag"><AlertTriangle size={12} /> Mismatch</span>
                        ) : (
                          <span className="badge-match"><CheckCircle2 size={12} /> Verified</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'blockchain' && (
            <div className="dossier-doc-view blockchain-view">
              <div className="blockchain-hero">
                <ShieldCheck size={36} className="chain-icon" />
                <div>
                  <h3>Tamper-Evident SHA-256 Ledger Anchor</h3>
                  <p>Document cryptographic fingerprint anchored on Ethereum mainnet via Google Cloud KMS signed transaction.</p>
                </div>
              </div>

              <div className="hash-box-group">
                <div className="hash-box">
                  <div className="hash-header">
                    <span>Document SHA-256 Hash</span>
                    <button className="copy-btn" onClick={handleCopyHash}>
                      {copiedHash ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy Hash</>}
                    </button>
                  </div>
                  <code className="hash-code">{document.sha256}</code>
                </div>

                <div className="hash-box">
                  <div className="hash-header">
                    <span>Ethereum Anchoring Transaction (Tx Hash)</span>
                    <span className="chain-network">Ethereum Mainnet · Block #{scenario.blockNumber}</span>
                  </div>
                  <code className="hash-code">{scenario.txHash}</code>
                </div>
              </div>

              <div className="kms-badge-row">
                <div className="kms-badge">
                  <span className="kms-dot" />
                  <span>Cloud KMS Hardware Security Module (HSM) Signed</span>
                </div>
                <div className="kms-badge">
                  <span>Timestamp: <strong>{document.date} · 11:42:09 UTC</strong></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <div className="modal-footer-left">
            <span>REALDHA ID: <strong>{scenario.realdhaId}</strong></span>
          </div>
          <button className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
