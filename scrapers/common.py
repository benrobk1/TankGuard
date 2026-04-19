"""Shared helpers for the TankGuard UST scrapers.

Each `sources/*.py` module contributes a `fetch(session)` function that
returns a DataFrame conforming to the unified schema below. `build_chain_
operators.py` orchestrates fan-out across all five states, applies the
3-20 site chain filter, and writes the final CSV.

Unified column order (enforced by CANONICAL_COLUMNS):
    state, facility_id, facility_name, owner_name, owner_address,
    owner_email_if_available, site_count_for_owner, last_inspection_date,
    violation_history
"""

from __future__ import annotations

import logging
import re
import time
from dataclasses import dataclass
from typing import Callable, Iterable

import pandas as pd
import requests

USER_AGENT = (
    "TankGuard-ProspectScraper/1.0 "
    "(+https://tankguard.com/contact; ust-target-list)"
)

CANONICAL_COLUMNS = [
    "state",
    "facility_id",
    "facility_name",
    "owner_name",
    "owner_address",
    "owner_email_if_available",
    "site_count_for_owner",  # filled in after aggregation
    "last_inspection_date",
    "violation_history",
]

log = logging.getLogger("scrapers")


def build_session(timeout: int = 60) -> requests.Session:
    """Return a requests Session that identifies itself and retries on 5xx.

    Agencies sometimes serve 502 for a few seconds after a dataset
    refresh — one retry catches that without hiding sustained outages.
    """
    from requests.adapters import HTTPAdapter
    try:
        # urllib3 v2
        from urllib3.util.retry import Retry
    except ImportError:  # pragma: no cover
        from requests.packages.urllib3.util.retry import Retry  # type: ignore

    retry = Retry(
        total=3,
        connect=3,
        read=3,
        backoff_factor=1.5,
        status_forcelist=(429, 500, 502, 503, 504),
        allowed_methods=frozenset(["GET", "HEAD"]),
        raise_on_status=False,
    )
    adapter = HTTPAdapter(max_retries=retry)

    s = requests.Session()
    s.mount("http://", adapter)
    s.mount("https://", adapter)
    s.headers.update({"User-Agent": USER_AGENT, "Accept": "*/*"})
    s.request = _timeout_wrapper(s.request, timeout)  # type: ignore[assignment]
    return s


def _timeout_wrapper(
    original: Callable[..., requests.Response], default_timeout: int
):
    def wrapped(method, url, *args, **kwargs):
        kwargs.setdefault("timeout", default_timeout)
        return original(method, url, *args, **kwargs)

    return wrapped


def normalize_owner_key(raw: str | None) -> str:
    """Produce the grouping key used to roll facilities up into operators.

    Mirrors the logic in src/lib/scraper/normalize.ts so the Python and
    TypeScript pipelines produce identical counts when fed the same data.
    If you change one, change both.
    """
    if not raw:
        return ""

    # Strip trailing store numbers: "Chevron #1234", "Shell Store 5".
    s = re.sub(
        r"\s*(?:#\s*\d+[a-z]?|(?:store|site|station|facility|location)\s*(?:no\.?|#)?\s*\d+[a-z]?|-\s*\d{2,5})\s*$",
        "",
        raw,
        flags=re.IGNORECASE,
    ).lower()

    # Map number words -> digits.
    number_words = {
        "zero": "0", "one": "1", "two": "2", "three": "3", "four": "4",
        "five": "5", "six": "6", "seven": "7", "eight": "8", "nine": "9",
        "ten": "10", "eleven": "11",
    }
    s = re.sub(
        r"\b([a-z]+)\b",
        lambda m: number_words.get(m.group(1), m.group(1)),
        s,
    )

    s = re.sub(r"[’']s\b", "", s)
    s = re.sub(r"[.,&/()]+", " ", s)
    s = re.sub(r"[-_]+", " ", s)
    s = re.sub(r"\s+", " ", s).strip()

    stop = {"the", "and", "of", "&", "a", "an"}
    tokens = [t for t in s.split(" ") if t and t not in stop]

    corporate_suffixes = {
        "incorporated", "inc", "corporation", "corp", "company", "co",
        "llc", "l", "lp", "llp", "plc", "pllc", "pc", "ltd", "limited",
        "holdings", "holding", "enterprises", "enterprise", "group",
        "partners", "partnership", "trust", "properties", "property",
        "realty", "management", "mgmt", "services", "svc",
    }
    # "stores"/"store" often appear as a branded plural in chain names
    # ("Circle K Stores Inc" vs "Circle K Store #5501"). Treat them like
    # suffixes so both variants collapse to the same key.
    store_words = {"stores", "store", "station", "stations", "mart", "marts"}

    while len(tokens) > 1 and (
        tokens[-1] in corporate_suffixes or tokens[-1] in store_words
    ):
        tokens.pop()

    return " ".join(tokens)


