import { Link } from 'react-router'
import { FLOWS, SCREENS } from './screens'
import { path } from './nav'
import { REGISTRY } from './registry'
import { clearPersisted } from './persist'

/** Dev-only prototype flow index (P-00). */
export default function FlowIndex() {
  const flows = Object.keys(FLOWS)
  const built = SCREENS.filter((s) => REGISTRY[s.slug]).length
  return (
    <div className="min-h-dvh bg-canvas">
      <div className="mx-auto flex max-w-[1100px] flex-col gap-8 px-6 py-10">
        <div>
          <h1 className="text-h1 font-semibold">Prototype: choose a flow</h1>
          <p className="text-body text-muted">Developer index of every route. Not linked from the product. {built} of {SCREENS.length} screens built.</p>
          <button type="button" className="mt-3 cursor-pointer text-small text-primary-text underline" onClick={() => { clearPersisted(); location.reload() }}>Clear saved sample entries</button>
        </div>
        {flows.map((f) => {
          const list = SCREENS.filter((s) => s.flow === f)
          return (
            <section key={f} className="rounded-card border border-line bg-surface p-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-h3 font-semibold">{f} · {FLOWS[f]}</h2>
                <Link to={path(list[0].id)}>Start flow →</Link>
              </div>
              <ul className="flex flex-wrap gap-2">
                {list.map((s) => (
                  <li key={s.id}>
                    <Link to={path(s.id)} title={s.title} className="inline-flex items-center gap-1.5 rounded-control border border-line-strong px-2 py-1 font-mono text-label no-underline hover:bg-primary-tint">
                      {s.id}{!REGISTRY[s.slug] && <span className="text-muted" aria-label="not built yet"> ○</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>
    </div>
  )
}
