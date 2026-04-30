/**
 * Indiana — Department of Environmental Management (IDEM), UST program.
 *
 * IDEM publishes the full Indiana UST registry as an Excel workbook on the
 * UST data page; the Open Data mirror is served at:
 *   https://www.in.gov/idem/files/storage_tanks_ust_facilities.csv
 *
 * Documented columns:
 *   FACILITY_ID, FACILITY_NAME, OWNER, OPERATOR, ADDRESS, CITY, COUNTY,
 *   ZIP, PHONE, EMAIL, NUM_USTS, FACILITY_STATUS, RED_TAGGED,
 *   LAST_INSPECTION
 *
 * The RED_TAGGED column maps to the Delivery Prohibition List — facilities
 * blocked from receiving fuel until they remediate. We surface that as the
 * strongest single trigger event the brief calls out (Indiana has the
 * lowest TCR in the nation at 19%, so red-tag operators are everywhere).
 */

import { fetchText, parseCsv, type FetchOptions } from '../http';
import type { RawFacilityRecord, ScraperRunOptions, StateScraper } from '../types';

const BULK_URL =
  'https://www.in.gov/idem/files/storage_tanks_ust_facilities.csv';

function mapRow(row: Record<string, string>): RawFacilityRecord | null {
  const facilityName = row.FACILITY_NAME;
  const facId = row.FACILITY_ID;
  if (!facilityName || !facId) return null;
  const tanks = parseInt(row.NUM_USTS || '', 10);

  // Promote red-tag status into complianceStatus so the operator
  // aggregator surfaces it on the rolled-up record.
  const redTagged = /^(y|yes|true|1)$/i.test(row.RED_TAGGED || '');
  const compliance = redTagged
    ? 'RED_TAGGED'
    : row.FACILITY_STATUS || undefined;

  return {
    sourceFacilityId: facId,
    state: 'IN',
    facilityName,
    ownerName: row.OWNER || undefined,
    operatorName: row.OPERATOR || undefined,
    address: row.ADDRESS || undefined,
    city: row.CITY || undefined,
    county: row.COUNTY || undefined,
    zip: row.ZIP || undefined,
    phone: row.PHONE || undefined,
    email: row.EMAIL || undefined,
    tankCount: Number.isFinite(tanks) ? tanks : undefined,
    facilityStatus: row.FACILITY_STATUS || undefined,
    complianceStatus: compliance,
    sourceUrl: BULK_URL,
    raw: row,
  };
}

export const inIdemScraper: StateScraper = {
  state: 'IN',
  agency: 'Indiana Department of Environmental Management',
  source: 'IDEM UST facilities CSV (Delivery Prohibition flag included)',

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
        !/active|in service|operational/i.test(rec.facilityStatus)
      ) {
        continue;
      }
      out.push(rec);
      if (options.limit && out.length >= options.limit) break;
    }
    return out;
  },
};
