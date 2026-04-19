"""Pennsylvania — DEP Underground Storage Tank Indemnification Fund (USTIF)
/ eFACTS Storage Tank Facility list.

eFACTS ships the facility roster as a CSV via its SSRS reporting URL.
Refreshed nightly.
"""

from __future__ import annotations

import io

import pandas as pd
import requests

from ..common import canonicalize_columns

STATE = "PA"
URL = (
    "https://cedatareporting.pa.gov/Reportserver"
    "?%2fPublic%2fDEP%2fBSTR%2fSSRS%2fStorageTankFacilityList"
    "&rs:Format=CSV"
)


def _address(row: pd.Series) -> str:
    parts = [row.get("StreetAddress"), row.get("City"), STATE, row.get("ZipCode")]
    return ", ".join(p.strip() for p in parts if isinstance(p, str) and p.strip())


def fetch(session: requests.Session) -> pd.DataFrame:
    resp = session.get(URL)
    resp.raise_for_status()
    df = pd.read_csv(io.StringIO(resp.text), dtype=str).fillna("")

    out = pd.DataFrame(
        {
            "state": STATE,
            "facility_id": df.get("FacilityID", ""),
            "facility_name": df.get("FacilityName", ""),
            "owner_name": df.get("OwnerName", ""),
            "owner_address": df.apply(_address, axis=1),
            "owner_email_if_available": df.get("OwnerEmail", ""),
            "last_inspection_date": df.get("LastInspectionDate", ""),
            "violation_history": df.get("ComplianceStatus", ""),
        }
    )

    return canonicalize_columns(out, STATE, URL)
