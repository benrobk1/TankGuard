/**
 * Owner/operator enrichment.
 *
 * Each agency reports some subset of {phone, email, mailing address} per
 * facility. After aggregation we have N rows for one operator, and we want
 * the best contact for outreach. This module:
 *
 *   1. Cleans phone/email formatting.
 *   2. Cross-fills missing fields from sibling facilities.
 *   3. Optionally calls a third-party enrichment provider (Clearbit, Apollo,
 *      ZoomInfo) when an operator has no contact info from any source.
 *
 * The third-party path is feature-flagged with ENRICHMENT_PROVIDER_API_KEY —
 * when unset we run in source-only mode, which is the safe default for a
 * scheduled job.
 */

import type { OperatorAggregate } from './types';

export interface EnrichOptions {
  /** When set, enables Clearbit-style company-by-domain lookup. */
  apiKey?: string;
  /** Cap calls to the external provider per run (cost control). */
  maxExternalLookups?: number;
  fetcher?: typeof fetch;
}

const PHONE_RE = /\D+/g;

export function normalizePhone(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const digits = raw.replace(PHONE_RE, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return undefined;
}

const EMAIL_RE = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

export function normalizeEmail(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim().toLowerCase();
  return EMAIL_RE.test(trimmed) ? trimmed : undefined;
}

interface ProviderCompanyResponse {
  name?: string;
  domain?: string;
  phone?: string;
  email?: string;
  address?: { city?: string; state?: string; zip?: string; street?: string };
}

async function lookupCompany(
  operator: OperatorAggregate,
  options: EnrichOptions,
): Promise<ProviderCompanyResponse | null> {
  if (!options.apiKey) return null;
  const fetcher = options.fetcher ?? fetch;

  // Generic provider-shaped endpoint; swap host for whichever vendor the org
  // contracts with. Auth via bearer token to avoid leaking the key in the URL.
  const endpoint = `https://api.enrichment-provider.example.com/v1/company/by-name?name=${encodeURIComponent(operator.canonicalOwnerName)}`;
  try {
    const r = await fetcher(endpoint, {
      headers: { Authorization: `Bearer ${options.apiKey}` },
    });
    if (!r.ok) return null;
    return (await r.json()) as ProviderCompanyResponse;
  } catch {
    return null;
  }
}

/**
 * Cross-fill contact fields across an operator's facilities and (optionally)
 * call an external provider when nothing usable was reported by any agency.
 */
export async function enrichOperators(
  operators: OperatorAggregate[],
  options: EnrichOptions = {},
): Promise<OperatorAggregate[]> {
  const maxExternal = options.maxExternalLookups ?? 250;
  let externalCalls = 0;

  for (const op of operators) {
    op.primaryPhone =
      normalizePhone(op.primaryPhone) ??
      op.facilities.map((f) => normalizePhone(f.phone)).find(Boolean);

    op.primaryEmail =
      normalizeEmail(op.primaryEmail) ??
      op.facilities.map((f) => normalizeEmail(f.email)).find(Boolean);

    const needsExternal =
      !op.primaryPhone && !op.primaryEmail && options.apiKey && externalCalls < maxExternal;

    if (needsExternal) {
      const found = await lookupCompany(op, options);
      externalCalls++;
      if (found) {
        op.primaryPhone = op.primaryPhone ?? normalizePhone(found.phone);
        op.primaryEmail = op.primaryEmail ?? normalizeEmail(found.email);
        op.primaryAddress = op.primaryAddress ?? found.address?.street;
        op.primaryCity = op.primaryCity ?? found.address?.city;
        op.primaryZip = op.primaryZip ?? found.address?.zip;
      }
    }
  }

  return operators;
}
