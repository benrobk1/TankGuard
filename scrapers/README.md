# TankGuard UST chain-operator scrapers

Python pipeline that scrapes the five canonical state UST registries —
California GeoTracker, Florida DEP Storage Tank Facilities, Texas TCEQ
PSTR, New York DEC PBS, and Pennsylvania DEP USTIF — normalizes owner
names across sources, rolls facilities up to operators, and keeps only
chain operators with **3–20 sites**. The output is a single CSV suited
for cold-outreach list loading.

> This directory is a standalone tool. There is a parallel TypeScript
> implementation at `src/lib/scraper/` that powers the in-app onboarding
> lookup and `pnpm scraper:build-target-list`. Both pipelines share the
> same normalization logic (if you tweak one, mirror the change in the
> other — see `normalize_owner_key()` in `common.py` and
> `ownerKey()` in `src/lib/scraper/normalize.ts`).

## Output

- `output/chain_operators_v1.csv` — one row per qualifying facility
  owned by a chain operator. Columns:

  | column                     | description |
  | -------------------------- | ----------- |
  | `state`                    | two-letter state code |
  | `facility_id`              | agency-issued facility/registration ID |
  | `facility_name`            | name as reported by the agency |
  | `owner_name`               | owner name as reported (display-cased) |
  | `owner_address`            | single-line facility address |
  | `owner_email_if_available` | owner email if the agency published one; often blank |
  | `site_count_for_owner`     | total sites this owner has across the five states |
  | `last_inspection_date`     | most recent inspection date on file (format varies by state) |
  | `violation_history`        | agency-reported compliance status / violation summary |

- `output/summary.json` — per-source row counts, timings, and any
  errors from the most recent run.

## One-time setup

```bash
cd scrapers
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Running the scrape

```bash
# from the repo root
python -m scrapers.build_chain_operators
```

Flags:

- `--min-sites N` / `--max-sites N` — override the 3/20 chain band
- `--output path/to.csv` — override the output path
- `-v` — verbose logging

A full statewide fan-out pulls ~3–5M facility rows, filters down to
~150k qualifying chain-operator facility rows, representing roughly
2,000–3,500 unique operators. Expect a runtime of 15–30 minutes on a
residential connection (California is the long tail — 58 counties, each
a separate CSV download).

## Monthly refresh cadence

The state agencies refresh their source datasets on different schedules:

| state | dataset                         | cadence         |
| ----- | ------------------------------- | --------------- |
| CA    | GeoTracker UST per-county CSVs  | monthly         |
| FL    | DEP Storage Tank Facilities     | daily           |
| TX    | TCEQ PSTR bulk CSV              | weekly          |
| NY    | data.ny.gov PBS Sites (8ehh-nbmk)| quarterly      |
| PA    | DEP eFACTS Storage Tank list    | nightly         |

Re-run the scrape on the **first Monday of each month**. That's a
conservative cadence that captures NY's quarterly refresh and all
faster-moving sources. A monthly cron on whichever server owns the
outreach pipeline:

```cron
0 6 1-7 * 1 cd /srv/tankguard && .venv/bin/python -m scrapers.build_chain_operators >> logs/scrape.log 2>&1
```

When a run completes, diff the new CSV against the prior version to
surface newly-appearing operators — those are the freshest leads.

## Endpoint verification

URLs in `sources/*.py` are the documented public endpoints for each
agency. They're stable but do change occasionally (a CSV path can move
when an agency overhauls its open-data portal). If a state's scrape
starts returning zero rows, check the relevant agency page first; the
module will clearly log HTTP 404s and parse errors per county/page.

Source-of-truth pages:

- **CA GeoTracker** — https://geotracker.waterboards.ca.gov/data_download
- **FL DEP open data** — https://floridadep.gov/waste/permitting-compliance-assistance/content/storage-tank-facility-information
- **TX TCEQ PSTR** — https://www.tceq.texas.gov/agency/data/lookup-data/pst-datasets-records.html
- **NY DEC PBS via data.ny.gov** — https://data.ny.gov/Energy-Environment/Petroleum-Bulk-Storage-PBS-Sites/8ehh-nbmk
- **PA DEP eFACTS storage tank list** — https://www.dep.pa.gov/Business/Land/Tanks/Pages/default.aspx

## Terms-of-service compliance

All five datasets are public records. The scrapers identify themselves
via a `TankGuard-ProspectScraper/1.0` User-Agent and retry on 5xx with
exponential backoff. Do **not** remove the UA — agencies rate-limit
anonymous bulk downloads. Contact info is in the UA string so an agency
can reach TankGuard if they want us to slow a crawl.

No captchas or logins are bypassed. If an agency starts requiring one,
stop using this pipeline for that state and reach out to the data
steward.
