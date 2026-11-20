import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { extractFields, normalizeDigits, toSqm } from '../src/modules/properties/extract';
import { sniffMime } from '../src/modules/properties/service';
import { chunkText } from '../src/services/translate';

const mr = readFileSync(join(import.meta.dir, 'fixtures/712_extract_mr.txt'), 'utf8');

describe('extractFields', () => {
  it('reads a Marathi 7/12 extract', () => {
    const f = extractFields(mr);
    expect(f.gat).toBe('112/2');
    expect(f.village).toBe('कुसगाव');
    expect(f.taluka).toBe('मावळ');
    expect(f.district).toBe('पुणे');
    expect(f.owner).toBe('प्रकाश कुलकर्णी');
    expect(f.areaSqm).toBeCloseTo(418, 5);
    expect(f.landUse).toBe('Non-agricultural (NA)');
    expect(f.mutationNos).toEqual(['2291', '1804']);
  });

  it('falls back to English text for owner and area', () => {
    const f = extractFields('', 'Name of occupant: Prakash Kulkarni\nTotal area: 465 sq m\nGat No. 112/2');
    expect(f.ownerEn).toBe('Prakash Kulkarni');
    expect(f.areaSqm).toBe(465);
    expect(f.gat).toBe('112/2');
  });

  it('returns nulls and an empty list for unrelated text', () => {
    const f = extractFields('hello world');
    expect(f.gat).toBeNull();
    expect(f.owner).toBeNull();
    expect(f.areaSqm).toBeNull();
    expect(f.mutationNos).toEqual([]);
  });
});

describe('helpers', () => {
  it('normalizes Devanagari digits', () => {
    expect(normalizeDigits('०१२३४५६७८९ 12')).toBe('0123456789 12');
  });

  it('converts area units to square metres', () => {
    expect(toSqm(0.0418, 'हे.आर')).toBeCloseTo(418, 5);
    expect(toSqm(2, 'आर')).toBe(200);
    expect(toSqm(465, 'चौ.मी.')).toBe(465);
    expect(toSqm(1, 'acre')).toBeNull();
  });

  it('sniffs real file types from bytes', () => {
    expect(sniffMime(new TextEncoder().encode('%PDF-1.7'))).toBe('application/pdf');
    expect(sniffMime(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe('image/jpeg');
    expect(sniffMime(new Uint8Array([0x89, 0x50, 0x4e, 0x47]))).toBe('image/png');
    expect(sniffMime(new TextEncoder().encode('MZ executable'))).toBeNull();
  });

  it('chunks long text under the limit without losing content', () => {
    const text = Array.from({ length: 50 }, (_, i) => `line ${i} ${'x'.repeat(40)}`).join('\n');
    const chunks = chunkText(text, 500);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((c) => c.length <= 500)).toBe(true);
    expect(chunks.join('')).toBe(text);
  });
});
