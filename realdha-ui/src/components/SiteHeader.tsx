import * as React from 'react'
import {
  ArrowLeft,
  Bell,
  Building2,
  Check,
  ChevronDown,
  FileCheck,
  LogOut,
  Menu,
  Moon,
  Plus,
  Settings,
  Shield,
  Sparkles,
  Sun,
  UserCheck,
  Users,
} from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router'
import { cn } from '../lib/cn'
import { type Role } from '../app/screens'
import { NAV, INITIALS, path } from '../app/nav'
import { useActiveRole } from '../app/active-role'
import { usePrefs, type Lang } from '../app/prefs'
import { useT } from '../app/i18n'
import { Button } from './ui/button'
import { PlaceSearch } from './place-search'
import { Badge } from './ui/badge'
import { useRunSearch } from '../routes/parts/search'
import { Avatar, AvatarFallback } from './ui/avatar'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from './ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

const ROLE_PROFILES: Record<
  Role,
  { name: string; title: string; route: string; icon: React.ReactNode }
> = {
  public: {
    name: 'Guest Visitor',
    title: 'Public Viewer',
    route: path('X-01'),
    icon: <Users className="size-4" />,
  },
  owner: {
    name: 'Pradeep Kulkarni',
    title: 'Property Owner',
    route: path('X-01'),
    icon: <Building2 className="size-4" />,
  },
  buyer: {
    name: 'Bhavna Patel',
    title: 'Due Diligence Buyer',
    route: path('X-01'),
    icon: <Users className="size-4" />,
  },
  lawyer: {
    name: 'Adv. Meera Joshi',
    title: 'Legal Counsel',
    route: path('GP-13'),
    icon: <FileCheck className="size-4" />,
  },
  developer: {
    name: 'Deepak Verma',
    title: 'Developer (Godrej)',
    route: path('F15-01'),
    icon: <Building2 className="size-4" />,
  },
  partner: {
    name: 'Chetan Parekh',
    title: 'Channel Partner',
    route: path('F16-01'),
    icon: <Users className="size-4" />,
  },
  admin: {
    name: 'Anand Deshmukh',
    title: 'Platform Administrator',
    route: path('GP-23'),
    icon: <Shield className="size-4" />,
  },
  government: {
    name: 'G. V. Kadam',
    title: 'IGR Maharashtra Inspector',
    route: path('F20-01'),
    icon: <UserCheck className="size-4" />,
  },
}

const ROLE_LABEL: Record<Role, string> = {
  public: 'Guest',
  owner: 'Owner',
  buyer: 'Buyer',
  developer: 'Developer',
  partner: 'Channel partner',
  lawyer: 'Lawyer',
  admin: 'Admin',
  government: 'Government',
}

const ROLE_GROUPS: { label: string; roles: Role[] }[] = [
  { label: 'Walk-throughs', roles: ['owner', 'developer', 'buyer'] },
  { label: 'Also in the product', roles: ['lawyer', 'partner', 'admin', 'government'] },
]

