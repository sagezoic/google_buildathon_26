import { useState } from 'react'
import { X, ArrowRight, ArrowLeft, CheckCircle2, Sparkles, Building2, ShieldCheck, MapPin, Compass } from 'lucide-react'

interface TourModalProps {
  isOpen: boolean
  onClose: () => void
}

const tourSteps = [
  {
    step: 1,
    title: '1. One Persistent Digital Identity',
    titleDv: 'कायमस्वरूपी डिजिटल ओळख',
    icon: Building2,
    description:
      'Every parcel, building, and individual apartment receives a permanent REALDHA ID (e.g. RA-PUN-001-A-18-04: Pune, project 001, Tower A, Floor 18, Unit 04). All physical dimensions, legal approvals, and sales data attach permanently to this record.',
    highlightArea: 'Top Identity Banner & MahaRERA Registration',
    actionPrompt: 'Use the scenario tabs above to toggle between the 4 real-world Maharashtra test cases.',
  },
  {
    step: 2,
    title: '2. The Spatial Twin & Solar Simulation',
    titleDv: 'अवकाशीय प्रतिकृती व प्रकाश विश्लेषण',
    icon: Compass,
    description:
      'Explore spatial truth over marketing. Switch between the 3D Tower massing, indicative architectural floor plan with room dimensions, and the Sun Simulation comparing 07:00 AM morning light against afternoon heat exposure.',
    highlightArea: 'Left Panel: Explore [Tower] [Floor plan] [Light]',
    actionPrompt: 'Click the tabs in the left panel to test indicative floor plans and morning/evening sun angles.',
  },
  {
    step: 3,
    title: '3. Schedule of Property (चतुःसीमा) & Title Chain',
    titleDv: 'मालमत्तेचे वर्णन · चतुःसीमा व मालकी साखळी',
    icon: MapPin,
    description:
      'Modeled after traditional Maharashtra conveyancing deeds: inspect the exact four boundaries (North, South, East, West, plus Above & Below). The 30-year interactive title chain traces ownership from ancestral 7/12 land to the present buyer.',
    highlightArea: 'Center Panel: Schedule of Property (चतुःसीमा)',
    actionPrompt: 'Click any boundary neighbor or title chain segment to view mutation and deed details.',
  },
  {
    step: 4,
    title: '4. The Revenue Register Stamp & Document Dossier',
    titleDv: 'महसूल नोंदणी शिक्का व दस्तऐवज तपासणी',
    icon: ShieldCheck,
    description:
      'Drop arbitrary trust scores: the authentic Maharashtra Violet Stamp carries the authoritative verdict. Every finding cites its exact document and page. Click any document in the dossier to view original Marathi text, English translations, and SHA-256 Cloud KMS fingerprints.',
    highlightArea: 'Right Panel: Verification & Document Chain Dossier',
    actionPrompt: 'Click on any document in the dossier list to open the side-by-side legal inspector.',
  },
  {
    step: 5,
    title: '5. Grounded Gemini Property Assistant',
    titleDv: 'वर्टेक्स एआय आधारित जेमिनी सहाय्यक',
    icon: Sparkles,
    description:
      'An autonomous conversational agent grounded strictly in the verified case documents. It refuses hallucinations, citing exact source pages (e.g. Index II p.2, Ferfar #4120 p.1). Click prompt chips or type questions to test live due-diligence answers.',
    highlightArea: 'Bottom Panel: Gemini Property Assistant (Expandable Drawer)',
    actionPrompt: 'Click any suggested question chip at the bottom to test immediate grounded responses.',
  },
]

export function TourModal({ isOpen, onClose }: TourModalProps) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0)

  if (!isOpen) return null

  const currentStep = tourSteps[currentStepIdx]
  const IconComponent = currentStep.icon

  const handleNext = () => {
    if (currentStepIdx < tourSteps.length - 1) {
      setCurrentStepIdx(currentStepIdx + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(currentStepIdx - 1)
    }
  }

  const handleComplete = () => {
    // Save preference to prevent auto-opening
    try {
      localStorage.setItem('realdha_tour_completed', 'true')
    } catch {
      // ignore in iframe
    }
    onClose()
  }

  return (
    <div className="modal-backdrop tour-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card tour-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-info">
            <div className="modal-doc-badge">
              <Sparkles size={16} />
              <span>Evaluator Walkthrough</span>
              <span className="status-pill verified">Step {currentStep.step} of 5</span>
            </div>
            <h2 className="modal-title">{currentStep.title}</h2>
            <p className="modal-subtitle dv">{currentStep.titleDv}</p>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Skip walkthrough">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body tour-body">
          <div className="tour-icon-hero">
            <div className="tour-icon-circle">
              <IconComponent size={32} />
            </div>
            <div className="tour-stepper-dots">
              {tourSteps.map((s, idx) => (
                <span
                  key={s.step}
                  className={`tour-dot ${idx === currentStepIdx ? 'active' : idx < currentStepIdx ? 'completed' : ''}`}
                  onClick={() => setCurrentStepIdx(idx)}
                />
              ))}
            </div>
          </div>

          <div className="tour-content-text">
            <p>{currentStep.description}</p>
            <div className="tour-focus-callout">
              <strong>Focus Area:</strong> <span>{currentStep.highlightArea}</span>
            </div>
            <div className="tour-action-callout">
              <CheckCircle2 size={16} />
              <span>{currentStep.actionPrompt}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer tour-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Skip Tour
          </button>
          <div className="tour-nav-buttons">
            {currentStepIdx > 0 && (
              <button className="btn btn-secondary" onClick={handlePrev}>
                <ArrowLeft size={14} /> Back
              </button>
            )}
            <button className="btn btn-primary" onClick={handleNext}>
              {currentStepIdx === tourSteps.length - 1 ? (
                <>Finish &amp; Explore</>
              ) : (
                <>Next Stop <ArrowRight size={14} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
