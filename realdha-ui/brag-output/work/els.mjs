import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/Users/light/Library/Caches/ms-playwright/chromium_headless_shell-1254/chrome-headless-shell-mac-arm64/chrome-headless-shell' });
const p = await b.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 3 });
// [route, name, text, levelsUpUntilBordered]
const jobs = [
  ['/properties/new/upload', 'up-row', ['7/12 extract','Property card','NA order','Mutation entries','Sale deed']],
  ['/properties/new/processing', 'proc', ['Reading Property card']],
  ['/properties/new/report', 'rep', ['Clarify','Area differs between documents']],
  ['/properties/new/anchoring', 'anc', ['Approve putting these 5']],
  ['/properties/new/resolve', 'res', ['Proceed – ready for lawyer review', 'Proceed']],
];
for (const [route, name, texts] of jobs) {
  await p.goto('http://localhost:5173' + route, { waitUntil: 'networkidle' }).catch(()=>{});
  await p.waitForTimeout(1500);
  await p.addStyleTag({ content: '*{animation-play-state:paused!important;transition:none!important}' });
  let i = 0;
  for (const t of texts) {
    const box = await p.evaluate((t) => {
      const all = [...document.querySelectorAll('body *')].filter(e => e.childElementCount === 0 && e.textContent.trim().startsWith(t));
      let e = all[0]; if (!e) return null;
      while (e && e !== document.body) {
        const s = getComputedStyle(e);
        const bordered = parseFloat(s.borderTopWidth) > 0 && parseFloat(s.borderLeftWidth) > 0 || (s.backgroundColor !== 'rgba(0, 0, 0, 0)' && e.getBoundingClientRect().width > 300);
        if (bordered && e.getBoundingClientRect().width > 300) break;
        e = e.parentElement;
      }
      const r = e.getBoundingClientRect();
      return { x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height, tag: e.tagName, cls: e.className };
    }, t);
    if (!box) { console.log('miss', name, t); continue; }
    const f = `el/${name}-${i++}.png`;
    await p.screenshot({ path: f, clip: { x: box.x, y: box.y, width: box.width, height: box.height }, fullPage: true });
    console.log(f, t, Math.round(box.width), Math.round(box.height));
  }
}
await b.close();
