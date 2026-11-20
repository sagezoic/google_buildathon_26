export const inputCls = 'h-control w-full rounded-control border border-line-strong bg-field px-3 text-control text-text outline-none placeholder:text-muted hover:border-line-hover focus:border-focus focus:shadow-[0_0_0_3px_var(--rd-focus-halo)] aria-[invalid=true]:border-danger'
export const mono = 'font-mono font-medium'

/** Page numbers with gaps, e.g. 1 2 3 … 11. */
export function pageList(page: number, last: number): (number | '…')[] {
  const want = new Set([1, 2, 3, last, page - 1, page, page + 1].filter((n) => n >= 1 && n <= last))
  const out: (number | '…')[] = []
  let prev = 0
  for (const n of [...want].sort((a, b) => a - b)) { if (n - prev > 1) out.push('…'); out.push(n); prev = n }
  return out
}

export function csvCell(v: string) { return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v }
export function toCsv(rows: string[][]) { return rows.map((r) => r.map(csvCell).join(',')).join('\r\n') + '\r\n' }
