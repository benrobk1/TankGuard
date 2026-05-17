/**
 * Shared types for the UST target-list scraping pipeline.
 *
 * The 5 in-scope source agencies (per product brief):
 *   CA - State Water Resources Control Board, GeoTracker
 *   FL - Department of Environmental Protection, Storage Tank Facilities
 *   TX - Commission on Environmental Quality, Petroleum Storage Tank Registration (PSTR)
 *   NY - Department of Environmental Conservation, Petroleum Bulk Storage (PBS)
 *   PA - Department of Environmental Protection, Underground Storage Tank Indemnification Fund (USTIF) / eFACTS
 */

export type StateCode = 'CA' | 'FL' | 'TX' | 'NY' | 'PA' | 'GA' | 'IN' | 'VA';

/**
 * Go-to-market tiering used to bias the target-list ranker toward states
 * where scrapeable data, regulatory pain, and ICP density combine to make
 * cold outreach most efficient. Mirrors the prioritization brief:
 *   Tier 1 — launch states (FL, TX, GA, IN, VA)
 *   Tier 2 — secondary, targeted campaigns (CA single-wall list, NJ WoM)
 *   Tier 3 — fill-in markets after Tier 1/2 are saturated
 *
 * Weights are added to the operator score in build-target-list.ts so a
 * 3-site Florida operator outranks a 3-site California operator when other
 * signals are equal. The 2,000-row cap is unchanged; tiering only affects
 * which operators land above the cut line when the long tail is competitive.
 */
export const STATE_TIER: Record<StateCode, 1 | 2 | 3> = {
  FL: 1,
  TX: 1,
  GA: 1,
  IN: 1,
  VA: 1,
  CA: 2,
  NY: 3,
  PA: 3,
};

export const STATE_TIER_BONUS: Record<1 | 2 | 3, number> = {
  1: 20,
  2: 5,
  3: 0,
};

export interface RawFacilityRecord {
  /** Source-provided facility/site identifier (registration number, facility ID, etc.). */
  sourceFacilityId: string;
  state: StateCode;
  facilityName: string;
  ownerName?: string;
  operatorName?: string;
  address?: string;
  city?: string;
  county?: string;
  zip?: string;
  phone?: string;
  email?: string;
  /** Number of regulated USTs at this facility, if reported. */
  tankCount?: number;
  /** "ACTIVE" | "TEMPORARILY_OUT_OF_SERVICE" | "PERMANENTLY_CLOSED" | etc. */
  facilityStatus?: string;
  productsStored?: string;
  installationDates?: string;
  complianceStatus?: string;
  latitude?: number;
  longitude?: number;
  /** URL of the source page or download. */
  sourceUrl: string;
  /** Source-specific raw payload (kept for debugging / re-parsing). */
  raw?: Record<string, unknown>;
}

export interface ScraperRunOptions {
  /** Hard cap on records pulled per state (use to bound free-tier API quotas). */
  limit?: number;
  /** When true, skip records flagged closed/abandoned at the source. */
  activeOnly?: boolean;
  /** Optional fetch implementation override (used in tests). */
  fetcher?: typeof fetch;
  /** Per-request timeout in ms. */
  timeoutMs?: number;
}

export interface StateScraper {
  state: StateCode;
  agency: string;
  source: string;
  /** Pull facility-level rows from the agency's public dataset. */
  fetchFacilities(options?: ScraperRunOptions): Promise<RawFacilityRecord[]>;
}

/** A facility row after owner-name normalization but before operator rollup. */
export interface NormalizedFacility extends RawFacilityRecord {
  /** Lowercased, stripped, suffix-collapsed key used for owner grouping. */
  ownerKey: string;
  /** Display-cased canonical owner name (e.g., "7-Eleven Inc."). */
  canonicalOwnerName: string;
}

/** A rolled-up operator with the facilities they own across all sources. */
export interface OperatorAggregate {
  ownerKey: string;
  canonicalOwnerName: string;
  siteCount: number;
  states: StateCode[];
  facilities: NormalizedFacility[];
  /** Estimated total UST count across all sites (sum of tankCount where known). */
  estimatedTankCount: number;
  /** Highest-quality contact phone/email observed across the operator's sites. */
  primaryPhone?: string;
  primaryEmail?: string;
  primaryAddress?: string;
  primaryCity?: string;
  primaryState?: StateCode;
  primaryZip?: string;
}

/** A row in the final target list export. */
export interface TargetAccount {
  rank: number;
  operatorName: string;
  siteCount: number;
  estimatedTankCount: number;
  states: string;
  primaryState: StateCode;
  primaryCity?: string;
  primaryAddress?: string;
  primaryZip?: string;
  primaryPhone?: string;
  primaryEmail?: string;
  /** Composite score 0-100 used to rank accounts before the 2,000 cap. */
  score: number;
  /** Top facility names (up to 5) for outreach personalization. */
  sampleSites: string;
}
