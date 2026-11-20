#!/usr/bin/env node
// Screenshot a route at 1440 / 834 / 390, light and dark.
//   node scripts/shot.mjs gp-01 [gp-02 ...]  [--out dir] [--sizes 1440,834,390] [--themes light,dark] [--state name]
// Needs the dev server (npm run dev, :5173) and chromium on PATH (brew install chromium).
import { spawnSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'

const args = process.argv.slice(2)
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i < 0 ? d : args.splice(i, 2)[1] }
const out = opt('out', '.impeccable/review/screens')
const sizes = opt('sizes', '1440,834,390').split(',').map(Number)
const themes = opt('themes', 'light').split(',')
const state = opt('state', '')
const base = opt('base', 'http://localhost:5173')
const H = { 1440: 900, 834: 1112, 390: 844 }
mkdirSync(out, { recursive: true })
for (const id of args) for (const t of themes) for (const w of sizes) {
  const url = `${base}/${id}?theme=${t}${state ? `&state=${state}` : ''}`
  const file = `${out}/${id}${state ? `-${state}` : ''}-${w}-${t}.png`
  const r = spawnSync(process.env.CHROME || '/Users/light/Library/Caches/ms-playwright/chromium_headless_shell-1254/chrome-headless-shell-mac-arm64/chrome-headless-shell', ['--no-sandbox', '--hide-scrollbars', '--force-device-scale-factor=1', `--window-size=${w},${H[w] ?? 900}`, '--virtual-time-budget=4000', `--screenshot=${file}`, url], { stdio: 'pipe' })
  console.log(r.status === 0 ? `ok   ${file}` : `FAIL ${file}\n${r.stderr}`)
}
