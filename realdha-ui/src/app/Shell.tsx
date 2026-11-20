import { ArrowLeft, Bell, Moon, Sun } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router'
import { cn } from '../lib/cn'
import { FLOWS, type Role } from './screens'
import { INITIALS, NAV, activePath, path, screenById } from './nav'
import { usePrefs, type Lang } from './prefs'

const LANGS: { id: Lang; label: string }[] = [
  { id: 'en', label: 'EN' },
  { id: 'hi', label: 'हिं' },
  { id: 'mr', label: 'मरा' },
]

export function LangSwitch({ className }: { className?: string }) {
  const { lang, setLang } = usePrefs()
  return (
    <div role="group" aria-label="Language" className={cn('flex overflow-hidden rounded-control border border-line-strong bg-surface text-label font-medium', className)}>
      {LANGS.map((l) => (
        <button
          key={l.id}
          type="button"
          lang={l.id}
          aria-pressed={lang === l.id}
          onClick={() => setLang(l.id)}
          className={cn('cursor-pointer px-2.5 py-1.5', lang === l.id ? 'bg-primary text-on-primary' : 'text-text hover:bg-primary-tint')}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}

export function ThemeToggle() {
  const { theme, toggleTheme } = usePrefs()
  return (
    <button type="button" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'} className="inline-flex size-9 cursor-pointer items-center justify-center rounded-control text-muted hover:bg-primary-tint">
      {theme === 'dark' ? <Sun className="size-[18px]" aria-hidden /> : <Moon className="size-[18px]" aria-hidden />}
    </button>
  )
}

function Avatar({ initials }: { initials: string }) {
  return <div aria-label="Account" className="flex size-8 items-center justify-center rounded-full bg-primary-tint text-label font-semibold text-on-primary-tint max-md:size-9">{initials}</div>
}

export function TopNav({ role, active, unread = 2, initials = INITIALS[role] }: { role: Role; active?: string; unread?: number; initials?: string }) {
  const items = NAV[role]
  return (
    <header className="hidden h-14 items-center gap-7 border-b border-line bg-surface px-5 md:flex">
      <Link to="/" className="text-xl font-semibold tracking-[-0.02em] text-brand no-underline">Realdha</Link>
      <nav aria-label="Primary" className="flex gap-7 self-stretch">
        {items.map((i) => (
          <NavLink key={i.to} to={i.to} aria-current={active === i.to ? 'page' : undefined} className={({ isActive }) => cn('flex items-center border-b-[3px] text-small no-underline', (active ? active === i.to : isActive) ? 'border-primary font-semibold text-brand' : 'border-transparent text-text hover:text-brand')}>
            {i.label}
          </NavLink>
        ))}
      </nav>
      <div className="ml-auto flex items-center gap-3.5">
        <LangSwitch />
        <ThemeToggle />
        <Link to={path('X-02')} aria-label={`Notifications, ${unread} unread`} className="relative flex p-1 text-text">
          <Bell className="size-5" aria-hidden />
          {unread > 0 && <span className="absolute top-0 right-0 min-w-4 rounded-full bg-danger px-1 text-center text-[10px] leading-4 font-semibold text-on-status">{unread}</span>}
        </Link>
        <Link to={path('X-03')} className="no-underline"><Avatar initials={initials} /></Link>
      </div>
    </header>
  )
}

/** 390 top bar. With `back` it shows a back arrow and the screen title, as the mobile frames do. */
export function MobileBar({ initials = 'PK', title, back }: { initials?: string; title?: string; back?: string }) {
  return (
    <header className="flex h-14 flex-none items-center gap-2.5 border-b border-line bg-surface px-4 md:hidden">
      {back && (
        <Link to={back} aria-label="Back" className="-ml-2 flex size-11 items-center justify-center text-text">
          <ArrowLeft className="size-5" aria-hidden />
        </Link>
      )}
      {back && title ? (
        <span className="truncate text-h3 font-semibold">{title}</span>
      ) : (
        <Link to="/" className="text-xl font-semibold tracking-[-0.02em] text-brand no-underline">Realdha</Link>
      )}
      <div className="ml-auto flex items-center gap-2">
        {!back && <LangSwitch className="text-xs" />}
        <ThemeToggle />
        {initials && <Avatar initials={initials} />}
      </div>
    </header>
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
    <div className="flex min-h-dvh flex-col bg-canvas text-text">
      {layout === 'auth' ? (
        <>
          <header className="flex items-center justify-between px-4 py-4 md:px-12 md:py-5">
            <Link to="/" className="text-xl font-semibold tracking-[-0.02em] text-brand no-underline md:text-2xl">Realdha</Link>
            <div className="flex items-center gap-2"><LangSwitch /><ThemeToggle /></div>
          </header>
        </>
      ) : (
        <>
          <TopNav role={r} active={activePath(id)} />
          <MobileBar initials={INITIALS[r]} back={back} title={title} />
        </>
      )}
      <main id="main" className={cn('flex flex-1 flex-col', className)} data-screen={id} data-flow={def ? FLOWS[def.flow] : undefined}>
        {children}
      </main>
      {layout === 'app' && !noTabs && <TabBar role={r} active={activePath(id)} />}
    </div>
  )
}
