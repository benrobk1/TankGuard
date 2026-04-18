/**
 * Target-list orchestrator.
 *
 * Pipeline:
 *   1. fanout to the 5 state scrapers (in parallel).
 *   2. normalize owner names.
 *   3. aggregate into operators with 3-20 sites.
 *   4. enrich contact info.
 *   5. score + sort, then cap at TARGET_COUNT (2,000).
 *
 * Scoring rewards: more sites (up to 20), multi-state presence, presence of
 * a usable phone or email, and active facilities. The score is purely for
 * intra-list ordering — it isn't surfaced to the sales team in the export.
 */

import { caGeoTrackerScraper } from './states/ca-geotracker';
import { flDepScraper } from './states/fl-dep';
import { txTceqScraper } from './states/tx-tceq';
import { nyDecScraper } from './states/ny-dec';
import { paDepScraper } from './states/pa-dep';
import { normalize } from './normalize';
import { aggregateOperators } from './aggregate';
import { enrichOperators, type EnrichOptions } from './enrich';
import type {
  NormalizedFacility,
  OperatorAggregate,
  RawFacilityRecord,
  ScraperRunOptions,
  StateCode,
  StateScraper,
  TargetAccount,
} from './types';

export const TARGET_COUNT = 2000;

const SCRAPERS: StateScraper[] = [
  caGeoTrackerScraper,
  flDepScraper,
  txTceqScraper,
  nyDecScraper,
  paDepScraper,
];

export interface BuildTargetListOptions {
  scraperOptions?: ScraperRunOptions;
  enrichOptions?: EnrichOptions;
  /** Override the target row cap (defaults to 2,000). */
  targetCount?: number;
  /** Optional callback for progress reporting from a CLI. */
  onProgress?: (event: ProgressEvent) => void;
}

export type ProgressEvent =
  | { kind: 'scrape:start'; state: StateCode }
  | { kind: 'scrape:done'; state: StateCode; count: number; ms: number }
  | { kind: 'scrape:error'; state: StateCode; error: string }
  | { kind: 'normalize:done'; kept: number; dropped: number }
  | { kind: 'aggregate:done'; operators: number }
  | { kind: 'enrich:done'; withPhone: number; withEmail: number }
  | { kind: 'rank:done'; targets: number };

export interface BuildTargetListResult {
  /** Final ranked list capped at targetCount. */
  targets: TargetAccount[];
  /** Full operator set before ranking, in case the caller wants the long tail. */
  operators: OperatorAggregate[];
  /** Per-state row counts for the run summary. */
  perState: Record<StateCode, number>;
}

export async function buildTargetList(
  options: BuildTargetListOptions = {},
): Promise<BuildTargetListResult> {
  const onProgress = options.onProgress ?? (() => {});
  const targetCount = options.targetCount ?? TARGET_COUNT;

  const perState: Record<StateCode, number> = { CA: 0, FL: 0, TX: 0, NY: 0, PA: 0 };
  const allRaw: RawFacilityRecord[] = [];

  const scraperResults = await Promise.allSettled(
    SCRAPERS.map(async (s) => {
      onProgress({ kind: 'scrape:start', state: s.state });
      const start = Date.now();
      const rows = await s.fetchFacilities(options.scraperOptions);
      onProgress({
        kind: 'scrape:done',
        state: s.state,
        count: rows.length,
        ms: Date.now() - start,
      });
      return { state: s.state, rows };
    }),
  );

  for (let i = 0; i < scraperResults.length; i++) {
    const r = scraperResults[i];
    const state = SCRAPERS[i].state;
    if (r.status === 'fulfilled') {
      perState[state] = r.value.rows.length;
      allRaw.push(...r.value.rows);
    } else {
      onProgress({
        kind: 'scrape:error',
        state,
        error: String(r.reason instanceof Error ? r.reason.message : r.reason),
      });
    }
  }

  const normalized: NormalizedFacility[] = [];
  let dropped = 0;
  for (const row of allRaw) {
    const n = normalize(row);
    if (n) normalized.push(n);
    else dropped++;
  }
  onProgress({ kind: 'normalize:done', kept: normalized.length, dropped });

  const operators = aggregateOperators(normalized);
  onProgress({ kind: 'aggregate:done', operators: operators.length });

  await enrichOperators(operators, options.enrichOptions);
  const withPhone = operators.filter((o) => o.primaryPhone).length;
  const withEmail = operators.filter((o) => o.primaryEmail).length;
  onProgress({ kind: 'enrich:done', withPhone, withEmail });

  const ranked = rankAndCap(operators, targetCount);
  onProgress({ kind: 'rank:done', targets: ranked.length });

  return { targets: ranked, operators, perState };
}

function score(op: OperatorAggregate): number {
  // Site count contributes up to 50 points (peaks at 12 sites — the band where
  // operators are big enough to need software but still easy to close).
  const sites = Math.min(op.siteCount, 20);
  const sitesPts = 50 * (1 - Math.abs(sites - 12) / 12);

  const multiState = op.states.length > 1 ? 15 : 0;
  const phonePts = op.primaryPhone ? 15 : 0;
  const emailPts = op.primaryEmail ? 15 : 0;
  const tankBonus = Math.min(op.estimatedTankCount, 60) * (5 / 60);

  return Math.round(sitesPts + multiState + phonePts + emailPts + tankBonus);
}

function rankAndCap(
  operators: OperatorAggregate[],
  cap: number,
): TargetAccount[] {
  const scored = operators.map((op) => ({ op, s: score(op) }));
  scored.sort((a, b) => {
    if (b.s !== a.s) return b.s - a.s;
    if (b.op.siteCount !== a.op.siteCount) return b.op.siteCount - a.op.siteCount;
    return a.op.canonicalOwnerName.localeCompare(b.op.canonicalOwnerName);
  });

  const capped = scored.slice(0, cap);
  return capped.map(({ op, s }, i) => ({
    rank: i + 1,
    operatorName: op.canonicalOwnerName,
    siteCount: op.siteCount,
    estimatedTankCount: op.estimatedTankCount,
    states: op.states.join('|'),
    primaryState: op.primaryState ?? op.states[0],
    primaryCity: op.primaryCity,
    primaryAddress: op.primaryAddress,
    primaryZip: op.primaryZip,
    primaryPhone: op.primaryPhone,
    primaryEmail: op.primaryEmail,
    score: s,
    sampleSites: op.facilities
      .slice(0, 5)
      .map((f) => f.facilityName)
      .join(' | '),
  }));
}

const TARGET_CSV_HEADERS: (keyof TargetAccount)[] = [
  'rank',
  'operatorName',
  'siteCount',
  'estimatedTankCount',
  'states',
  'primaryState',
  'primaryCity',
  'primaryAddress',
  'primaryZip',
  'primaryPhone',
  'primaryEmail',
  'score',
  'sampleSites',
];

export function targetsToCsv(targets: TargetAccount[]): string {
  const escape = (v: unknown) => {
    if (v === undefined || v === null) return '';
    const s = String(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const lines = [TARGET_CSV_HEADERS.join(',')];
  for (const t of targets) {
    lines.push(TARGET_CSV_HEADERS.map((h) => escape(t[h])).join(','));
  }
  return lines.join('\n') + '\n';
}
