import { CheckCircle2, ShieldCheck, TriangleAlert, XCircle, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

const TONES = {
  clarify: { box: 'border-warning bg-warning-tint text-warning-ink', Icon: TriangleAlert },
  proceed: { box: 'border-success bg-success-tint text-success-ink', Icon: CheckCircle2 },
  stop: { box: 'border-danger bg-danger-tint text-danger-ink', Icon: XCircle },
  chain: { box: 'border-chain bg-chain-tint text-chain-ink', Icon: ShieldCheck },
} satisfies Record<string, { box: string; Icon: LucideIcon }>

/** Verdict banner (Clarify / Proceed / Stop). Icon + word + colour; never colour alone. */
export function VerdictBanner({ tone, title, children, aside, className }: {
  tone: keyof typeof TONES
  title: ReactNode
  children?: ReactNode
  aside?: ReactNode
  className?: string
}) {
  const { box, Icon } = TONES[tone]
  return (
    <div className={cn('flex items-start gap-2.5 rounded-card border p-3.5 md:gap-3.5 md:px-[22px] md:py-[18px]', box, className)}>
      <Icon className="mt-0.5 size-6 flex-none md:mt-1 md:size-7" aria-hidden />
      <div className="min-w-0 flex-1">
        <div className="text-h3 font-bold md:text-h2 md:font-semibold">{title}</div>
        {children && <div className="text-small text-text md:text-body md:leading-[22px]">{children}</div>}
      </div>
      {aside}
    </div>
  )
}
