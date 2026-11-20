import { useState, useRef, useEffect } from 'react'
import { Send, ChevronUp, ChevronDown, Sparkles, FileText, Bot, User, Trash2 } from 'lucide-react'
import type { Scenario, DocumentRecord } from '../data/scenarios'

interface GeminiDrawerProps {
  scenario: Scenario
  onOpenDocument: (doc: DocumentRecord) => void
  forceOpen?: boolean
  onClose?: () => void
}

interface ChatMessage {
  id: string
  sender: 'user' | 'assistant'
  text: string
  citation?: string
  sourceDocId?: string
  timestamp: string
}

export function GeminiDrawer({ scenario, onOpenDocument, forceOpen, onClose }: GeminiDrawerProps) {
  const [internalExpanded, setInternalExpanded] = useState(false)
  const isExpanded = forceOpen !== undefined ? forceOpen : internalExpanded
  const [inputVal, setInputVal] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      sender: 'assistant',
      text: `Namaste! I am the Gemini Property Assistant for ${scenario.unit} (${scenario.realdhaId}). I answer questions strictly grounded in the verified documents on file for this property. How may I assist your due diligence?`,
      timestamp: 'Just now',
    },
  ])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll when messages update
  useEffect(() => {
    if (isExpanded) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isExpanded])

  const handleSendQuestion = (questionText: string) => {
    if (!questionText.trim()) return

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: questionText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    setInputVal('')
    setInternalExpanded(true)

    // Find answer in grounded QA or provide contextual response
    const matchedQA = scenario.groundedQA.find(
      (qa) => qa.question.toLowerCase().includes(questionText.toLowerCase()) ||
              questionText.toLowerCase().includes(qa.question.toLowerCase().slice(0, 15))
    )

    setTimeout(() => {
      let replyMsg: ChatMessage
      if (matchedQA) {
        replyMsg = {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          text: matchedQA.answer,
          citation: matchedQA.citation,
          sourceDocId: matchedQA.sourceDocId,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      } else {
        // Fallback grounded knowledge query
        replyMsg = {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          text: `Based on the verified audit dossier for ${scenario.realdhaId}: the property is ${scenario.stamp.title}. The official sanctioned area is ${scenario.carpet} with ${scenario.findings.length} findings logged in the Maharashtra revenue register. Consult the document chain dossier for clause-by-clause inspection.`,
          citation: `REALDHA Audit File · ${scenario.stamp.serialNo}`,
          sourceDocId: scenario.documents[0]?.id,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      }
      setMessages((prev) => [...prev, replyMsg])
    }, 450)
  }

  const handleCitationClick = (docId?: string) => {
    if (!docId) return
    const doc = scenario.documents.find((d) => d.id === docId)
    if (doc) onOpenDocument(doc)
  }

  const handleClearChat = () => {
    setMessages([
      {
        id: `clear-${Date.now()}`,
        sender: 'assistant',
        text: `Conversation cleared. Grounded on ${scenario.realdhaId}. Ask any due-diligence question below.`,
        timestamp: 'Just now',
      },
    ])
  }

  return (
    <div className={`gemini-drawer-container ${isExpanded ? 'expanded' : 'docked'}`}>
      {/* Expanded Overlay Panel */}
      {isExpanded && (
        <div className="drawer-panel-body">
          {/* Drawer Header */}
          <div className="drawer-header">
            <div className="drawer-header-title">
              <Sparkles size={18} className="gemini-sparkle-icon" />
              <div>
                <h4>Gemini Property Assistant · वर्टेक्स एआय</h4>
                <span>Grounded on {scenario.documents.length} verified records for {scenario.realdhaId} · Vertex AI</span>
              </div>
            </div>
            <div className="drawer-header-actions">
              <button
                className="drawer-icon-btn"
                onClick={handleClearChat}
                title="Clear conversation"
                aria-label="Clear chat"
              >
                <Trash2 size={16} />
              </button>
              <button
                className="drawer-icon-btn"
                onClick={() => {
                  setInternalExpanded(false)
                  onClose?.()
                }}
                title="Collapse drawer"
                aria-label="Collapse assistant"
              >
                <ChevronDown size={18} />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="drawer-messages-list">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-message ${msg.sender}`}>
                <div className="chat-avatar">
                  {msg.sender === 'assistant' ? <Bot size={16} /> : <User size={16} />}
                </div>
                <div className="chat-bubble">
                  <p className="chat-text">{msg.text}</p>
                  {msg.citation && (
                    <div
                      className="chat-citation-pill"
                      onClick={() => handleCitationClick(msg.sourceDocId)}
                      title="Click to inspect source document in dossier"
                    >
                      <FileText size={12} />
                      <span>{msg.citation}</span>
                      <small>Inspect Record →</small>
                    </div>
                  )}
                  <span className="chat-time n">{msg.timestamp}</span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* Docked Interactive Bottom Bar (Always Accessible) */}
      <div className="drawer-bar">
        <div className="drawer-bar-row">
          <button
            className="drawer-toggle-btn"
            onClick={() => {
              if (isExpanded) {
                setInternalExpanded(false)
                onClose?.()
              } else {
                setInternalExpanded(true)
              }
            }}
            aria-label={isExpanded ? 'Collapse panel' : 'Expand panel'}
            title={isExpanded ? 'Collapse panel' : 'Expand panel'}
          >
            <Sparkles size={16} className="gemini-sparkle-icon" />
            <span className="dv">Gemini Assistant</span>
            {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>

          <form
            className="drawer-form"
            onSubmit={(e) => {
              e.preventDefault()
              handleSendQuestion(inputVal)
            }}
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={`Ask Gemini anything about ${scenario.realdhaId} (e.g. title chain, bank NOC, carpet area)...`}
              aria-label="Ask Gemini Property Assistant"
              className="drawer-input"
            />
            <button type="submit" className="btn btn-ask" aria-label="Send query">
              <Send size={15} />
              <span>Ask</span>
            </button>
          </form>
        </div>

        {/* Suggested Chips Bar */}
        <div className="drawer-chips-bar">
          <span className="chips-hint">Suggested Questions:</span>
          {scenario.chips.map((chip, idx) => (
            <button
              key={idx}
              className="chip"
              onClick={() => handleSendQuestion(chip)}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
