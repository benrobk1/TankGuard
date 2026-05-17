#!/usr/bin/env python3
"""Build the TankGuard chain-operator target list.

Pipeline:
    1. Fetch from each of the five state UST registries in sequence.
    2. Normalize owner names; drop probable individual owners.
    3. Count sites per owner across all five states combined.
    4. Keep only owners with 3-20 sites (chain-operator band).
    5. Write chain_operators_v1.csv and a per-source summary JSON.

Usage:
    pip install -r requirements.txt
    python -m scrapers.build_chain_operators

Options:
    --min-sites   (default 3)  lower bound of the chain band
    --max-sites   (default 20) upper bound of the chain band
    --output      (default scrapers/output/chain_operators_v1.csv)
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
from dataclasses import asdict
from pathlib import Path

import pandas as pd

from scrapers.common import (
    aggregate_and_filter,
    build_session,
    normalize_owner_key,
    time_source,
)
from scrapers.sources import ca_geotracker, fl_dep, ny_dec, pa_dep, tx_tceq

SOURCES = [
    ("CA", ca_geotracker.fetch),
    ("FL", fl_dep.fetch),
    ("TX", tx_tceq.fetch),
    ("NY", ny_dec.fetch),
    ("PA", pa_dep.fetch),
]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--min-sites", type=int, default=3)
    parser.add_argument("--max-sites", type=int, default=20)
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("scrapers/output/chain_operators_v1.csv"),
    )
    parser.add_argument(
        "--summary",
        type=Path,
        default=Path("scrapers/output/summary.json"),
    )
    parser.add_argument(
        "-v", "--verbose", action="store_true", help="enable debug logging"
    )
    args = parser.parse_args()

    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )
    log = logging.getLogger("build")

    session = build_session()

    frames: list[pd.DataFrame] = []
    results = []
    for state, fetcher in SOURCES:
        log.info("[%s] starting…", state)
        df, result = time_source(fetcher, session, state)
        results.append(result)
        if df is None:
            continue
        log.info(
            "[%s] %d rows in %.1fs", state, len(df), result.seconds
        )
        frames.append(df)

    if not frames:
        log.error("all sources failed; refusing to write empty output")
        return 1

    filtered = aggregate_and_filter(
        frames, min_sites=args.min_sites, max_sites=args.max_sites
    )

    args.output.parent.mkdir(parents=True, exist_ok=True)
    filtered.to_csv(args.output, index=False)
    log.info("wrote %d rows to %s", len(filtered), args.output)

    summary = {
        "built_at": pd.Timestamp.utcnow().isoformat(),
        "output_path": str(args.output),
        "chain_filter": {"min_sites": args.min_sites, "max_sites": args.max_sites},
        "sources": [asdict(r) for r in results],
        "output_row_count": int(len(filtered)),
        "unique_operators": int(
            filtered["owner_name"].map(normalize_owner_key).nunique()
        ),
    }
    args.summary.parent.mkdir(parents=True, exist_ok=True)
    args.summary.write_text(json.dumps(summary, indent=2))
    log.info("wrote summary to %s", args.summary)

    # Acceptance-criterion guardrail: we expect ≥1,500 rows after dedup
    # from a healthy real run. Don't fail the script — just warn — so
    # partial-outage runs still produce a CSV for triage.
    if len(filtered) < 1500:
        log.warning(
            "output has %d rows (< 1500 expected). Check sources: %s",
            len(filtered),
            [r.state for r in results if r.error],
        )
    return 0


if __name__ == "__main__":
    sys.exit(main())
