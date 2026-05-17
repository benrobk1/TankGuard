"""California — State Water Resources Control Board, GeoTracker.

GeoTracker ships UST facility data as per-county CSVs via the EDF
download service. Statewide fan-out concatenates all 58 counties.

Endpoint: https://geotracker.waterboards.ca.gov/data_download/edf/UST_FACILITY_<COUNTY>.csv

Documented columns (subset):
    GLOBAL_ID, FACILITY_NAME, FACILITY_STATUS, ADDRESS, CITY, ZIP,
    COUNTY, OWNER, OPERATOR, OWNER_PHONE, OWNER_EMAIL, NUM_TANKS,
    LAST_INSPECTION_DATE, VIOLATIONS
"""

from __future__ import annotations

import io
import logging
from urllib.parse import quote

import pandas as pd
import requests

from ..common import canonicalize_columns

log = logging.getLogger("scrapers.ca")

STATE = "CA"
BASE = "https://geotracker.waterboards.ca.gov/data_download/edf/UST_FACILITY"

COUNTIES = [
    "ALAMEDA", "ALPINE", "AMADOR", "BUTTE", "CALAVERAS", "COLUSA",
    "CONTRA_COSTA", "DEL_NORTE", "EL_DORADO", "FRESNO", "GLENN",
    "HUMBOLDT", "IMPERIAL", "INYO", "KERN", "KINGS", "LAKE", "LASSEN",
    "LOS_ANGELES", "MADERA", "MARIN", "MARIPOSA", "MENDOCINO", "MERCED",
    "MODOC", "MONO", "MONTEREY", "NAPA", "NEVADA", "ORANGE", "PLACER",
    "PLUMAS", "RIVERSIDE", "SACRAMENTO", "SAN_BENITO", "SAN_BERNARDINO",
    "SAN_DIEGO", "SAN_FRANCISCO", "SAN_JOAQUIN", "SAN_LUIS_OBISPO",
    "SAN_MATEO", "SANTA_BARBARA", "SANTA_CLARA", "SANTA_CRUZ", "SHASTA",
    "SIERRA", "SISKIYOU", "SOLANO", "SONOMA", "STANISLAUS", "SUTTER",
    "TEHAMA", "TRINITY", "TULARE", "TUOLUMNE", "VENTURA", "YOLO", "YUBA",
]


def _county_url(county: str) -> str:
    return f"{BASE}_{quote(county)}.csv"


def _address(row: pd.Series) -> str:
    parts = [row.get("ADDRESS"), row.get("CITY"), STATE, row.get("ZIP")]
    return ", ".join(p.strip() for p in parts if isinstance(p, str) and p.strip())


def fetch(session: requests.Session) -> pd.DataFrame:
    frames: list[pd.DataFrame] = []
    first_url = _county_url(COUNTIES[0])

    for county in COUNTIES:
        url = _county_url(county)
        resp = session.get(url)
        if resp.status_code == 404:
            # Counties with zero registered USTs 404 — expected.
            continue
        if not resp.ok:
            log.warning("CA %s: HTTP %s", county, resp.status_code)
            continue

        try:
            df = pd.read_csv(io.StringIO(resp.text), dtype=str).fillna("")
        except Exception as exc:  # noqa: BLE001
            log.warning("CA %s: parse error %s", county, exc)
            continue

        if df.empty:
            continue

        out = pd.DataFrame(
            {
                "state": STATE,
                "facility_id": df.get("GLOBAL_ID", ""),
                "facility_name": df.get("FACILITY_NAME", ""),
                "owner_name": df.get("OWNER", ""),
                "owner_address": df.apply(_address, axis=1),
                "owner_email_if_available": df.get("OWNER_EMAIL", ""),
                "last_inspection_date": df.get("LAST_INSPECTION_DATE", ""),
                "violation_history": df.get("VIOLATIONS", ""),
            }
        )
        frames.append(out)

    if not frames:
        return canonicalize_columns(pd.DataFrame(), STATE, first_url)

    combined = pd.concat(frames, ignore_index=True)
    return canonicalize_columns(combined, STATE, first_url)
