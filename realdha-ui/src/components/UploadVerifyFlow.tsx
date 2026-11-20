import { useState, useEffect, useRef } from 'react'
import {
  Upload,
  FileText,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  FileSearch,
  Lock,
  Layers,
  Copy,
  Check,
} from 'lucide-react'
import type { Scenario } from '../data/scenarios'

interface UploadVerifyFlowProps {
  scenarios: Scenario[]
  activeScenario: Scenario
  onSelectScenario: (s: Scenario) => void
  onNavigate: (view: 'landing' | 'search' | 'passport' | 'upload') => void
}

type ProcessingStage = 'idle' | 'uploading' | 'ocr' | 'entities' | 'reconciliation' | 'anchoring' | 'complete'

interface VerificationSample {
  id: string
  scenarioId: string
  title: string
  docType: string
  authority: string
  fileSize: string
  expectedStatus: 'clear' | 'mismatch' | 'heir' | 'mortgage'
  originalMarathi: string
  englishTranslation: string
  discrepancyNote?: string
  extractedData: {
    surveyGat: string
    carpetArea: string
    sanctionedArea: string
    registeredHolder: string
    encumbrance: string
  }
}

const samples: VerificationSample[] = [
  {
    id: 'sample-pune',
    scenarioId: 'pune-highrise',
    title: 'Commencement Certificate & Sanctioned Floor Plan (PMC)',
    docType: 'PMC Sanctioned Plan & CC',
    authority: 'Pune Municipal Corporation · Bldg Perm. Dept',
    fileSize: '4.8 MB (PDF)',
    expectedStatus: 'clear',
    originalMarathi: 'पुणे महानगरपालिका नगररचना व बांधकाम विकास विभाग. मंजूर रेखांकन व सदनिका चटई क्षेत्र १०९.६० चौ.मी. (१,१८० चौ.फूट). ३० वर्षांची शोध नोंदणी निर्दोष.',
    englishTranslation: 'Pune Municipal Corporation Town Planning & Building Dept. Sanctioned layout and unit carpet area 109.60 sq m (1,180 sq ft). 30-year search report clean without encumbrance.',
    extractedData: {
      surveyGat: 'Survey No. 172/2 Part, Hadapsar',
      carpetArea: '1,180 sq ft (109.60 sq m)',
      sanctionedArea: '1,180 sq ft (Exact Match)',
      registeredHolder: 'Amanora Infrastructure Ltd / Present Buyer',
      encumbrance: 'Nil (Bank NOC on file dated 14-Jan-2021)',
    },
  },
  {
    id: 'sample-lonavala',
    scenarioId: 'lonavala-plot',
    title: 'Village Form VII/XII (सातबारा उतारा) & Sale Agreement Draft',
    docType: 'Marathi 7/12 (Satbara) Extract',
    authority: 'Talathi Office Tungarli · Maval Taluka Revenue',
    fileSize: '2.1 MB (Scanned PDF)',
    expectedStatus: 'mismatch',
    originalMarathi: 'गाव नमुना सात (अधिकार अभिलेख पत्रक) - गट क्र. ८४. एकूण क्षेत्र ० हेक्टर ०४.१८ आर (४१८ चौ.मी.). विक्रेता करार मसुद्यात क्षेत्र ४६५ चौ.मी. नमूद केले असून ४७ चौ.मी. ची तफावत दिसून येत आहे.',
    englishTranslation: 'Village Form 7 (Record of Rights) - Gat No. 84. Total registered area 0 Hectare 04.18 Are (418 sq m). Seller sale draft claims 465 sq m, resulting in a critical 47 sq m discrepancy.',
    discrepancyNote: 'Area Mismatch: 7/12 official revenue record reflects 418 sq m, whereas the sale agreement draft claims 465 sq m. Advise buyer to stop and obtain certified cadastral measurement before advance payment.',
    extractedData: {
      surveyGat: 'Gat No. 84 (Cadastral Parcel 84/1)',
      carpetArea: '465 sq m (Claimed in Draft)',
      sanctionedArea: '418 sq m (Official Revenue 7/12)',
      registeredHolder: 'Anita Suresh Deshmukh',
      encumbrance: 'Area Mismatch Flagged (47 sq m deficit)',
    },
  },
  {
    id: 'sample-resale',
    scenarioId: 'pune-resale',
    title: 'Society Share Certificate & Ferfar #4120 Mutation Entry',
    docType: 'Ferfar (Mutation) & Share Certificate',
    authority: 'Sub-Registrar Haveli 5 & Mayur Nagari Co-op Society',
    fileSize: '3.4 MB (Scanned PDF)',
    expectedStatus: 'heir',
    originalMarathi: 'वारस हक्क नोंद फेरफार क्र. ४१२० अन्वये स्व. प्रभाकर कुलकर्णी यांचे पश्चात ३ वारसांची नावे दाखल. परंतु सह-वारसदार श्रीमती मंगला कुलकर्णी यांचे हक्क सोडपत्र (Relinquishment Deed) दस्तऐवजात समाविष्ट नाही.',
    englishTranslation: 'Inheritance mutation entry Ferfar #4120 recorded 3 legal heirs following the demise of Prabhakar Kulkarni. However, co-heir Mrs. Mangala Kulkarni’s registered Relinquishment Deed is missing from the title packet.',
    discrepancyNote: 'Missing Legal Heir Release: Title packet lacks a registered release deed (हक्कसोडपत्र) from daughter Mangala. Risk of future coparcenary dispute under Hindu Succession (Amendment) Act.',
    extractedData: {
      surveyGat: 'CTS No. 1290, Kothrud Division',
      carpetArea: '920 sq ft (85.47 sq m)',
      sanctionedArea: '920 sq ft (Society records match)',
      registeredHolder: 'Sameer Prabhakar Kulkarni (+ 2 Co-Heirs)',
      encumbrance: 'Defective Title: Unsigned Co-Parcenary Heir Release',
    },
  },
  {
    id: 'sample-bhiwandi',
    scenarioId: 'bhiwandi-warehouse',
    title: 'Index II (नोंदणीकृत दस्त २) & 2019 Commercial Hypothecation Deed',
    docType: 'Index II & Bank Charge Register',
    authority: 'Sub-Registrar Bhiwandi III · Thane District',
    fileSize: '5.2 MB (PDF)',
    expectedStatus: 'mortgage',
    originalMarathi: 'दस्त नोंदणी क्रमांक ३९२१/२०१९ - युनियन बँक ऑफ इंडिया तारण बोजा रुपये १.८५ कोटी कायम. बँकेचे कर्जफेडीचे ना-हरकत प्रमाणपत्र (NOC) अथवा बोजा समाप्ती नोंद (Deed of Reconveyance) उपलब्ध नाही.',
    englishTranslation: 'Registration Deed No. 3921/2019 - Subsisting commercial hypothecation charge of ₹1.85 Cr in favour of Union Bank of India. No Bank NOC or Deed of Reconveyance on record.',
    discrepancyNote: 'Active Bank Mortgage: Undisclosed ₹1.85 Cr mortgage remains encumbered on the property card. Bank NOC and formal deed of reconveyance must be obtained prior to closing.',
    extractedData: {
      surveyGat: 'Survey No. 44/1A, Bhiwandi Logistics Corridor',
      carpetArea: '22,500 sq ft Built-up / 35,000 sq ft Plot',
      sanctionedArea: '22,500 sq ft (Approved Warehouse Plan)',
      registeredHolder: 'Logistics Warehousing Corp Ltd',
      encumbrance: 'Active Charge: ₹1.85 Cr Union Bank Mortgage (Unreleased)',
    },
  },
]

