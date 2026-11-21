import { ArrowRight, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useActiveRole } from '../app/active-role'
import { JOURNEYS, type JourneyRole } from '../app/journeys'
import { path } from '../app/nav'
import { Screen } from '../app/Shell'
import { Button } from '../components/ui/button'

const ORDER: JourneyRole[] = ['owner', 'developer', 'buyer']

const ALSO: { label: string; to: string }[] = [
  { label: 'Lawyer sign-off queue', to: path('GP-13') },
  { label: 'Channel partner', to: path('F16-01') },
  { label: 'Admin console', to: path('GP-23') },
  { label: 'Government record check', to: path('F20-01') },
]

/** Front door: pick a role, land on that role's first screen. */
export default function Start() {
  const navigate = useNavigate()
  const [, setActiveRole] = useActiveRole()

  const begin = (role: JourneyRole) => {
    if (role === 'owner' || role === 'buyer') setActiveRole(role)
    navigate(JOURNEYS[role].home)
  }

  return (
    <Screen id="X-00" layout="auth">
      <div className="mx-auto flex w-full max-w-[920px] flex-col gap-8 px-4 py-10 md:px-8 xl:py-16">
        <header className="flex max-w-2xl flex-col gap-3">
          <h1 className="text-h1 font-bold tracking-tight text-text text-balance sm:text-display">
            One permanent record for every property in India
          </h1>
          <p className="text-body text-muted">
            AI checks the documents, a lawyer signs off, and fingerprints are anchored on a blockchain. Choose a role to
            see it from that side.
          </p>
        </header>

        <ul className="flex flex-col gap-4">
          {ORDER.map((role) => {
            const j = JOURNEYS[role]
            return (
              <li
                key={role}
                className="grid gap-5 rounded-card border border-line bg-surface p-5 shadow-e1 md:grid-cols-[1fr_auto] md:items-center md:p-6"
              >
                <div className="flex min-w-0 flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-h2 font-semibold text-text">{j.name}</h2>
                    <p className="max-w-xl text-small text-muted">{j.outcome}</p>
                  </div>
                  <ol className="flex flex-wrap items-center gap-x-1 gap-y-1 text-chip font-medium text-text">
                    {j.stages.map((s, i) => (
                      <li key={s.label} className="flex items-center gap-1">
                        {i > 0 && <ChevronRight className="size-3.5 text-muted" aria-hidden />}
                        <span className="rounded-control bg-sunken px-2 py-0.5">{s.label}</span>
                      </li>
                    ))}
                  </ol>
                </div>
                <Button size="lg" onClick={() => begin(role)} icon={<ArrowRight className="size-4" />} className="md:min-w-48">
                  {j.cta}
                </Button>
              </li>
            )
          })}
        </ul>

        <section aria-labelledby="also" className="flex flex-col gap-2">
          <h2 id="also" className="text-small font-semibold text-text">
            Also in the product
          </h2>
          <div className="flex flex-wrap gap-2">
            {ALSO.map((a) => (
              <Button key={a.to} variant="secondary" size="sm" to={a.to}>
                {a.label}
              </Button>
            ))}
          </div>
        </section>

        <p className="text-label text-muted">
          All records are sample data. Anchoring runs on the Sepolia test network.
        </p>
      </div>
    </Screen>
  )
}
