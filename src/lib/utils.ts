import type { ComplianceStatus } from '../generated/prisma';

/**
 * Merge class names, filtering out falsy values.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Format a date as "MMM D, YYYY" (e.g. "Jan 5, 2026").
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format cents as USD currency string (e.g. 9900 -> "$99.00").
 */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

/**
 * Return a Tailwind-friendly color token based on compliance status.
 */
export function getComplianceStatusColor(
  status: ComplianceStatus,
): 'green' | 'yellow' | 'red' {
  switch (status) {
    case 'COMPLETED':
    case 'WAIVED':
      return 'green';
    case 'DUE_SOON':
    case 'UPCOMING':
      return 'yellow';
    case 'OVERDUE':
      return 'red';
    default:
      return 'yellow';
  }
}

/**
 * Calculate the percentage of completed items vs total.
 */
export function calculateComplianceScore(
  items: { status: ComplianceStatus }[],
): number {
  if (items.length === 0) return 100;
  const completed = items.filter(
    (i) => i.status === 'COMPLETED' || i.status === 'WAIVED',
  ).length;
  return Math.round((completed / items.length) * 100);
}

/**
 * Return the number of days between now and the target date.
 * Positive = future, negative = past.
 */
export function daysUntil(date: Date | string): number {
  const target = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Derive a compliance status from a due date.
 *  - > 30 days away -> UPCOMING
 *  - 0-30 days away -> DUE_SOON
 *  - past due        -> OVERDUE
 */
export function getStatusFromDueDate(
  dueDate: Date | string,
): 'UPCOMING' | 'DUE_SOON' | 'OVERDUE' {
  const days = daysUntil(dueDate);
  if (days < 0) return 'OVERDUE';
  if (days <= 30) return 'DUE_SOON';
  return 'UPCOMING';
}
