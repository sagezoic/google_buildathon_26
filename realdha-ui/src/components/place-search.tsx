import { ArrowUp, CornerDownLeft, MapPin, Search, X } from 'lucide-react'
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { cn } from '../lib/cn'
import { usePlace, usePlaceSuggestions, type Place } from '../lib/places'

const isId = (s: string) => /^RA-/i.test(s.trim())

interface Props {
  variant: 'composer' | 'header'
  /** Called with the final query string and the picked place (if any). */
  onSubmit: (q: string, place: Place | null) => void
  placeholder?: string
  className?: string
}

/**
 * Location-aware search. Typing lists OpenStreetMap places; picking one stores it (`usePlace`) and shows it as a chip.
 * `composer` is the home field (chip, input, send row); `header` is the compact bar.
 */
export function PlaceSearch({ variant, onSubmit, placeholder, className }: Props) {
  const [place, setPlace] = usePlace()
  const [text, setText] = useState('')
  const [open, setOpen] = useState(false)
  const [cursor, setCursor] = useState(0)
  const root = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const listId = useId()
  const composer = variant === 'composer'

  // With a place already chosen, typing refines the question, not the place: suggest only until one is picked.
  const suggest = usePlaceSuggestions(place || isId(text) ? '' : text)
  const showList = !place && open && text.trim().length >= 2 && !isId(text)

  useEffect(() => {
    const away = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('pointerdown', away)
    return () => document.removeEventListener('pointerdown', away)
  }, [])

  const pick = (p: Place) => {
    setPlace(p)
    setText('')
    setOpen(false)
    setCursor(0)
    if (!composer) onSubmit(p.name, p)
    else input.current?.focus()
  }

  const submit = () => {
    const t = text.trim()
    if (!t && !place) return
    setOpen(false)
    const q = isId(t) ? t : [t, place?.name].filter(Boolean).join(' ')
    onSubmit(q, isId(t) ? null : place)
    setText('')
  }

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    const n = suggest.places.length
    if (e.key === 'ArrowDown' && showList && n) { e.preventDefault(); setCursor((c) => (c + 1) % n) }
    else if (e.key === 'ArrowUp' && showList && n) { e.preventDefault(); setCursor((c) => (c - 1 + n) % n) }
    else if (e.key === 'Escape') setOpen(false)
    else if (e.key === 'Backspace' && !text && place) setPlace(null)
    else if (e.key === 'Enter') {
      e.preventDefault()
      if (showList && n && suggest.places[cursor] && !isId(text)) pick(suggest.places[cursor])
      else submit()
    }
  }

  const chip = place && (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-control border border-line bg-primary-tint py-0.5 pr-1 pl-2 text-chip font-medium text-text">
      <MapPin className="size-3.5 shrink-0 text-primary-text" aria-hidden />
      <span className="truncate">{place.name}</span>
      {place.area && composer && <span className="truncate font-normal text-muted">{place.area}</span>}
      <button
        type="button"
        aria-label={`Remove place ${place.name}`}
        onClick={() => { setPlace(null); input.current?.focus() }}
        className="inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-control text-muted hover:bg-surface hover:text-text"
      >
        <X className="size-3.5" aria-hidden />
      </button>
    </span>
  )

  const field = (
    <input
      ref={input}
      role="combobox"
      aria-expanded={showList}
      aria-controls={listId}
      aria-autocomplete="list"
      aria-activedescendant={showList && suggest.places.length ? `${listId}-${cursor}` : undefined}
      aria-label={composer ? 'Search a place or property ID' : 'Search places and property IDs'}
      autoComplete="off"
      spellCheck={false}
      value={text}
      placeholder={place ? (composer ? 'Ask about this place, or add a property ID' : 'Refine…') : placeholder}
      onChange={(e) => { setText(e.target.value); setOpen(true); setCursor(0) }}
      onFocus={() => setOpen(true)}
      onKeyDown={onKey}
      className={cn(
        'min-w-0 flex-1 bg-transparent text-text outline-none placeholder:text-muted',
        composer ? 'h-11 text-body md:h-12' : 'h-9 text-small',
      )}
    />
  )

  const list = showList && (
    <ul
      id={listId}
      role="listbox"
      aria-label="Places on OpenStreetMap"
      className={cn(
        'absolute z-50 max-h-80 overflow-auto rounded-control border border-line bg-surface py-1 shadow-e2',
        composer ? 'inset-x-0 top-full mt-1.5' : 'top-full right-0 mt-1.5 w-[min(340px,calc(100vw-2rem))]',
      )}
    >
      {suggest.places.map((p, i) => (
        <li
          key={p.id}
          id={`${listId}-${i}`}
          role="option"
          aria-selected={i === cursor}
          onPointerDown={(e) => { e.preventDefault(); pick(p) }}
          onPointerEnter={() => setCursor(i)}
          className={cn('flex min-h-11 cursor-pointer items-center gap-3 px-3 py-2 md:min-h-0', i === cursor && 'bg-primary-tint')}
        >
          <MapPin className="size-4 shrink-0 text-muted" aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-small font-medium text-text">{p.name}</span>
            {p.area && <span className="block truncate text-chip text-muted">{p.area}</span>}
          </span>
          <span className="shrink-0 text-label text-muted capitalize">{p.kind}</span>
        </li>
      ))}
      {suggest.status === 'loading' && !suggest.places.length && <li role="presentation" className="px-3 py-2.5 text-small text-muted">Searching OpenStreetMap…</li>}
      {suggest.status === 'ready' && !suggest.places.length && <li role="presentation" className="px-3 py-2.5 text-small text-muted">No place matches “{text.trim()}”. Press Enter to search records instead.</li>}
      {suggest.status === 'error' && <li role="presentation" className="px-3 py-2.5 text-small text-danger-ink">Place search is unavailable. Press Enter to search records instead.</li>}
      <li role="presentation" className="flex items-center justify-between gap-2 border-t border-line px-3 pt-1.5 pb-1 text-label text-muted">
        <span>Places © OpenStreetMap contributors</span>
        <span className="inline-flex items-center gap-1 max-md:hidden"><CornerDownLeft className="size-3" aria-hidden />select</span>
      </li>
    </ul>
  )

  if (!composer) {
    return (
      <div ref={root} className={cn('relative', className)}>
        <div role="search" className="flex h-9 items-center gap-2 rounded-control border border-line bg-field px-2.5 focus-within:border-focus focus-within:ring-1 focus-within:ring-focus">
          <Search className="size-4 shrink-0 text-muted" aria-hidden />
          {chip && <span className="min-w-0 max-w-[55%] shrink-0">{chip}</span>}
          {field}
        </div>
        {list}
      </div>
    )
  }

  return (
    <div ref={root} className={cn('relative', className)}>
      <form
        role="search"
        onSubmit={(e) => { e.preventDefault(); submit() }}
        className="rounded-card border border-line-strong bg-surface shadow-e1 focus-within:border-primary focus-within:shadow-[0_0_0_3px_var(--rd-focus-halo)]"
      >
        {chip && <div className="flex px-3 pt-3">{chip}</div>}
        <div className="flex items-center gap-2 px-3.5">{field}</div>
        <div className="flex items-center justify-between gap-3 border-t border-line px-3.5 py-2">
          <span className="text-chip text-muted">
            {place ? 'Saved as your search area' : 'Pick a place from the list, or enter a property ID'}
          </span>
          <button
            type="submit"
            aria-label="Search"
            disabled={!text.trim() && !place}
            className="inline-flex size-10 cursor-pointer items-center justify-center rounded-control bg-primary text-on-primary transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-disabled-fill disabled:text-disabled md:size-9"
          >
            <ArrowUp className="size-4" aria-hidden />
          </button>
        </div>
      </form>
      {list}
    </div>
  )
}
