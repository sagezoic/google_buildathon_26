import { CircleCheck, Clock, TriangleAlert } from 'lucide-react'
import { Pill } from '../../components/ui/pill'
import type { Unit } from '../../data/fixtures/f11-buyer'

const ICON = { success: <CircleCheck className="size-3.5" />, warning: <TriangleAlert className="size-3.5" />, neutral: undefined }

/** Unit document status: icon + word, never colour alone. */
export function UnitStatus({ unit }: { unit: Unit }) {
  return <Pill tone={unit.status.tone} icon={ICON[unit.status.tone]}>{unit.status.label}</Pill>
}
export function UnitExtra({ unit }: { unit: Unit }) {
  if (!unit.extra) return null
  return <Pill tone={unit.extra.tone} icon={unit.extra.tone === 'neutral' ? <Clock className="size-3.5" /> : undefined}>{unit.extra.label}</Pill>
}
