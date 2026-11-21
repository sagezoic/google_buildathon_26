import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/Users/light/Library/Caches/ms-playwright/chromium_headless_shell-1254/chrome-headless-shell-mac-arm64/chrome-headless-shell' });
const p = await b.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 3 });
await p.goto('http://localhost:5173/properties/new/anchoring', { waitUntil: 'networkidle' });
await p.waitForTimeout(1200);
const card = p.locator('text=Approve putting these 5').locator('xpath=ancestor::*[.//button][1]');
await p.getByRole('checkbox').first().check();
await p.waitForTimeout(300);
await card.screenshot({ path: 'el/anc-checked.png' });
await p.getByRole('button', { name: 'Approve and anchor' }).click();
for (const t of [600, 2000, 5000, 9000]) { await p.waitForTimeout(t === 600 ? 600 : t - 600); await p.screenshot({ path: `shots/anc-after-${t}.png` }); }
await b.close();
