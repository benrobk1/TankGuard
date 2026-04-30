/**
 * Virginia — Department of Environmental Quality (DEQ), UST program.
 *
 * VA DEQ publishes UST facility data daily through the Virginia Open Data
 * ArcGIS GeoHub. The hosted feature service exposes a paginated REST query
 * endpoint that returns GeoJSON features:
 *   https://services.arcgis.com/p5v98VHDX9Atv3l7/arcgis/rest/services/UST_Facilities/FeatureServer/0/query
 *
 * We page in 2,000-feature chunks (the service-side cap) and walk the
 * resultOffset until the response is empty.
 *
 * Documented attribute fields:
 *   FACILITY_ID, FACILITY_NAME, OWNER_NAME, OPERATOR_NAME, ADDRESS,
 *   CITY, COUNTY, ZIP, PHONE, EMAIL, NUM_USTS, FACILITY_STATUS
 *
 * Per the brief: VA DEQ's October-2025 severity-based enforcement is the
 * driver here. Operators previously written warnings now face escalated
 * penalties — the target list should not skip Virginia even though its raw
 * UST count (17,657) is mid-pack.
 */

import { fetchJson, type FetchOptions } from '../http';
import type { RawFacilityRecord, ScraperRunOptions, StateScraper } from '../types';

const BASE =
  'https://services.arcgis.com/p5v98VHDX9Atv3l7/arcgis/rest/services/UST_Facilities/FeatureServer/0/query';
const PAGE_SIZE = 2_000;

interface ArcGisFeature {
  attributes: Record<string, string | number | null>;
}

interface ArcGisResponse {
  features?: ArcGisFeature[];
  exceededTransferLimit?: boolean;
}

function attr(a: Record<string, string | number | null>, key: string): string | undefined {
  const v = a[key];
  if (v === null || v === undefined) return undefined;
  return String(v).trim() || undefined;
}

function mapFeature(f: ArcGisFeature, sourceUrl: string): RawFacilityRecord | null {
  const a = f.attributes;
  const facilityName = attr(a, 'FACILITY_NAME');
  const facId = attr(a, 'FACILITY_ID');
  if (!facilityName || !facId) return null;

  const tanks = parseInt(attr(a, 'NUM_USTS') || '', 10);

  return {
    sourceFacilityId: facId,
    state: 'VA',
    facilityName,
    ownerName: attr(a, 'OWNER_NAME'),
    operatorName: attr(a, 'OPERATOR_NAME'),
    address: attr(a, 'ADDRESS'),
    city: attr(a, 'CITY'),
    county: attr(a, 'COUNTY'),
    zip: attr(a, 'ZIP'),
    phone: attr(a, 'PHONE'),
    email: attr(a, 'EMAIL'),
    tankCount: Number.isFinite(tanks) ? tanks : undefined,
    facilityStatus: attr(a, 'FACILITY_STATUS'),
    sourceUrl,
    raw: a as Record<string, unknown>,
  };
}

export const vaDeqScraper: StateScraper = {
  state: 'VA',
  agency: 'Virginia Department of Environmental Quality',
  source: 'VA Open Data ArcGIS UST_Facilities feature service',

  async fetchFacilities(options: ScraperRunOptions = {}): Promise<RawFacilityRecord[]> {
    const fetchOpts: FetchOptions = {
      fetcher: options.fetcher,
      timeoutMs: options.timeoutMs,
    };

    const out: RawFacilityRecord[] = [];
    let offset = 0;

    while (true) {
      const url =
        `${BASE}?where=1%3D1&outFields=*&f=json` +
        `&resultOffset=${offset}&resultRecordCount=${PAGE_SIZE}`;

      const page = await fetchJson<ArcGisResponse>(url, fetchOpts);
      const features = page.features ?? [];
      if (features.length === 0) break;

      for (const f of features) {
        const rec = mapFeature(f, url);
        if (!rec) continue;
        if (
          options.activeOnly &&
          rec.facilityStatus &&
          !/active|in service|operational/i.test(rec.facilityStatus)
        ) {
          continue;
        }
        out.push(rec);
        if (options.limit && out.length >= options.limit) return out;
      }

      if (!page.exceededTransferLimit && features.length < PAGE_SIZE) break;
      offset += features.length;
    }

    return out;
  },
};
