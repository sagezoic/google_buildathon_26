import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
const [mode, ...ts] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: '/Users/light/Library/Caches/ms-playwright/chromium_headless_shell-1254/chrome-headless-shell-mac-arm64/chrome-headless-shell' });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await p.goto('http://localhost:8765/video.html');
await p.evaluate(() => window.ready);
if (mode === 'stills') {
  mkdirSync('stills', { recursive: true });
  for (const t of ts) { await p.evaluate(t => render(+t), t); await p.screenshot({ path: `stills/t${t}.png` }); }
} else {
  mkdirSync('frames', { recursive: true });
  const N = +ts[0];
  for (let f = 0; f < N; f++) {
    await p.evaluate(t => render(t), f / 30);
    await p.screenshot({ path: `frames/f${String(f).padStart(4, '0')}.png` });
  }
}
await b.close();
