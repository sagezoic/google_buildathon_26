import { Check, Loader2, X } from 'lucide-react'
import { Pill } from '../../components/ui/pill'

import type { TokState } from './f17-lib'
export function TokPill({ s }: { s: TokState }) {
  if (s === 'minted') return <Pill tone="success" icon={<Check className="size-3" />}>Minted</Pill>
  if (s === 'pending') return <Pill tone="warning" icon={<Loader2 className="size-3" />}>Pending</Pill>
  return <Pill tone="danger" icon={<X className="size-3" />}>Failed</Pill>
}
