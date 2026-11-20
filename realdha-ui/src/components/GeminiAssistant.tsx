import { Send } from 'lucide-react'
import type { Scenario } from '../data/scenarios'

interface GeminiAssistantProps {
  scenario: Scenario
}

export function GeminiAssistant({ scenario }: GeminiAssistantProps) {
  return (
    <footer className="assistant">
      <div className="assistant-row">
        <span className="dv" style={{ fontSize: '20px' }}>
          Gemini property assistant
        </span>
        <input
          type="text"
          placeholder={`Ask about ${scenario.realdhaId}…`}
          aria-label="Ask Gemini"
          className="assistant-input"
        />
        <button className="btn btn-ask">
          <Send size={16} />
          Ask
        </button>
      </div>
      <div className="assistant-chips">
        {scenario.chips.map((chip, i) => (
          <button key={i} className="chip">
            {chip}
          </button>
        ))}
      </div>
    </footer>
  )
}
