#!/usr/bin/env tsx
/**
 * CLI: build the 2,000-account UST chain-operator target list.
 *
 * Usage:
 *   pnpm tsx scripts/build-target-list.ts [--limit N] [--target N]
 *                                         [--out data/target-list]
 *                                         [--active-only] [--no-persist]
 *
 * Outputs (to <out>/):
 *   targets-YYYY-MM-DD.csv      ranked top-N for sales (the deliverable)
 *   targets-YYYY-MM-DD.json     same data, JSON for programmatic consumers
 *   operators-YYYY-MM-DD.json   full pre-cap operator set (the long tail)
 *   summary-YYYY-MM-DD.json     per-state row counts + run timing
 *
 * When --no-persist is omitted, the script also upserts each target operator's
 * primary site into prospect_facilities so the in-app dashboard can use it.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  buildTargetList,
  TARGET_COUNT,
  targetsToCsv,
  type ProgressEvent,
} from '../src/lib/scraper/build-target-list';
import { saveScrapedFacilities } from '../src/lib/scraper';

interface CliArgs {
  limit?: number;
  target: number;
  outDir: string;
  activeOnly: boolean;
  persist: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    target: TARGET_COUNT,
    outDir: 'data/target-list',
    activeOnly: false,
    persist: true,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--limit') args.limit = parseInt(argv[++i], 10);
    else if (a === '--target') args.target = parseInt(argv[++i], 10);
    else if (a === '--out') args.outDir = argv[++i];
    else if (a === '--active-only') args.activeOnly = true;
    else if (a === '--no-persist') args.persist = false;
    else if (a === '--help' || a === '-h') {
      console.log(
        'Usage: tsx scripts/build-target-list.ts [--limit N] [--target N] [--out DIR] [--active-only] [--no-persist]',
      );
      process.exit(0);
    }
  }
  return args;
}

function logProgress(e: ProgressEvent): void {
  switch (e.kind) {
    case 'scrape:start':
      console.log(`[${e.state}] scraping…`);
      break;
    case 'scrape:done':
      console.log(`[${e.state}] ${e.count.toLocaleString()} rows in ${(e.ms / 1000).toFixed(1)}s`);
      break;
    case 'scrape:error':
      console.error(`[${e.state}] FAILED: ${e.error}`);
      break;
    case 'normalize:done':
      console.log(`normalize: ${e.kept.toLocaleString()} kept, ${e.dropped.toLocaleString()} dropped`);
      break;
    case 'aggregate:done':
      console.log(`aggregate: ${e.operators.toLocaleString()} chain operators (3-20 sites)`);
      break;
    case 'enrich:done':
      console.log(`enrich: phone=${e.withPhone.toLocaleString()} email=${e.withEmail.toLocaleString()}`);
      break;
    case 'rank:done':
      console.log(`rank: top ${e.targets.toLocaleString()} accounts selected`);
      break;
  }
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const stamp = new Date().toISOString().slice(0, 10);

  console.log(`TankGuard target-list build  (target=${args.target}, stamp=${stamp})`);

  const { targets, operators, perState } = await buildTargetList({
    targetCount: args.target,
    scraperOptions: {
      limit: args.limit,
      activeOnly: args.activeOnly,
      timeoutMs: 120_000,
    },
    enrichOptions: {
      apiKey: process.env.ENRICHMENT_PROVIDER_API_KEY,
      maxExternalLookups: 250,
    },
    onProgress: logProgress,
  });

  await mkdir(args.outDir, { recursive: true });

  const csvPath = path.join(args.outDir, `targets-${stamp}.csv`);
  const jsonPath = path.join(args.outDir, `targets-${stamp}.json`);
  const operatorsPath = path.join(args.outDir, `operators-${stamp}.json`);
  const summaryPath = path.join(args.outDir, `summary-${stamp}.json`);

  await writeFile(csvPath, targetsToCsv(targets), 'utf8');
  await writeFile(jsonPath, JSON.stringify(targets, null, 2), 'utf8');
  await writeFile(operatorsPath, JSON.stringify(operators, null, 2), 'utf8');
  await writeFile(
    summaryPath,
    JSON.stringify(
      {
        builtAt: new Date().toISOString(),
        targetCount: targets.length,
        totalOperators: operators.length,
        perState,
      },
      null,
      2,
    ),
    'utf8',
  );

  console.log(`\nWrote:\n  ${csvPath}\n  ${jsonPath}\n  ${operatorsPath}\n  ${summaryPath}`);

  if (args.persist) {
    console.log('\nPersisting target operators to prospect_facilities…');
    let persisted = 0;
    for (const op of operators.slice(0, args.target)) {
      const saved = await saveScrapedFacilities(
        op.primaryState ?? op.states[0],
        op.facilities.map((f) => ({
          facilityName: f.facilityName,
          ownerName: op.canonicalOwnerName,
          address: f.address,
          city: f.city,
          zip: f.zip,
          phone: f.phone,
          email: f.email,
          tankCount: f.tankCount,
          tankTypes: f.productsStored,
          productsStored: f.productsStored,
          installationDates: f.installationDates,
          registrationNumber: f.sourceFacilityId,
          complianceStatus: f.complianceStatus ?? f.facilityStatus,
          sourceUrl: f.sourceUrl,
        })),
      );
      persisted += saved;
    }
    console.log(`Persisted ${persisted.toLocaleString()} new prospect_facility rows.`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
