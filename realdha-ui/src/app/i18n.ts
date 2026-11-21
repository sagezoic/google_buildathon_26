import { useCallback } from 'react'
import { usePrefs, type Lang } from './prefs'
import { DICT, UNIT_WORDS } from './translations'

const pick = (e: [string, string], lang: Lang) => (lang === 'hi' ? e[0] : e[1])

/** One piece of text: an exact entry, else its unit words ("sq ft", "Cr", "L"), else unchanged. */
function piece(lang: Lang, s: string): string {
  const hit = DICT[s]
  if (hit) return pick(hit, lang)
  let out = s
  for (const [re, words] of UNIT_WORDS) out = out.replace(re, pick(words, lang))
  return out
}

/**
 * Translate `s` into `lang`. Tries the whole string first, then each " · " part, then each ", " part.
 * `{0}`, `{1}` in the text are filled from `args`. English and unknown text pass through.
 */
export function translate(lang: Lang, s: string, ...args: (string | number)[]): string {
  let out = s
  if (lang !== 'en') {
    const hit = DICT[s]
    out = hit
      ? pick(hit, lang)
      : s.split(' · ').map((p) => (DICT[p] ? pick(DICT[p], lang) : p.split(', ').map((q) => piece(lang, q)).join(', '))).join(' · ')
  }
  return args.length ? out.replace(/\{(\d+)\}/g, (m, i) => String(args[+i] ?? m)) : out
}

/** `const t = useT()` then `t('Verified properties')`. Re-renders when the header language changes. */
export function useT() {
  const { lang } = usePrefs()
  return useCallback((s: string, ...args: (string | number)[]) => translate(lang, s, ...args), [lang])
}
