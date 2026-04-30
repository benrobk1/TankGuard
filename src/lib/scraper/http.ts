/**
 * Tiny HTTP helpers shared across the state scrapers.
 *
 * All requests identify TankGuard so agencies can rate-limit / contact us.
 * Respect documented dataset cadences — none of these scrapers should be run
 * more than once per 24h against a given source.
 */

const DEFAULT_USER_AGENT =
  'TankGuard-ProspectScraper/1.0 (+https://tankguard.com/contact; ust-target-list)';

const DEFAULT_TIMEOUT_MS = 60_000;

export interface FetchOptions {
  fetcher?: typeof fetch;
  timeoutMs?: number;
  headers?: Record<string, string>;
  /** When true, do not throw on 4xx/5xx — return the response anyway. */
  allowErrorStatus?: boolean;
}

export async function fetchWithTimeout(
  url: string,
  options: FetchOptions = {},
): Promise<Response> {
  const fetcher = options.fetcher ?? fetch;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetcher(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': DEFAULT_USER_AGENT,
        Accept: '*/*',
        ...options.headers,
      },
      redirect: 'follow',
    });

    if (!response.ok && !options.allowErrorStatus) {
      throw new Error(
        `Fetch failed: ${response.status} ${response.statusText} for ${url}`,
      );
    }

    return response;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchText(url: string, options?: FetchOptions): Promise<string> {
  const response = await fetchWithTimeout(url, options);
  return response.text();
}

export async function fetchJson<T = unknown>(
  url: string,
  options?: FetchOptions,
): Promise<T> {
  const response = await fetchWithTimeout(url, {
    ...options,
    headers: { Accept: 'application/json', ...options?.headers },
  });
  return response.json() as Promise<T>;
}

/**
 * Minimal CSV parser that handles quoted fields with embedded commas / newlines.
 * Returns an array of row objects keyed by the header row.
 *
 * Production note: For very large state downloads (CA GeoTracker ships >100MB
 * CSVs), prefer streaming via csv-parse. This implementation is fine for the
 * dataset sizes we hit (FL ~6MB, NY ~20MB, PA ~3MB).
 */
export function parseCsv(text: string): Record<string, string>[] {
  const rows = splitCsvRows(text);
  if (rows.length === 0) return [];

  const headers = rows[0].map((h) => h.trim());
  const out: Record<string, string>[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length === 1 && row[0] === '') continue;
    const obj: Record<string, string> = {};
    for (let c = 0; c < headers.length; c++) {
      obj[headers[c]] = (row[c] ?? '').trim();
    }
    out.push(obj);
  }

  return out;
}

function splitCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += ch;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}
