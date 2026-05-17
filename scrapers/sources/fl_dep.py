"""Florida — Department of Environmental Protection, Storage Tank facilities.

FL DEP publishes the full statewide storage-tank facility roster as a
single CSV on its open-data portal.

Endpoint: https://geodata.dep.state.fl.us/datasets/storage-tank-contamination-monitoring-facilities.csv
"""

from __future__ import annotations

import io

import pandas as pd
import requests

from ..common import canonicalize_columns

STATE = "FL"
URL = (
    "https://geodata.dep.state.fl.us/datasets/"
    "storage-tank-contamination-monitoring-facilities.csv"
)


def _address(row: pd.Series) -> str:
    parts = [
        row.get("facility_address"),
        row.get("facility_city"),
        STATE,
        row.get("facility_zip"),
    ]
    return ", ".join(p.strip() for p in parts if isinstance(p, str) and p.strip())


def fetch(session: requests.Session) -> pd.DataFrame:
    resp = session.get(URL)
    resp.raise_for_status()
    df = pd.read_csv(io.StringIO(resp.text), dtype=str).fillna("")

    # Accept either snake_case or UPPER_CASE headers; FL has flipped the
    # export style at least once in the last two years.
    lower = {c.lower(): c for c in df.columns}

    def col(name: str) -> pd.Series:
        actual = lower.get(name.lower())
        return df[actual] if actual else pd.Series([""] * len(df))

    out = pd.DataFrame(
        {
            "state": STATE,
            "facility_id": col("facility_id"),
            "facility_name": col("facility_name"),
            "owner_name": col("owner_name"),
            "owner_address": df.apply(_address, axis=1) if "facility_address" in lower else "",
            "owner_email_if_available": col("owner_email"),
            "last_inspection_date": col("last_inspection_date"),
            "violation_history": col("regulatory_status"),
        }
    )

    return canonicalize_columns(out, STATE, URL)
