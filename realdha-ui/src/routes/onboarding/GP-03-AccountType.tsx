import { Link, useNavigate } from 'react-router'
import { usePersistentState } from '../../app/persist'
import { K } from '../../lib/identity-flow'
import { Screen } from '../../app/Shell'
import { path } from '../../app/nav'
import { Button } from '../../components/ui/button'
import { cn } from '../../lib/cn'

interface Opt { id: string; title: string; d: string; m: string }

const ACCOUNTS: Opt[] = [
  { id: 'retail', title: 'Retail', d: 'Buyers, investors, NRIs, landowners and sellers.', m: 'Buyer, investor, NRI, landowner or seller' },
  { id: 'business', title: 'Business', d: 'Developers, brokers, lawyers, valuers and government bodies.', m: 'Developer, broker, lawyer or government' },
]
const ROLES: Opt[] = [
  { id: 'developer', title: 'Developer', d: 'List projects and manage inventory.', m: 'Create projects and units' },
  { id: 'broker', title: 'Channel partner / broker', d: 'Share verified listings with clients.', m: 'Share units and log leads' },
  { id: 'lawyer', title: 'Lawyer / valuer', d: 'Review and sign off documents.', m: 'Review and sign off files' },
  { id: 'gov', title: 'Government body', d: 'Read-only access to records.', m: 'Read-only lookup' },
]

function Radio({ name, opt, on, set, small }: { name: string; opt: Opt; on: boolean; set: () => void; small?: boolean }) {
  return (
    <label className={cn('flex min-h-11 cursor-pointer items-start gap-3.5 rounded-card border bg-surface p-4 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus xl:p-5', small && 'xl:p-4', on ? 'border-2 border-primary bg-primary-tint p-[15px] xl:p-[19px]' : 'border-line-strong')}>
      <input type="radio" name={name} checked={on} onChange={set} className="sr-only" />
      <span aria-hidden className={cn('mt-0.5 hidden size-5 flex-none rounded-full bg-surface xl:block', on ? 'border-[6px] border-primary' : 'border-2 border-muted')} />
      <span>
        <span className={cn('block font-semibold', small ? 'text-control xl:text-control' : 'text-control xl:text-[17px] xl:leading-6')}>{opt.title}</span>
        <span className={cn('block text-chip text-muted', !small && 'xl:text-small')}><span className="xl:hidden">{opt.m}</span><span className="max-xl:hidden">{opt.d}</span></span>
      </span>
    </label>
  )
}

/** GP-03 · Account type. Business reveals the role picker (in-frame, not a separate state). */
export default function AccountType() {
  const nav = useNavigate()
  const [acctRaw, setAcct] = usePersistentState(K.accountType, 'business')
  const [roleRaw, setRole] = usePersistentState(K.businessRole, 'developer')
  const acct = ACCOUNTS.some((o) => o.id === acctRaw) ? acctRaw : 'business'
  const role = ROLES.some((o) => o.id === roleRaw) ? roleRaw : 'developer'
  const biz = acct === 'business'
  return (
    <Screen id="GP-03" layout="auth" noTabs>
      <div className="flex flex-1 justify-center px-4 pt-4 pb-8">
        <div className="flex w-full max-w-[760px] flex-col gap-4 xl:gap-5">
          <p className="text-label font-semibold tracking-[0.06em] text-muted uppercase max-xl:hidden">Step 2 of 3 · Account type</p>
          <h1 className="text-h2 xl:text-h1">How will you use Realdha?</h1>
          <div role="radiogroup" aria-label="Account type" className="flex flex-col gap-3 xl:flex-row xl:gap-4">
            {ACCOUNTS.map((o) => <div key={o.id} className="xl:flex-1 [&>label]:h-full"><Radio name="acct" opt={o} on={acct === o.id} set={() => setAcct(o.id)} /></div>)}
          </div>
          {biz && (
            <div className="flex flex-col gap-3 xl:rounded-card xl:border xl:border-line xl:bg-surface xl:p-5">
              <h2 className="text-label font-semibold tracking-[0.06em] text-muted uppercase xl:text-control xl:tracking-normal xl:text-text xl:normal-case xl:leading-[22px]">
                <span className="xl:hidden">Business role</span><span className="max-xl:hidden">Choose your role</span>
              </h2>
              <div role="radiogroup" aria-label="Business role" className="grid gap-3 xl:grid-cols-2">
                {ROLES.map((o) => <Radio key={o.id} name="role" opt={o} small on={role === o.id} set={() => setRole(o.id)} />)}
              </div>
              <p className="text-label text-muted max-xl:hidden">Business accounts need organisation details and KYC before they can publish.</p>
            </div>
          )}
          <div className="flex items-center justify-between max-xl:flex-col-reverse max-xl:gap-3">
            <Link to={path('GP-02')} className="text-small max-xl:hidden">Back</Link>
            <Button size="lg" onClick={() => { setAcct(acct); setRole(role); nav(path('GP-04')) }} className="max-xl:w-full xl:px-8">Continue</Button>
          </div>
        </div>
      </div>
    </Screen>
  )
}
