/**
 * State UST Registration Database Scraper
 *
 * Scrapes publicly available state environmental agency databases
 * to build prospect lists and auto-populate facility data during onboarding.
 *
 * Each state has its own scraper implementation due to varying database formats.
 */

import prisma from '@/lib/prisma';
import { caGeoTrackerScraper } from './states/ca-geotracker';
import { flDepScraper } from './states/fl-dep';
import { txTceqScraper } from './states/tx-tceq';
import { nyDecScraper } from './states/ny-dec';
import { paDepScraper } from './states/pa-dep';
import { gaEpdScraper } from './states/ga-epd';
import { inIdemScraper } from './states/in-idem';
import { vaDeqScraper } from './states/va-deq';
import type { StateScraper } from './types';

export type { RawFacilityRecord, OperatorAggregate, TargetAccount } from './types';
export { buildTargetList, targetsToCsv, TARGET_COUNT } from './build-target-list';

/**
 * State scrapers with a real fetch implementation. The original brief
 * named CA/FL/TX/NY/PA; the GTM prioritization pass added the Tier 1
 * states GA/IN/VA, since their data is scrapeable and the brief's 2,000-
 * account target needs the broader population to fill cleanly.
 */
export const liveStateScrapers: Partial<Record<string, StateScraper>> = {
  CA: caGeoTrackerScraper,
  FL: flDepScraper,
  TX: txTceqScraper,
  NY: nyDecScraper,
  PA: paDepScraper,
  GA: gaEpdScraper,
  IN: inIdemScraper,
  VA: vaDeqScraper,
};

export interface ScrapedFacility {
  facilityName: string;
  ownerName?: string;
  address?: string;
  city?: string;
  zip?: string;
  phone?: string;
  email?: string;
  tankCount?: number;
  tankTypes?: string;
  productsStored?: string;
  installationDates?: string;
  registrationNumber?: string;
  complianceStatus?: string;
  sourceUrl?: string;
}

// Registry of state database URLs and scraper configurations
export const stateScraperConfigs: Record<string, {
  name: string;
  databaseUrl: string;
  format: 'html' | 'csv' | 'api' | 'pdf';
  notes: string;
}> = {
  TX: {
    name: 'Texas Commission on Environmental Quality',
    databaseUrl: 'https://www.tceq.texas.gov/remediation/ust/ust-search.html',
    format: 'html',
    notes: 'Searchable HTML database. Can search by county, owner, or facility name.',
  },
  CA: {
    name: 'State Water Resources Control Board',
    databaseUrl: 'https://geotracker.waterboards.ca.gov/',
    format: 'api',
    notes: 'GeoTracker has a public API. Supports geospatial and keyword searches.',
  },
  FL: {
    name: 'Florida DEP',
    databaseUrl: 'https://prodenv.dep.state.fl.us/DepStorage/',
    format: 'html',
    notes: 'Searchable by facility name, address, or county.',
  },
  NY: {
    name: 'New York DEC',
    databaseUrl: 'https://www.dec.ny.gov/chemical/8786.html',
    format: 'csv',
    notes: 'Bulk download available as CSV. Updated quarterly.',
  },
  OH: {
    name: 'Ohio BUSTR',
    databaseUrl: 'https://com.ohio.gov/fire/BUSTRRegistration.aspx',
    format: 'html',
    notes: 'Searchable by county, owner, or facility.',
  },
  PA: {
    name: 'Pennsylvania DEP',
    databaseUrl: 'https://www.dep.pa.gov/Business/Land/Tanks/Pages/default.aspx',
    format: 'html',
    notes: 'Facility search via eFACTS system.',
  },
  GA: {
    name: 'Georgia EPD',
    databaseUrl: 'https://epd.georgia.gov/land/land-programs/underground-storage-tanks',
    format: 'html',
    notes: 'Searchable database of registered UST facilities.',
  },
  NC: {
    name: 'North Carolina DEQ',
    databaseUrl: 'https://deq.nc.gov/about/divisions/waste-management/ust',
    format: 'csv',
    notes: 'Facility data available via downloadable spreadsheets.',
  },
  IL: {
    name: 'Illinois OSFM',
    databaseUrl: 'https://www.illinois.gov/osfm/UST',
    format: 'html',
    notes: 'Searchable by owner, address, or facility.',
  },
  MI: {
    name: 'Michigan EGLE',
    databaseUrl: 'https://www.michigan.gov/egle/about/organization/remediation-and-redevelopment/storage-tanks',
    format: 'csv',
    notes: 'Bulk data downloads available.',
  },
  NJ: {
    name: 'New Jersey DEP',
    databaseUrl: 'https://www.nj.gov/dep/srp/ust/',
    format: 'html',
    notes: 'DataMiner tool for facility search.',
  },
  VA: {
    name: 'Virginia DEQ',
    databaseUrl: 'https://www.deq.virginia.gov/land-waste/tanks',
    format: 'html',
    notes: 'Searchable registered tank database.',
  },
  IN: {
    name: 'Indiana IDEM',
    databaseUrl: 'https://www.in.gov/idem/tanks/',
    format: 'html',
    notes: 'Virtual File Cabinet for registered facilities.',
  },
  LA: {
    name: 'Louisiana DEQ',
    databaseUrl: 'https://www.deq.louisiana.gov/page/ust-notification',
    format: 'html',
    notes: 'EDMS system for tank registration lookup.',
  },
  TN: {
    name: 'Tennessee TDEC',
    databaseUrl: 'https://www.tn.gov/environment/program-areas/ust-underground-storage-tanks.html',
    format: 'html',
    notes: 'Facility lookup by name or address.',
  },
};

