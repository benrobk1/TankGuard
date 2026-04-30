/**
 * Owner-name normalization for cross-state operator rollup.
 *
 * Five state agencies report owner names with wildly different conventions:
 * "7-Eleven, Inc.", "7-ELEVEN INC", "SEVEN ELEVEN INC", "7 Eleven Inc.", etc.
 * The chain-operator detector groups by `ownerKey` so all of these collapse to
 * one operator with N sites. We never mutate the source name — we keep both
 * the canonical display form and the grouping key.
 *
 * The normalization is intentionally conservative: we only collapse things we
 * are confident represent the same legal entity. A 1-site outlier wrongly
 * merged into a 7-Eleven would inflate counts; a 7-Eleven row wrongly kept
 * separate just means we miss one facility, which is the safer error mode.
 */

import type { NormalizedFacility, RawFacilityRecord } from './types';

const CORPORATE_SUFFIXES = [
  'incorporated','inc','corporation','corp','company','co','llc','l l c',
  'lp','llp','plc','pllc','pc','ltd','limited','holdings','holding',
  'enterprises','enterprise','group','partners','partnership','trust',
  'properties','property','realty','management','mgmt','services','svc',
];

const NUMBER_WORDS: Record<string, string> = {
  zero: '0', one: '1', two: '2', three: '3', four: '4', five: '5',
  six: '6', seven: '7', eight: '8', nine: '9', ten: '10', eleven: '11',
};

const STOP_TOKENS = new Set(['the', 'and', 'of', '&', 'a', 'an']);

function stripStoreSuffix(name: string): string {
  // Remove trailing "#1234", "Store 5", "Site No 12", etc. so per-store rows
  // for the same chain collapse together.
  return name
    .replace(/\s*#\s*\d+[a-z]?\s*$/i, '')
    .replace(/\s*(store|site|station|facility|location)\s*(no\.?|#)?\s*\d+[a-z]?\s*$/i, '')
    .replace(/\s*-\s*\d{2,5}\s*$/i, '')
    .trim();
}

export function ownerKey(name: string): string {
  let s = stripStoreSuffix(name).toLowerCase();

  // Map written numbers ("seven eleven" -> "7 11").
  s = s.replace(/\b([a-z]+)\b/g, (m) => NUMBER_WORDS[m] ?? m);

  // Collapse possessives, punctuation, and connecting characters.
  s = s
    .replace(/['’]s\b/g, '')
    .replace(/[.,&/()]+/g, ' ')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const tokens = s
    .split(' ')
    .filter((t) => t.length > 0)
    .filter((t) => !STOP_TOKENS.has(t));

  // Strip trailing corporate suffix tokens — repeat to handle "Foo LLC Inc".
  while (tokens.length > 1 && CORPORATE_SUFFIXES.includes(tokens[tokens.length - 1])) {
    tokens.pop();
  }

  return tokens.join(' ');
}

export function canonicalOwnerName(name: string): string {
  // Title-case the cleaned name but preserve common acronyms.
  const cleaned = stripStoreSuffix(name)
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned
    .split(' ')
    .map((tok) => {
      const upper = tok.toUpperCase();
      if (/^(LLC|INC|LP|LLP|USA|US|BP|EG|AM|PM|CITGO|EXXON|MOBIL)$/.test(upper)) {
        return upper.replace(/\.$/, '');
      }
      if (/^[A-Z0-9.&'-]+$/.test(tok) && tok.length <= 4) return upper;
      return tok.charAt(0).toUpperCase() + tok.slice(1).toLowerCase();
    })
    .join(' ');
}

/** Junk owner names that always indicate a single-owner mom-and-pop or unknown. */
const REJECTED_KEYS = new Set([
  '', 'unknown', 'n a', 'na', 'none', 'not available', 'private', 'individual',
  'owner', 'see notes', 'tbd', 'redacted',
]);

/** Heuristics that a row's "owner" is actually a personal name, not a chain entity. */
function looksLikeIndividual(name: string): boolean {
  // "JOHN A SMITH" or "SMITH, JOHN" — 2-3 tokens, no corporate suffix tokens.
  const cleaned = name.replace(/[.,]/g, ' ').trim();
  const tokens = cleaned.split(/\s+/);
  if (tokens.length === 0 || tokens.length > 4) return false;
  const lc = cleaned.toLowerCase();
  if (CORPORATE_SUFFIXES.some((s) => lc.includes(` ${s}`) || lc.endsWith(s))) {
    return false;
  }
  if (/[0-9]/.test(cleaned)) return false;
  return tokens.every((t) => /^[A-Za-z'-]+$/.test(t));
}

export function normalize(rec: RawFacilityRecord): NormalizedFacility | null {
  const raw = (rec.ownerName || rec.operatorName || '').trim();
  if (!raw) return null;

  const key = ownerKey(raw);
  if (REJECTED_KEYS.has(key)) return null;
  if (looksLikeIndividual(raw)) return null;

  return {
    ...rec,
    ownerKey: key,
    canonicalOwnerName: canonicalOwnerName(raw),
  };
}
