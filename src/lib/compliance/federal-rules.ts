/**
 * Federal EPA compliance rules per 40 CFR Part 280.
 * Updated per the 2015 UST Rule revision (effective Oct 13, 2015; compliance Oct 13, 2018)
 * and incorporating 2024 amendments where applicable.
 *
 * These are seeded into compliance_rules with stateId: null and ruleSource: 'EPA'.
 *
 * Key citations verified against 40 CFR Part 280:
 * - Walkthrough inspections: 280.36
 * - Spill/overfill/sump testing: 280.35
 * - Release detection: 280.40-280.45
 * - Corrosion protection: 280.31
 * - Operator training: 280.240-280.245
 * - Financial responsibility: 280.90-280.116
 * - Closure: 280.70-280.74
 * - Release response: 280.50-280.67
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
    inspectionType: 'EPA_MONTHLY_WALKTHROUGH_SPILL',
    ruleSource: 'EPA',
    category: 'INSPECTION',
    frequencyMonths: 1,
    frequencyDays: null,
    description:
      'Monthly walkthrough inspection: visually check spill prevention equipment (spill buckets/catchment basins) for damage, deterioration, leaks, and obstructions. Added by the 2015 UST rule revision.',
    citation: '40 CFR 280.36(a)(1)(i)',
    equipmentType: 'SPILL_PREVENTION',
    appliesToMaterial: null,
    appliesToLeakDetection: null,
    appliesToCorrosionProtection: null,
    notes: 'New requirement from 2015 revision. Compliance deadline was Oct 13, 2018.',
  },
  {
    inspectionType: 'EPA_MONTHLY_WALKTHROUGH_RELEASE_DETECTION',
    ruleSource: 'EPA',
    category: 'INSPECTION',
    frequencyMonths: 1,
    frequencyDays: null,
    description:
      'Monthly walkthrough inspection: check release detection equipment is operating with no alarms or unusual readings. Verify monitoring systems are functioning. Added by the 2015 UST rule revision.',
    citation: '40 CFR 280.36(a)(1)(ii)',
    equipmentType: 'RELEASE_DETECTION',
    appliesToMaterial: null,
    appliesToLeakDetection: null,
    appliesToCorrosionProtection: null,
    notes: 'New requirement from 2015 revision.',
  },
  {
    inspectionType: 'EPA_MONTHLY_RELEASE_DETECTION_MONITORING',
    ruleSource: 'EPA',
    category: 'TESTING',
    frequencyMonths: 1,
    frequencyDays: null,
    description:
      'Monthly release detection monitoring using an approved method: automatic tank gauging (ATG), statistical inventory reconciliation (SIR), interstitial monitoring, vapor monitoring, or groundwater monitoring. Records must be maintained for at least 12 months.',
    citation: '40 CFR 280.41(a)',
    equipmentType: 'RELEASE_DETECTION',
    appliesToMaterial: null,
    appliesToLeakDetection: null,
    appliesToCorrosionProtection: null,
    notes: 'Method must meet performance standards in 40 CFR 280.43. Manual tank gauging only for tanks ≤2,000 gallons.',
  },
  {
    inspectionType: 'EPA_BIMONTHLY_IMPRESSED_CURRENT_CHECK',
    ruleSource: 'EPA',
    category: 'INSPECTION',
    frequencyMonths: 2,
    frequencyDays: null,
    description:
      'Impressed current cathodic protection systems must be inspected every 60 days to ensure the system is running properly. Check rectifier output readings.',
    citation: '40 CFR 280.31(c)',
    equipmentType: 'CATHODIC_PROTECTION',
    appliesToMaterial: null,
    appliesToLeakDetection: null,
    appliesToCorrosionProtection: 'CATHODIC_PROTECTION',
    notes: 'Applies specifically to impressed current CP systems, not sacrificial anode systems.',
  },

  // ============================================
  // ANNUAL (frequencyMonths: 12)
  // ============================================
  {
    inspectionType: 'EPA_ANNUAL_WALKTHROUGH_SUMPS',
    ruleSource: 'EPA',
    category: 'INSPECTION',
    frequencyMonths: 12,
    frequencyDays: null,
    description:
      'Annual walkthrough inspection: check under containment sumps (below handhole/manway covers) and inspect hand-held electronic release detection equipment. Added by the 2015 UST rule revision.',
    citation: '40 CFR 280.36(a)(2)',
    equipmentType: 'CONTAINMENT_SUMP',
    appliesToMaterial: null,
    appliesToLeakDetection: null,
    appliesToCorrosionProtection: null,
    notes: 'New requirement from 2015 revision.',
  },
  {
    inspectionType: 'EPA_ANNUAL_LINE_LEAK_DETECTOR_TEST',
    ruleSource: 'EPA',
    category: 'TESTING',
    frequencyMonths: 12,
    frequencyDays: null,
    description:
      'Annual test of automatic line leak detectors (ALLDs) on pressurized piping to verify detection capability of 3 gallons per hour at 10 psi within 1 hour. New explicit annual testing requirement from 2015 rule revision.',
    citation: '40 CFR 280.44(a)',
    equipmentType: 'LINE_LEAK_DETECTOR',
    appliesToMaterial: null,
    appliesToLeakDetection: null,
    appliesToCorrosionProtection: null,
    notes: 'Applies to all pressurized piping with ALLDs. New annual testing requirement from 2015 revision.',
  },
  {
    inspectionType: 'EPA_ANNUAL_RELEASE_DETECTION_OPERABILITY',
    ruleSource: 'EPA',
    category: 'TESTING',
    frequencyMonths: 12,
    frequencyDays: null,
    description:
      'Annual operability testing of release detection equipment including tank probes, sensors, and electronic monitoring devices to verify functionality per manufacturer specifications.',
    citation: '40 CFR 280.40(a)(3)',
    equipmentType: 'RELEASE_DETECTION',
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
      'Annual review and maintenance of financial responsibility documentation. Must demonstrate coverage of at least $1 million per occurrence. Mechanisms include insurance, surety bond, guarantee, letter of credit, state fund, or self-insurance.',
    citation: '40 CFR 280.90-280.116',
    equipmentType: 'FINANCIAL',
    appliesToMaterial: null,
    appliesToLeakDetection: null,
    appliesToCorrosionProtection: null,
    notes: '$1M per occurrence / $1M aggregate for 1-100 petroleum USTs; $1M per occurrence / $2M aggregate for 101+ USTs.',
  },

  // ============================================
  // TRIENNIAL (frequencyMonths: 36)
  // ============================================
  {
    inspectionType: 'EPA_TRIENNIAL_SPILL_EQUIPMENT_TEST',
    ruleSource: 'EPA',
    category: 'TESTING',
    frequencyMonths: 36,
    frequencyDays: null,
    description:
      'Test spill prevention equipment (spill buckets/catchment basins) at least every 3 years to ensure they are liquid-tight. Testing per PEI RP1200 or manufacturer specifications. Alternative: double-walled spill buckets with interstitial monitoring may use monitoring in lieu of testing.',
    citation: '40 CFR 280.35(a)(1)',
    equipmentType: 'SPILL_PREVENTION',
    appliesToMaterial: null,
    appliesToLeakDetection: null,
    appliesToCorrosionProtection: null,
    notes: 'New requirement from 2015 revision. Double-walled spill buckets with interstitial monitoring exempt per 280.35(a)(1)(ii).',
  },
  {
    inspectionType: 'EPA_TRIENNIAL_OVERFILL_EQUIPMENT_INSPECTION',
    ruleSource: 'EPA',
    category: 'TESTING',
    frequencyMonths: 36,
    frequencyDays: null,
    description:
      'Inspect overfill prevention equipment at least every 3 years. Flow restriction devices (ball float valves) must be inspected for proper operation. Electronic/mechanical shutoff devices must be tested to ensure activation at proper tank level (90% for shutoff, 95% for alarm).',
    citation: '40 CFR 280.35(a)(2)',
    equipmentType: 'OVERFILL_PREVENTION',
    appliesToMaterial: null,
    appliesToLeakDetection: null,
    appliesToCorrosionProtection: null,
    notes: 'New requirement from 2015 revision.',
  },
  {
    inspectionType: 'EPA_TRIENNIAL_CONTAINMENT_SUMP_TEST',
    ruleSource: 'EPA',
    category: 'TESTING',
    frequencyMonths: 36,
    frequencyDays: null,
    description:
      'Test containment sumps used for interstitial monitoring of piping every 3 years to ensure they are liquid-tight. Testing must verify sump integrity.',
    citation: '40 CFR 280.35(b)',
    equipmentType: 'CONTAINMENT_SUMP',
    appliesToMaterial: null,
    appliesToLeakDetection: null,
    appliesToCorrosionProtection: null,
    notes: 'New requirement from 2015 revision. Applies only to sumps used for interstitial monitoring.',
  },
  {
    inspectionType: 'EPA_TRIENNIAL_CP_SURVEY',
    ruleSource: 'EPA',
    category: 'TESTING',
    frequencyMonths: 36,
    frequencyDays: null,
    description:
      'Comprehensive cathodic protection system survey by a qualified cathodic protection tester every 3 years. Must evaluate entire CP system including anodes, rectifiers, test stations, and confirm adequate protection levels (minimum -850mV).',
    citation: '40 CFR 280.31(b)',
    equipmentType: 'CATHODIC_PROTECTION',
    appliesToMaterial: null,
    appliesToLeakDetection: null,
    appliesToCorrosionProtection: 'CATHODIC_PROTECTION',
    notes: 'Must be tested within 6 months of installation and every 3 years thereafter.',
  },
  {
    inspectionType: 'EPA_TRIENNIAL_CLASS_A_TRAINING',
    ruleSource: 'EPA',
    category: 'TRAINING',
    frequencyMonths: 36,
    frequencyDays: null,
    description:
      'Class A operator training renewal. Class A operators (owners/senior management) must broadly understand UST regulatory requirements and must complete retraining every 3 years or within 30 days of a facility failing a compliance inspection.',
    citation: '40 CFR 280.242, 280.245',
    equipmentType: 'OPERATOR',
    appliesToMaterial: null,
    appliesToLeakDetection: null,
    appliesToCorrosionProtection: null,
    notes: 'New Subpart J added by 2015 revision. Retraining also triggered within 30 days of significant non-compliance.',
  },
  {
    inspectionType: 'EPA_TRIENNIAL_CLASS_B_TRAINING',
    ruleSource: 'EPA',
    category: 'TRAINING',
    frequencyMonths: 36,
    frequencyDays: null,
    description:
      'Class B operator training renewal. Class B operators (facility/site managers) implement day-to-day UST compliance and must complete retraining every 3 years or within 30 days of a facility failing a compliance inspection.',
    citation: '40 CFR 280.243, 280.245',
    equipmentType: 'OPERATOR',
    appliesToMaterial: null,
    appliesToLeakDetection: null,
    appliesToCorrosionProtection: null,
    notes: 'New Subpart J added by 2015 revision.',
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
      'Class C operator training must be completed before assuming duties. Class C operators are front-line employees responsible for responding to alarms, emergencies, and spills. Signage or written instructions can satisfy the requirement.',
    citation: '40 CFR 280.244',
    equipmentType: 'OPERATOR',
    appliesToMaterial: null,
    appliesToLeakDetection: null,
    appliesToCorrosionProtection: null,
    notes: 'Must be completed before the operator assumes duties. No periodic retraining required by federal rule (some states require it).',
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
      'Initial corrective action steps must be completed within 45 days of a confirmed release. Includes free product removal, initial site characterization, and initial abatement measures.',
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
      'Notification of new UST system installation must be submitted to the implementing agency at least 30 days before installation begins. New installations after April 11, 2016 must have secondary containment with interstitial monitoring.',
    citation: '40 CFR 280.22, 280.20(c)',
    equipmentType: 'TANK',
    appliesToMaterial: null,
    appliesToLeakDetection: null,
    appliesToCorrosionProtection: null,
    notes: '2015 revision requires secondary containment for all new installations after April 11, 2016.',
  },
  {
    inspectionType: 'EPA_TANK_CLOSURE_NOTIFICATION',
    ruleSource: 'EPA',
    category: 'CLOSURE',
    frequencyMonths: null,
    frequencyDays: null,
    description:
      'Notification of permanent tank closure must be submitted to the implementing agency at least 30 days before closure begins. Must include closure plan, site assessment, and environmental sampling. Temporary closures exceeding 12 months must be permanently closed or receive an extension.',
    citation: '40 CFR 280.70-280.74',
    equipmentType: 'TANK',
    appliesToMaterial: null,
    appliesToLeakDetection: null,
    appliesToCorrosionProtection: null,
    notes: 'Temporary closure: 280.70. Permanent closure: 280.71. Site assessment: 280.72.',
  },
  {
    inspectionType: 'EPA_CHANGE_IN_SERVICE',
    ruleSource: 'EPA',
    category: 'DOCUMENTATION',
    frequencyMonths: null,
    frequencyDays: null,
    description:
      'Notification of change-in-service for a UST system. When a tank changes from storing a regulated substance, the owner must notify the implementing agency and comply with the same requirements as permanent closure.',
    citation: '40 CFR 280.71(c)',
    equipmentType: 'TANK',
    appliesToMaterial: null,
    appliesToLeakDetection: null,
    appliesToCorrosionProtection: null,
    notes: null,
  },
];
