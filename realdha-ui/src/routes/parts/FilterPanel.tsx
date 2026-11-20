import { Check } from 'lucide-react'
import { useId } from 'react'
import { Button } from '../../components/ui/button'
import { Drawer } from '../../components/ui/drawer'
import { Switch } from '../../components/ui/switch'
import { NO_FILTERS, priceError, type Filters, type PType } from '../../data/fixtures/f08-search'
import { cn } from '../../lib/cn'

function Check_({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: string }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-2.5 md:min-h-0 md:py-1.5">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span aria-hidden className={cn('flex size-5 flex-none items-center justify-center rounded-[4px] border-2 border-primary peer-focus-visible:shadow-[0_0_0_3px_var(--rd-focus-halo)] md:size-[18px]', checked ? 'bg-primary text-on-primary' : 'bg-field')}>{checked && <Check className="size-3.5" strokeWidth={3} />}</span>
      <span className="text-small">{children}</span>
    </label>
  )
}

const TYPES: [PType, string][] = [['apartment', 'Apartment'], ['plot', 'Plot'], ['commercial', 'Commercial']]
const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])

/** Filters drawer (F08-02). Changes apply live; the footer shows the live count. */
export function FilterDrawer({ open, onOpenChange, filters, onChange, count }: { open: boolean; onOpenChange: (o: boolean) => void; filters: Filters; onChange: (f: Filters) => void; count: number }) {
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => onChange({ ...filters, [k]: v })
  const uid = useId()
  const loErr = priceError(filters.priceMin)
  const hiErr = priceError(filters.priceMax)
  const field = (k: 'priceMin' | 'priceMax', ph: string, err: string, label: string) => (
    <div className="flex-1">
      <input
        aria-label={label} placeholder={ph} value={filters[k]} inputMode="text" aria-invalid={err ? true : undefined} aria-describedby={err ? `${uid}-err` : undefined}
        onChange={(e) => set(k, e.target.value)}
        className={cn('h-11 w-full rounded-control border bg-field px-3 text-control outline-none placeholder:text-muted focus:border-focus md:h-control', err ? 'border-danger' : 'border-line-strong')}
      />
    </div>
  )
  return (
    <Drawer open={open} onOpenChange={onOpenChange} title="Filters">
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
        <fieldset>
          <legend className="mb-1 text-chip font-semibold">Type</legend>
          {TYPES.map(([t, l]) => <Check_ key={t} checked={filters.types.includes(t)} onChange={() => set('types', toggle(filters.types, t))}>{l}</Check_>)}
        </fieldset>
        <fieldset>
          <legend className="mb-1.5 text-chip font-semibold">BHK</legend>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((b) => (
              <button key={b} type="button" aria-pressed={filters.bhk.includes(b)} onClick={() => set('bhk', toggle(filters.bhk, b))} className={cn('h-11 min-w-11 cursor-pointer rounded-control border px-3.5 text-chip font-medium md:h-control-sm', filters.bhk.includes(b) ? 'border-primary bg-primary text-on-primary' : 'border-line-strong bg-surface text-primary-text hover:bg-primary-tint')}>{b === 4 ? '4+' : b}</button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-1.5 text-chip font-semibold">Price range (indicative, sample)</legend>
          <div className="flex items-center gap-2">
            {field('priceMin', '₹ 60 L', loErr, 'Minimum price')}
            <span className="text-small">to</span>
            {field('priceMax', '₹ 1.5 Cr', hiErr, 'Maximum price')}
          </div>
          {(loErr || hiErr) && <p id={`${uid}-err`} role="alert" className="mt-1.5 text-label text-danger-ink">{loErr || hiErr}</p>}
        </fieldset>
        <fieldset>
          <legend className="mb-1 text-chip font-semibold">Verification status</legend>
          <Check_ checked={filters.signedOff} onChange={(v) => set('signedOff', v)}>Signed off</Check_>
          <Check_ checked={filters.onChain} onChange={(v) => set('onChain', v)}>Anchored on-chain</Check_>
          <Check_ checked={filters.lawyerReview} onChange={(v) => set('lawyerReview', v)}>Lawyer review</Check_>
        </fieldset>
        <div className="flex items-center justify-between">
          <span id={`${uid}-new`} className="text-small font-medium">New launch only</span>
          <Switch checked={filters.newOnly} onChange={(v) => set('newOnly', v)} aria-labelledby={`${uid}-new`} />
        </div>
      </div>
      <div className="flex gap-2.5 border-t border-line p-5">
        <Button variant="secondary" size="lg" className="flex-1" onClick={() => onChange(NO_FILTERS)}>Reset</Button>
        <Button size="lg" className="flex-1" onClick={() => onOpenChange(false)}>Show {count} result{count === 1 ? '' : 's'}</Button>
      </div>
    </Drawer>
  )
}
