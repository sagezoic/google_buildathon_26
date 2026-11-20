const { chromium } = require('/home/claude/.npm-global/lib/node_modules/playwright');
const fs = require('fs');
(async () => {
  const svg = fs.readFileSync(process.argv[2], 'utf8');
  const b = await chromium.launch({ args: ['--no-sandbox'] });
  const p = await b.newPage({ deviceScaleFactor: 3 });
  await p.setContent('<html><body style="margin:0;background:#fff">' + svg + '</body></html>');
  const out = await p.evaluate(() => {
    const root = document.querySelector('svg');
    document.querySelectorAll('.architecture-service').forEach(g => {
      const t = g.querySelector('text'); const r = g.querySelector('rect.background');
      if (!t || !r) return;
      const bb = t.getBBox(); const pad = 5;
      r.setAttribute('x', bb.x - pad); r.setAttribute('y', bb.y - pad);
      r.setAttribute('width', bb.width + 2 * pad); r.setAttribute('height', bb.height + 2 * pad);
      r.setAttribute('rx', 4); r.setAttribute('fill', '#ffffff'); r.setAttribute('style', 'stroke:none;fill:#ffffff');
    });
    const edges = root.querySelector('.architecture-edges');
    const top = document.createElementNS('http://www.w3.org/2000/svg','g');
    top.setAttribute('class','arrows-top');
    edges.querySelectorAll('polygon.arrow').forEach(a => top.appendChild(a));
    const svcs = root.querySelector('.architecture-services');
    svcs.parentNode.insertBefore(top, svcs.nextSibling);
    return new XMLSerializer().serializeToString(root);
  });
  fs.writeFileSync(process.argv[3], out);
  const el = await p.$('svg'); await el.screenshot({ path: process.argv[4] });
  await b.close();
})();
