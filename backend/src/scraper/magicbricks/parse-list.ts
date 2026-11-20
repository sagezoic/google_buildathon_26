export interface ScrapedProjectCard {
  mb_id: string;
  name: string;
  developer: string | null;
  locality: string | null;
  pincode: string | null;
  status: string | null;
  possession: string | null;
  units: number | null;
  towers: number | null;
  acres: number | null;
  price_min: number | null;
  price_max: number | null;
  prop_types: string | null;
  brochure_url: string | null;
  card_units: Array<{ bhk: number | null; sqft: number; kind: string }>;
  images: Array<{ thumb: string; full: string }>;
  type_codes: string[];
  url: string;
}

export function parseTotal(html: string): number | null {
  const m = html.match(/"totalCount":\s*(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

export function num(v: any): number | null {
  if (v === null || v === undefined || v === '') return null;
  const f = parseFloat(String(v));
  return !Number.isNaN(f) && f !== 0 ? f : null;
}

export function photoLinks(
  paths?: string | null,
  n = 8
): Array<{ thumb: string; full: string }> {
  if (!paths) return [];
  const out: Array<{ thumb: string; full: string }> = [];
  const parts = paths.split(',');

  for (const raw of parts) {
    const p = raw.trim();
    if (!p || !p.includes('.') || p.includes('Floor-Plan')) continue;
    const lastDot = p.lastIndexOf('.');
    const stem = p.slice(0, lastDot);
    const ext = p.slice(lastDot + 1);
    const base = 'https://img.staticmb.com/mbimages/project/';
    out.push({
      thumb: `${base}Photo_h310_w462/${stem}_310_462.${ext}`,
      full: base + p,
    });
    if (out.length >= n) break;
  }

  return out;
}

export function parseUnitInfo(
  raw?: string | null
): Array<{ bhk: number | null; sqft: number; kind: string }> {
  if (!raw) return [];
  const units: Array<{ bhk: number | null; sqft: number; kind: string }> = [];
  const parts = raw.split('|');

  for (const part of parts) {
    const bits = part.split(',').map((b) => b.trim());
    if (bits.length !== 3) continue;
    const m = bits[2].match(/^([\d.]+)\s*Sq-ft/i);
    if (!m) continue;
    const bhk = /^\d+$/.test(bits[0]) ? parseInt(bits[0], 10) : null;
    const sqft = parseFloat(m[1]);
    if (Number.isNaN(sqft)) continue;
    units.push({
      bhk,
      sqft,
      kind: bits[1],
    });
  }

  return units;
}

/**
 * Extracts a complete JSON object from a string starting at startIndex (which must point to '{').
 */
export function extractJsonObject(str: string, startIndex: number): any | null {
  if (str[startIndex] !== '{') return null;
  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = startIndex; i < str.length; i++) {
    const ch = str[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === '\\') {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (ch === '{') {
        depth++;
      } else if (ch === '}') {
        depth--;
        if (depth === 0) {
          try {
            return JSON.parse(str.slice(startIndex, i + 1));
          } catch {
            return null;
          }
        }
      }
    }
  }
  return null;
}

/**
 * Parse project cards from a list page HTML.
 * Searches for "psmName": markers and walks backwards to the enclosing object.
 */
export function parseListPage(html: string): Record<string, any>[] {
  const cards: Record<string, any>[] = [];
  const regex = /"psmName":/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    let j = html.lastIndexOf('{', match.index);
    while (j > 0) {
      const obj = extractJsonObject(html, j);
      if (obj && typeof obj === 'object' && 'psmName' in obj && 'pdpUrl' in obj) {
        cards.push(obj);
        break;
      }
      j = html.lastIndexOf('{', j - 1);
    }
  }

  // Deduplicate by psmid
  const seen = new Set<string>();
  const out: Record<string, any>[] = [];
  for (const c of cards) {
    const id = String(c.psmid || '');
    if (id && !seen.has(id)) {
      seen.add(id);
      out.push(c);
    }
  }

  return out;
}

export function cardToProject(c: Record<string, any>): ScrapedProjectCard {
  const psmid = String(c.psmid || '');
  const pdpUrl = c.pdpUrl ? String(c.pdpUrl) : '';
  const url = pdpUrl
    ? pdpUrl.startsWith('http')
      ? pdpUrl
      : 'https://www.magicbricks.com/' + pdpUrl
    : '';

  return {
    mb_id: psmid,
    name: (c.psmName ? String(c.psmName) : '').trim(),
    developer: c.devName ? String(c.devName).trim() : null,
    locality: c.lmtDName ? String(c.lmtDName).trim() : null,
    pincode: c.pincode ? String(c.pincode).trim() : null,
    status: c.showReadyToMove ? String(c.showReadyToMove).trim() : null,
    possession: c.prjPossYear ? String(c.prjPossYear).trim() : null,
    units: c.totalUnits ? parseInt(String(c.totalUnits), 10) || null : null,
    towers: c.noTower ? parseInt(String(c.noTower), 10) || null : null,
    acres:
      c.projAreaUnitDesc === 'Acre' && c.projArea ? parseFloat(String(c.projArea)) || null : null,
    price_min: num(c.seoSMinPrice),
    price_max: num(c.seoSMaxPrice),
    prop_types: c.psmcndproptypes ? String(c.psmcndproptypes) : null,
    brochure_url: c.sblink ? String(c.sblink) : null,
    card_units: parseUnitInfo(c.unitInfo || ''),
    images: photoLinks(c.image),
    type_codes: String(c.ty || '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
    url,
  };
}
