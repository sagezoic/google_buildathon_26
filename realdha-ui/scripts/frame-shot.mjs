#!/usr/bin/env node
// Render a reference frame from references/realdha-frames/project/*.dc.html to a PNG.
//   node scripts/frame-shot.mjs GP-01-Signup [T-GP-01-Signup M-GP-01-Signup ...] [--out dir]
import { spawnSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
const args = process.argv.slice(2)
const i = args.indexOf('--out'); const out = i < 0 ? '.impeccable/review/frames' : args.splice(i, 2)[1]
mkdirSync(out, { recursive: true })
const dir = '../references/realdha-frames/project'
for (const name of args) {
  let h = readFileSync(`${dir}/${name}.dc.html`, 'utf8')
  const m = h.match(/data-props='\{"\$preview":\{"width":(\d+),"height":(\d+)/)
  const [w, ht] = m ? [+m[1], +m[2]] : [1440, 900]
  h = h.replace(/<script src="\.\/support\.js"><\/script>/, '').replace(/<\/?x-dc>/g, '').replace(/<helmet>([\s\S]*?)<\/helmet>/, '$1')
  const tmp = `${out}/.${name}.html`
  writeFileSync(tmp, h)
  const file = `${out}/${name}.png`
  const r = spawnSync(process.env.CHROME || '/Users/light/Library/Caches/ms-playwright/chromium_headless_shell-1254/chrome-headless-shell-mac-arm64/chrome-headless-shell', ['--no-sandbox', '--hide-scrollbars', '--force-device-scale-factor=1', `--window-size=${w},${ht}`, '--virtual-time-budget=3000', `--screenshot=${file}`, `file://${process.cwd()}/${tmp}`], { stdio: 'pipe' })
  console.log(r.status === 0 ? `ok   ${file} (${w}x${ht})` : `FAIL ${name}\n${r.stderr}`)
}
