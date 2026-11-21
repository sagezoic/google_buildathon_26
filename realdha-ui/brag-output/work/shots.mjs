import { chromium } from 'playwright-core';
const routes = process.argv.slice(2);
const b = await chromium.launch({ executablePath: '/Users/light/Library/Caches/ms-playwright/chromium_headless_shell-1254/chrome-headless-shell-mac-arm64/chrome-headless-shell' });
const p = await b.newPage({ viewport: { width: 1440, height: 810 }, deviceScaleFactor: 2 });
for (const r of routes) {
  try {
    await p.goto('http://localhost:5173' + r, { waitUntil: 'networkidle', timeout: 20000 });
  } catch (e) { console.log('slow', r); }
  await p.waitForTimeout(2500);
  const f = 'shots/' + r.replace(/[\/?=&]/g, '_') + '.png';
  await p.screenshot({ path: f });
  console.log(f);
}
await b.close();
