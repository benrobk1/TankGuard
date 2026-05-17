/**
 * Operator aggregation + chain-operator filter.
 *
 * Given normalized facility rows from all 5 states, group by `ownerKey` and
 * keep operators with 3-20 distinct sites. The 3-20 band is the product
 * brief's definition of a "chain operator" sweet spot: large enough to need
 * compliance software, small enough that they don't already have an in-house
 * EHS team running their own system.
 */

import type {
  NormalizedFacility,
  OperatorAggregate,
  StateCode,
} from './types';

const MIN_SITES = 3;
const MAX_SITES = 20;

export interface AggregateOptions {
  minSites?: number;
  maxSites?: number;
}

export function aggregateOperators(
  facilities: NormalizedFacility[],
  options: AggregateOptions = {},
): OperatorAggregate[] {
  const minSites = options.minSites ?? MIN_SITES;
  const maxSites = options.maxSites ?? MAX_SITES;

  // Dedupe facilities first: the same site can appear in two pulls (e.g. an
  // owner-rename creates a new GLOBAL_ID in CA). Key on state + facility ID.
  const seen = new Set<string>();
  const deduped: NormalizedFacility[] = [];
  for (const f of facilities) {
    const k = `${f.state}:${f.sourceFacilityId}`;
    if (seen.has(k)) continue;
    seen.add(k);
    deduped.push(f);
  }

  // Group by ownerKey, but also dedupe sites within an owner using
  // address+city — two state pulls can both see a multi-state operator's
  // store, and owner-name spellings can drift across pulls.
  const byOwner = new Map<string, NormalizedFacility[]>();
  for (const f of deduped) {
    const list = byOwner.get(f.ownerKey) ?? [];
    list.push(f);
    byOwner.set(f.ownerKey, list);
  }

  const out: OperatorAggregate[] = [];

  for (const [key, sites] of byOwner) {
    const uniqueSites = dedupeSites(sites);
    if (uniqueSites.length < minSites || uniqueSites.length > maxSites) continue;

    const states = Array.from(new Set(uniqueSites.map((s) => s.state))) as StateCode[];
    states.sort();

    // Pick the longest, most-formed canonical owner name we observed.
    const canonical = uniqueSites
      .map((s) => s.canonicalOwnerName)
      .sort((a, b) => b.length - a.length)[0];

    const tankCount = uniqueSites.reduce(
      (sum, s) => sum + (s.tankCount ?? 0),
      0,
    );

    const primary = pickPrimaryContact(uniqueSites);

    out.push({
      ownerKey: key,
      canonicalOwnerName: canonical,
      siteCount: uniqueSites.length,
      states,
      facilities: uniqueSites,
      estimatedTankCount: tankCount,
      primaryPhone: primary.phone,
      primaryEmail: primary.email,
      primaryAddress: primary.address,
      primaryCity: primary.city,
      primaryState: primary.state,
      primaryZip: primary.zip,
    });
  }

  return out;
}

function dedupeSites(sites: NormalizedFacility[]): NormalizedFacility[] {
  const seen = new Set<string>();
  const out: NormalizedFacility[] = [];
  for (const s of sites) {
    const addrKey = `${(s.address ?? '').toLowerCase().trim()}|${(s.city ?? '').toLowerCase().trim()}|${s.state}`;
    if (addrKey !== '||' + s.state && seen.has(addrKey)) continue;
    seen.add(addrKey);
    out.push(s);
  }
  return out;
}

function pickPrimaryContact(sites: NormalizedFacility[]): {
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: StateCode;
  zip?: string;
} {
  const phone = sites.find((s) => s.phone)?.phone;
  const email = sites.find((s) => s.email)?.email;
  // Prefer the first site with a complete address; fall back to first.
  const withAddr = sites.find((s) => s.address && s.city && s.zip) ?? sites[0];
  return {
    phone,
    email,
    address: withAddr?.address,
    city: withAddr?.city,
    state: withAddr?.state,
    zip: withAddr?.zip,
  };
}
