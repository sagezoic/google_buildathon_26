import * as Dialog from '@radix-ui/react-dialog'
import { Lock, X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { Screen } from '../../app/Shell'
import { path } from '../../app/nav'
import { usePersistentState } from '../../app/persist'
import { Button } from '../../components/ui/button'
import { K, type KycStatus } from '../../lib/identity-flow'

/** F02-02 · "Complete KYC to continue" gate over a property page. Opens for unverified users, or with `?state=modal`. */
export default function KYCModal() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const [kyc] = usePersistentState<KycStatus>(K.kycStatus, 'none')
  const verified = kyc === 'verified'
  const st = params.get('state')
  const [open, setOpen] = useState(st === 'modal' || (st !== 'closed' && !verified))
  const anchor = () => (verified ? nav(path('GP-15')) : setOpen(true))

  return (
    <Screen id="F02-02" back={path('F03-03')} title="Property">
      <div className="flex flex-col gap-4 p-4 md:px-12 md:py-8">
        <h1 className="text-h1 font-semibold"><span className="xl:hidden">A-1804 · 3 BHK</span><span className="max-xl:hidden">Plot · Gat 112/2 · Kusgaon</span></h1>
        <div className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4 shadow-e1 md:flex-row md:items-center md:justify-between md:p-6">
          <span>Anchor on-chain · waiting for you</span>
          <Button onClick={anchor} className="max-md:w-full">Anchor on-chain</Button>
        </div>
      </div>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-scrim" />
          <Dialog.Content aria-describedby="kyc-gate-desc" className="fixed inset-x-0 bottom-0 z-50 flex flex-col gap-3.5 rounded-t-modal bg-surface p-6 shadow-e3 outline-none md:inset-x-auto md:top-1/2 md:bottom-auto md:left-1/2 md:w-[440px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-modal">
            <div className="flex items-start justify-between">
              <span aria-hidden className="flex size-12 items-center justify-center rounded-full bg-warning-tint text-warning-ink"><Lock className="size-5" /></span>
              <Dialog.Close aria-label="Close" className="-mt-2 -mr-2 inline-flex size-11 cursor-pointer items-center justify-center rounded-control text-muted hover:bg-primary-tint"><X className="size-[18px]" aria-hidden /></Dialog.Close>
            </div>
            <Dialog.Title className="text-h3">Complete KYC to continue</Dialog.Title>
            <Dialog.Description id="kyc-gate-desc" className="text-small text-muted">
              <span className="md:hidden">Anchoring on-chain needs a verified identity.</span>
              <span className="max-md:hidden">Anchoring on-chain needs a verified identity. It takes about 2 minutes: your PAN and DigiLocker.</span>
            </Dialog.Description>
            <div className="flex gap-3 max-md:flex-col-reverse">
              <Button size="lg" block variant="secondary" onClick={() => nav(path('GP-06'))}>Not now</Button>
              <Button size="lg" block onClick={() => nav(path('GP-04'))}>Start KYC</Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </Screen>
  )
}