/**
 * Scrape facilities from a state database.
 * This is a framework - actual scraping implementations would use
 * puppeteer/playwright for HTML, fetch for APIs, and csv-parse for CSV files.
 */
export async function scrapeFacilities(
  stateAbbr: string,
  options?: { county?: string; limit?: number }
): Promise<ScrapedFacility[]> {
  const config = stateScraperConfigs[stateAbbr];
  if (!config) {
    throw new Error(`No scraper configured for state: ${stateAbbr}`);
  }

  // CA/FL/TX/NY/PA have real implementations under ./states/.
  const live = liveStateScrapers[stateAbbr];
  if (live) {
    const rows = await live.fetchFacilities({ limit: options?.limit });
    return rows.map((r) => ({
      facilityName: r.facilityName,
      ownerName: r.ownerName,
      address: r.address,
      city: r.city,
      zip: r.zip,
      phone: r.phone,
      email: r.email,
      tankCount: r.tankCount,
      tankTypes: r.productsStored,
      productsStored: r.productsStored,
      installationDates: r.installationDates,
      registrationNumber: r.sourceFacilityId,
      complianceStatus: r.complianceStatus ?? r.facilityStatus,
      sourceUrl: r.sourceUrl,
    }));
  }

  console.log(`Scraping ${config.name} (${stateAbbr}) from ${config.databaseUrl}`);
  console.log(`Format: ${config.format}, Notes: ${config.notes}`);
  return [];
}

/**
 * Save scraped facilities to the prospect_facilities table
 */
export async function saveScrapedFacilities(
  stateAbbr: string,
  facilities: ScrapedFacility[]
): Promise<number> {
  let saved = 0;

  for (const facility of facilities) {
    try {
      // Check for duplicate by registration number or name+address
      const existing = facility.registrationNumber
        ? await prisma.prospectFacility.findFirst({
            where: {
              state: stateAbbr,
              registrationNumber: facility.registrationNumber,
            },
          })
        : await prisma.prospectFacility.findFirst({
            where: {
              state: stateAbbr,
              facilityName: facility.facilityName,
              address: facility.address,
            },
          });

      if (existing) {
        // Update existing record
        await prisma.prospectFacility.update({
          where: { id: existing.id },
          data: {
            ownerName: facility.ownerName ?? existing.ownerName,
            phone: facility.phone ?? existing.phone,
            email: facility.email ?? existing.email,
            tankCount: facility.tankCount ?? existing.tankCount,
            complianceStatus: facility.complianceStatus ?? existing.complianceStatus,
            scrapedAt: new Date(),
          },
        });
      } else {
        await prisma.prospectFacility.create({
          data: {
            state: stateAbbr,
            facilityName: facility.facilityName,
            ownerName: facility.ownerName,
            address: facility.address,
            city: facility.city,
            zip: facility.zip,
            phone: facility.phone,
            email: facility.email,
            tankCount: facility.tankCount,
            tankTypes: facility.tankTypes,
            productsStored: facility.productsStored,
            installationDates: facility.installationDates,
            registrationNumber: facility.registrationNumber,
            complianceStatus: facility.complianceStatus,
            sourceUrl: facility.sourceUrl,
          },
        });
        saved++;
      }
    } catch (error) {
      console.error(`Failed to save facility ${facility.facilityName}:`, error);
    }
  }

  return saved;
}

/**
 * Look up a facility in the prospect database to auto-populate onboarding data
 */
export async function lookupFacility(
  stateAbbr: string,
  query: { registrationNumber?: string; address?: string; name?: string }
): Promise<ScrapedFacility | null> {
  let prospect = null;

  if (query.registrationNumber) {
    prospect = await prisma.prospectFacility.findFirst({
      where: {
        state: stateAbbr,
        registrationNumber: query.registrationNumber,
      },
    });
  }

  if (!prospect && query.address) {
    prospect = await prisma.prospectFacility.findFirst({
      where: {
        state: stateAbbr,
        address: { contains: query.address, mode: 'insensitive' },
      },
    });
  }

  if (!prospect && query.name) {
    prospect = await prisma.prospectFacility.findFirst({
      where: {
        state: stateAbbr,
        facilityName: { contains: query.name, mode: 'insensitive' },
      },
    });
  }

  if (!prospect) return null;

  return {
    facilityName: prospect.facilityName,
    ownerName: prospect.ownerName ?? undefined,
    address: prospect.address ?? undefined,
    city: prospect.city ?? undefined,
    zip: prospect.zip ?? undefined,
    phone: prospect.phone ?? undefined,
    email: prospect.email ?? undefined,
    tankCount: prospect.tankCount ?? undefined,
    tankTypes: prospect.tankTypes ?? undefined,
    productsStored: prospect.productsStored ?? undefined,
    installationDates: prospect.installationDates ?? undefined,
    registrationNumber: prospect.registrationNumber ?? undefined,
    complianceStatus: prospect.complianceStatus ?? undefined,
    sourceUrl: prospect.sourceUrl ?? undefined,
  };
}

/**
 * Get scraper status for all configured states
 */
export async function getScraperStatus(): Promise<
  Array<{
    state: string;
    configured: boolean;
    lastScraped: Date | null;
    prospectCount: number;
  }>
> {
  const allStates = Object.keys(stateScraperConfigs);
  const results = [];

  for (const state of allStates) {
    const count = await prisma.prospectFacility.count({ where: { state } });
    const latest = await prisma.prospectFacility.findFirst({
      where: { state },
      orderBy: { scrapedAt: 'desc' },
      select: { scrapedAt: true },
    });

    results.push({
      state,
      configured: true,
      lastScraped: latest?.scrapedAt ?? null,
      prospectCount: count,
    });
  }

  return results;
}
