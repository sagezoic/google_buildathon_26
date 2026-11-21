import type { ReactNode } from 'react'
import { NavLink } from 'react-router'
import { cn } from '../lib/cn'
import { FLOWS, type Role } from './screens'
import { INITIALS, NAV, activePath, screenById } from './nav'
import { SiteHeader, LangSwitch, ThemeToggle } from '../components/SiteHeader'

export { LangSwitch, ThemeToggle }

/**
 * TopNav (backward compatibility wrapper): delegates to SiteHeader (shadcn dashboard-01).
 */
export function TopNav({
  role,
  active,
  unread = 2,
  initials = INITIALS[role],
}: {
  role: Role
  active?: string
  unread?: number
  initials?: string
}) {
  return (
    <SiteHeader
      role={role}
      active={active}
      unread={unread}
      initials={initials}
      className="hidden md:flex"
    />
  )
}

/**
 * MobileBar (backward compatibility wrapper): delegates to SiteHeader.
 */
export function MobileBar({
  initials = 'PK',
  title,
  back,
}: {
  initials?: string
  title?: string
  back?: string
}) {
  return (
    <SiteHeader
      initials={initials}
      title={title}
      back={back}
      className="flex md:hidden"
    />
  )
}

export function TabBar({ role, active }: { role: Role; active?: string }) {
  const items = NAV[role]
  if (!items.length) return null
  return (
    <nav aria-label="Primary" className="sticky bottom-0 flex h-16 flex-none border-t border-line bg-surface md:hidden">
      {items.map((i) => (
        <NavLink key={i.to} to={i.to} aria-current={active === i.to ? 'page' : undefined} className={({ isActive }) => cn('flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] leading-[14px] no-underline', (active ? active === i.to : isActive) ? 'font-semibold text-brand' : 'text-muted')}>
          {i.tab ?? i.label}
        </NavLink>
      ))}
    </nav>
  )
}

interface ScreenProps {
  id: string
  /** `auth` = logo + language switch only (sign-up screens). `app` = role nav. */
  layout?: 'auth' | 'app'
  role?: Role
  children: ReactNode
  className?: string
  /** Hide the 390 bottom tabs (focus tasks such as OTP, upload). */
  noTabs?: boolean
  /** 390 only: show a back arrow to this route plus `title` in the top bar, as the mobile frames do. */
  back?: string
  title?: string
}

/** One responsive screen per frame ID: wraps content in the DEMO bar, nav and page chrome. */
export function Screen({ id, layout = 'app', role, children, className, noTabs, back, title }: ScreenProps) {
  const def = screenById(id)
  const r = role ?? def?.role ?? 'owner'
  return (
    // h-dvh + overflow-y-auto: legacy-aliases.css locks html/body/#root to overflow:hidden, so each screen scrolls itself.
    <div className="flex h-dvh flex-col overflow-y-auto bg-canvas text-text">
      <SiteHeader
        layout={layout}
        role={r}
        active={activePath(id)}
        initials={INITIALS[r]}
        back={back}
        title={title}
      />
      <main id="main" className={cn('flex flex-1 flex-col', className)} data-screen={id} data-flow={def ? FLOWS[def.flow] : undefined}>
        {children}
      </main>
      {layout === 'app' && !noTabs && <TabBar role={r} active={activePath(id)} />}
    </div>
  )
}
