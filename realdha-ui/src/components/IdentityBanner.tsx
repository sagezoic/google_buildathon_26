import { ShieldCheck, AlertTriangle } from 'lucide-react'
import type { Scenario } from '../data/scenarios'

interface IdentityBannerProps {
  scenario: Scenario
}

export function IdentityBanner({ scenario }: IdentityBannerProps) {
  return (
    <section className="identity-banner">
      <div className="identity-main">
        <h1 className="identity-title">
          {scenario.unit}
          <span>
            {scenario.tower !== '—' ? `${scenario.tower}, ` : ''}
            {scenario.floor !== '—' ? `${scenario.floor} · ` : ''}
            {scenario.project}, {scenario.location}
          </span>
        </h1>
      </div>

      <div className="identity-kv-group">
        <div className="kv n">
          <i>REALDHA ID</i>
          <strong>{scenario.realdhaId}</strong>
        </div>

        <div className="kv n">
          <i>MAHARERA NO.</i>
          <strong>{scenario.mahaRera}</strong>
        </div>

        <div className="kv n">
          <i>ASKING PRICE</i>
          <strong className="asking-price">{scenario.asking}</strong>
        </div>

        <div className="kv">
          <i>AUDIT VERDICT</i>
          <div className="banner-verdict-pill" style={{ color: scenario.stamp.stampColor, borderColor: scenario.stamp.stampColor }}>
            {scenario.stamp.type === 'clear' ? <ShieldCheck size={14} /> : <AlertTriangle size={14} />}
            <span>{scenario.stamp.title.split('·')[0]}</span>
          </div>
        </div>
      </div>

      <div className="identity-right">
        <span className="demo-tag" title="Verified prototype record for Google Buildathon India 2026">
          {scenario.tag}
        </span>
      </div>
    </section>
  )
}
