import * as React from 'react'
import {
  ArrowLeft,
  Bell,
  Building2,
  ChevronDown,
  FileCheck,
  LogOut,
  MapPin,
  Menu,
  Moon,
  Plus,
  Search,
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
import { usePrefs, type Lang } from '../app/prefs'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
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
    route: path('F08-01'),
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

const SAMPLE_SEARCH_RESULTS = [
  {
    id: 'RA-PUN-001-A-18-04',
    title: 'Amanora Park Town, Tower A-1804',
    locality: 'Hadapsar, Pune',
    badge: 'On-chain Anchored',
    tone: 'chain' as const,
    route: '/ra-pun-001-a-18-04',
  },
  {
    id: 'RA-LON-004-P-112-2',
    title: 'Gat No. 84, NA Plot (418 sq m)',
    locality: 'Lonavala, Pune',
    badge: 'Discrepancy Flag',
    tone: 'warning' as const,
    route: '/ra-lon-004-p-112-2',
  },
  {
    id: 'P52100018892',
    title: 'MahaRERA Sanctioned Project Record',
    locality: 'Amanora Gateway Towers, Pune',
    badge: 'Sanctioned',
    tone: 'success' as const,
    route: '/properties/P52100018892',
  },
]

const LANGS: { id: Lang; label: string }[] = [
  { id: 'en', label: 'EN' },
  { id: 'hi', label: 'हिं' },
  { id: 'mr', label: 'मरा' },
]

export function LangSwitch({ className }: { className?: string }) {
  const { lang, setLang } = usePrefs()
  return (
    <div
      role="group"
      aria-label="Language"
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
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
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
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [searchFocused, setSearchFocused] = React.useState(false)
  const searchContainerRef = React.useRef<HTMLDivElement | null>(null)

  // Keep "Market", remove only "Search" text link (since search bar is present) and "Marketplace"
  const items = (NAV[role] || []).filter(
    (item) => item.label !== 'Search' && item.label !== 'Marketplace',
  )
  const currentProfile = ROLE_PROFILES[role] || ROLE_PROFILES.owner

  // Handle outside click for search suggestions popup
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setSearchFocused(false)
      }
    }
    document.addEventListener('pointerdown', handleClickOutside)
    return () => document.removeEventListener('pointerdown', handleClickOutside)
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setSearchFocused(false)
    if (onSearch) {
      onSearch(searchQuery)
    } else {
      navigate(`${path('F08-02')}?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleSelectSample = (route: string) => {
    setSearchFocused(false)
    setSearchQuery('')
    navigate(route)
  }

  const handleRoleSwitch = (newRole: Role) => {
    const profile = ROLE_PROFILES[newRole]
    if (profile) {
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
            aria-label="Back"
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
                  aria-label="Toggle navigation menu"
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
                    <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-mono">
                      Testnet
                    </Badge>
                  </div>
                  <p className="text-xs text-muted">
                    One permanent record for every property in India
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
                      {currentProfile.title}
                    </div>
                  </div>
                </div>

                {/* Mobile Navigation Links */}
                <nav className="flex flex-col gap-1 overflow-y-auto py-2">
                  <div className="px-2 pb-1 text-xs font-semibold tracking-wider text-muted uppercase">
                    {role} Navigation
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
                        {item.label}
                      </NavLink>
                    )
                  })}

                  <div className="mt-3 px-2 pb-1 text-xs font-semibold tracking-wider text-muted uppercase">
                    Quick Portals
                  </div>
                  <NavLink
                    to="/dev/flows"
                    onClick={() => setMobileOpen(false)}
                    className="flex min-h-11 items-center justify-between rounded-control px-3 text-small text-text no-underline hover:bg-primary-tint"
                  >
                    <span>Prototype Flow Index</span>
                    <span className="font-mono text-xs text-muted">123 screens</span>
                  </NavLink>
                </nav>

                {/* Mobile Role Switcher */}
                <div className="border-t border-line pt-3">
                  <div className="mb-2 text-xs font-semibold text-muted">
                    Switch Test Persona
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(
                      [
                        'owner',
                        'buyer',
                        'lawyer',
                        'developer',
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
                        {r}
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
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      {/* CENTER-RIGHT: Global Search Bar */}
      <div
        ref={searchContainerRef}
        className={cn(
          'relative ml-auto flex-1 max-w-[170px] sm:max-w-[210px] md:max-w-[240px] lg:max-w-[280px] shrink',
          back && title && 'hidden sm:block',
        )}
      >
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted"
            aria-hidden
          />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            placeholder="Search ID, society, RERA..."
            aria-label="Search property records or RERA numbers"
            className="h-9 pl-9 pr-3 text-small rounded-control bg-field border-line shadow-none focus-visible:border-focus"
          />
        </form>

        {/* Interactive Search Suggestions Popup */}
        {searchFocused && (
          <div className="absolute top-full right-0 sm:left-0 mt-1.5 w-[280px] sm:w-[320px] rounded-control border border-line bg-surface p-2 shadow-e2 z-50">
            <div className="px-2 py-1 text-xs font-semibold text-muted uppercase">
              Quick Case Studies &amp; Records
            </div>
            <div className="flex flex-col gap-1 mt-1">
              {SAMPLE_SEARCH_RESULTS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    handleSelectSample(item.route)
                  }}
                  className="flex items-start justify-between gap-2 rounded-control p-2 text-left hover:bg-primary-tint transition-colors cursor-pointer"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-xs font-semibold text-text">
                      {item.id}
                    </div>
                    <div className="truncate text-xs text-text font-medium">
                      {item.title}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-muted">
                      <MapPin className="size-3" />
                      <span>{item.locality}</span>
                    </div>
                  </div>
                  <Badge variant={item.tone} className="text-[10px] shrink-0">
                    {item.badge}
                  </Badge>
                </button>
              ))}
            </div>
            <div className="border-t border-line mt-2 pt-2 px-2 flex items-center justify-between text-[11px] text-muted">
              <span>Press Enter to search</span>
              <span className="font-mono">⌘K</span>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT ACTION CONTROLS */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Quick Action Button: Add Property */}
        <div className="hidden xl:flex items-center shrink-0">
          <Button
            to={path('GP-07')}
            size="sm"
            variant="secondary"
            icon={<Plus className="size-3.5" />}
            className="h-9 whitespace-nowrap text-chip"
          >
            Add property
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
          aria-label={`Notifications, ${unread} unread`}
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
                    {role}
                  </Badge>
                </div>
                <span className="text-xs font-normal text-muted">
                  {currentProfile.title}
                </span>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              {/* Persona Switcher Section */}
              <div className="px-2.5 py-1 text-[11px] font-semibold text-muted uppercase">
                Switch Persona
              </div>
              <div className="grid grid-cols-2 gap-1 p-1">
                {(
                  [
                    'owner',
                    'buyer',
                    'lawyer',
                    'developer',
                    'admin',
                    'government',
                  ] as Role[]
                ).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRoleSwitch(r)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-control px-2 py-1 text-xs text-left capitalize transition-colors cursor-pointer',
                      role === r
                        ? 'bg-primary text-on-primary font-semibold'
                        : 'text-text hover:bg-primary-tint',
                    )}
                  >
                    {ROLE_PROFILES[r]?.icon}
                    <span className="truncate">{r}</span>
                  </button>
                ))}
              </div>

              <DropdownMenuSeparator />

              {/* Navigation Shortcuts */}
              <DropdownMenuItem onSelect={() => navigate(path('X-03'))}>
                <Settings className="size-4 text-muted" />
                <span>Profile &amp; Settings</span>
              </DropdownMenuItem>

              <DropdownMenuItem onSelect={() => navigate(path('F18-01'))}>
                <Sparkles className="size-4 text-muted" />
                <span>My Watchlist</span>
              </DropdownMenuItem>

          

              <DropdownMenuSeparator />

              {/* Sign Out / Reset */}
              <DropdownMenuItem
                onSelect={() => navigate(path('GP-01'))}
                className="text-danger hover:bg-danger-tint hover:text-danger-ink"
              >
                <LogOut className="size-4" />
                <span>Sign Out / Reset</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
