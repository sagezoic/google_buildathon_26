import { cn } from '../../lib/cn'

const fmtPct = (p: number, digits = 2) => (p > 0 ? '+' : p < 0 ? '−' : '') + Math.abs(p).toFixed(digits) + '%'

/** Change with arrow + sign + colour (never colour alone). */
export function Delta({ pct, digits = 2, className, suffix }: { pct: number; digits?: number; className?: string; suffix?: string }) {
  const tone = pct > 0 ? 'text-success-ink' : pct < 0 ? 'text-danger-ink' : 'text-muted'
  return (
    <span className={cn('font-semibold tabular', tone, className)}>
      <span aria-hidden>{pct > 0 ? '▲' : pct < 0 ? '▼' : '–'}</span> {fmtPct(pct, digits)}{suffix}
      <span className="sr-only">{pct > 0 ? ' up' : pct < 0 ? ' down' : ' unchanged'}</span>
    </span>
  )
}

export function Sparkline({ values, pct, className }: { values: number[]; pct: number; className?: string }) {
  const pts = values.map((y, i) => `${(2 + i * 11.4).toFixed(1)},${(2 + y).toFixed(1)}`).join(' ')
  const tone = pct > 0 ? 'text-success' : pct < 0 ? 'text-danger' : 'text-muted'
  return (
    <svg width="84" height="32" viewBox="0 0 84 32" fill="none" aria-hidden className={cn('flex-none', tone, className)}>
      <polyline points={pts} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

