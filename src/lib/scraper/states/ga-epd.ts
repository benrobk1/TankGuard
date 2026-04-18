/**
 * Georgia — Environmental Protection Division (EPD), UST program.
 *
 * GA EPD publishes the "Current or former UST Owners or Operators" report
 * and county-level facility data on the UST Data & Reporting page:
 *   https://epd.georgia.gov/ust-data-and-reporting
 *
 * The owner/operator extract is published as an Excel workbook on a
 * biannual cadence. The Open Data layer behind the page exposes a CSV
 * mirror at:
 *   https://epd.georgia.gov/sites/epd.georgia.gov/files/related_files/site_page/UST_Facilities.csv
 *
 * Documented columns:
 *   FACILITY_ID, FACILITY_NAME, OWNER_NAME, OPERATOR_NAME, ADDRESS, CITY,
 *   COUNTY, ZIP, OWNER_PHONE, OWNER_EMAIL, NUM_TANKS, FACILITY_STATUS,
 *   LAST_INSPECTION_DATE, COMPLIANCE_STATUS
 *
 * Note: GA EPD's GEOS portal also serves facility data behind a login;
 * we deliberately avoid it because (a) public-only sourcing keeps this
 * job ToS-clean and (b) the open-data CSV covers the same population.
 */

import { fetchText, parseCsv, type FetchOptions } from '../http';
import type { RawFacilityRecord, ScraperRunOptions, StateScraper } from '../types';

const BULK_URL =
  'https://epd.georgia.gov/sites/epd.georgia.gov/files/related_files/site_page/UST_Facilities.csv';

function mapRow(row: Record<string, string>): RawFacilityRecord | null {
  const facilityName = row.FACILITY_NAME;
  const facId = row.FACILITY_ID;
  if (!facilityName || !facId) return null;
  const tanks = parseInt(row.NUM_TANKS || '', 10);
  return {
    sourceFacilityId: facId,
    state: 'GA',
    facilityName,
    ownerName: row.OWNER_NAME || undefined,
    operatorName: row.OPERATOR_NAME || undefined,
    address: row.ADDRESS || undefined,
    city: row.CITY || undefined,
    county: row.COUNTY || undefined,
    zip: row.ZIP || undefined,
    phone: row.OWNER_PHONE || undefined,
    email: row.OWNER_EMAIL || undefined,
    tankCount: Number.isFinite(tanks) ? tanks : undefined,
    facilityStatus: row.FACILITY_STATUS || undefined,
    complianceStatus: row.COMPLIANCE_STATUS || undefined,
    sourceUrl: BULK_URL,
    raw: row,
  };
}

export const gaEpdScraper: StateScraper = {
  state: 'GA',
  agency: 'Georgia Environmental Protection Division',
  source: 'EPD UST Facilities open-data CSV',

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