/** Always-visible role switcher: shows who the visitor is viewing as and lists every role. */
function RoleMenu({ role, onPick, onStart }: { role: Role; onPick: (r: Role) => void; onStart: () => void }) {
  const t = useT()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`${t('Viewing as')} ${t(ROLE_LABEL[role])}. ${t('Switch role')}`}
        className="hidden h-9 shrink-0 cursor-pointer items-center gap-2 rounded-control border border-line-strong bg-surface px-2.5 text-chip font-medium text-text transition-colors hover:bg-primary-tint md:flex"
      >
        {ROLE_PROFILES[role]?.icon}
        <span className="max-xl:hidden">{t('Viewing as')} {t(ROLE_LABEL[role])}</span>
        <ChevronDown className="size-3 text-muted" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 p-1.5">
        {ROLE_GROUPS.map((g) => (
          <React.Fragment key={g.label}>
            <DropdownMenuLabel className="px-2.5 py-1 text-xs font-semibold text-muted">{t(g.label)}</DropdownMenuLabel>
            {g.roles.map((r) => (
              <DropdownMenuItem key={r} onSelect={() => onPick(r)} className="justify-between">
                <span className="flex items-center gap-2">
                  {ROLE_PROFILES[r]?.icon}
                  {t(ROLE_LABEL[r])}
                </span>
                {role === r && <Check className="size-4 text-primary-text" aria-hidden />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </React.Fragment>
        ))}
        <DropdownMenuItem onSelect={onStart}>{t('Choose a role from the start screen')}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const LANGS: { id: Lang; label: string }[] = [
  { id: 'en', label: 'EN' },
  { id: 'hi', label: 'हिं' },
  { id: 'mr', label: 'मरा' },
]

export function LangSwitch({ className }: { className?: string }) {
  const { lang, setLang } = usePrefs()
  const t = useT()
  return (
    <div
      role="group"
      aria-label={t('Language')}
      className={cn(
        'flex h-8 items-center overflow-hidden rounded-control border border-line-strong bg-surface text-label font-medium shrink-0',
        className,
      )}
    >
      {LANGS.map((l) => (
        <button
          key={l.id}
          type="button"
          lang={l.id}
          aria-pressed={lang === l.id}
          onClick={() => setLang(l.id)}
          className={cn(
            'flex h-full items-center cursor-pointer px-2 text-xs transition-colors',
            lang === l.id
              ? 'bg-primary text-on-primary font-semibold'
              : 'text-text hover:bg-primary-tint',
          )}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = usePrefs()
  const t = useT()
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={t(theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme')}
      className={cn(
        'inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-control text-muted transition-colors hover:bg-primary-tint hover:text-text',
        className,
      )}
    >
      {theme === 'dark' ? (
        <Sun className="size-4" aria-hidden />
      ) : (
        <Moon className="size-4" aria-hidden />
      )}
    </button>
  )
}

export interface SiteHeaderProps {
  layout?: 'auth' | 'app'
  role?: Role
  active?: string
  unread?: number
  initials?: string
  title?: string
  back?: string
  className?: string
  onSearch?: (query: string) => void
}

export function SiteHeader({
  layout = 'app',
  role = 'owner',
  active,
  unread = 2,
  initials = INITIALS[role] || 'PK',
  title,
  back,
  className,
  onSearch,
}: SiteHeaderProps) {
  const navigate = useNavigate()
  const t = useT()
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const runSearch = useRunSearch()

  // Keep "Market", remove only "Search" text link (since search bar is present) and "Marketplace"
  const items = (NAV[role] || []).filter(
    (item) => item.label !== 'Search' && item.label !== 'Marketplace',
  )
  const currentProfile = ROLE_PROFILES[role] || ROLE_PROFILES.owner

  const handleSearchSubmit = (q: string) => {
    if (onSearch) onSearch(q)
    else runSearch(q)
  }

  const [, setActiveRole] = useActiveRole()
  const handleRoleSwitch = (newRole: Role) => {
    const profile = ROLE_PROFILES[newRole]
    if (profile) {
      if (newRole === 'owner' || newRole === 'buyer') setActiveRole(newRole)
      setMobileOpen(false)
      navigate(profile.route)
    }
  }

  // Consistent auth header: exact same 64px height, padding, and alignment as the main app header
  if (layout === 'auth') {
    return (
      <header
        className={cn(
          'sticky top-0 z-40 flex h-16 min-h-16 max-h-16 w-full flex-none shrink-0 items-center justify-between border-b border-line bg-surface/95 px-4 backdrop-blur-xs md:px-6 box-border flex-nowrap select-none',
          className,
        )}
      >
        <Link
          to="/"
          className="flex items-center gap-2.5 text-lg font-semibold tracking-[-0.02em] text-brand no-underline md:text-xl shrink-0"
        >
          <img
            src="/logo.png"
            alt="Realdha logo"
            className="size-6 object-contain md:size-7 shrink-0"
          />
          <span className="font-bold">Realdha</span>
         
        </Link>
        <div className="flex items-center gap-2 shrink-0">
          <LangSwitch />
          <ThemeToggle />
        </div>
      </header>
    )
  }

  // Consistent app header: locked to exactly 64px across all routes (h-16 min-h-16 max-h-16 flex-none shrink-0)
  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex h-16 min-h-16 max-h-16 w-full flex-none shrink-0 items-center justify-between gap-3 border-b border-line bg-surface/95 px-4 backdrop-blur-xs md:gap-4 md:px-6 box-border flex-nowrap select-none',
        className,
      )}
    >
      {/* LEFT SECTION: Mobile Sheet / Back trigger & Brand Logo */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Mobile back button (when route defines a back path) */}
        {back ? (
          <Link
            to={back}
            aria-label={t('Back')}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-control text-text transition-colors hover:bg-primary-tint md:hidden"
          >
            <ArrowLeft className="size-5" />
          </Link>
        ) : (
          /* Mobile hamburger Sheet trigger */
          <div className="flex items-center md:hidden shrink-0">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label={t('Toggle navigation menu')}
                  className="inline-flex size-8 items-center justify-center rounded-control text-muted transition-colors hover:bg-primary-tint hover:text-text"
                >
                  <Menu className="size-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85vw] max-w-xs p-5">
                <SheetHeader>
                  <div className="flex items-center gap-2.5">
                    <img
                      src="/logo.png"
                      alt="Realdha logo"
                      className="size-6 object-contain"
                    />
                    <span className="text-h3 font-bold tracking-tight text-brand">
                      Realdha
                    </span>
                  </div>
                  <p className="text-xs text-muted">
                    {t('One permanent record for every property in India')}
                  </p>
                </SheetHeader>

                {/* Mobile persona banner */}
                <div className="flex items-center gap-3 rounded-control border border-line bg-sunken p-2.5">
                  <Avatar className="size-9">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 text-left">
                    <div className="truncate text-small font-semibold text-text">
                      {currentProfile.name}
                    </div>
                    <div className="truncate text-xs text-muted">
                      {t(currentProfile.title)}
                    </div>
                  </div>
                </div>

                {/* Mobile Navigation Links */}
                <nav className="flex flex-col gap-1 overflow-y-auto py-2">
                  <div className="px-2 pb-1 text-xs font-semibold tracking-wider text-muted uppercase">
                    {t(role)} {t('Navigation')}
                  </div>
                  {items.map((item) => {
                    const isItemActive = active ? active === item.to : false
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                          cn(
                            'flex min-h-11 items-center rounded-control px-3 text-small font-medium no-underline transition-colors',
                            (active ? isItemActive : isActive)
                              ? 'bg-primary text-on-primary font-semibold'
                              : 'text-text hover:bg-primary-tint hover:text-primary-text',
                          )
                        }
                      >
                        {t(item.label)}
                      </NavLink>
                    )
                  })}

                  <NavLink
                    to="/"
                    onClick={() => setMobileOpen(false)}
                    className="mt-3 flex min-h-11 items-center rounded-control px-3 text-small text-text no-underline hover:bg-primary-tint"
                  >
                    {t('Choose a role')}
                  </NavLink>
                </nav>

                {/* Mobile Role Switcher */}
                <div className="border-t border-line pt-3">
                  <div className="mb-2 text-xs font-semibold text-muted">
                    {t('Switch role')}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(
                      [
                        'owner',
                        'buyer',
                        'lawyer',
                        'developer',
                        'partner',
                        'admin',
                        'government',
                      ] as Role[]
                    ).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => handleRoleSwitch(r)}
                        className={cn(
                          'flex items-center gap-1.5 rounded-control border px-2 py-1.5 text-xs text-left capitalize transition-colors',
                          role === r
                            ? 'border-primary bg-primary-tint font-semibold text-primary-text'
                            : 'border-line bg-surface text-text hover:bg-sunken',
                        )}
                      >
                        {t(r)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile Footer Utilities */}
                <div className="mt-auto border-t border-line pt-3 flex items-center justify-between">
                  <LangSwitch />
                  <ThemeToggle />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}

        {/* Screen title on mobile when back is active */}
        {back && title ? (
          <span className="truncate text-body font-semibold text-text max-w-[130px] sm:max-w-[200px] md:hidden shrink-0">
            {title}
          </span>
        ) : null}

        {/* Brand logo and wordmark (always visible on desktop, hidden on mobile only when back+title present) */}
        <Link
          to="/"
          className={cn(
            'flex items-center gap-2.5 text-lg font-semibold tracking-[-0.02em] text-brand no-underline md:text-xl shrink-0',
            back && title && 'hidden md:flex',
          )}
        >
          <img
            src="/logo.png"
            alt="Realdha logo"
            className="size-6 object-contain md:size-7 shrink-0"
          />
          <span className="font-bold">Realdha</span>
       
        </Link>
      </div>

      {/* CENTER-LEFT: Desktop Primary Navigation Links (including "Market") */}
      <nav
        aria-label="Primary"
        className="hidden lg:flex items-center gap-5 xl:gap-6 self-stretch ml-2 shrink-0"
      >
        {items.map((item) => {
          const isItemActive = active ? active === item.to : false
          return (
            <NavLink
              key={item.to}
              to={item.to}
              aria-current={isItemActive ? 'page' : undefined}
              className={({ isActive }) =>
                cn(
                  'flex items-center self-stretch border-b-2 text-small font-medium no-underline transition-colors whitespace-nowrap shrink-0',
                  (active ? isItemActive : isActive)
                    ? 'border-primary font-semibold text-brand'
                    : 'border-transparent text-muted hover:text-text hover:border-line-hover',
                )
              }
            >
              {t(item.label)}
            </NavLink>
          )
        })}
      </nav>

      {/* CENTER-RIGHT: Global search (OpenStreetMap places + property IDs) */}
      <PlaceSearch
        variant="header"
        placeholder={t('Search a place or ID')}
        onSubmit={handleSearchSubmit}
        className={cn(
          'ml-auto flex-1 max-w-[190px] sm:max-w-[240px] md:max-w-[280px] lg:max-w-[320px] shrink',
          back && title && 'hidden sm:block',
        )}
      />

      {/* RIGHT ACTION CONTROLS */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Quick Action Button: Add Property */}
        <RoleMenu role={role} onPick={handleRoleSwitch} onStart={() => navigate('/')} />
        <div className={cn('hidden items-center shrink-0', role === 'owner' && 'xl:flex')}>
          <Button
            to={path('GP-07')}
            size="sm"
            variant="secondary"
            icon={<Plus className="size-3.5" />}
            className="h-9 whitespace-nowrap text-chip"
          >
            {t('Add property')}
          </Button>
        </div>

        {/* Utility Controls: Lang & Theme */}
        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          <LangSwitch />
          <ThemeToggle />
        </div>

        {/* Notifications Bell */}
        <Link
          to={path('X-02')}
          aria-label={`${t('Notifications')}, ${unread} ${t('unread')}`}
          className="relative flex size-8 shrink-0 items-center justify-center rounded-control text-muted transition-colors hover:bg-primary-tint hover:text-text no-underline"
        >
          <Bell className="size-4" aria-hidden />
          {unread > 0 && (
            <span className="absolute top-1 right-1 flex size-3.5 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-on-status">
              {unread}
            </span>
          )}
        </Link>

        {/* User Profile Dropdown Menu (shadcn pattern) */}
        <div className="shrink-0 flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 rounded-full cursor-pointer p-0.5 transition-all hover:ring-2 hover:ring-primary/20 shrink-0">
              <Avatar className="size-8 shrink-0">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <ChevronDown className="size-3 text-muted hidden sm:block shrink-0" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64 p-1.5">
              {/* User Profile Header */}
              <DropdownMenuLabel className="flex flex-col gap-1 pb-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-text">{currentProfile.name}</span>
                  <Badge variant="brand" className="text-[10px]">
                    {t(role)}
                  </Badge>
                </div>
                <span className="text-xs font-normal text-muted">
                  {t(currentProfile.title)}
                </span>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              {/* Navigation Shortcuts */}
              <DropdownMenuItem onSelect={() => navigate(path('X-03'))}>
                <Settings className="size-4 text-muted" />
                <span>{t('Profile & Settings')}</span>
              </DropdownMenuItem>

              <DropdownMenuItem onSelect={() => navigate(path('F18-01'))}>
                <Sparkles className="size-4 text-muted" />
                <span>{t('My Watchlist')}</span>
              </DropdownMenuItem>

          

              <DropdownMenuSeparator />

              {/* Sign Out / Reset */}
              <DropdownMenuItem
                onSelect={() => navigate('/')}
                className="text-danger hover:bg-danger-tint hover:text-danger-ink"
              >
                <LogOut className="size-4" />
                <span>{t('Sign Out / Reset')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
