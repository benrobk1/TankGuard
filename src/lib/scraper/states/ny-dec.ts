/**
 * New York — Department of Environmental Conservation, Petroleum Bulk
 * Storage (PBS) registration.
 *
 * NY publishes the PBS registry through data.ny.gov as a Socrata dataset.
 * Resource: "Petroleum Bulk Storage (PBS) Sites - Active" (id: 8ehh-nbmk)
 *
 * We hit the JSON endpoint (paginated, 50k row max per page):
 *   https://data.ny.gov/resource/8ehh-nbmk.json?$limit=50000&$offset=N
 *
 * Documented field names (Socrata camelCase):
 *   pbs_number, facility_name, owner_name, owner_address, contact_phone,
 *   contact_email, site_address, site_city, site_county, site_zip,
 *   number_of_tanks, facility_status, latitude, longitude
 */

import { fetchJson, type FetchOptions } from '../http';
import type { RawFacilityRecord, ScraperRunOptions, StateScraper } from '../types';

const BASE = 'https://data.ny.gov/resource/8ehh-nbmk.json';
const PAGE_SIZE = 50_000;

interface NYRow {
  pbs_number?: string;
  facility_name?: string;
  owner_name?: string;
  contact_phone?: string;
  contact_email?: string;
  site_address?: string;
  site_city?: string;
  site_county?: string;
  site_zip?: string;
  number_of_tanks?: string;
  facility_status?: string;
  latitude?: string;
  longitude?: string;
  [k: string]: unknown;
}

function mapRow(row: NYRow, sourceUrl: string): RawFacilityRecord | null {
  if (!row.facility_name || !row.pbs_number) return null;
  const tanks = parseInt(row.number_of_tanks || '', 10);
  const lat = parseFloat(row.latitude || '');
  const lon = parseFloat(row.longitude || '');
  return {
    sourceFacilityId: row.pbs_number,
    state: 'NY',
    facilityName: row.facility_name,
    ownerName: row.owner_name || undefined,
    address: row.site_address || undefined,
    city: row.site_city || undefined,
    county: row.site_county || undefined,
    zip: row.site_zip || undefined,
    phone: row.contact_phone || undefined,
    email: row.contact_email || undefined,
    tankCount: Number.isFinite(tanks) ? tanks : undefined,
    facilityStatus: row.facility_status || undefined,
    latitude: Number.isFinite(lat) ? lat : undefined,
    longitude: Number.isFinite(lon) ? lon : undefined,
    sourceUrl,
    raw: row as Record<string, unknown>,
  };
}

export const nyDecScraper: StateScraper = {
  state: 'NY',
  agency: 'New York Department of Environmental Conservation',
  source: 'data.ny.gov PBS Sites (8ehh-nbmk)',

  async fetchFacilities(options: ScraperRunOptions = {}): Promise<RawFacilityRecord[]> {
    const fetchOpts: FetchOptions = {
      fetcher: options.fetcher,
      timeoutMs: options.timeoutMs,
    };

    const out: RawFacilityRecord[] = [];
    let offset = 0;

    while (true) {
      const url = `${BASE}?$limit=${PAGE_SIZE}&$offset=${offset}`;
      const page = await fetchJson<NYRow[]>(url, fetchOpts);
      if (!Array.isArray(page) || page.length === 0) break;

      for (const row of page) {
        const rec = mapRow(row, url);
        if (!rec) continue;
        if (
          options.activeOnly &&
          rec.facilityStatus &&
          !/active|in service/i.test(rec.facilityStatus)
        ) {
          continue;
        }
        out.push(rec);
        if (options.limit && out.length >= options.limit) return out;
      }

      if (page.length < PAGE_SIZE) break;
      offset += PAGE_SIZE;
    }

    return out;
  },
};
