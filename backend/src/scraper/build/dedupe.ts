import { distM } from './geo';

export const GENERIC_WORDS = new Set([
  'the',
  'of',
  'at',
  'in',
  'sector',
  'gurgaon',
  'gurugram',
  'pune',
  'pcmc',
  'residency',
  'residences',
  'homes',
  'apartments',
  'apartment',
  'towers',
  'tower',
  'heights',
  'city',
  'phase',
  'park',
  'estate',
  'floors',
  'society',
  'cghs',
  'group',
  'housing',
  'and',
  'by',
  'new',
  'greens',
  'green',
  'plaza',
]);

export function tokens(name?: string | null): Set<string> {
  const matches = (name || '').toLowerCase().match(/[a-z0-9]+/g) || [];
  const out = new Set<string>();
  for (const t of matches) {
    if (!GENERIC_WORDS.has(t) && t.length > 2) {
      out.add(t);
    }
  }
  return out;
}

export function areSetsEqual(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;
  for (const item of a) {
    if (!b.has(item)) return false;
  }
  return true;
}

export const UNIT_KIND: Record<string, string> = {
  '10002': 'apartment',
  '10021': 'apartment',
  '10003': 'builder floor',
  '10000': 'plot',
  '10017': 'villa',
  '10007': 'commercial',
  '10008': 'commercial',
  '10009': 'commercial',
  '10022': 'apartment',
};

export function inferKindFromName(p: Record<string, any>): string {
  const n = ' ' + (p.name || '').toLowerCase() + ' ';
  if (/\b(plots?|land)\b/.test(n)) return 'plot~';
  if (/\b(villas?|kothi|bungalows?)\b/.test(n)) return 'villa~';
  if (/\bfloors?\b/.test(n)) return 'builder floor~';
  if (
    /\b(business|centre|center|mall|plaza|office|offices|commercial|corporate|hotel|hub|arcade|market|retail|square|district|spaces?)\b/.test(
      n
    ) &&
    !p.units
  ) {
    return 'commercial~';
  }
  if (/\b(business|corporate|mall|office|commercial|district)\b/.test(n)) {
    return 'commercial~';
  }
  return 'apartment~';
}

export function kindOf(p: Record<string, any>): string {
  const t = (p.config_text || '').toLowerCase();
  if (!t) {
    const codes: string[] = [
      ...((p.configs?.units || p.card_units || []).map((u: any) => u.kind) || []),
      ...(p.type_codes || []),
    ];
    const kinds = codes.map((c) => UNIT_KIND[c] || 'other');
    if (kinds.length > 0) {
      for (const k of ['apartment', 'builder floor', 'villa', 'plot', 'commercial'] as const) {
        if (kinds.includes(k)) return k;
      }
    }
    return inferKindFromName(p);
  }

  if (t.includes('apartment') || t.includes('penthouse') || t.includes('studio') || t.includes('flat')) {
    return 'apartment';
  }
  if (t.includes('floor')) {
    return 'builder floor';
  }
  if (t.includes('villa') || t.includes('house')) {
    return 'villa';
  }
  if (t.includes('plot') || t.includes('land')) {
    return 'plot';
  }
  return /\bbhk\b/.test(t) ? 'apartment' : 'other';
}

export interface ProjectForDedupe {
  name: string;
  lat: number;
  lng: number;
  url?: string;
  merged?: string[];
  [key: string]: any;
}

/**
 * Merges listings with the same name tokens less than 400 m apart.
 */
export function dedupe<T extends ProjectForDedupe>(projects: T[]): T[] {
  const kept: T[] = [];

  for (const p of projects) {
    const pTokens = tokens(p.name);
    let isDuplicate = false;

    for (const q of kept) {
      const qTokens = tokens(q.name);
      if (
        pTokens.size > 0 &&
        areSetsEqual(pTokens, qTokens) &&
        distM([p.lng, p.lat], [q.lng, q.lat]) < 400
      ) {
        if (!q.merged) q.merged = [];
        if (p.url) q.merged.push(p.url);
        isDuplicate = true;
        break;
      }
    }

    if (!isDuplicate) {
      kept.push(p);
    }
  }

  return kept;
}
