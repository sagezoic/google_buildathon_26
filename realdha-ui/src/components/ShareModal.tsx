import { useState } from 'react'
import { X, Copy, Check, FileDown, ShieldCheck, Share2 } from 'lucide-react'
import type { Scenario } from '../data/scenarios'

interface ShareModalProps {
  scenario: Scenario
  isOpen: boolean
  onClose: () => void
}

export function ShareModal({ scenario, isOpen, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const [downloaded, setDownloaded] = useState(false)

  if (!isOpen) return null

  const shareUrl = `https://realdha.in/p/${scenario.realdhaId}`

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const summaryData = {
      realdhaId: scenario.realdhaId,
      unit: scenario.unit,
      project: scenario.project,
      location: scenario.location,
      mahaRera: scenario.mahaRera,
      askingPrice: scenario.asking,
      verdictStamp: scenario.stamp.title,
      sha256LedgerHash: scenario.sha256,
      ethereumTxHash: scenario.txHash,
      verifiedDocuments: scenario.documents.map((d) => ({ name: d.name, authority: d.authority, status: d.status })),
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(summaryData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `REALDHA_${scenario.realdhaId}_Passport_Audit.json`
    a.click()
    URL.revokeObjectURL(url)
    setDownloaded(true)
    setTimeout(() => setDownloaded(false), 2000)
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-info">
            <div className="modal-doc-badge">
              <Share2 size={16} />
              <span>Digital Property Passport</span>
              <span className="status-pill verified">Institutional Link</span>
            </div>
            <h2 className="modal-title">Share Verified Property Record</h2>
            <p className="modal-subtitle">
              Provide buyers, advocates, banks, or channel partners direct access to this verified passport.
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body share-body">
          {/* Link box */}
          <div className="share-link-group">
            <label className="share-label">Permanent REALDHA Web Passport Link</label>
            <div className="share-link-input-row">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="share-url-input"
              />
              <button className="btn btn-primary" onClick={handleCopy}>
                {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Link</>}
              </button>
            </div>
          </div>

          {/* QR Code and Passport Snapshot */}
          <div className="share-qr-section">
            <div className="qr-container">
              <svg viewBox="0 0 120 120" width="120" height="120" aria-label="Property QR Code">
                <rect width="120" height="120" fill="#fff" />
                {/* Corner markers */}
                <rect x="10" y="10" width="30" height="30" fill="#16181D" />
                <rect x="16" y="16" width="18" height="18" fill="#fff" />
                <rect x="20" y="20" width="10" height="10" fill="#16181D" />

                <rect x="80" y="10" width="30" height="30" fill="#16181D" />
                <rect x="86" y="16" width="18" height="18" fill="#fff" />
                <rect x="90" y="20" width="10" height="10" fill="#16181D" />

                <rect x="10" y="80" width="30" height="30" fill="#16181D" />
                <rect x="16" y="86" width="18" height="18" fill="#fff" />
                <rect x="20" y="90" width="10" height="10" fill="#16181D" />

                {/* Simulated QR bits */}
                <rect x="48" y="14" width="8" height="8" fill="#16181D" />
                <rect x="62" y="22" width="10" height="8" fill="#16181D" />
                <rect x="48" y="32" width="6" height="6" fill="#16181D" />
                <rect x="24" y="52" width="12" height="6" fill="#16181D" />
                <rect x="44" y="48" width="16" height="16" fill="#4A154B" />
                <rect x="68" y="48" width="10" height="10" fill="#16181D" />
                <rect x="86" y="56" width="14" height="6" fill="#16181D" />
                <rect x="52" y="72" width="8" height="12" fill="#16181D" />
                <rect x="70" y="74" width="18" height="8" fill="#16181D" />
                <rect x="48" y="94" width="14" height="12" fill="#16181D" />
                <rect x="72" y="94" width="10" height="10" fill="#16181D" />
                <rect x="92" y="86" width="14" height="14" fill="#16181D" />
              </svg>
              <span className="qr-hint">Scan at site lounge or gate</span>
            </div>

            <div className="share-summary-info">
              <div className="summary-prop-title">
                <strong>{scenario.unit}</strong>
                <span>{scenario.project}, {scenario.location}</span>
              </div>
              <div className="summary-badge-row">
                <span className="summary-stamp-pill" style={{ color: scenario.stamp.stampColor, borderColor: scenario.stamp.stampColor }}>
                  {scenario.stamp.title}
                </span>
                <span className="summary-rera-pill">RERA {scenario.mahaRera}</span>
              </div>
              <p className="summary-desc">
                Includes {scenario.documents.length} verified Maharashtra deeds, 30-year title chain breakdown, and SHA-256 Cloud KMS tamper-evident fingerprint.
              </p>
              <button className="btn btn-secondary share-download-btn" onClick={handleDownload}>
                <FileDown size={14} />
                {downloaded ? 'Downloaded JSON Audit!' : 'Export Dossier Record (JSON)'}
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <div className="modal-footer-left">
            <ShieldCheck size={14} />
            <span>Cryptographically anchored record · No PII on-chain</span>
          </div>
          <button className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
