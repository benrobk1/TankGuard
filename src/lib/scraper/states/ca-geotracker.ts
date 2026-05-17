/**
 * California — State Water Resources Control Board, GeoTracker.
 *
 * GeoTracker exposes UST facility-level data through the public ESI download
 * service: https://geotracker.waterboards.ca.gov/data_download_by_county.asp
 *
 * The service ships per-county "UST Facility" CSVs with these columns
 * (subset, as of the 2024-Q4 schema):
 *   GLOBAL_ID, FACILITY_NAME, FACILITY_STATUS, ADDRESS, CITY, ZIP, COUNTY,
 *   OWNER, OPERATOR, OWNER_PHONE, OWNER_EMAIL, NUM_TANKS, LATITUDE, LONGITUDE
 *
 * For statewide pulls we iterate the 58 counties and concat. The base URL is
 * deterministic; we encode the county name verbatim as the source documents.
 */

import { fetchText, parseCsv, type FetchOptions } from '../http';
import type { RawFacilityRecord, ScraperRunOptions, StateScraper } from '../types';

const BASE_URL =
  'https://geotracker.waterboards.ca.gov/data_download/edf/UST_FACILITY';

const CA_COUNTIES = [
  'ALAMEDA','ALPINE','AMADOR','BUTTE','CALAVERAS','COLUSA','CONTRA COSTA',
  'DEL NORTE','EL DORADO','FRESNO','GLENN','HUMBOLDT','IMPERIAL','INYO',
  'KERN','KINGS','LAKE','LASSEN','LOS ANGELES','MADERA','MARIN','MARIPOSA',
  'MENDOCINO','MERCED','MODOC','MONO','MONTEREY','NAPA','NEVADA','ORANGE',
  'PLACER','PLUMAS','RIVERSIDE','SACRAMENTO','SAN BENITO','SAN BERNARDINO',
  'SAN DIEGO','SAN FRANCISCO','SAN JOAQUIN','SAN LUIS OBISPO','SAN MATEO',
  'SANTA BARBARA','SANTA CLARA','SANTA CRUZ','SHASTA','SIERRA','SISKIYOU',
  'SOLANO','SONOMA','STANISLAUS','SUTTER','TEHAMA','TRINITY','TULARE',
  'TUOLUMNE','VENTURA','YOLO','YUBA',
];

function countyDownloadUrl(county: string): string {
  return `${BASE_URL}_${encodeURIComponent(county.replace(/ /g, '_'))}.csv`;
}

function mapRow(
  row: Record<string, string>,
  sourceUrl: string,
): RawFacilityRecord | null {
  const facilityName = row.FACILITY_NAME || row.facility_name;
  const globalId = row.GLOBAL_ID || row.global_id;
  if (!facilityName || !globalId) return null;

  const tanks = parseInt(row.NUM_TANKS || row.num_tanks || '', 10);
  const lat = parseFloat(row.LATITUDE || row.latitude || '');
  const lon = parseFloat(row.LONGITUDE || row.longitude || '');

  return {
    sourceFacilityId: globalId,
    state: 'CA',
    facilityName,
    ownerName: row.OWNER || row.owner || undefined,
    operatorName: row.OPERATOR || row.operator || undefined,
    address: row.ADDRESS || row.address || undefined,
    city: row.CITY || row.city || undefined,
    county: row.COUNTY || row.county || undefined,
    zip: row.ZIP || row.zip || undefined,
    phone: row.OWNER_PHONE || row.owner_phone || undefined,
    email: row.OWNER_EMAIL || row.owner_email || undefined,
    tankCount: Number.isFinite(tanks) ? tanks : undefined,
    facilityStatus: row.FACILITY_STATUS || row.facility_status || undefined,
    latitude: Number.isFinite(lat) ? lat : undefined,
    longitude: Number.isFinite(lon) ? lon : undefined,
    sourceUrl,
    raw: row,
  };
}

export const caGeoTrackerScraper: StateScraper = {
  state: 'CA',
  agency: 'State Water Resources Control Board',
  source: 'GeoTracker UST Facility data download',

  async fetchFacilities(options: ScraperRunOptions = {}): Promise<RawFacilityRecord[]> {
    const fetchOpts: FetchOptions = {
      fetcher: options.fetcher,
      timeoutMs: options.timeoutMs,
    };

    const out: RawFacilityRecord[] = [];

    for (const county of CA_COUNTIES) {
      if (options.limit && out.length >= options.limit) break;

      const url = countyDownloadUrl(county);
      let text: string;
      try {
        text = await fetchText(url, fetchOpts);
      } catch (err) {
        // Counties with zero registered USTs return 404 — skip silently.
        console.warn(`[CA] skipping ${county}: ${(err as Error).message}`);
        continue;
      }

      const rows = parseCsv(text);
      for (const row of rows) {
        const rec = mapRow(row, url);
        if (!rec) continue;
        if (
          options.activeOnly &&
          rec.facilityStatus &&
          !/active|operating/i.test(rec.facilityStatus)
        ) {
          continue;
        }
        out.push(rec);
        if (options.limit && out.length >= options.limit) break;
      }
    }

    return out;
  },
};
