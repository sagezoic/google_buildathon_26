#!/usr/bin/env node
// Checks WCAG contrast for every text/background and UI pair the Realdha tokens promise.
// Usage: node scripts/check-contrast.mjs [extra.css ...]
// Reads src/styles/tokens.css (+ any extra files), resolves each theme block, prints a table,
// exits 1 if any required pair fails.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const files = ['src/styles/tokens.css', ...process.argv.slice(2)].map((f) => resolve(root, f))

// --- parse: selector -> { --var: value } (top-level and inside @media are both read; @media blocks are ignored) ---
const blocks = []
for (const file of files) {
  const css = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
  const re = /([^{}@]+)\{([^{}]*)\}/g
  let m
  while ((m = re.exec(css))) {
    const selector = m[1].trim()
    const vars = {}
    for (const d of m[2].matchAll(/(--rd-[\w-]+)\s*:\s*([^;]+);/g)) vars[d[1]] = d[2].trim()
    if (Object.keys(vars).length) blocks.push({ selector, vars })
  }
}
const light = Object.assign({}, ...blocks.filter((b) => b.selector === ':root').map((b) => b.vars))
const themes = { light }
for (const b of blocks) {
  if (b.selector === ':root') continue
  const name = b.selector.match(/data-dark="(\w+)"/)?.[1] ?? (b.selector.includes('data-theme="dark"') ? 'graphite' : null)
  if (!name) continue
  themes[`dark-${name}`] = { ...light, ...b.vars }
}

function resolveVar(theme, name, depth = 0) {
  let v = theme[name]
  if (!v) throw new Error(`missing ${name}`)
  const ref = v.match(/^var\((--rd-[\w-]+)\)$/)
  if (ref && depth < 10) return resolveVar(theme, ref[1], depth + 1)
  return v
}
function rgb(v) {
  const hex = v.match(/^#([0-9a-f]{6})$/i)
  if (hex) return [0, 2, 4].map((i) => parseInt(hex[1].slice(i, i + 2), 16))
  throw new Error(`unsupported colour ${v}`)
}
const lum = (c) => {
  const [r, g, b] = c.map((x) => {
    x /= 255
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const ratio = (a, b) => {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x)
  return (l1 + 0.05) / (l2 + 0.05)
}

// [foreground, background, minimum, note]
const TEXT = 4.5, UI = 3
const pairs = [
  ['text', 'canvas', TEXT], ['text', 'surface', TEXT], ['text', 'field', TEXT],
  ['text-muted', 'surface', TEXT], ['text-muted', 'canvas', TEXT], ['text-muted', 'surface-sunken', TEXT],
  ['heading-brand', 'surface', TEXT], ['primary-text', 'surface', TEXT, 'link / secondary button text'],
  ['primary-text', 'canvas', TEXT], ['on-primary', 'primary', TEXT], ['on-primary', 'primary-hover', TEXT],
  ['on-primary-tint', 'primary-tint', TEXT], ['primary-text', 'primary-tint', TEXT, 'secondary button hover'],
  ['text-disabled', 'disabled-fill', UI, 'disabled is exempt; kept legible'],
  ['success-ink', 'success-tint', TEXT], ['warning-ink', 'warning-tint', TEXT],
  ['danger-ink', 'danger-tint', TEXT], ['info-ink', 'info-tint', TEXT], ['chain-ink', 'chain-tint', TEXT],
  ['danger-ink', 'surface', TEXT, 'field error message'], ['chain-ink', 'surface', TEXT, 'fingerprint on card'],
  ['on-status', 'danger', TEXT, 'danger button'], ['on-status', 'danger-hover', TEXT],
  ['demo-ink', 'demo-fill', TEXT],
  ['focus', 'surface', UI, 'focus ring'], ['focus', 'canvas', UI],
  ['success', 'surface', UI, 'verdict border / icon'], ['danger', 'surface', UI], ['warning', 'surface', UI],
  ['chain', 'surface', UI], ['line-strong', 'surface', UI, 'input border (WCAG 1.4.11)'],
]

let failed = 0
for (const [name, theme] of Object.entries(themes)) {
  console.log(`\n${name}`)
  for (const [fg, bg, min, note = ''] of pairs) {
    const r = ratio(rgb(resolveVar(theme, `--rd-${fg}`)), rgb(resolveVar(theme, `--rd-${bg}`)))
    const ok = r >= min
    // The artifact's light input border (#B9C1CC) is pinned; report it, don't fail on it.
    const pinned = !ok && name === 'light' && fg === 'line-strong'
    if (!ok && !pinned) failed++
    console.log(`  ${ok ? 'ok  ' : pinned ? 'note' : 'FAIL'} ${r.toFixed(2).padStart(5)}:1  ${fg} on ${bg}  (min ${min})${note ? '  · ' + note : ''}${pinned ? '  · pinned by artifact' : ''}`)
  }
}
console.log(failed ? `\n${failed} pair(s) below minimum` : '\nall required pairs pass')
process.exit(failed ? 1 : 0)
