/**
 * Federal EPA compliance rules per 40 CFR Part 280.
 * These are seeded into compliance_rules with stateId: null and ruleSource: 'EPA'.
 */

export interface FederalRule {
  inspectionType: string;
  ruleSource: 'EPA';
  category: string;
  frequencyMonths: number | null;
  frequencyDays: number | null;
  description: string;
  citation: string;
  equipmentType: string;
  appliesToMaterial: string | null;
  appliesToLeakDetection: string | null;
  appliesToCorrosionProtection: string | null;
  notes: string | null;
}

export const federalRules: FederalRule[] = [
  // ============================================
  // MONTHLY (frequencyMonths: 1)
  // ============================================
  {
    inspectionType: 'EPA_MONTHLY_SPILL_VISUAL',
    ruleSource: 'EPA',
    category: 'INSPECTION',
    frequencyMonths: 1,
    frequencyDays: null,
    description:
      'Monthly visual inspection of spill prevention equipment (spill buckets/catchment basins) to ensure they are functional, free of debris, and not damaged.',
    citation: '40 CFR 280.35(a)(1)',
    equipmentType: 'SPILL_PREVENTION',
    appliesToMaterial: null,
    appliesToLeakDetection: null,
    appliesToCorrosionProtection: null,
    notes: null,
  },
  {
    inspectionType: 'EPA_MONTHLY_OVERFILL_INSPECTION',
    ruleSource: 'EPA',
    category: 'INSPECTION',
    frequencyMonths: 1,
    frequencyDays: null,
    description:
      'Monthly inspection of overfill prevention equipment (ball float valves, flapper valves, automatic shutoff devices) to verify proper operation and no blockage.',
    citation: '40 CFR 280.35(a)(2)',
    equipmentType: 'OVERFILL_PREVENTION',
    appliesToMaterial: null,
    appliesToLeakDetection: null,
    appliesToCorrosionProtection: null,
    notes: null,
  },
  {
    inspectionType: 'EPA_MONTHLY_RELEASE_DETECTION',
    ruleSource: 'EPA',
    category: 'TESTING',
    frequencyMonths: 1,
    frequencyDays: null,
    description:
      'Monthly release detection monitoring using ATG, SIR, manual tank gauging, or other approved method. Records must be maintained for at least 12 months.',
    citation: '40 CFR 280.40',
    equipmentType: 'RELEASE_DETECTION',
    appliesToMaterial: null,
    appliesToLeakDetection: null,
    appliesToCorrosionProtection: null,
    notes: 'Applies to all leak detection methods (ATG, SIR, manual gauging, etc.)',
  },
  {
    inspectionType: 'EPA_MONTHLY_CONTAINMENT_SUMP',
    ruleSource: 'EPA',
    category: 'INSPECTION',
    frequencyMonths: 1,
    frequencyDays: null,
    description:
      'Monthly visual inspection of containment sumps (under-dispenser containment and tank-top sumps) for liquid, damage, and proper sealing.',
    citation: '40 CFR 280.35(a)(1)(ii)',
    equipmentType: 'CONTAINMENT_SUMP',
    appliesToMaterial: null,
    appliesToLeakDetection: null,
    appliesToCorrosionProtection: null,
    notes: 'If applicable — only for facilities with containment sumps.',
  },

  // ============================================
  // ANNUAL (frequencyMonths: 12)
  // ============================================
  {
    inspectionType: 'EPA_ANNUAL_ATG_TESTING',
    ruleSource: 'EPA',
    category: 'TESTING',
    frequencyMonths: 12,
    frequencyDays: null,
    description:
      'Annual automatic tank gauging (ATG) functionality testing to verify probe accuracy, alarm functionality, and proper calibration per manufacturer specifications.',
    citation: '40 CFR 280.40(a)(3)',
    equipmentType: 'ATG',
    appliesToMaterial: null,
    appliesToLeakDetection: 'ATG',
    appliesToCorrosionProtection: null,
    notes: null,
  },
  {
    inspectionType: 'EPA_ANNUAL_RELEASE_DETECTION_OPERABILITY',
    ruleSource: 'EPA',
    category: 'TESTING',
    frequencyMonths: 12,
    frequencyDays: null,
    description:
      'Annual operability testing of all release detection equipment including sensors, probes, mechanical line leak detectors, and electronic monitoring devices.',
    citation: '40 CFR 280.40(a)',
    equipmentType: 'RELEASE_DETECTION',
    appliesToMaterial: null,
    appliesToLeakDetection: null,
    appliesToCorrosionProtection: null,
    notes: null,
  },
  {
    inspectionType: 'EPA_ANNUAL_CP_TESTING',
    ruleSource: 'EPA',
    category: 'TESTING',
    frequencyMonths: 12,
    frequencyDays: null,
    description:
      'Annual cathodic protection system testing. Impressed current systems must be tested every 60 days; sacrificial anode systems tested annually. Minimum -850mV reading required.',
    citation: '40 CFR 280.31(b)',
    equipmentType: 'CATHODIC_PROTECTION',
    appliesToMaterial: null,
    appliesToLeakDetection: null,
    appliesToCorrosionProtection: 'CATHODIC_PROTECTION',
    notes:
      'Impressed current systems require 60-day inspections; annual testing is the minimum for sacrificial anode systems.',
  },
  {
    inspectionType: 'EPA_ANNUAL_SPILL_TESTING',
    ruleSource: 'EPA',
    category: 'TESTING',
    frequencyMonths: 12,
    frequencyDays: null,
    description:
      'Annual testing of spill prevention equipment (spill buckets) per manufacturer specifications or PEI RP1200. Must demonstrate containment integrity.',
    citation: '40 CFR 280.35(b)(1)',
    equipmentType: 'SPILL_PREVENTION',
    appliesToMaterial: null,
    appliesToLeakDetection: null,
    appliesToCorrosionProtection: null,
    notes: null,
  },
  {
    inspectionType: 'EPA_ANNUAL_OVERFILL_TESTING',
    ruleSource: 'EPA',
    category: 'TESTING',
    frequencyMonths: 12,
    frequencyDays: null,
    description:
      'Annual testing of overfill prevention equipment to confirm activation at proper tank level (90% for automatic shutoff, 95% for alarm, ball float at high level).',
    citation: '40 CFR 280.35(b)(2)',
    equipmentType: 'OVERFILL_PREVENTION',
    appliesToMaterial: null,
    appliesToLeakDetection: null,
    appliesToCorrosionProtection: null,
    notes: null,
  },
  {
    inspectionType: 'EPA_ANNUAL_FINANCIAL_RESPONSIBILITY',
    ruleSource: 'EPA',
    category: 'FINANCIAL',
    frequencyMonths: 12,
    frequencyDays: null,
    description:
      'Annual review and documentation of financial responsibility mechanisms. Must demonstrate coverage of at least $1 million per occurrence and $2 million annual aggregate ($500K/$1M for <100 tanks).',
    citation: '40 CFR 280.90-280.111',
    equipmentType: 'FINANCIAL',
    appliesToMaterial: null,
    appliesToLeakDetection: null,
    appliesToCorrosionProtection: null,
    notes: null,
  },

  // ============================================
  // TRIENNIAL (frequencyMonths: 36)
  // ============================================
  {
    inspectionType: 'EPA_TRIENNIAL_CLASS_A_TRAINING',
    ruleSource: 'EPA',
    category: 'TRAINING',
    frequencyMonths: 36,
    frequencyDays: null,
    description:
      'Class A operator training renewal. Class A operators have primary responsibility for on-site operation and maintenance, and must complete retraining every 3 years.',
    citation: '40 CFR 280.240-280.245',
    equipmentType: 'OPERATOR',
    appliesToMaterial: null,
    appliesToLeakDetection: null,
    appliesToCorrosionProtection: null,
    notes: null,
  },
  {
    inspectionType: 'EPA_TRIENNIAL_CLASS_B_TRAINING',
    ruleSource: 'EPA',
    category: 'TRAINING',
    frequencyMonths: 36,
    frequencyDays: null,
    description:
      'Class B operator training renewal. Class B operators implement day-to-day compliance and must complete retraining every 3 years.',
    citation: '40 CFR 280.240-280.245',
    equipmentType: 'OPERATOR',
    appliesToMaterial: null,
    appliesToLeakDetection: null,
    appliesToCorrosionProtection: null,
    notes: null,
  },
  {
    inspectionType: 'EPA_TRIENNIAL_CP_SURVEY',
    ruleSource: 'EPA',
    category: 'TESTING',
    frequencyMonths: 36,
    frequencyDays: null,
    description:
      'Comprehensive cathodic protection survey every 3 years by a qualified cathodic protection tester. Must evaluate entire CP system including anodes, rectifiers, and test stations.',
    citation: '40 CFR 280.31(b)(3)',
    equipmentType: 'CATHODIC_PROTECTION',
    appliesToMaterial: null,
    appliesToLeakDetection: null,
    appliesToCorrosionProtection: 'CATHODIC_PROTECTION',
    notes: null,
  },

  // ============================================
  // ONE-TIME / AS-NEEDED (frequencyMonths: null)
  // ============================================
  {
    inspectionType: 'EPA_CLASS_C_TRAINING',
    ruleSource: 'EPA',
    category: 'TRAINING',
    frequencyMonths: null,
    frequencyDays: null,
    description:
      'Class C operator training must be completed before assuming duties. Class C operators are the on-site employees responsible for responding to alarms and emergencies.',
    citation: '40 CFR 280.240-280.245',
    equipmentType: 'OPERATOR',
    appliesToMaterial: null,
    appliesToLeakDetection: null,
    appliesToCorrosionProtection: null,
    notes: 'Must be completed before the operator assumes duties at the facility.',
  },
  {
    inspectionType: 'EPA_RELEASE_REPORTING_24HR',
    ruleSource: 'EPA',
    category: 'REPORTING',
    frequencyMonths: null,
    frequencyDays: 1,
    description:
      'Confirmed or suspected releases must be reported to the implementing agency within 24 hours. Includes unusual operating conditions, presence of free product, or failed leak detection tests.',
    citation: '40 CFR 280.50',
    equipmentType: 'TANK',
    appliesToMaterial: null,
    appliesToLeakDetection: null,
    appliesToCorrosionProtection: null,
    notes: null,
  },
  {
    inspectionType: 'EPA_SUSPECTED_RELEASE_INVESTIGATION',
    ruleSource: 'EPA',
    category: 'REPORTING',
    frequencyMonths: null,
    frequencyDays: 7,
    description:
      'Investigation of a suspected release must begin within 7 days. Owner/operator must perform system tests, site checks, and determine if contamination is present.',
    citation: '40 CFR 280.52',
    equipmentType: 'TANK',
    appliesToMaterial: null,
    appliesToLeakDetection: null,
    appliesToCorrosionProtection: null,
    notes: null,
  },
  {
    inspectionType: 'EPA_CORRECTIVE_ACTION_45DAY',
    ruleSource: 'EPA',
    category: 'REPORTING',
    frequencyMonths: null,
    frequencyDays: 45,
    description:
      'Initial corrective action steps must be completed within 45 days of confirmed release. Includes free product removal, initial site characterization, and initial abatement measures.',
    citation: '40 CFR 280.62-280.65',
    equipmentType: 'TANK',
    appliesToMaterial: null,
    appliesToLeakDetection: null,
    appliesToCorrosionProtection: null,
    notes: null,
  },
  {
    inspectionType: 'EPA_NEW_TANK_NOTIFICATION',
    ruleSource: 'EPA',
    category: 'DOCUMENTATION',
    frequencyMonths: null,
    frequencyDays: null,
    description:
      'Notification of new tank installation must be submitted to the implementing agency at least 30 days before installation begins. Includes tank specifications, installation details, and contractor information.',
    citation: '40 CFR 280.22',
    equipmentType: 'TANK',
    appliesToMaterial: null,
    appliesToLeakDetection: null,
    appliesToCorrosionProtection: null,
    notes: 'Must be submitted 30 days before installation.',
  },
  {
    inspectionType: 'EPA_TANK_CLOSURE_NOTIFICATION',
    ruleSource: 'EPA',
    category: 'CLOSURE',
    frequencyMonths: null,
    frequencyDays: null,
    description:
      'Notification of permanent tank closure must be submitted to the implementing agency at least 30 days before closure begins. Includes closure plan, site assessment, and environmental sampling plan.',
    citation: '40 CFR 280.71',
    equipmentType: 'TANK',
    appliesToMaterial: null,
    appliesToLeakDetection: null,
    appliesToCorrosionProtection: null,
    notes: 'Must be submitted 30 days before closure.',
  },
  {
    inspectionType: 'EPA_CHANGE_IN_SERVICE',
    ruleSource: 'EPA',
    category: 'DOCUMENTATION',
    frequencyMonths: null,
    frequencyDays: null,
    description:
      'Notification of change-in-service for a UST system. When a tank changes from storing a regulated substance, the owner must notify the implementing agency and comply with closure requirements.',
    citation: '40 CFR 280.71(b)',
    equipmentType: 'TANK',
    appliesToMaterial: null,
    appliesToLeakDetection: null,
    appliesToCorrosionProtection: null,
    notes: null,
  },
];
