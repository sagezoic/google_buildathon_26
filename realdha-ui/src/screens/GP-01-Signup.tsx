import { Mail, Smartphone } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { useState } from 'react'
import { usePersistentState } from '../app/persist'
import { K } from '../lib/identity-flow'
import { Modal } from '../components/ui/modal'
import { Screen } from '../app/Shell'
import { path } from '../app/nav'
import { Button } from '../components/ui/button'

/** GP-01 · Sign up. 1440: centred card. 390: full-width page with the mobile headline. */
export default function Signup() {
  const [, setMethod] = usePersistentState<string>(K.signupMethod, '')
  const nav = useNavigate()
  const go = (m: string, id: string) => { setMethod(m); nav(path(id)) }
  const [doc, setDoc] = useState<'Terms' | 'Privacy Policy' | null>(null)
  return (
    <Screen id="GP-01" layout="auth">
      <div className="flex flex-1 items-start justify-center px-4 pt-6 md:items-center md:pt-0">
        <div className="flex w-full max-w-[440px] flex-col gap-4 md:rounded-card md:border md:border-line md:bg-surface md:p-8 md:shadow-e1">
          <div className="flex flex-col gap-2">
            <h1 className="text-h1 font-semibold">
              <span className="md:hidden">One permanent record for every property</span>
              <span className="max-md:hidden">Create your account</span>
            </h1>
            <p className="text-body text-muted max-md:text-control">
              <span className="md:hidden">Documents checked, lawyer signed off, proof anchored. Start with your phone.</span>
              <span className="max-md:hidden">One permanent, verified record for every property you own or buy.</span>
            </p>
          </div>
          <Button size="lg" block onClick={() => go('phone', 'GP-02')} icon={<Smartphone className="size-[18px]" aria-hidden />}>Continue with phone</Button>
          <Button size="lg" block variant="secondary" onClick={() => go('email', 'F01-02')} icon={<Mail className="size-[18px]" aria-hidden />}>Continue with email</Button>
          <Button size="lg" block variant="secondary" onClick={() => go('google', 'F01-05')} icon={<span aria-hidden className="flex size-5 items-center justify-center rounded-full border-[1.5px] border-muted text-label font-semibold">G</span>}>Continue with Google</Button>
          <p className="text-center text-small text-muted">Already have an account? <Link to={path('F01-01')} className="font-medium">Sign in</Link></p>
          <p className="border-t border-line pt-3.5 text-center text-label text-muted max-md:hidden">
            By continuing you agree to the <button type="button" onClick={() => setDoc('Terms')} className="cursor-pointer text-brand underline">Terms</button> and <button type="button" onClick={() => setDoc('Privacy Policy')} className="cursor-pointer text-brand underline">Privacy Policy</button>.
          </p>
        </div>
      </div>
      <Modal open={doc !== null} onOpenChange={(o) => !o && setDoc(null)} title={doc ?? ''}>
        <p className="text-small text-muted">Sample text. The full {doc} is published before launch.</p>
      </Modal>
    </Screen>
  )
}
