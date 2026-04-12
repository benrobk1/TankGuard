import { z } from 'zod';

// Common validators
export const emailSchema = z.string().email('Invalid email address').max(255);
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters').max(128);

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().max(255).optional(),
  companyName: z.string().min(1, 'Company name is required').max(255),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: passwordSchema,
});

// Field allowlists for PUT operations
export const tankUpdateFields = [
  'tankNumber', 'capacity', 'material', 'product', 'installationDate',
  'leakDetection', 'corrosionProtection', 'status', 'notes',
] as const;

export const facilityUpdateFields = [
  'name', 'address', 'city', 'zipCode', 'stateId', 'epaId', 'phone',
] as const;

export const complianceUpdateFields = [
  'status', 'dueDate', 'completedDate', 'completedBy', 'notes', 'documentUrl',
] as const;

export const operatorUpdateFields = [
  'name', 'email', 'phone', 'classType', 'certificationDate',
  'certificationExpiration', 'trainingProvider', 'notes',
] as const;

export function pickAllowedFields<T extends Record<string, unknown>>(
  body: T,
  allowedFields: readonly string[],
): Partial<T> {
  const result: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (key in body) {
      result[key] = body[key];
    }
  }
  return result as Partial<T>;
}