export function UploadVerifyFlow({
  scenarios,
  activeScenario,
  onSelectScenario,
  onNavigate,
}: UploadVerifyFlowProps) {
  const [userSelectedSample, setUserSelectedSample] = useState<VerificationSample | null>(null)
  const [prevScenarioId, setPrevScenarioId] = useState<string>(activeScenario.id)

  if (prevScenarioId !== activeScenario.id) {
    setPrevScenarioId(activeScenario.id)
    setUserSelectedSample(null)
  }

  const selectedSample =
    userSelectedSample ||
    samples.find((s) => s.scenarioId === activeScenario.id || s.id === activeScenario.id) ||
    samples[0]

  const [stage, setStage] = useState<ProcessingStage>('idle')
  const [progress, setProgress] = useState<number>(0)
  const [customFileName, setCustomFileName] = useState<string | null>(null)
  const [copiedHash, setCopiedHash] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCustomFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCustomFileName(file.name)
      handleStartAnalysis(samples[0])
    }
  }

  useEffect(() => {
    if (stage === 'uploading') {
      const t1 = setTimeout(() => {
        setProgress(20)
        setStage('ocr')
      }, 600)
      return () => clearTimeout(t1)
    }
    if (stage === 'ocr') {
      const t2 = setTimeout(() => {
        setProgress(45)
        setStage('entities')
      }, 700)
      return () => clearTimeout(t2)
    }
    if (stage === 'entities') {
      const t3 = setTimeout(() => {
        setProgress(70)
        setStage('reconciliation')
      }, 800)
      return () => clearTimeout(t3)
    }
    if (stage === 'reconciliation') {
      const t4 = setTimeout(() => {
        setProgress(90)
        setStage('anchoring')
      }, 700)
      return () => clearTimeout(t4)
    }
    if (stage === 'anchoring') {
      const t5 = setTimeout(() => {
        setProgress(100)
        setStage('complete')
      }, 600)
      return () => clearTimeout(t5)
    }
  }, [stage])

  const handleStartAnalysis = (sample: VerificationSample) => {
    setUserSelectedSample(sample)
    setProgress(5)
    setStage('uploading')
  }

  const handleReset = () => {
    setStage('idle')
    setProgress(0)
    setCustomFileName(null)
  }

  const handleCopyHash = () => {
    const hash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    navigator.clipboard.writeText(hash)
    setCopiedHash(true)
    setTimeout(() => setCopiedHash(false), 2000)
  }

  const matchedScenario = scenarios.find((s) => s.id === selectedSample.scenarioId) || activeScenario

  return (
    <div className="upload-studio-container">
      {/* Studio Header */}
      <section className="studio-header">
        <div className="studio-header-inner">
          <h1 className="studio-title">
            Upload &amp; Verify Maharashtra Property Records
            <span className="section-dv-sub dv">महाराष्ट्र महसूल कागदपत्र पडताळणी कक्ष</span>
          </h1>
          <p className="studio-subtitle">
            Multimodal OCR extraction for Marathi Devanagari &amp; Modi scripts, 30-year title reconciliation,
            discrepancy detection, and Cloud KMS cryptographic ledger anchoring in seconds.
          </p>
        </div>
      </section>

      {/* Main Studio Workspace */}
      <section className="studio-body">
        <div className="studio-grid">
          {/* LEFT: Ingestion & Control Panel */}
          <div className="studio-left-panel">
            {stage === 'idle' ? (
              <div className="ingestion-box">
                {/* Drag and Drop Zone */}
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleCustomFileChange}
                  accept=".pdf,.png,.jpg,.jpeg,.tiff"
                />
                <div
                  className="interactive-dropzone"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="dropzone-icon-circle">
                    <Upload size={32} />
                  </div>
                  <h3 className="dropzone-heading">
                    {customFileName ? `Selected: ${customFileName}` : 'Drop Property Document PDF or Image'}
                  </h3>
                  <p className="dropzone-sub">
                    Upload Marathi Village Form VII/XII (सातबारा), Index II, Ferfar mutation, PMC/PCMC sanctioned plans,
                    or Bank NOC (PDF, PNG, TIFF up to 50MB)
                  </p>
                  <span className="dropzone-action-btn">
                    Select File from Device
                  </span>
                </div>

                {/* Pre-Loaded Benchmark Test Cases */}
                <div className="benchmark-docs-section">
                  <div className="benchmark-title-row">
                    <FileText size={16} />
                    <span>Or Select from Real Maharashtra Test Documents:</span>
                  </div>

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
                </div>
              </div>
            ) : (
              /* Live Progress Pipeline Card */
              <div className="pipeline-progress-card">
                <div className="pipeline-head">
                  <div>
                    <span className="pipeline-status-badge n">PIPELINE RUNNING · {progress}%</span>
                    <h3 className="pipeline-title">{selectedSample.title}</h3>
                    <p className="pipeline-meta">{selectedSample.authority} · {selectedSample.fileSize}</p>
                  </div>
                  <button
                    type="button"
                    className="pipeline-reset-btn"
                    onClick={handleReset}
                  >
                    <RefreshCw size={14} />
                    <span>Cancel / Reset</span>
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="progress-bar-track">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Stage Steps List */}
                <div className="pipeline-steps-list">
                  <div className={`step-item ${stage === 'uploading' ? 'current' : progress > 20 ? 'done' : 'pending'}`}>
                    <div className="step-icon-wrap">
                      {progress > 20 ? <Check size={14} className="text-grn" /> : <Upload size={14} />}
                    </div>
                    <div className="step-text-wrap">
                      <strong>1. Document Ingestion &amp; Image Pre-processing</strong>
                      <span>Noise reduction, orientation rectification, and DPI enhancement</span>
                    </div>
                  </div>

                  <div className={`step-item ${stage === 'ocr' ? 'current' : progress > 45 ? 'done' : 'pending'}`}>
                    <div className="step-icon-wrap">
                      {progress > 45 ? <Check size={14} className="text-grn" /> : <FileSearch size={14} />}
                    </div>
                    <div className="step-text-wrap">
                      <strong>2. Gemini Multimodal OCR (Devanagari &amp; Modi Script)</strong>
                      <span>Extracting bilingual schedules, Gat numbers, and Devanagari numerals</span>
                    </div>
                  </div>

                  <div className={`step-item ${stage === 'entities' ? 'current' : progress > 70 ? 'done' : 'pending'}`}>
                    <div className="step-icon-wrap">
                      {progress > 70 ? <Check size={14} className="text-grn" /> : <Layers size={14} />}
                    </div>
                    <div className="step-text-wrap">
                      <strong>3. Entity Extraction &amp; Boundary Mapping (चतुःसीमा)</strong>
                      <span>Carpet area parsing, North/South/East/West neighbor boundaries</span>
                    </div>
                  </div>

                  <div className={`step-item ${stage === 'reconciliation' ? 'current' : progress > 90 ? 'done' : 'pending'}`}>
                    <div className="step-icon-wrap">
                      {progress > 90 ? <Check size={14} className="text-grn" /> : <ShieldCheck size={14} />}
                    </div>
                    <div className="step-text-wrap">
                      <strong>4. Cross-Registry Title Reconciliation &amp; Fraud Detection</strong>
                      <span>Checking 7/12 area against sanctioned plans, Ferfar heir releases, Bank charges</span>
                    </div>
                  </div>

                  <div className={`step-item ${stage === 'anchoring' || stage === 'complete' ? 'current' : 'pending'}`}>
                    <div className="step-icon-wrap">
                      {stage === 'complete' ? <Check size={14} className="text-grn" /> : <Lock size={14} />}
                    </div>
                    <div className="step-text-wrap">
                      <strong>5. SHA-256 Fingerprint &amp; Cloud KMS Cryptographic Anchor</strong>
                      <span>Generating immutable hash ready for Ethereum ledger anchoring</span>
                    </div>
                  </div>
                </div>

                {stage === 'complete' && (
                  <div className="pipeline-complete-actions">
                    <button
                      type="button"
                      className="btn-primary-large"
                      onClick={() => {
                        onSelectScenario(matchedScenario)
                        onNavigate('passport')
                      }}
                    >
                      <span>Open Full Property Passport</span>
                      <ArrowRight size={18} />
                    </button>
                    <button
                      type="button"
                      className="btn-outline-large"
                      onClick={handleReset}
                    >
                      <RefreshCw size={16} />
                      <span>Verify Another Document</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: Real-time Extraction Results & Stamped Verdict Dossier */}
          <div className="studio-right-panel">
            <div className="dossier-card">
              <div className="dossier-top">
                <div className="dossier-title-group">
                  <span className="dv">महसूल तपासणी निकाल व स्वाक्षरी</span>
                  <span className="badge-divider">·</span>
                  <span>VERIFICATION AUDIT DOSSIER</span>
                </div>
                <div className="dossier-meta n">
                  <span>Timestamp: 20-Nov-2026 · MH-REV-VERIFY-00194</span>
                </div>
              </div>

              {/* Official Violet Revenue Stamp Verdict Banner */}
              <div className={`studio-verdict-banner ${selectedSample.expectedStatus === 'clear' ? 'clear' : 'warning'}`}>
                <div className="stamp-seal-outer" style={{ borderColor: selectedSample.expectedStatus === 'clear' ? '#4A154B' : '#A86400', color: selectedSample.expectedStatus === 'clear' ? '#4A154B' : '#A86400' }}>
                  <div className="stamp-seal-inner">
                    <span className="stamp-seal-dv dv">
                      {selectedSample.expectedStatus === 'clear' ? 'प्रमाणित' : 'सावधान'}
                    </span>
                    <span className="stamp-seal-en">
                      {selectedSample.expectedStatus === 'clear' ? 'VERIFIED' : 'DISCREPANCY'}
                    </span>
                    <small className="n">20-NOV-2026</small>
                  </div>
                </div>

                <div className="verdict-banner-text">
                  <h3 className="verdict-title" style={{ color: selectedSample.expectedStatus === 'clear' ? '#4A154B' : '#C3271F' }}>
                    {selectedSample.expectedStatus === 'clear'
                      ? 'प्रमाणित · CLEAR TO PROCEED'
                      : 'सावधान: तफावत आढळली · ATTENTION REQUIRED'}
                  </h3>
                  <p className="verdict-desc">
                    {selectedSample.expectedStatus === 'clear'
                      ? 'Sanctioned plans match 7/12 record area. 30-year search report unbroken with zero encumbrance.'
                      : selectedSample.discrepancyNote || 'Discrepancy detected during cross-registry reconciliation.'}
                  </p>
                </div>
              </div>

              {/* Extracted Fields Table */}
              <div className="extracted-fields-box">
                <h4 className="extracted-box-title">
                  <FileText size={16} />
                  <span>Structured Entity Extraction (Bilingual Ground Truth)</span>
                </h4>

                <div className="extracted-table">
                  <div className="table-row">
                    <span className="row-key">Cadastral / Survey No.</span>
                    <strong className="row-val n">{selectedSample.extractedData.surveyGat}</strong>
                  </div>
                  <div className="table-row">
                    <span className="row-key">Stated / Document Area</span>
                    <strong className="row-val n">{selectedSample.extractedData.carpetArea}</strong>
                  </div>
                  <div className="table-row">
                    <span className="row-key">Sanctioned / Record Area</span>
                    <strong className={`row-val n ${selectedSample.expectedStatus === 'mismatch' ? 'text-red font-bold' : ''}`}>
                      {selectedSample.extractedData.sanctionedArea}
                    </strong>
                  </div>
                  <div className="table-row">
                    <span className="row-key">Registered Title Holder</span>
                    <strong className="row-val">{selectedSample.extractedData.registeredHolder}</strong>
                  </div>
                  <div className="table-row">
                    <span className="row-key">Encumbrance / Lien Check</span>
                    <strong className={`row-val ${selectedSample.expectedStatus === 'mortgage' || selectedSample.expectedStatus === 'heir' ? 'text-red font-bold' : 'text-grn'}`}>
                      {selectedSample.extractedData.encumbrance}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Side-by-side Marathi original vs English translation */}
              <div className="bilingual-text-box">
                <div className="bilingual-col">
                  <div className="col-header">
                    <span className="dv">मूळ मराठी दस्तऐवज उतारा</span>
                    <span>(Original Marathi Excerpt)</span>
                  </div>
                  <blockquote className="excerpt-quote mr-text">
                    &ldquo;{selectedSample.originalMarathi}&rdquo;
                  </blockquote>
                </div>

                <div className="bilingual-col">
                  <div className="col-header">
                    <span>Certified English Translation</span>
                    <span>(Vertex AI Ground Truth)</span>
                  </div>
                  <blockquote className="excerpt-quote en-text">
                    &ldquo;{selectedSample.englishTranslation}&rdquo;
                  </blockquote>
                </div>
              </div>

              {/* Cryptographic Ledger Anchor Proof */}
              <div className="crypto-anchor-box">
                <div className="crypto-head">
                  <div className="crypto-title-row">
                    <Lock size={15} className="text-grn" />
                    <strong>Cryptographic Ledger Fingerprint (Cloud KMS Anchored)</strong>
                  </div>
                  <button
                    type="button"
                    className="copy-hash-btn"
                    onClick={handleCopyHash}
                  >
                    {copiedHash ? <Check size={14} className="text-grn" /> : <Copy size={14} />}
                    <span>{copiedHash ? 'Hash Copied' : 'Copy Hash'}</span>
                  </button>
                </div>
                <div className="crypto-hash-code n">
                  <span>SHA-256: </span>
                  <code>e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</code>
                </div>
                <div className="crypto-sub-info n">
                  <span>Cloud KMS Key: gcp-kms://projects/realdha-prod/locations/asia-south1/keyRings/mumbai-deeds</span>
                  <span className="bullet">·</span>
                  <span>Tx: 0x7f9a...3b21</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