def looks_like_individual(name: str | None) -> bool:
    """Heuristic: owner names that look like a person, not a company.

    Drops rows like "JOHN A SMITH" or "SMITH, JOHN" that would inflate the
    chain-operator count with single-owner mom-and-pops. Errs on the side
    of keeping anything ambiguous.
    """
    if not name:
        return False
    if any(ch.isdigit() for ch in name):
        return False
    cleaned = re.sub(r"[.,]", " ", name).strip()
    # Match suffix tokens anywhere in the name (including last position);
    # the previous version missed "SHELL OIL CO" because "co" was at the
    # end with no trailing space.
    lc_tokens = cleaned.lower().split()
    corporate_tokens = {
        "inc", "llc", "corp", "co", "ltd", "company", "holdings",
        "enterprises", "group", "partners", "partnership", "lp", "llp",
        "plc", "pllc", "incorporated", "corporation", "limited",
        "properties", "management", "services", "stores", "store",
        "station", "stations", "mart", "marts", "trust", "realty",
    }
    if any(t in corporate_tokens for t in lc_tokens):
        return False
    if not lc_tokens or len(lc_tokens) > 4:
        return False
    return all(re.fullmatch(r"[A-Za-z'-]+", t) for t in cleaned.split())


def canonicalize_columns(
    df: pd.DataFrame, state: str, source_url: str
) -> pd.DataFrame:
    """Force a source-specific DataFrame into the unified schema.

    Missing columns are filled with empty strings. Extra columns are
    dropped. `state` is stamped in case the source module forgot.
    """
    df = df.copy()
    df["state"] = state
    for col in CANONICAL_COLUMNS:
        if col not in df.columns:
            df[col] = ""
    # site_count_for_owner is filled post-aggregation; leave blank here.
    df["site_count_for_owner"] = ""
    df["_source_url"] = source_url
    return df[CANONICAL_COLUMNS + ["_source_url"]]


def aggregate_and_filter(
    frames: Iterable[pd.DataFrame],
    min_sites: int = 3,
    max_sites: int = 20,
) -> pd.DataFrame:
    """Concatenate per-state frames, roll up by owner, apply chain filter.

    Returns a DataFrame with one row per facility owned by a qualifying
    3-20 site operator, ordered by (owner_name, state, facility_name) so
    the CSV reviewer can eyeball contiguous chains.
    """
    df = pd.concat(list(frames), ignore_index=True)
    log.info("raw rows across all states: %d", len(df))

    df["owner_name"] = df["owner_name"].fillna("").astype(str).str.strip()
    df = df[df["owner_name"].ne("")]

    df["_owner_key"] = df["owner_name"].map(normalize_owner_key)
    df = df[df["_owner_key"].ne("")]
    df = df[~df["owner_name"].map(looks_like_individual)]

    # Dedupe facilities within a state before counting (some agencies
    # emit multiple rows per site when a tank's status changes).
    df = df.drop_duplicates(subset=["state", "facility_id"], keep="first")

    counts = (
        df.groupby("_owner_key", dropna=False)["facility_id"]
        .nunique()
        .rename("site_count_for_owner")
    )
    # Drop the placeholder column added by canonicalize_columns so the
    # join doesn't trip on a name collision.
    df = df.drop(columns=["site_count_for_owner"], errors="ignore").join(
        counts, on="_owner_key"
    )

    mask = df["site_count_for_owner"].between(min_sites, max_sites)
    qualified = df.loc[mask].copy()

    log.info(
        "qualifying chain operators: %d (filter=%d-%d sites) — %d facility rows",
        qualified["_owner_key"].nunique(),
        min_sites,
        max_sites,
        len(qualified),
    )

    qualified = qualified.sort_values(["owner_name", "state", "facility_name"])
    qualified["site_count_for_owner"] = qualified[
        "site_count_for_owner"
    ].astype("Int64")

    return qualified[CANONICAL_COLUMNS]


@dataclass
class SourceResult:
    state: str
    rows: int
    seconds: float
    error: str | None = None


def time_source(
    fn: Callable[[requests.Session], pd.DataFrame],
    session: requests.Session,
    state: str,
) -> tuple[pd.DataFrame | None, SourceResult]:
    """Run a source fetch, measure it, and never let one state kill the run."""
    start = time.time()
    try:
        df = fn(session)
        elapsed = time.time() - start
        return df, SourceResult(state=state, rows=len(df), seconds=elapsed)
    except Exception as exc:  # noqa: BLE001 — source fails are logged, run continues
        elapsed = time.time() - start
        log.error("[%s] scraper failed after %.1fs: %s", state, elapsed, exc)
        return None, SourceResult(
            state=state, rows=0, seconds=elapsed, error=str(exc)
        )
