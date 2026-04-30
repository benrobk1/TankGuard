/**
 * Pennsylvania — Department of Environmental Protection, Underground Storage
 * Tank Indemnification Fund (USTIF) / eFACTS storage tank facility list.
 *
 * PA DEP exposes the registered storage-tank facility table through its
 * eFACTS Open Data feed:
 *   https://cedatareporting.pa.gov/Reportserver?%2fPublic%2fDEP%2fBSTR%2fSSRS%2fStorageTankFacilityList&rs:Format=CSV
 *
 * This is the same dataset that backs the USTIF eligibility lookup. Columns:
 *   FacilityID, FacilityName, OwnerName, OwnerPhone, OwnerEmail,
 *   StreetAddress, City, County, ZipCode, NumUSTs, FacilityStatus,
 *   InstallDateRange
 *
 * The CSV is small (~3 MB) and refreshed nightly.
 */

import { fetchText, parseCsv, type FetchOptions } from '../http';
import type { RawFacilityRecord, ScraperRunOptions, StateScraper } from '../types';

const BULK_URL =
  'https://cedatareporting.pa.gov/Reportserver?%2fPublic%2fDEP%2fBSTR%2fSSRS%2fStorageTankFacilityList&rs:Format=CSV';

function mapRow(row: Record<string, string>): RawFacilityRecord | null {
  const facilityName = row.FacilityName;
  const facilityId = row.FacilityID;
  if (!facilityName || !facilityId) return null;
  const tanks = parseInt(row.NumUSTs || '', 10);
  return {
    sourceFacilityId: facilityId,
    state: 'PA',
    facilityName,
    ownerName: row.OwnerName || undefined,
    address: row.StreetAddress || undefined,
    city: row.City || undefined,
    county: row.County || undefined,
    zip: row.ZipCode || undefined,
    phone: row.OwnerPhone || undefined,
    email: row.OwnerEmail || undefined,
    tankCount: Number.isFinite(tanks) ? tanks : undefined,
    facilityStatus: row.FacilityStatus || undefined,
    installationDates: row.InstallDateRange || undefined,
    sourceUrl: BULK_URL,
    raw: row,
  };
}

export const paDepScraper: StateScraper = {
  state: 'PA',
  agency: 'Pennsylvania Department of Environmental Protection',
  source: 'eFACTS Storage Tank Facility list (USTIF)',

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
        !/active|currently regulated/i.test(rec.facilityStatus)
      ) {
        continue;
      }
      out.push(rec);
      if (options.limit && out.length >= options.limit) break;
    }

    return out;
  },
};
