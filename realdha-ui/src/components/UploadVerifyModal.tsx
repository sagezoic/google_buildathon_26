import { useState, useEffect } from 'react'
import { X, Upload, FileText, RefreshCw } from 'lucide-react'
import type { Scenario } from '../data/scenarios'

interface UploadVerifyModalProps {
  scenario: Scenario
  isOpen: boolean
  onClose: () => void
}

type ScanStage = 'idle' | 'ocr' | 'entities' | 'crosscheck' | 'fingerprint' | 'complete'

export function UploadVerifyModal({ isOpen, onClose }: UploadVerifyModalProps) {
  const [selectedFile, setSelectedFile] = useState<string>('sample-pune')
  const [stage, setStage] = useState<ScanStage>('idle')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (stage === 'ocr') {
      const t1 = setTimeout(() => { setProgress(25); setStage('entities') }, 700)
      return () => clearTimeout(t1)
    }
    if (stage === 'entities') {
      const t2 = setTimeout(() => { setProgress(55); setStage('crosscheck') }, 800)
      return () => clearTimeout(t2)
    }
    if (stage === 'crosscheck') {
      const t3 = setTimeout(() => { setProgress(85); setStage('fingerprint') }, 900)
      return () => clearTimeout(t3)
    }
    if (stage === 'fingerprint') {
      const t4 = setTimeout(() => { setProgress(100); setStage('complete') }, 700)
      return () => clearTimeout(t4)
    }
  }, [stage])

  if (!isOpen) return null

  const handleStartVerification = (sampleId: string) => {
    setSelectedFile(sampleId)
    setProgress(10)
    setStage('ocr')
  }

  const handleReset = () => {
    setStage('idle')
    setProgress(0)
  }

  const isMismatchSample = selectedFile === 'sample-lonavala'
  const isMortgageSample = selectedFile === 'sample-bhiwandi'

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card upload-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-info">
            <div className="modal-doc-badge">
              <Upload size={16} />
              <span>REALDHA Verify Engine</span>
              <span className="status-pill verified">Vertex AI + Document AI</span>
            </div>
            <h2 className="modal-title">Live Document Ingestion &amp; AI Verification</h2>
            <p className="modal-subtitle">
              Upload any Maharashtra deed, 7/12 extract, or Index II for real-time extraction, cross-referencing, and tamper-evident anchoring.
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="modal-body">
          {stage === 'idle' ? (
            <div className="upload-idle-view">
              {/* Drag and Drop Zone */}
              <div
                className="dropzone"
                onClick={() => handleStartVerification('sample-pune')}
              >
                <Upload size={36} className="dropzone-icon" />
                <h3>Drop property document PDF here, or select a sample</h3>
                <p>Supports Marathi Village Form VII/XII, Index II deeds, PMC/MCGM CC, and MahaRERA registration papers (Max 25MB)</p>
                <span className="dropzone-btn">Select File from Computer</span>
              </div>

              {/* Sample Selection */}
              <div className="sample-presets">
                <span className="sample-presets-label">Or choose a test document from the Maharashtra records library:</span>
                <div className="sample-cards-grid">
                  <button
                    className="sample-card"
                    onClick={() => handleStartVerification('sample-pune')}
                  >
                    <div className="sample-card-top">
                      <FileText size={18} />
                      <span className="badge-pass">Expected: Clean Title</span>
                    </div>
                    <strong>Marathi 7/12 Extract · Gat #84</strong>
                    <span>Amanora Park Town, Pune · Converted NA Class 1 Freehold</span>
                  </button>

                  <button
                    className="sample-card"
                    onClick={() => handleStartVerification('sample-lonavala')}
                  >
                    <div className="sample-card-top">
                      <FileText size={18} />
                      <span className="badge-flag">Expected: Area Discrepancy</span>
                    </div>
                    <strong>Seller Draft Agreement · Plot NA-412</strong>
                    <span>Lonavala NA Plot · Claims 465 sq m vs 418 sq m on 7/12</span>
                  </button>

                  <button
                    className="sample-card"
                    onClick={() => handleStartVerification('sample-bhiwandi')}
                  >
                    <div className="sample-card-top">
                      <FileText size={18} />
                      <span className="badge-flag">Expected: Hidden Mortgage</span>
                    </div>
                    <strong>CERSAI Charge Registry · WH-7</strong>
                    <span>Bhiwandi Logistics Hub · Subsisting SBI Loan ₹2.4 Cr</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="upload-scanning-view">
              {/* Progress Bar & Status */}
              <div className="scan-progress-box">
                <div className="scan-progress-header">
                  <div className="scan-current-file">
                    <FileText size={18} />
                    <span>
                      {selectedFile === 'sample-pune' && 'Marathi_7_12_Extract_Gat84_Amanora.pdf'}
                      {selectedFile === 'sample-lonavala' && 'Seller_Draft_Agreement_Plot412_Lonavala.pdf'}
                      {selectedFile === 'sample-bhiwandi' && 'CERSAI_Charge_Search_Report_WH7.pdf'}
                    </span>
                  </div>
                  <span className="scan-percent n">{progress}%</span>
                </div>
                <div className="progress-bar-track">
                  <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                </div>
              </div>

              {/* Multi-Stage Stepper */}
              <div className="scan-stepper">
                <div className={`step-item ${stage === 'ocr' ? 'active' : progress > 25 ? 'done' : ''}`}>
                  <span className="step-circle">{progress > 25 ? '✓' : '1'}</span>
                  <div className="step-label">
                    <strong>Document AI Optical Character Recognition</strong>
                    <small>Extracting bilingual Marathi (Modi/Devanagari) &amp; English text</small>
                  </div>
                </div>

                <div className={`step-item ${stage === 'entities' ? 'active' : progress > 55 ? 'done' : ''}`}>
                  <span className="step-circle">{progress > 55 ? '✓' : '2'}</span>
                  <div className="step-label">
                    <strong>Structured Legal Entity Extraction</strong>
                    <small>Parsing Gat/Survey #, boundary dimensions, carpet area, holder names</small>
                  </div>
                </div>

                <div className={`step-item ${stage === 'crosscheck' ? 'active' : progress > 85 ? 'done' : ''}`}>
                  <span className="step-circle">{progress > 85 ? '✓' : '3'}</span>
                  <div className="step-label">
                    <strong>Cross-Verification with State Land Register</strong>
                    <small>Validating against MahaRERA sanctioned filings &amp; sub-registrar deeds</small>
                  </div>
                </div>

                <div className={`step-item ${stage === 'fingerprint' ? 'active' : progress === 100 ? 'done' : ''}`}>
                  <span className="step-circle">{progress === 100 ? '✓' : '4'}</span>
                  <div className="step-label">
                    <strong>SHA-256 Ledger Anchoring</strong>
                    <small>Computing cryptographic hash &amp; signing via Cloud KMS HSM</small>
                  </div>
                </div>
              </div>

              {/* Complete Verdict Result */}
              {stage === 'complete' && (
                <div className="scan-result-card">
                  {isMismatchSample ? (
                    <div className="result-alert warning">
                      <div className="result-stamp amber-stamp">
                        <span className="dv">सावधान</span>
                        <small>AREA MISMATCH</small>
                      </div>
                      <div className="result-details">
                        <h4>Audit Discrepancy Flagged: 465 sq m vs 418 sq m</h4>
                        <p>
                          Document AI identified a <strong>47 sq m (11.2%) discrepancy</strong> between the seller draft recital (465 sq m) and the government 7/12 extract (418 sq m).
                        </p>
                        <div className="result-clause">
                          <strong>Source Quote:</strong> &quot;गट क्र. २०१/४१२: एकूण क्षेत्र ० हेक्टर ०४.१८ आर&quot; vs Draft Recital &quot;Area 465 sq m&quot;
                        </div>
                        <div className="result-action-note">
                          Verdict: <strong>Stop transaction. Require Mojani resurvey by TILR before earnest money deposit.</strong>
                        </div>
                      </div>
                    </div>
                  ) : isMortgageSample ? (
                    <div className="result-alert danger">
                      <div className="result-stamp red-stamp">
                        <span className="dv">बोजा</span>
                        <small>MORTGAGE ACTIVE</small>
                      </div>
                      <div className="result-details">
                        <h4>Critical Risk: Unreleased 2019 Bank Mortgage (₹2.4 Cr)</h4>
                        <p>
                          CERSAI registry check reveals an active security interest registered by <strong>State Bank of India</strong>. The vendor cannot convey unencumbered title without Bank No Due Certificate.
                        </p>
                        <div className="result-clause">
                          <strong>Source Quote:</strong> &quot;CERSAI Security Interest #20001948271: Charge Amount ₹2,40,00,000/- active&quot;
                        </div>
                        <div className="result-action-note">
                          Verdict: <strong>Tripartite escrow required. Pay outstanding ₹1.82 Cr directly to SBI for title release.</strong>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="result-alert success">
                      <div className="result-stamp violet-stamp">
                        <span className="dv">प्रमाणित</span>
                        <small>RECORD VERIFIED</small>
                      </div>
                      <div className="result-details">
                        <h4>Verification Passed: 100% Match with Maharashtra Registry</h4>
                        <p>
                          Document successfully cross-checked against MahaRERA registration <strong>P52100018892</strong>. Unbroken title chain confirmed, encumbrances clear, carpet area exactly 1,180 sq ft.
                        </p>
                        <div className="result-hash-proof">
                          <span>SHA-256: <code>e3b0c44298fc1c149afbf4c8996fb92427ae41e4...</code></span>
                        </div>
                        <div className="result-action-note success-note">
                          Verdict: <strong>Clear to proceed. 1 procedural note on Ferfar #4120 release deed.</strong>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="result-buttons">
                    <button className="btn btn-secondary" onClick={handleReset}>
                      <RefreshCw size={14} />
                      Verify Another Document
                    </button>
                    <button className="btn btn-primary" onClick={onClose}>
                      Done · View Passport Dossier
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
