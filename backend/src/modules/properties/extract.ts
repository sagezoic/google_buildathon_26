/** Key fields read from a Maharashtra land record (7/12, property card, NA order, deed). */
export interface ExtractedFields {
  gat: string | null;
  village: string | null;
  taluka: string | null;
  district: string | null;
  /** Owner / occupant name as written in the source language. */
  owner: string | null;
  /** Owner name in English, read from the translation. */
  ownerEn: string | null;
  areaSqm: number | null;
  landUse: string | null;
  mutationNos: string[];
}

const DEVANAGARI_DIGITS = '०१२३४५६७८९';

/** Replaces Devanagari digits (०-९) with ASCII digits. */
export function normalizeDigits(text: string): string {
  return text.replace(/[०-९]/g, (d) => String(DEVANAGARI_DIGITS.indexOf(d)));
}

const clean = (v: string | undefined | null): string | null => {
  const t = v?.replace(/\s+/g, ' ').replace(/^[\s:\-–]+|[\s:\-–.,]+$/g, '').trim();
  return t ? t : null;
};

/** Converts an area value and its Marathi/English unit to square metres. Returns null when the unit is unknown. */
export function toSqm(value: number, unit: string): number | null {
  const u = unit.replace(/[\s.]/g, '').toLowerCase();
  if (/^(हेआर|हेक्टर|हे|ha|hectares?)$/.test(u)) return Math.round(value * 10_000 * 100) / 100;
  if (/^(आर|are)$/.test(u)) return Math.round(value * 100 * 100) / 100;
  if (/^(चौमी|चौरसमीटर|sqm|squaremeters?|squaremetres?|m2)$/.test(u)) return value;
  return null;
}

function extractArea(mr: string, en: string): number | null {
  const m = mr.match(/(?:एकूण\s*)?क्षेत्र[^\d\n]{0,20}?(\d+(?:[.,]\d+)?)\s*(हे\.?\s*आर|हेक्टर|हे\.?|चौ\.?\s*मी\.?|आर)/);
  if (m) {
    const sqm = toSqm(parseFloat(m[1].replace(',', '.')), m[2]);
    if (sqm !== null) return sqm;
  }
  const e = en.match(/(\d+(?:[.,]\d+)?)\s*(sq\.?\s?m(?:eters?|etres?)?|hectares?|ha)\b/i);
  if (e) return toSqm(parseFloat(e[1].replace(/,(?=\d{3})/g, '').replace(',', '.')), e[2]);
  return null;
}

function extractLandUse(mr: string, en: string): string | null {
  if (/बिनशेती/.test(mr) || /non[-\s]?agricultural/i.test(en)) return 'Non-agricultural (NA)';
  if (/शेती|जिरायत|बागायत/.test(mr) || /\bagricultur/i.test(en)) return 'Agricultural';
  return null;
}

/** Pure parser: no network, no I/O. `mr` is the source-language text, `en` its English translation (may be empty). */
export function extractFields(sourceText: string, englishText = ''): ExtractedFields {
  const mr = normalizeDigits(sourceText);
  const en = normalizeDigits(englishText);

  const gatMatch = mr.match(
    /(?:गट\s*(?:नं|नंबर|क्र|क्रमांक)\.?|सर्व्हे\s*(?:नं|नंबर)\.?|भूमापन\s*क्रमांक[^:\n]{0,30}?)\s*[:\-]?\s*(\d{1,5}(?:\s*\/\s*\d{1,3}[A-Za-z]?)?)/,
  ) ?? en.match(/(?:gat|survey)\s*(?:no\.?|number)?\s*[:\-]?\s*(\d{1,5}(?:\s*\/\s*\d{1,3}[A-Za-z]?)?)/i);

  const owner = mr.match(/(?:भोगवटादाराचे|खातेदाराचे|धारकाचे)\s*नाव\s*[:\-]?\s*([^\n]+)/);
  const ownerEn = en.match(/(?:name of (?:the )?(?:occupant|owner|holder|account holder)|occupant'?s? name|owner'?s? name)\s*[:\-]?\s*([^\n]+)/i);

  const mutationNos = [...new Set([...mr.matchAll(/फेरफार\s*(?:क्र|क्रमांक|नं)\.?\s*[:\-]?\s*(\d{1,6})/g)].map((m) => m[1]))];

  return {
    gat: gatMatch ? gatMatch[1].replace(/\s+/g, '') : null,
    village: clean(mr.match(/मौजे\s*[:\-]?\s*([^\n:]+?)\s*(?=तालुका|जिल्हा|\n|$)/)?.[1]),
    taluka: clean(mr.match(/तालुका\s*[:\-]?\s*([^\n:]+?)\s*(?=जिल्हा|मौजे|\n|$)/)?.[1]),
    district: clean(mr.match(/जिल्हा\s*[:\-]?\s*([^\n:]+?)\s*(?=तालुका|\n|$)/)?.[1]),
    owner: clean(owner?.[1]),
    ownerEn: clean(ownerEn?.[1]),
    areaSqm: extractArea(mr, en),
    landUse: extractLandUse(mr, en),
    mutationNos,
  };
}
