/**
 * Florida — Department of Environmental Protection, Storage Tank facilities.
 *
 * FL DEP publishes the full statewide storage-tank facility roster through
 * its Open Data portal as a single CSV (~6 MB):
 *   https://geodata.dep.state.fl.us/datasets/storage-tank-contamination-monitoring-facilities.csv
 *
 * Columns of interest (snake-case in the export):
 *   facility_id, facility_name, owner_name, owner_phone, owner_email,
 *   facility_address, facility_city, facility_county, facility_zip,
 *   tank_count, regulatory_status
 *
 * The DepStorage HTML search at prodenv.dep.state.fl.us/DepStorage/ is also
 * available for ad-hoc lookups, but the bulk CSV is canonical and comes from
 * the same backing system, so we use it for the target-list build.
 */

import { fetchText, parseCsv, type FetchOptions } from '../http';
import type { RawFacilityRecord, ScraperRunOptions, StateScraper } from '../types';

const BULK_URL =
  'https://geodata.dep.state.fl.us/datasets/storage-tank-contamination-monitoring-facilities.csv';

function mapRow(row: Record<string, string>): RawFacilityRecord | null {
  const facilityName = row.facility_name || row.FACILITY_NAME;
  const facilityId = row.facility_id || row.FACILITY_ID;
  if (!facilityName || !facilityId) return null;

  const tanks = parseInt(row.tank_count || row.TANK_COUNT || '', 10);

  return {
    sourceFacilityId: facilityId,
    state: 'FL',
    facilityName,
    ownerName: row.owner_name || row.OWNER_NAME || undefined,
    address: row.facility_address || row.FACILITY_ADDRESS || undefined,
    city: row.facility_city || row.FACILITY_CITY || undefined,
    county: row.facility_county || row.FACILITY_COUNTY || undefined,
    zip: row.facility_zip || row.FACILITY_ZIP || undefined,
    phone: row.owner_phone || row.OWNER_PHONE || undefined,
    email: row.owner_email || row.OWNER_EMAIL || undefined,
    tankCount: Number.isFinite(tanks) ? tanks : undefined,
    facilityStatus: row.regulatory_status || row.REGULATORY_STATUS || undefined,
    sourceUrl: BULK_URL,
    raw: row,
  };
}

export const flDepScraper: StateScraper = {
  state: 'FL',
  agency: 'Florida Department of Environmental Protection',
  source: 'DEP Storage Tank facility bulk CSV',

  async fetchFacilities(options: ScraperRunOptions = {}): Promise<RawFacilityRecord[]> {
    const fetchOpts: FetchOptions = {
      fetcher: options.fetcher,
      timeoutMs: options.timeoutMs,
    };

    const text = await fetchText(BULK_URL, fetchOpts);
    const rows = parseCsv(text);

    const out: RawFacilityRecord[] = [];
    for (const row of rows) {
      const rec = mapRow(row);
      if (!rec) continue;
      if (
        options.activeOnly &&
        rec.facilityStatus &&
        !/open|active|regulated/i.test(rec.facilityStatus)
      ) {
        continue;
      }
      out.push(rec);
      if (options.limit && out.length >= options.limit) break;
    }

    return out;
  },
};
