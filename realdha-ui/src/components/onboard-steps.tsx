import { JOURNEYS } from '../app/journeys'
import { STEP_INDEX, STEP_LABELS, useIntent, type OnboardStep } from '../lib/onboard-intent'
import { Stepper } from './ui/stepper'

/** Progress through sign-in, KYC and the DigiLocker fetch. Renders only when a persona was picked on `/`. */
export function OnboardSteps({ step }: { step: Exclude<OnboardStep, 'home'> }) {
  const role = useIntent()
  if (!role) return null
  const steps = [...STEP_LABELS, JOURNEYS[role].name.replace(/^I /, 'You ')]
  const n = STEP_INDEX[step]
  return (
    <div className="w-full">
      <Stepper steps={steps} current={n} className="max-w-none max-md:hidden" />
      <p className="text-label font-semibold tracking-[0.06em] text-muted uppercase md:hidden">
        Step {n} of {steps.length} · {steps[n - 1]}
      </p>
    </div>
  )
}
