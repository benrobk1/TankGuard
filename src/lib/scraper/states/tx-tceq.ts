/**
 * Texas — Commission on Environmental Quality, Petroleum Storage Tank
 * Registration (PSTR).
 *
 * TCEQ ships PSTR data through two public surfaces:
 *
 *   1. The "Central Registry — Regulated Entity" search at
 *        https://www15.tceq.texas.gov/crpub/  (HTML, slow, paginated)
 *   2. The Open Records FTP-style download:
 *        https://www.tceq.texas.gov/downloads/remediation/pst/pstreg.csv
 *      (refreshed weekly, contains all registered LPST/UST facilities)
 *
 * We use the bulk CSV. Columns per the published data dictionary:
 *   FAC_ID, FAC_NAME, OWNER_NAME, OWNER_CONTACT, OWNER_PHONE, OWNER_EMAIL,
 *   FAC_ADDR, FAC_CITY, FAC_COUNTY, FAC_ZIP, NUM_REGULATED_TANKS,
 *   FAC_STATUS, INSTALL_DATES
 */

import { fetchText, parseCsv, type FetchOptions } from '../http';
import type { RawFacilityRecord, ScraperRunOptions, StateScraper } from '../types';

const BULK_URL = 'https://www.tceq.texas.gov/downloads/remediation/pst/pstreg.csv';

function mapRow(row: Record<string, string>): RawFacilityRecord | null {
  const facilityName = row.FAC_NAME;
  const facId = row.FAC_ID;
  if (!facilityName || !facId) return null;

  const tanks = parseInt(row.NUM_REGULATED_TANKS || '', 10);

  return {
    sourceFacilityId: facId,
    state: 'TX',
    facilityName,
    ownerName: row.OWNER_NAME || undefined,
    operatorName: row.OWNER_CONTACT || undefined,
    address: row.FAC_ADDR || undefined,
    city: row.FAC_CITY || undefined,
    county: row.FAC_COUNTY || undefined,
    zip: row.FAC_ZIP || undefined,
    phone: row.OWNER_PHONE || undefined,
    email: row.OWNER_EMAIL || undefined,
    tankCount: Number.isFinite(tanks) ? tanks : undefined,
    facilityStatus: row.FAC_STATUS || undefined,
    installationDates: row.INSTALL_DATES || undefined,
    sourceUrl: BULK_URL,
    raw: row,
  };
}

export const txTceqScraper: StateScraper = {
  state: 'TX',
  agency: 'Texas Commission on Environmental Quality',
  source: 'PSTR weekly bulk CSV',

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
        !/active|in service/i.test(rec.facilityStatus)
      ) {
        continue;
      }
      out.push(rec);
      if (options.limit && out.length >= options.limit) break;
    }

    return out;
  },
};
