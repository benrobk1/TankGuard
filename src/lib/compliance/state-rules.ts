/**
 * State-specific UST compliance rules.
 * These supplement the federal EPA 40 CFR Part 280 requirements.
 * Each state may add requirements on top of federal minimums.
 *
 * Rules are keyed by 2-letter state abbreviation.
 * These are seeded into compliance_rules with the appropriate state_id and ruleSource: 'STATE'.
 *
 * RESEARCH STATUS: Rules sourced from live research of state regulatory agency websites
 * and current state administrative codes. Citations should be periodically verified
 * as states update their UST programs.
 */

export interface StateRule {
  inspectionType: string;
  ruleSource: 'STATE';
  category: 'INSPECTION' | 'TESTING' | 'CERTIFICATION' | 'TRAINING' | 'DOCUMENTATION' | 'REPORTING' | 'FINANCIAL' | 'CLOSURE';
  frequencyMonths: number | null;
  frequencyDays: number | null;
  description: string;
  citation: string;
  equipmentType: string | null;
  appliesToMaterial: string | null;
  appliesToLeakDetection: string | null;
  appliesToCorrosionProtection: string | null;
  notes: string | null;
}

// Placeholder - will be populated with researched rules once agents complete
export const stateRules: Record<string, StateRule[]> = {};
