"""New York — Department of Environmental Conservation, Petroleum Bulk
Storage (PBS) registration.

Served via the data.ny.gov Socrata API. The Active PBS Sites dataset
(resource id 8ehh-nbmk) paginates 50k rows at a time.
"""

from __future__ import annotations

import pandas as pd
import requests

from ..common import canonicalize_columns

STATE = "NY"
BASE = "https://data.ny.gov/resource/8ehh-nbmk.json"
PAGE = 50_000


def _address(row: dict) -> str:
    parts = [
        row.get("site_address"),
        row.get("site_city"),
        STATE,
        row.get("site_zip"),
    ]
    return ", ".join(p.strip() for p in parts if isinstance(p, str) and p.strip())


def fetch(session: requests.Session) -> pd.DataFrame:
    rows: list[dict] = []
    offset = 0
    while True:
        resp = session.get(BASE, params={"$limit": PAGE, "$offset": offset})
        resp.raise_for_status()
        page = resp.json() or []
        if not page:
            break
        rows.extend(page)
        if len(page) < PAGE:
            break
        offset += PAGE

    if not rows:
        return canonicalize_columns(pd.DataFrame(), STATE, BASE)

    df = pd.DataFrame(rows).fillna("").astype(str)

    out = pd.DataFrame(
        {
            "state": STATE,
            "facility_id": df.get("pbs_number", ""),
            "facility_name": df.get("facility_name", ""),
            "owner_name": df.get("owner_name", ""),
            "owner_address": [_address(r) for r in rows],
            "owner_email_if_available": df.get("contact_email", ""),
            "last_inspection_date": df.get("last_inspection_date", ""),
            "violation_history": df.get("facility_status", ""),
        }
    )

    return canonicalize_columns(out, STATE, BASE)
