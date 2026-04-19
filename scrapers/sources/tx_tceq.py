"""Texas — Commission on Environmental Quality, Petroleum Storage Tank
Registration (PSTR).

Published weekly as a bulk CSV. Columns per the PSTR data dictionary:
    FAC_ID, FAC_NAME, OWNER_NAME, OWNER_CONTACT, OWNER_PHONE, OWNER_EMAIL,
    FAC_ADDR, FAC_CITY, FAC_COUNTY, FAC_ZIP, NUM_REGULATED_TANKS,
    FAC_STATUS, INSTALL_DATES, LAST_INSPECTION, NOV_SUMMARY
"""

from __future__ import annotations

import io

import pandas as pd
import requests

from ..common import canonicalize_columns

STATE = "TX"
URL = "https://www.tceq.texas.gov/downloads/remediation/pst/pstreg.csv"


def _address(row: pd.Series) -> str:
    parts = [row.get("FAC_ADDR"), row.get("FAC_CITY"), STATE, row.get("FAC_ZIP")]
    return ", ".join(p.strip() for p in parts if isinstance(p, str) and p.strip())


def fetch(session: requests.Session) -> pd.DataFrame:
    resp = session.get(URL)
    resp.raise_for_status()
    df = pd.read_csv(io.StringIO(resp.text), dtype=str).fillna("")

    out = pd.DataFrame(
        {
            "state": STATE,
            "facility_id": df.get("FAC_ID", ""),
            "facility_name": df.get("FAC_NAME", ""),
            "owner_name": df.get("OWNER_NAME", ""),
            "owner_address": df.apply(_address, axis=1),
            "owner_email_if_available": df.get("OWNER_EMAIL", ""),
            "last_inspection_date": df.get("LAST_INSPECTION", ""),
            "violation_history": df.get("NOV_SUMMARY", ""),
        }
    )

    return canonicalize_columns(out, STATE, URL)
