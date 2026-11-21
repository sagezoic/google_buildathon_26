import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Lang = 'en' | 'hi' | 'mr'
export type Theme = 'light' | 'dark'

interface Prefs {
  lang: Lang
  setLang: (l: Lang) => void
  theme: Theme
  toggleTheme: () => void
}
const Ctx = createContext<Prefs | null>(null)

const initialTheme = (): Theme => {
  const stored = localStorage.getItem('rd-theme')
  if (stored === 'light' || stored === 'dark') return stored
  const q = new URLSearchParams(location.search).get('theme')
  if (q === 'light' || q === 'dark') return q
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const initialLang = (): Lang => {
  const stored = localStorage.getItem('rd-lang')
  return stored === 'hi' || stored === 'mr' ? stored : 'en'
}

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(initialLang)
  const [theme, setTheme] = useState<Theme>(initialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    // A ?theme= param (used by the screenshot script) wins and is not persisted.
    if (!new URLSearchParams(location.search).get('theme')) localStorage.setItem('rd-theme', theme)
  }, [theme])
  useEffect(() => {
    document.documentElement.lang = lang
    localStorage.setItem('rd-lang', lang)
  }, [lang])

  const toggleTheme = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])
  const value = useMemo(() => ({ lang, setLang, theme, toggleTheme }), [lang, theme, toggleTheme])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function usePrefs() {
  const v = useContext(Ctx)
  if (!v) throw new Error('usePrefs outside PrefsProvider')
  return v
}
