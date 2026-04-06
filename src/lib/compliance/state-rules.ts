/**
 * State-specific UST compliance rules.
 * These supplement the federal EPA 40 CFR Part 280 requirements.
 * Each state may add requirements on top of federal minimums.
 *
 * Rules are keyed by 2-letter state abbreviation.
 * These are seeded into compliance_rules with the appropriate state_id and ruleSource: 'STATE'.
 *
 * RESEARCH STATUS: Rules sourced from live research of state regulatory agency websites
 * and current state administrative codes (April 2026). Citations should be periodically
 * verified as states update their UST programs.
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

function rule(
  inspectionType: string,
  category: StateRule['category'],
  frequencyMonths: number | null,
  description: string,
  citation: string,
  opts: Partial<Pick<StateRule, 'frequencyDays' | 'equipmentType' | 'appliesToMaterial' | 'appliesToLeakDetection' | 'appliesToCorrosionProtection' | 'notes'>> = {}
): StateRule {
  return {
    inspectionType,
    ruleSource: 'STATE',
    category,
    frequencyMonths,
    frequencyDays: opts.frequencyDays ?? null,
    description,
    citation,
    equipmentType: opts.equipmentType ?? null,
    appliesToMaterial: opts.appliesToMaterial ?? null,
    appliesToLeakDetection: opts.appliesToLeakDetection ?? null,
    appliesToCorrosionProtection: opts.appliesToCorrosionProtection ?? null,
    notes: opts.notes ?? null,
  };
}

export const stateRules: Record<string, StateRule[]> = {
  // ── TEXAS (TCEQ) ──────────────────────────────────────────────────────
  // Texas Commission on Environmental Quality
  // Primary Regulation: 30 TAC Chapter 334
  TX: [
    rule('STATE_TX_ANNUAL_SELF_CERTIFICATION', 'CERTIFICATION', 12,
      'Annual self-certification of compliance with technical standards, registration, and financial assurance. TCEQ issues a Delivery Certificate upon successful self-certification. Delivery of regulated substances is prohibited without a valid Delivery Certificate.',
      '30 TAC 334.8',
      { notes: 'Submit 30-90 days before expiration. Unique to Texas — no federal equivalent.' }),
    rule('STATE_TX_FINANCIAL_ASSURANCE_PROOF', 'FINANCIAL', 12,
      'Proof of financial assurance (current certificate of insurance or other proof per 30 TAC Chapter 37, Subchapter I) must accompany annual self-certification form.',
      '30 TAC 334.8; 30 TAC 37.870(b)',
      { notes: 'Required since September 1, 2007. Tied to Delivery Certificate issuance.' }),
    rule('STATE_TX_DELIVERY_CERTIFICATE', 'CERTIFICATION', 12,
      'Valid Delivery Certificate must be displayed at facility. Delivery of regulated substances into regulated USTs is prohibited by state law without a current certificate.',
      '30 TAC 334.8',
      { notes: 'Delivery Certificate program is unique to Texas.' }),
    rule('STATE_TX_UST_CONTRACTOR_LICENSE', 'CERTIFICATION', null,
      'State-issued occupational licenses required for UST contractors and on-site supervisors who install, repair, or remove USTs.',
      '30 TAC Chapter 334, Subchapter J',
      { notes: 'State-specific licensing regime beyond federal requirements.' }),
    rule('STATE_TX_TOOS_SITE_CHECK', 'CLOSURE', null,
      'Owners placing a UST system temporarily out of service must empty the system and perform a site check to be released from financial assurance requirements.',
      '30 TAC 334.54(e)(5)(b); 30 TAC 334.74(2)',
      { notes: 'State-specific procedural requirement for temporary out-of-service status.' }),
  ],

  // ── CALIFORNIA (SWRCB / CUPAs) ────────────────────────────────────────
  // State Water Resources Control Board, administered locally by CUPAs
  // Primary Regulations: Health & Safety Code Chapter 6.7; CCR Title 23, Division 3, Chapter 16
  CA: [
    rule('STATE_CA_OPERATING_PERMIT', 'CERTIFICATION', 12,
      'UST operating permit issued by the local CUPA required. No federal operating permit equivalent exists. Permits renewed annually or biennially depending on local jurisdiction.',
      'Health & Safety Code 25284; CCR Title 23, Division 3, Chapter 16',
      { notes: 'Renewal frequency varies by CUPA (12 or 24 months).' }),
    rule('STATE_CA_MONITORING_SYSTEM_CERTIFICATION', 'TESTING', 12,
      'All UST monitoring systems must be certified every 12 months by an ICC-certified California UST Service Technician with current manufacturer training. Must be witnessed by a local agency inspector.',
      'CCR Title 23, Section 2638; Section 2643',
      { equipmentType: 'monitoring_system', notes: 'Strict 12-month period — no grace period between certifications.' }),
    rule('STATE_CA_SENSOR_ALARM_TESTING', 'TESTING', 12,
      'Annual testing of release detection sensors and alarms, including under-dispenser containment (UDC) sensors, pump turbine containment sensors, and alarms. Sensors must achieve positive shutdown.',
      'CCR Title 23, Sections 2638, 2643',
      { equipmentType: 'sensors_alarms' }),
    rule('STATE_CA_SPILL_CONTAINMENT_TESTING', 'TESTING', 12,
      'Spill containment structures must be tested annually to demonstrate they can contain the regulated substance.',
      'CCR Title 23, Section 2637',
      { equipmentType: 'spill_containment' }),
    rule('STATE_CA_SECONDARY_CONTAINMENT_TESTING', 'TESTING', 36,
      'Secondary containment must be tested for tightness every 36 months. Also required upon installation, 6 months post-install, and within 30 days of any repair.',
      'CCR Title 23, Section 2637',
      { equipmentType: 'secondary_containment', notes: 'Also required at install, 6 months post-install, and post-repair.' }),
    rule('STATE_CA_SERVICE_TECHNICIAN_CERTIFICATION', 'CERTIFICATION', 24,
      'UST service technicians must possess or work under someone with a current California UST Service Technician certification issued by ICC. Renewed every 24 months with current manufacturer training.',
      'CCR Title 23, Section 2715',
      { notes: 'Applies to all individuals performing UST installation, testing, maintenance, or monitoring.' }),
    rule('STATE_CA_CUPA_ANNUAL_FEE', 'FINANCIAL', 12,
      'Annual fees to local CUPA vary by county/jurisdiction, typically several hundred to over a thousand dollars per facility per year.',
      'Health & Safety Code 25284',
      { notes: 'Fee amounts vary by CUPA jurisdiction.' }),
  ],

  // ── FLORIDA (DEP) ─────────────────────────────────────────────────────
  // Florida Department of Environmental Protection, Division of Waste Management
  // Primary Regulation: Chapter 62-761, F.A.C.
  FL: [
    rule('STATE_FL_ANNUAL_VISUAL_INSPECTION', 'INSPECTION', 12,
      'Annual visual inspection of every component of the storage tank system that contains, transfers, or stores regulated substances and can be visually inspected. Must be documented per Rule 62-761.710.',
      '62-761.500, F.A.C.; 62-761.710, F.A.C.',
      { notes: 'Not to exceed 12 months between inspections.' }),
    rule('STATE_FL_EQUIPMENT_REGISTRATION', 'CERTIFICATION', 60,
      'All UST system equipment must be registered with DEP using Form 62-761.900(9). Registration renewed every 5 years.',
      '62-761.900(9), F.A.C.',
      { notes: 'Integrity test requirements and annual operability testing procedures must also be registered.' }),
    rule('STATE_FL_ANNUAL_TANK_FEE', 'FINANCIAL', 12,
      'Annual renewal fee of $25 per tank due by July 1 each year. Initial registration fee of $50 per tank.',
      'Section 376.303, Florida Statutes',
      { notes: 'Per-tank fee is state-specific.' }),
    rule('STATE_FL_IPTF_COMPLIANCE', 'FINANCIAL', 12,
      'Owners/operators must maintain compliance with registration and financial responsibility to be eligible for Inland Protection Trust Fund (IPTF) coverage for cleanup costs.',
      'Section 376.3071, Florida Statutes',
      { notes: 'IPTF funded by excise tax revenues on petroleum and registration fees.' }),
    rule('STATE_FL_CONTAINMENT_INTEGRITY_TEST', 'TESTING', null,
      'Factory-made single-walled spill containment systems or single-walled sumps require containment integrity test before being placed into service per manufacturer specifications or PEI/RP1200-19.',
      '62-761.500, F.A.C.',
      { equipmentType: 'spill_containment', notes: 'Required before initial service.' }),
  ],

  // ── NEW YORK (DEC) ────────────────────────────────────────────────────
  // New York State Department of Environmental Conservation
  // Primary Regulation: 6 NYCRR Part 613
  NY: [
    rule('STATE_NY_PBS_REGISTRATION_RENEWAL', 'CERTIFICATION', 60,
      'Petroleum Bulk Storage registration must be renewed every 5 years. Registration fees range from $0 to $500 per facility based on total storage capacity.',
      '6 NYCRR 613-1.9',
      { notes: 'Must renew until written notice of permanent closure or ownership transfer.' }),
    rule('STATE_NY_ANNUAL_TIGHTNESS_TEST_CAT1', 'TESTING', 12,
      'Category 1 UST systems must be tightness tested annually. Stricter than federal which allows alternative release detection methods.',
      '6 NYCRR 613-2.1',
      { notes: 'Applies to older Category 1 UST systems.' }),
    rule('STATE_NY_OPERATOR_RETRAINING', 'TRAINING', 60,
      'Class A and Class B operators must receive retesting/retraining every 5 years. Federal rules do not mandate periodic retraining.',
      '6 NYCRR Part 613 (2023 amendments)',
      { notes: 'Effective October 17, 2023. State-specific requirement.' }),
    rule('STATE_NY_CP_ANNUAL_TESTING', 'TESTING', 12,
      'Cathodic protection systems must be tested at yearly intervals. Impressed current systems inspected every 60 days. Records maintained for 3 years.',
      '6 NYCRR 613-2.2',
      { appliesToCorrosionProtection: 'IMPRESSED_CURRENT', notes: 'Within 6 months of installation/reinstallation/repair, then yearly.' }),
    rule('STATE_NY_PIPING_TIGHTNESS_TESTING', 'TESTING', 12,
      'Underground piping must undergo tightness and leak detection testing. Piping cathodic protection inspected annually if installed.',
      '6 NYCRR 613-2.2',
      { equipmentType: 'piping' }),
  ],

  // ── OHIO (BUSTR) ──────────────────────────────────────────────────────
  // Bureau of Underground Storage Tank Regulations, Division of State Fire Marshal
  // Primary Regulation: OAC 1301:7-9
  OH: [
    rule('STATE_OH_CERTIFICATE_OF_OPERATION', 'CERTIFICATION', 12,
      'Each UST must have a current Certificate of Operation issued by the State Fire Marshal. Without a valid certificate, the UST cannot legally operate. Payment of fees alone does not guarantee issuance.',
      'OAC 1301:7-9-10; ORC 3737.88',
      { notes: 'Annual renewal, fees due by July 1 each year.' }),
    rule('STATE_OH_ANNUAL_TANK_FEE', 'FINANCIAL', 12,
      'Annual per-tank fee assessed by the Petroleum Board (PUSTFA). All outstanding fees, late payment fees, and collection costs must be paid before a Certificate can be issued.',
      'ORC 3737.91; OAC 3737-1-04',
      { notes: 'Fee amount set annually by the board. Due July 1.' }),
    rule('STATE_OH_FACILITY_TRANSFER_FEE', 'FINANCIAL', null,
      'Upon ownership change, new owner must pay a $500 per-facility transfer fee plus any unpaid annual per-tank fees, late payment fees, and collection costs.',
      'ORC 3737.91',
      { notes: 'State-specific transfer fee with no federal equivalent.' }),
    rule('STATE_OH_INSTALLER_CERTIFICATION', 'CERTIFICATION', null,
      'UST installers must be certified by the State Fire Marshal. Certified installers must have a copy of their current certificate at any work location.',
      'OAC 1301:7-9-11',
      { notes: 'Applies to all UST installation work.' }),
    rule('STATE_OH_PUSTFA_COMPLIANCE', 'FINANCIAL', 12,
      'Tank owners must maintain a current Certificate from the Petroleum Board (separate from Fire Marshal Certificate of Operation) to demonstrate financial responsibility.',
      'ORC 3737.91; OAC 1301:7-9-05',
      { notes: 'Dual-compliance: both Fire Marshal and Petroleum Board certificates required.' }),
  ],

  // ── PENNSYLVANIA (DEP) ────────────────────────────────────────────────
  // Pennsylvania Department of Environmental Protection, Division of Storage Tanks
  // Primary Regulation: 25 Pa. Code Chapter 245
  PA: [
    rule('STATE_PA_FACILITY_OPERATIONS_INSPECTION', 'INSPECTION', 36,
      'Third-party facility operations inspection (FOI) by a DEP-certified UST Inspector (IUM) evaluating tank/piping construction, corrosion protection, spill/overfill protection, sumps, and release detection.',
      '25 Pa. Code Section 245.411',
      { notes: 'Within 6-12 months of installation or ownership change; every 3 years thereafter. Owner-funded.' }),
    rule('STATE_PA_ANNUAL_REGISTRATION_FEE', 'FINANCIAL', 12,
      'Annual UST registration fee of $50 per tank. Volunteer fire companies and EMS organizations are exempt.',
      '25 Pa. Code Section 245.42',
      { notes: 'Effective July 1, 1993 for exemptions.' }),
    rule('STATE_PA_USTIF_CAPACITY_FEE', 'FINANCIAL', 12,
      'Underground Storage Tank Indemnification Fund (USTIF) capacity fee of $0.0825 per gallon of tank capacity.',
      '25 Pa. Code Chapter 977',
      { notes: 'Additional per-gallon delivered fee of $0.011/gallon also applies.' }),
    rule('STATE_PA_CLASS_C_ANNUAL_REFRESHER', 'TRAINING', 12,
      'Class C operators (emergency response) must complete annual refresher training. Class A/B require retraining only if facility found out of compliance.',
      '25 Pa. Code Section 245.436',
      { notes: 'Annual Class C refresher exceeds federal minimums.' }),
    rule('STATE_PA_CERTIFIED_INSTALLER_PROGRAM', 'CERTIFICATION', null,
      'State certification required for UST installers, inspectors, and tightness testers. Comprehensive certification program including IUM, UTT certifications.',
      '25 Pa. Code Sections 245.110-245.141 (Subchapter B)',
      { notes: 'PA-specific certification regime beyond federal requirements.' }),
    rule('STATE_PA_TIGHTNESS_TESTING', 'TESTING', null,
      'Tank tightness testing must be conducted by a DEP-certified Underground Storage Tank Tightness Tester (UTT). Line tests must detect 0.1 gph leak rate at 1.5x operating pressure.',
      '25 Pa. Code Section 245.31',
      { notes: 'State-certified testers required — beyond federal requirements.' }),
  ],

  // ── GEORGIA (EPD) ─────────────────────────────────────────────────────
  // Georgia Environmental Protection Division, Land Protection Branch
  // Primary Regulation: Rules 391-3-15
  GA: [
    rule('STATE_GA_COMPLIANCE_INSPECTION', 'INSPECTION', 36,
      'EPD compliance inspectors conduct on-site facility inspections every 3 years.',
      'Rules 391-3-15',
      { notes: 'State-conducted inspections.' }),
    rule('STATE_GA_OPERATOR_RETRAINING', 'TRAINING', 84,
      'Class A/B operators must complete periodic retraining every 7 years. Immediate retraining required if facility found out of compliance or in significant violation.',
      'Rules 391-3-15',
      { notes: '7-year mandatory cycle is more prescriptive than federal (no automatic federal retraining).' }),
    rule('STATE_GA_GUST_TRUST_FUND_FEE', 'FINANCIAL', 12,
      'Environmental Assurance Fee (EAF) of $0.0075 per gallon of petroleum purchased (0.75 cents/gallon) funds the GUST Trust Fund.',
      'O.C.G.A. Section 12-13-10; Rule 391-3-15-.13',
      { notes: 'Fee collection suspends when fund balance exceeds $50M, resumes when below $30M.' }),
    rule('STATE_GA_PRECISION_TIGHTNESS_TEST', 'TESTING', null,
      'For GUST Trust Fund participation, a precision tightness test must be performed and passed, plus a site check per 40 CFR 280.52(b).',
      'Rule 391-3-15-.13',
      { notes: 'Required for initial GUST Trust Fund eligibility.' }),
    rule('STATE_GA_ANNUAL_LINE_TESTING', 'TESTING', 12,
      'Annual line leak detection testing at 0.1 GPH for all pressurized piping systems.',
      'Rules 391-3-15 (incorporating 40 CFR 280 Subpart D)',
      { equipmentType: 'piping' }),
  ],

  // ── NORTH CAROLINA (DEQ) ──────────────────────────────────────────────
  // NC Department of Environmental Quality, UST Section, Division of Waste Management
  // Primary Regulation: 15A NCAC 02N; N.C.G.S. 143-215.94
  NC: [
    rule('STATE_NC_ANNUAL_OPERATING_FEE', 'FINANCIAL', 12,
      'Commercial UST annual operating fee of $420 per tank. Funds the Commercial Leaking Petroleum UST Cleanup Fund.',
      'N.C.G.S. 143-215.94C',
      { notes: 'Among the higher state per-tank fees. Applies to each commercial petroleum UST.' }),
    rule('STATE_NC_CONTAINMENT_SUMP_TESTING', 'TESTING', 36,
      'Containment sumps not continuously monitored (vacuum, pressure, or hydrostatic) must be tested for tightness per PEI/RP100 every 3 years.',
      '15A NCAC 02N .0905',
      { equipmentType: 'containment_sump', notes: 'Specifies triennial testing with PEI/RP100 standard.' }),
    rule('STATE_NC_INTERSTITIAL_SPACE_TESTING', 'TESTING', 36,
      'Interstitial spaces of tanks not monitored using vacuum/pressure/hydrostatic methods must be tested for tightness. Initial test before start-up, then between 6-12 months post-start-up, then every 3 years.',
      '15A NCAC 02N .0903',
      { notes: 'Applies to double-walled tanks without continuous interstitial monitoring.' }),
    rule('STATE_NC_ANNUAL_SUMP_VISUAL_INSPECTION', 'INSPECTION', 12,
      'All containment sumps must be visually inspected at least annually.',
      '15A NCAC 02N .0407',
      { equipmentType: 'containment_sump' }),
    rule('STATE_NC_OPERATOR_TRAINING', 'TRAINING', null,
      'NC combines Class A/B into "Primary Operator" category. Training conducted by state inspector during compliance inspection. Must score 75% or better on written assessment.',
      'N.C.G.S. 143-215.94NN through 143-215.94TT',
      { notes: 'Retraining within 30 days if out of compliance or failed assessment ("Tank School").' }),
  ],

  // ── ILLINOIS (OSFM) ──────────────────────────────────────────────────
  // Illinois Office of the State Fire Marshal, Petroleum & Chemical Safety Division
  // Primary Regulation: 41 Ill. Adm. Code Parts 174, 175, 176, 177
  IL: [
    rule('STATE_IL_OPERATOR_RETRAINING', 'TRAINING', 48,
      'All Class A, B, and C operators must be recertified every 4 years through OSFM-approved vendors. Retraining within 60 days of NOV if out of compliance.',
      '41 Ill. Adm. Code 174',
      { notes: '4-year mandatory cycle for all classes is more prescriptive than federal.' }),
    rule('STATE_IL_OSFM_PERMIT', 'CERTIFICATION', null,
      'All UST activities require an OSFM permit. Certain activities cannot proceed without an OSFM inspector on site.',
      '41 Ill. Adm. Code 175, Subpart I, Appendix A and B',
      { notes: 'State inspector on-site presence required for specific activities.' }),
    rule('STATE_IL_PRECISION_TESTING', 'TESTING', null,
      'Final precision test results required for all new installations. Records must be kept for 2 years or until next test.',
      '41 Ill. Adm. Code 175.630, 175.640',
      { notes: 'Required at installation and as part of release investigation.' }),
    rule('STATE_IL_REGISTRATION', 'CERTIFICATION', null,
      'All USTs must be registered with OSFM. Late registration carries a $500 per tank penalty fee.',
      '41 Ill. Adm. Code 176.440, 176.450',
      { notes: 'Applies to all petroleum and hazardous substance USTs except heating oil for consumptive use.' }),
    rule('STATE_IL_LUST_FUND_FEE', 'FINANCIAL', 12,
      'Combined per-gallon fee of $0.011/gallon ($0.003 motor fuel tax + $0.008 environmental impact fee) funds the Illinois LUST Fund for corrective action reimbursement.',
      'Illinois Compiled Statutes',
      { notes: 'Fees set to expire in 2030.' }),
  ],

  // ── MICHIGAN (EGLE / LARA) ────────────────────────────────────────────
  // EGLE (cleanup) and LARA Bureau of Fire Services (compliance)
  // Primary Regulation: Part 211, Act 451 of 1994 (NREPA); MUSTR
  MI: [
    rule('STATE_MI_OPERATOR_RETRAINING', 'TRAINING', 60,
      'Class A/B operators must complete training and recertification every 5 years. Out-of-compliance operators receive on-site retraining; must re-examine if not compliant within 60 days.',
      'Part 211, Act 451; MUSTR',
      { notes: '5-year mandatory cycle is more prescriptive than federal.' }),
    rule('STATE_MI_PRE_INSTALLATION_NOTIFICATION', 'DOCUMENTATION', null,
      'Owners must submit Notice of Proposed Installation (BFS-3820) with complete plans at least 45 days prior to use.',
      'Part 211, Act 451; MUSTR',
      { notes: '45-day advance notice exceeds federal 30-day notification.' }),
    rule('STATE_MI_CLASS_B_FACILITY_INSPECTION', 'INSPECTION', 3,
      'Class B operators must conduct facility inspections monthly or quarterly and record results on an UST Operational Facility Inspection Form, retained for 3 years.',
      'MUSTR',
      { notes: 'Monthly or quarterly inspections with 3-year record retention.' }),
    rule('STATE_MI_MUSTA_FUND', 'FINANCIAL', 12,
      'MUSTA cleanup fund reimburses up to $1M per claim. Optional $500/year fee reduces deductible. Deductible: $2,000 (fewer than 8 USTs) or $10,000 (8+ USTs).',
      'Part 211; MUSTA program',
      { notes: 'Annual registration fee eliminated (formerly $100/tank, last invoiced Nov 2016).' }),
    rule('STATE_MI_RELEASE_REPORTING', 'REPORTING', null,
      'Initial Assessment Report (IAR) required within 180 days of confirmed release. Final Assessment Report (FAR) within 365 days.',
      'Part 213, Act 451',
      { notes: 'Strict reporting timelines for releases.' }),
  ],

  // ── NEW JERSEY (DEP) ─────────────────────────────────────────────────
  // New Jersey Department of Environmental Protection
  // Primary Regulation: N.J.A.C. 7:14B
  NJ: [
    rule('STATE_NJ_ANNUAL_REGISTRATION', 'CERTIFICATION', 12,
      'All regulated USTs must be registered with NJDEP. Since Dec 2, 2024, all submissions must be made online via NJDEP portal. Annual renewal required.',
      'N.J.A.C. 7:14B-2.2; N.J.A.C. 7:14B-3.2',
      { notes: 'Initial registration fee per 7:14B-3.1; annual renewal per 7:14B-3.2.' }),
    rule('STATE_NJ_ANNUAL_LINE_TIGHTNESS', 'TESTING', 12,
      'Annual line tightness testing required on all single-wall product piping, unless electronic leak detectors are installed and functioning properly.',
      'N.J.A.C. 7:14B-6',
      { equipmentType: 'piping', notes: 'Federal allows alternative methods; NJ mandates annual testing.' }),
    rule('STATE_NJ_MONTHLY_VISUAL_INSPECTION', 'INSPECTION', null,
      'Spill prevention equipment and containment sumps require monthly visual inspection.',
      'N.J.A.C. 7:14B-5.12',
      { frequencyDays: 30, equipmentType: 'spill_containment' }),
    rule('STATE_NJ_OPERATOR_RECERTIFICATION', 'CERTIFICATION', 36,
      'All personnel who install, close, test, and design corrosion protection systems must be certified. Recertification every 3 years.',
      'N.J.A.C. 7:14B (certification subchapter)',
      { notes: 'NJ mandates certified professionals for all UST work.' }),
    rule('STATE_NJ_SPILL_COMPENSATION_FUND', 'FINANCIAL', 12,
      'NJ Spill Compensation Fund funded by tax of $0.023 per barrel on petroleum transfers. Rate increases to $0.04/barrel when pending claims exceed fund balance.',
      'N.J.A.C. 7:26C',
      { notes: 'Separate from UST Fund which provides loans/grants up to $2M.' }),
  ],

  // ── VIRGINIA (DEQ) ────────────────────────────────────────────────────
  // Virginia Department of Environmental Quality
  // Primary Regulation: 9VAC25-580
  VA: [
    rule('STATE_VA_PERMIT_AND_CERTIFICATE', 'CERTIFICATION', null,
      'All UST systems undergoing installation, upgrade, repair, or closure must be permitted and inspected. A Certificate of Use must be obtained from the building official before any UST is placed into service.',
      '9VAC25-580-40',
      { notes: 'Building permit and Certificate of Use required — federal does not require this.' }),
    rule('STATE_VA_TANK_TIGHTNESS_TESTING', 'TESTING', 60,
      'Monthly inventory control plus tank tightness testing at least every 5 years (within first 10 years of installation).',
      '9VAC25-580-160',
      { notes: 'Applies to petroleum UST systems.' }),
    rule('STATE_VA_SUCTION_PIPING_TESTING', 'TESTING', 36,
      'Suction piping must have tightness test at least every 3 years OR use monthly monitoring.',
      '9VAC25-580-170',
      { equipmentType: 'piping', notes: 'Alternative: monthly monitoring instead of triennial testing.' }),
    rule('STATE_VA_CLASS_C_ANNUAL_REFRESHER', 'TRAINING', 12,
      'Class C operators must complete annual refresher training.',
      '9VAC25-580 (operator training section)',
      { notes: 'Annual refresher exceeds federal minimums.' }),
    rule('STATE_VA_PETROLEUM_TANK_FUND', 'FINANCIAL', 12,
      'Virginia Petroleum Storage Tank Fund funded by fee of $0.002/gallon on gasoline, diesel, blended fuel, and heating oil. Rate increases to $0.006/gallon when fund falls below $3M.',
      'Virginia Code 62.1-44.34:11; 9VAC25-590-210',
      { notes: 'Provides financial responsibility mechanism and cleanup reimbursement.' }),
  ],

  // ── INDIANA (IDEM) ────────────────────────────────────────────────────
  // Indiana Department of Environmental Management, Office of Land Quality
  // Primary Regulation: 329 IAC 9
  IN: [
    rule('STATE_IN_ANNUAL_REGISTRATION_FEE', 'FINANCIAL', 12,
      'Annual registration fee of $90/year per regulated petroleum UST. $245/year per UST containing regulated hazardous substances. Separate compartments each require a separate fee.',
      '329 IAC 9; Indiana Code 13-23',
      { notes: 'Per-tank annual fee with no federal equivalent.' }),
    rule('STATE_IN_FACILITY_INSPECTION', 'INSPECTION', 36,
      'IDEM inspects each UST facility at least once every 3 years.',
      '329 IAC 9 (inspection provisions)',
      { notes: 'State-mandated triennial inspection cycle.' }),
    rule('STATE_IN_FIRE_MARSHAL_CERTIFICATION', 'CERTIFICATION', null,
      'Workers performing UST installations, testing, upgrades, closures, removals, or change-in-service must be certified by the Indiana State Fire Marshal and present on-site at all times.',
      '329 IAC 9',
      { notes: 'State-specific certification beyond federal requirements.' }),
    rule('STATE_IN_FINANCIAL_RESPONSIBILITY', 'FINANCIAL', 12,
      'Per-occurrence amount of at least $1 million required for all UST owners/operators. Federal allows $500,000 for smaller operations.',
      '329 IAC 9 (financial responsibility)',
      { notes: '$1M per-occurrence is stricter than federal $500K for smaller operations.' }),
    rule('STATE_IN_ELTF_COMPLIANCE', 'FINANCIAL', 12,
      'Excess Liability Trust Fund (ELTF) reimburses cleanup costs. Releases discovered after July 1, 2016 have reduced coverage if annual fees from 2014+ are unpaid.',
      '328 IAC 1; Indiana Code 13-23-9',
      { notes: 'Fee payment status affects cleanup reimbursement eligibility.' }),
  ],

  // ── LOUISIANA (DEQ) ───────────────────────────────────────────────────
  // Louisiana Department of Environmental Quality, UST Division
  // Primary Regulation: LAC 33:XI
  LA: [
    rule('STATE_LA_ANNUAL_TANK_REGISTRATION', 'FINANCIAL', 12,
      'Annual tank registration fee of $60 per tank for all registered UST systems. 5% late payment fee if not received within 15 days of due date. Fees due regardless of tank status.',
      'LAC 33:XI.301 (Chapter 3)',
      { notes: 'Fiscal year July 1 - June 30. Applies even to temporarily closed tanks.' }),
    rule('STATE_LA_FACILITY_INSPECTION', 'INSPECTION', 36,
      'LDEQ inspects all UST facilities at least once every three years.',
      'LAC 33:XI (inspection provisions)',
      { notes: 'State-mandated triennial inspections.' }),
    rule('STATE_LA_SECONDARY_CONTAINMENT', 'DOCUMENTATION', null,
      'All UST systems installed after December 20, 2008 must have secondary containment (double-walled/jacketed) with monthly interstitial monitoring.',
      'LAC 33:XI',
      { notes: 'Earlier mandate than the 2015 federal secondary containment requirement.' }),
    rule('STATE_LA_MOTOR_FUELS_TRUST_FUND', 'FINANCIAL', 12,
      'Motor Fuels Underground Storage Tank Trust Fund: fee of $72 per 9,000-gallon withdrawal. $0 deductible for in-compliance facilities; $10,000 deductible for out-of-compliance.',
      'Louisiana Revised Statutes 30:2195',
      { notes: 'Modified by Act 167 of the 2024 Legislative Session.' }),
    rule('STATE_LA_PRE_CLOSURE_ASSESSMENT', 'CLOSURE', null,
      'Owners must measure for the presence of a release where contamination is most likely before permanent closure or change-in-service.',
      'LAC 33:XI (closure chapter)',
      { notes: 'State-specific pre-closure assessment requirement.' }),
  ],

  // ── TENNESSEE (TDEC) ─────────────────────────────────────────────────
  // Tennessee Department of Environment and Conservation, Division of USTs
  // Primary Regulation: Tenn. Comp. R. & Regs. 0400-18-01
  TN: [
    rule('STATE_TN_ANNUAL_COMPARTMENT_FEE', 'FINANCIAL', 12,
      'Annual fee of $125 per compartment (not per tank). Regional billing: July 1 (East TN), October 1 (Middle TN), January 1 (West TN). No proration allowed.',
      'Tennessee Code 68-215-109',
      { notes: 'Fee suspension for 5 years began July 1, 2021. Check current status.' }),
    rule('STATE_TN_PRE_INSTALLATION_NOTIFICATION', 'DOCUMENTATION', null,
      'Tank owners must submit a pre-installation notification form at least 15 days prior to installation of any tank/new UST system.',
      'Rule 0400-18-01-.03',
      { notes: '15-day advance notice is state-specific.' }),
    rule('STATE_TN_POST_INSTALLATION_CERTIFICATION', 'CERTIFICATION', null,
      'Installation must be certified within 15 days following completion.',
      'Rule 0400-18-01-.02',
      { notes: 'State-specific 15-day certification deadline.' }),
    rule('STATE_TN_INITIAL_TIGHTNESS_TESTING', 'TESTING', null,
      'Line tightness test and tank tightness test required upon completion of installation, prior to dispensing fuel.',
      'Rule 0400-18-01-.02',
      { notes: 'Both tank and piping tested before any fuel dispensed.' }),
    rule('STATE_TN_STATUS_CHANGE_REPORTING', 'REPORTING', null,
      'Any change in tank status must be reported within 30 days (ownership changes, upgrades, replacements, address changes, closures).',
      'Rule 0400-18-01-.03',
      { notes: 'Applies to all petroleum UST facilities.' }),
  ],

  // ── ALABAMA (ADEM) ────────────────────────────────────────────────────
  // Alabama Department of Environmental Management
  // Primary Regulation: ADEM Admin. Code 335-6-15, 335-6-16
  // State program approved by EPA: Jan 24, 1997 (effective Mar 25, 1997)
  // Revised UST regulations finalized Dec 8, 2017
  AL: [
    rule('STATE_AL_ANNUAL_REGULATION_FEE', 'FINANCIAL', 12,
      'Annual UST regulation fee per tank per year (amount set by ADEM Director annually, historically $15-$30). Must be paid annually to maintain Tank Trust Fund eligibility.',
      'ADEM Admin. Code 335-6-16-.07',
      { notes: 'Amount varies year to year. Nonpayment jeopardizes Trust Fund eligibility.' }),
    rule('STATE_AL_TRUST_FUND_CHARGE', 'FINANCIAL', 12,
      'Per-gallon surcharge on petroleum delivered to USTs funds the Alabama Underground and Aboveground Storage Tank Trust Fund. Rate set at $0.01/gallon (rate can be adjusted by ADEM).',
      'ADEM Admin. Code 335-6-16-.07',
      { notes: 'Trust Fund Charge set at $0.01/gallon. Trust Fund Fee per tank currently set at $0.00.' }),
    rule('STATE_AL_TRUST_FUND_ELIGIBILITY', 'FINANCIAL', 12,
      'To be eligible for Tank Trust Fund reimbursement: (1) annual payment of Trust Fund and UST Regulatory Fees for each UST until permanent closure, (2) compliance with all 335-6-15 technical standards, (3) financial responsibility of $5,000/occurrence ($25,000 aggregate) via insurance, guarantee, surety bond, letter of credit, or self-insurance ($25,000 tangible net worth).',
      'ADEM Admin. Code 335-6-16-.04',
      { notes: 'Trust Fund provides corrective action cost reimbursement. Lower FA threshold than federal $1M requirement because Trust Fund covers the gap.' }),
    rule('STATE_AL_OPERATOR_TRAINING', 'TRAINING', 36,
      'Class A, B, and C operator training required. Owners must designate all three classes for each facility. Training must be completed through an ADEM-approved training provider. Retraining every 3 years or within 30 days of failing a compliance inspection.',
      'ADEM Admin. Code 335-6-15-.46',
      { notes: 'ADEM maintains list of approved training providers. Matches federal Subpart J cycle.' }),
    rule('STATE_AL_INSTALLER_CERTIFICATION', 'CERTIFICATION', null,
      'Individuals who supervise installation, closure, and repair of UST systems must hold ADEM certification per 335-6-15-.47. ALPEC UST-ICR 16-unit education program is an approved pathway. Certification must be obtained before performing work.',
      'ADEM Admin. Code 335-6-15-.47',
      { notes: 'State-specific certification for installation/closure/repair supervisors. Goes beyond federal which has no installer certification mandate.' }),
    rule('STATE_AL_OVERFILL_INSPECTION_DEADLINE', 'INSPECTION', 36,
      'Overfill prevention equipment in use before Dec 8, 2017 must have been inspected by Dec 8, 2020 and at least every 3 years thereafter. Equipment installed on or after Dec 8, 2017 must be inspected upon installation and every 3 years thereafter.',
      'ADEM Admin. Code 335-6-15-.09',
      { equipmentType: 'OVERFILL_PREVENTION', notes: 'State-specific deadline tied to Dec 8, 2017 regulation revision date (vs. federal Oct 13, 2018 compliance date).' }),
    rule('STATE_AL_CLOSURE_30DAY_NOTICE', 'CLOSURE', null,
      'At least 30 days prior to permanently closing a UST, the owner/operator must notify ADEM of the intent to close. Closure must follow ADEM-approved procedures including site assessment and environmental sampling.',
      'ADEM Admin. Code 335-6-15-.33; 335-6-15-.34',
      { notes: 'State requires notification to ADEM specifically. Temporary closure provisions in 335-6-15-.33.' }),
    rule('STATE_AL_WALKTHROUGH_30DAY', 'INSPECTION', 1,
      'Monthly (30-day) walkthrough inspections of spill prevention equipment, release detection equipment, and containment sumps. Records must be maintained. Frequency aligns with federal but state requires specific ADEM-format inspection forms.',
      'ADEM Admin. Code 335-6-15-.09',
      { equipmentType: 'SPILL_PREVENTION', notes: 'State compliance deadline was Dec 8, 2017 revision effective date. ADEM provides state-specific walkthrough forms.' }),
  ],

  // ── ALASKA (ADEC) ────────────────────────────────────────────────────
  // Alaska Department of Environmental Conservation, Division of Spill Prevention and Response
  // Primary Regulation: 18 AAC 78; AS 46.03.365-46.03.450
  AK: [
    rule('STATE_AK_TIERED_ANNUAL_REGISTRATION', 'FINANCIAL', 12,
      'Tiered annual registration fees incentivize upgrades: $50/tank (upgraded); $150/tank (<1,000 gal non-upgraded); $300/tank (1,000-5,000 gal non-upgraded); $500/tank (>5,000 gal non-upgraded). Expires Dec 31 each year.',
      '18 AAC 78; AS 46.03.385(a)',
      { notes: 'Must renew at least 30 days before Dec 31 expiration. Fee structure unique to Alaska — penalizes non-upgraded systems. No fee required for temporarily out-of-service or permanently closed tanks.' }),
    rule('STATE_AK_THIRD_PARTY_INSPECTION', 'INSPECTION', 36,
      'Mandatory third-party inspection every 3 years by an ADEC-certified UST Inspector covering both tanks and piping. Inspection covers all currently in-use and temporarily out-of-use tank systems. Owner/operator pays for the inspector.',
      '18 AAC 78.090',
      { notes: 'Exceeds federal requirements — federal rule has no mandatory third-party inspection. Alaska requires state-certified inspectors specifically.' }),
    rule('STATE_AK_DELIVERY_PROHIBITION_TAGS', 'CERTIFICATION', 12,
      'All UST systems must display a permanently affixed current tag, decal, or notice after passing inspection. ADEC posts non-compliant USTs to the "Tanks Without Tags" website. Fuel distributors may not deliver to tanks without valid tags.',
      '18 AAC 78',
      { notes: 'Unique Alaska system — ADEC publishes online list of non-compliant tanks. Distributors check before delivery. Tag/decal issued by DEC after passing third-party inspection.' }),
    rule('STATE_AK_CERTIFIED_WORKER_CATEGORIES', 'CERTIFICATION', null,
      'All UST work must be performed by ADEC-certified workers in one of four categories: (1) Installation & Reconfiguration, (2) Decommissioning (Closure), (3) Tank Tightness Testing, (4) Cathodic Protection Testing. Certified person must be physically on-site during work and cannot sign off on work not under their direct control and personal supervision.',
      '18 AAC 78.700-78.740',
      { notes: 'Four distinct certification categories — more granular than most states. Direct personal supervision requirement is strictly enforced.' }),
    rule('STATE_AK_OPERATOR_TRAINING', 'TRAINING', 36,
      'Class A, B, and C operator training required. Must use ADEC-approved training programs. Retraining every 3 years. Training records must be available at facility during inspections.',
      '18 AAC 78; AS 46.03.365',
      { notes: 'Alaska follows federal Subpart J framework but requires ADEC-approved programs specifically.' }),
    rule('STATE_AK_CONTAINMENT_SUMP_TESTING', 'TESTING', 36,
      'Spill buckets and any containment sump used for leak detection must be integrity tested every 3 years. Piping installed after April 2016 must have sump integrity tested for liquid tightness every 3 years.',
      '18 AAC 78',
      { equipmentType: 'CONTAINMENT_SUMP', notes: 'Matches federal triennial testing but Alaska enforces via third-party inspection program.' }),
    rule('STATE_AK_LINE_TIGHTNESS_TESTING', 'TESTING', 12,
      'Pressurized single-wall pipe (including pipe in a chase) must have annual line-tightness test. Automatic line leak detectors (ALLDs) must also be tested annually.',
      '18 AAC 78',
      { equipmentType: 'LINE_LEAK_DETECTOR', notes: 'Single-wall pipe in chase still requires annual testing — some states exempt piping in secondary containment chases.' }),
    rule('STATE_AK_CLOSURE_NOTIFICATION', 'CLOSURE', null,
      'Temporary closure requires submittal of Notice of Tank Taken Out-of-Service (ADEC Form 18-0502) and Empty Tank Affidavit (ADEC Form 18-0503). Permanent closure requires 30-day advance notification. All closure work must be done by ADEC-certified Decommissioning worker.',
      '18 AAC 78.500-78.560',
      { notes: 'State-specific forms required. Certified Decommissioning worker category is unique to Alaska.' }),
  ],

  // ── ARIZONA (ADEQ) ───────────────────────────────────────────────────
  // Arizona Department of Environmental Quality
  // Primary Regulation: A.A.C. R18-12; A.R.S. 49-1001 et seq.
  AZ: [
    rule('STATE_AZ_ANNUAL_TANK_FEE', 'FINANCIAL', 12,
      'Annual tank fee of $100 per tank per year, due March 15 to ADEQ. Funds the UST Assurance Account and UST Revolving Fund.',
      'A.R.S. 49-1015; A.R.S. 49-1020',
      { notes: 'Fee must be paid before receiving fuel delivery upon facility sale/transfer.' }),
    rule('STATE_AZ_OPERATOR_TRAINING', 'TRAINING', 36,
      'Arizona-specific Class A/B/C operator training required every 3 years. ADEQ provides free online self-paced training with exam and certificate for facilities regulated by ADEQ. Training records must be available during facility inspections.',
      'A.A.C. R18-12-261.01',
      { notes: 'Free state-provided training is unique to Arizona. Most states require third-party paid training.' }),
    rule('STATE_AZ_ASSURANCE_ACCOUNT', 'FINANCIAL', 12,
      'UST Assurance Account provides state-run financial assurance for corrective action. Funded by UST tax revenues when fund balance exceeds $5.6M threshold. Reimburses ADEQ for corrective action costs and reasonable administration costs. Eligibility requires compliance with all UST rules.',
      'A.R.S. 49-1015; A.A.C. R18-12, Article 6 (R18-12-601)',
      { notes: '$5.6M balance threshold triggers deposits. Account covers ADEQ-led cleanup costs.' }),
    rule('STATE_AZ_SERVICE_PROVIDER_CERTIFICATION', 'CERTIFICATION', null,
      'ADEQ-certified UST Service Provider required for: installation and retrofit, cathodic protection testing, interior lining, tightness testing, and decommissioning. Applicants must submit UST Service Provider Application with proof of qualification per certification category.',
      'A.A.C. R18-12-261',
      { notes: 'Five distinct certification categories. More granular than many states. Established to ensure work quality on UST systems.' }),
    rule('STATE_AZ_PLAN_REVIEW_CLOSURE', 'CLOSURE', null,
      'All UST installation, modification, and closure requires ADEQ plan review at least 30 days before work begins. Plan review ensures regulatory and compatibility requirements are met. Must use ADEQ-certified service provider.',
      'A.A.C. R18-12-263',
      { notes: 'State requires pre-approval plan review — goes beyond federal 30-day notification by requiring actual review and approval.' }),
    rule('STATE_AZ_DELIVERY_PROHIBITION_TRANSFER', 'CERTIFICATION', null,
      'When a facility is sold, the new owner must register USTs and pay required tank fees PRIOR to receiving delivery of regulated substance, but no more than 30 days from purchase date.',
      'A.R.S. 49-1015',
      { notes: 'Ownership transfer triggers delivery prohibition until registration and fees are current. Unique timing requirement.' }),
    rule('STATE_AZ_SPILL_CONTAINMENT_TESTING', 'TESTING', 36,
      'Initial tightness testing of spill prevention devices (spill buckets) and secondary containment sumps used for interstitial monitoring. Testing every 3 years thereafter.',
      'A.A.C. R18-12-224',
      { equipmentType: 'SPILL_PREVENTION', notes: 'Matches federal triennial cycle. Initial testing deadline was March 1, 2020.' }),
    rule('STATE_AZ_FINANCIAL_RESPONSIBILITY_ANNUAL', 'FINANCIAL', 12,
      'Annual submission of UST Financial Responsibility form and documentation of financial responsibility coverage to ADEQ required. Options include: insurance, surety bond, letter of credit, trust fund, guarantee, state Assurance Account, or self-insurance.',
      'A.A.C. R18-12, Article 5',
      { notes: 'Annual FR form submission is a state-specific administrative requirement beyond federal.' }),
  ],

  // ── ARKANSAS (DEQ) ───────────────────────────────────────────────────
  // Arkansas Department of Energy and Environment, Division of Environmental Quality
  // Primary Regulation: APC&EC Regulation No. 12 (Storage Tanks)
  // Statutory authority: Ark. Code Ann. 8-7-801 et seq.
  AR: [
    rule('STATE_AR_ANNUAL_REGISTRATION_FEE', 'FINANCIAL', 12,
      'Annual storage tank registration fee of $75 per tank. Billed in May, due June 30. $5/tank late fee if unpaid within 30 days. Registration must be current before any form submissions are processed.',
      'Reg. 12.203',
      { notes: '$75/tank is the current rate. Must be paid via DEQ online portal. Nonpayment triggers delivery prohibition.' }),
    rule('STATE_AR_OPERATOR_CERTIFICATION_EXAM', 'CERTIFICATION', null,
      'State-specific operator certification exam required for Class A and B operators. Exam fee: $25 for single exam (Class A or B); $50 for both exams. Application and nonrefundable fee must be submitted at least one week prior to scheduled test date. State exam is in addition to training.',
      'Reg. 12, Chapter 8 (Reg. 12.801-12.804)',
      { notes: 'Unique to Arkansas — most states require only training, not a separate state-administered exam. DEQ publishes exam schedule on website.' }),
    rule('STATE_AR_CONTRACTOR_LICENSING', 'CERTIFICATION', 24,
      'All UST installation, closure, and corrective action contractors and testing companies must be licensed by DEQ. Initial licensing fee: $300 (nonrefundable). Renewal every 2 years at $300. Licensed contractor list maintained by DEQ.',
      'Reg. 12, Chapter 8 (Reg. 12.805-12.808)',
      { notes: 'Biennial renewal cycle. DEQ publishes list of licensed contractors. Testing companies also require $300 biennial license.' }),
    rule('STATE_AR_DELIVERY_PROHIBITION', 'CERTIFICATION', 12,
      'Tanks non-compliant with registration or fee requirements are subject to delivery prohibition (red tag). Non-compliant tanks may not receive fuel deliveries until registration is current and all fees are paid.',
      'Reg. 12.204',
      { notes: 'Tied to annual registration compliance. DEQ enforces via compliance inspections.' }),
    rule('STATE_AR_PETROLEUM_STORAGE_TANK_TRUST_FUND', 'FINANCIAL', 12,
      'Arkansas Petroleum Storage Tank Trust Fund (PSTTF) provides corrective action cost reimbursement. Eligibility: (1) owned/operated a regulated petroleum tank, (2) registered and paid all tank fees, (3) gave DEQ timely notice of release, (4) cooperated fully with DEQ in corrective action. Costs must be reasonable, allowable, and necessary per Reg. 12.311-12.313.',
      'Reg. 12, Chapter 3 (Reg. 12.301-12.315); Ark. Code Ann. 8-7-905',
      { notes: 'PSTTF Advisory Committee oversees fund. Three-pronged cost test (reasonable/allowable/necessary) is state-specific.' }),
    rule('STATE_AR_OPERATOR_TRAINING_SCHEDULE', 'TRAINING', 36,
      'Class A and B operators must complete DEQ-approved training and pass state certification exam. Class C operators must complete training before assuming duties. Retraining every 3 years. DEQ publishes training and exam schedule.',
      'Reg. 12, Chapter 8 (Reg. 12.801-12.804)',
      { notes: 'Arkansas requires both approved training AND state exam — dual requirement exceeds most states.' }),
    rule('STATE_AR_COMPLIANCE_INSPECTION', 'INSPECTION', 36,
      'DEQ conducts compliance inspections of UST facilities. Inspection frequency is approximately every 3 years per EPA grant work plan. Inspections verify registration, operator training, release detection, spill/overfill equipment, corrosion protection, and financial responsibility.',
      'Reg. 12.501',
      { notes: 'DEQ inspection program funded in part by EPA LUST Trust Fund grants. Failing inspection triggers 30-day retraining requirement.' }),
    rule('STATE_AR_ONLINE_PORTAL_TRACKING', 'DOCUMENTATION', 12,
      'DEQ provides online portal for RST owners, operators, and contractors to submit required forms, track upcoming testing requirements, and make annual registration payments. Portal use is strongly encouraged for compliance tracking.',
      'Reg. 12',
      { notes: 'State-provided compliance tracking tool is a unique administrative feature. Accessible at DEQ website.' }),
  ],

  // ── COLORADO (CDLE/OPS) ──────────────────────────────────────────────
  // Colorado Department of Labor and Employment, Division of Oil and Public Safety
  // Primary Regulation: 7 CCR 1101-14 (revised effective Jan 1, 2025)
  // Statutory authority: C.R.S. 8-20.5-101 et seq.
  CO: [
    rule('STATE_CO_ANNUAL_REGISTRATION_FEE', 'FINANCIAL', 12,
      'Annual tank registration fee of $35 per tank per year. Must maintain current registration to avoid delivery prohibition.',
      '7 CCR 1101-14-2-2; C.R.S. 8-20.5-103',
      { notes: 'Relatively low per-tank fee compared to other states.' }),
    rule('STATE_CO_INSTALLATION_PLAN_REVIEW', 'CERTIFICATION', null,
      'Installation plan review fee of $150 per tank for new UST installations. Site plan review and installation inspection required before system is placed into service.',
      '7 CCR 1101-14-2-2',
      { notes: 'One-time fee per installation. Plan review must be completed before construction begins.' }),
    rule('STATE_CO_PETROLEUM_STORAGE_TANK_FUND', 'FINANCIAL', 12,
      'Petroleum Storage Tank Fund (PSTF) provides corrective action reimbursement. Owner/operator deductible: $10,000 per release. Max reimbursement: $2,000,000 per release occurrence. Aggregate cap: $3,000,000 per fiscal year per applicant for multiple occurrences. Non-responsible parties (property owners, orphaned tank owners, lenders) have no deductible.',
      'C.R.S. 8-20.5-103; 7 CCR 1101-14, Article 7',
      { notes: 'Two eligibility categories: Responsible party ($10K deductible) and Non-responsible party (no deductible). PSTC approves reimbursement rates.' }),
    rule('STATE_CO_PSTF_ELIGIBILITY', 'FINANCIAL', 12,
      'PSTF eligibility for tank owners/operators requires: (1) substantial compliance with CO petroleum storage tank regulations, (2) payment of Environmental Response Surcharge (ERS), (3) not in default on ERS obligations, (4) demonstrated financial responsibility of $10,000 for corrective action and $25,000 for third-party compensation.',
      'C.R.S. 8-20.5-103(5); 7 CCR 1101-14-7-1',
      { notes: 'ERS surcharge amount varies by fund balance. Lower FA threshold ($10K/$25K) than federal $1M because PSTF covers the gap.' }),
    rule('STATE_CO_DELIVERY_PROHIBITION_RED_TAG', 'CERTIFICATION', null,
      'OPS attaches red tag to fill pipes of ineligible tanks. Triggers: (1) spill prevention equipment missing/non-functional, (2) overfill protection missing/non-functional, (3) leak detection missing/non-functional, (4) corrosion protection missing/non-functional, (5) registration not current, (6) significant violation posing imminent threat. OPS may also require product removal from tank.',
      '7 CCR 1101-14-6-2',
      { notes: 'Red tag is physically attached to fill pipes — visible to delivery drivers. Both owners/operators AND product deliverers are responsible for compliance. Delivering to red-tagged tank is a violation.' }),
    rule('STATE_CO_OPERATOR_TRAINING', 'TRAINING', 36,
      'Class A, B, and C operator training required per 7 CCR 1101-14 Article 2. Certified Class A or B operators may train their company Class C operators. Class C training certificates must be kept at facility. Retraining every 3 years.',
      '7 CCR 1101-14-2-3',
      { notes: 'Effective since Jan 1, 2010. Class A/B can self-train Class C — reduces cost for multi-site operators.' }),
    rule('STATE_CO_CLOSURE_10DAY_NOTICE', 'CLOSURE', null,
      'At least 10 calendar days before beginning permanent closure or change-in-service, owner/operator must notify the OPS Director. Shorter notice period than federal 30-day requirement.',
      '7 CCR 1101-14-2-4',
      { notes: 'Colorado requires only 10-day advance notice vs. federal 30-day requirement. Less lead time but still mandatory.' }),
    rule('STATE_CO_ENVIRONMENTAL_RESPONSE_SURCHARGE', 'FINANCIAL', 12,
      'Environmental Response Surcharge (ERS) imposed on all petroleum fuel products sold in Colorado (except railroad or aircraft fuel). Surcharge rate varies according to PSTF balance. Funds the Petroleum Storage Tank Fund.',
      'C.R.S. 8-20.5-103(1)',
      { notes: 'Variable surcharge rate is unique — adjusts automatically based on fund balance. Not a fixed per-tank fee.' }),
  ],

  // ── CONNECTICUT (DEEP) ───────────────────────────────────────────────
  // Connecticut Department of Energy and Environmental Protection
  // Primary Regulation: RCSA 22a-449(d)-1, 22a-449(d)-101 through 22a-449(d)-113
  // Revised regulations effective May 7, 2025
  CT: [
    rule('STATE_CT_ANNUAL_REGISTRATION_FEE', 'FINANCIAL', 12,
      'Annual registration fee of $100 per tank per year for all USTs in-use or temporarily out of service. One-time installation fee of $100/tank ($50/tank for municipalities).',
      'RCSA 22a-449(d)-1; Conn. Gen. Stat. 22a-449(d)',
      { notes: 'Fee applies to both active and temporarily closed tanks — cannot avoid fee by temporary closure.' }),
    rule('STATE_CT_FIRE_MARSHAL_DUAL_NOTIFICATION', 'REPORTING', null,
      'All owners/former owners of nonresidential USTs must notify BOTH DEEP and the local fire marshal of UST installations, closures, removals, and status changes. Filing the DEEP Notification Form satisfies both state and EPA registration requirements.',
      'RCSA 22a-449(d)-1; RCSA 22a-449(d)-102',
      { notes: 'Dual notification (state + local fire marshal) is unique to Connecticut. Most states require only state agency notification.' }),
    rule('STATE_CT_CLEANUP_FUND_ENDED', 'FINANCIAL', null,
      'UST Petroleum Clean-up Account program ENDED June 23, 2025. All appropriated amounts transferred to general fund. All pending applications deemed cancelled. Facilities must now maintain independent financial assurance mechanisms.',
      'Conn. Gen. Stat. 22a-449c',
      { notes: 'CRITICAL: Fund no longer available. All CT UST owners must have independent FA (insurance, surety, letter of credit, etc.). Transitional deadline was Aug 5, 2025.' }),
    rule('STATE_CT_OPERATOR_TRAINING_BIENNIAL', 'TRAINING', 24,
      'Class A, B, and C operator training required. Retraining/refresher training required at least every 2 YEARS (not 3 years as in federal rule). Class A/B certified via approved exam/training. Class C certified via training provided by certified Class B operator at same facility. Operator info must be submitted to DEEP annually and within 30 days of any change.',
      'RCSA 22a-449(d)-108',
      { notes: 'EXCEEDS FEDERAL: 2-year retraining cycle vs. federal 3-year cycle. Annual operator info submission to DEEP is also stricter than federal.' }),
    rule('STATE_CT_RETRAINING_ON_NONCOMPLIANCE', 'TRAINING', null,
      'If commissioner determines UST system is not in compliance with release prevention/detection, the responsible Class A, B, or C operator must be retrained and recertified within 30 days of the order.',
      'RCSA 22a-449(d)-108',
      { notes: 'Commissioner-ordered retraining within 30 days matches federal trigger but is enforced at state level.' }),
    rule('STATE_CT_TIGHTNESS_TEST_REPORTING', 'REPORTING', null,
      'Within 30 days of completion of any tank tightness test or line tightness test, the owner/operator must notify the commissioner AND the local fire marshal of the test results.',
      'RCSA 22a-449(d)-103',
      { notes: 'Dual reporting of test results (DEEP + fire marshal) is unique to CT. Most states only require reporting to state agency.' }),
    rule('STATE_CT_CLOSURE_30DAY_REMOVAL_NOTICE', 'CLOSURE', null,
      'Notice required 30 days PRIOR to UST removal. If removal occurs before notification, notification must still be submitted no later than 30 days after removal is complete.',
      'RCSA 22a-449(d)-107',
      { notes: 'Both pre-removal and post-removal notification deadlines. Dual notification to DEEP and fire marshal.' }),
    rule('STATE_CT_NEW_INSTALLATION_DOUBLE_WALL', 'DOCUMENTATION', null,
      'Any state or federally regulated UST installed on or after August 5, 2025 must be double-walled and use continuous interstitial monitoring (inert gas, liquid, or vacuum technology). Financial responsibility instruments must be updated by August 5, 2025 to conform with regulation changes.',
      'RCSA 22a-449(d)-102 (2025 amendments)',
      { notes: 'EXCEEDS FEDERAL: Mandatory double-wall + continuous interstitial monitoring for new installations. Federal requires secondary containment but not specifically double-wall with continuous monitoring.' }),
  ],

  // ── DELAWARE (DNREC) ─────────────────────────────────────────────────
  // Delaware Department of Natural Resources and Environmental Control, Tanks Compliance Branch
  // Primary Regulation: 7 DE Admin. Code 1351
  DE: [
    rule('STATE_DE_ANNUAL_REGISTRATION_FEE', 'FINANCIAL', 12,
      'Annual registration fee of $150 per tank (increased from $50 per HB 175, effective June 2025). Due February 1; $30/tank late fee after Feb 1.',
      '7 Del. Code 7418; 7 DE Admin. Code 1351-A-4',
      { notes: 'Recent fee increase. USTs >1,100 gal for heating fuel must also register; >2,000 gal must also pay fees.' }),
    rule('STATE_DE_CERTIFIED_CONTRACTOR', 'CERTIFICATION', null,
      'All UST installation, removal, and repair must be performed by DNREC-certified individuals and companies.',
      '7 DE Admin. Code 1351',
      { notes: 'State certification requirement.' }),
    rule('STATE_DE_RBCA_PROTOCOL', 'DOCUMENTATION', null,
      'Delaware Risk-Based Corrective Action (RBCA) Protocol, Hydrogeologic Investigative Guidance, and Vapor Intrusion Guidance are mandatory standards for releases.',
      '7 DE Admin. Code 1351 (2023 amendments)',
      { notes: 'Incorporated by reference as mandatory standards.' }),
    rule('STATE_DE_HEATING_OIL_REGISTRATION', 'CERTIFICATION', 12,
      'Heating oil USTs >1,100 gallons must be registered with DNREC. Tanks >2,000 gallons must also pay annual fees. Broader scope than federal which exempts heating oil tanks.',
      '7 DE Admin. Code 1351',
      { notes: 'Federal exempts heating oil for on-premises consumption; Delaware regulates larger heating oil USTs.' }),
    rule('STATE_DE_OPERATOR_TRAINING', 'TRAINING', null,
      'Class A, B, and C operator training required per federal Subpart J. Retraining required upon noncompliance finding.',
      '7 DE Admin. Code 1351',
      { notes: 'Delaware follows federal framework for operator training.' }),
  ],

  // ── DISTRICT OF COLUMBIA (DOEE) ──────────────────────────────────────
  // DC Department of Energy and Environment
  // Primary Regulation: DCMR Title 20, Chapters 55-70
  DC: [
    rule('STATE_DC_ANNUAL_REGISTRATION_FEE', 'FINANCIAL', 12,
      'Tiered annual registration: $800/tank (>10,000 gal); $450/tank (<=10,000 gal); $200/tank (heating oil <=10,000 gal); $800/tank (heating oil >10,000 gal). Due January 1.',
      'DCMR 20-5605',
      { notes: 'Among the highest state per-tank fees nationally.' }),
    rule('STATE_DC_INSTALLATION_REVIEW_FEE', 'FINANCIAL', null,
      'Installation/abandonment review fee of $200 per tank for plan review and site inspection.',
      'DCMR 20-5605',
      { notes: 'Per-event fee for installation or abandonment.' }),
    rule('STATE_DC_CERTIFICATE_DISPLAY', 'DOCUMENTATION', 12,
      'Copy of registration certificate must be maintained at the facility at all times.',
      'DCMR 20-56',
      { notes: 'Annual registration certificate display requirement.' }),
    rule('STATE_DC_CHANGE_NOTIFICATION', 'REPORTING', null,
      'All owners/operators must register tanks annually and report changes within 30 days.',
      'DCMR 20-56',
      { notes: 'New/existing active tanks registered annually.' }),
    rule('STATE_DC_OPERATOR_TRAINING', 'TRAINING', null,
      'Class A, B, and C operators required. Training must be completed through DOEE-approved programs.',
      'DCMR Title 20, Chapters 55-70',
      { notes: 'DC follows federal Subpart J framework.' }),
  ],

  // ── HAWAII (DOH) ─────────────────────────────────────────────────────
  // Hawaii Department of Health, Solid and Hazardous Waste Branch
  // Primary Regulation: HAR 11-280.1
  HI: [
    rule('STATE_HI_OPERATING_PERMIT', 'CERTIFICATION', 60,
      'Operating permit fee of $150 per tank. Permit valid for 5 years, then must renew.',
      'HAR 11-280.1-300 through 11-280.1-335',
      { notes: '5-year permit cycle.' }),
    rule('STATE_HI_SECONDARY_CONTAINMENT_UPGRADE', 'CERTIFICATION', null,
      'All single-walled tanks and piping must be upgraded to secondary containment with interstitial monitoring by July 15, 2028. Field-constructed tanks/airport hydrant systems by July 15, 2038.',
      'HAR 11-280.1-21',
      { notes: 'CRITICAL DEADLINE: State-mandated upgrade deadline approaching.' }),
    rule('STATE_HI_INTERSTITIAL_MONITORING', 'INSPECTION', null,
      'All UST systems must use interstitial monitoring as the release detection method (monthly).',
      'HAR 11-280.1',
      { frequencyDays: 30, notes: 'State mandates interstitial monitoring specifically — no alternatives allowed.' }),
    rule('STATE_HI_SHORELINE_PROHIBITION', 'CERTIFICATION', null,
      'No UST may operate within 100 yards of the shoreline effective January 1, 2045. No permits will be renewed for shoreline USTs after that date.',
      'HAR 11-280.1',
      { notes: 'Future prohibition — plan for compliance. Unique to Hawaii.' }),
    rule('STATE_HI_COMPLIANCE_INSPECTION', 'INSPECTION', 36,
      'DOH conducts compliance inspections of all UST facilities at least once every 3 years.',
      'HAR 11-280.1',
      { notes: 'State-mandated triennial inspection cycle.' }),
  ],

  // ── IDAHO (DEQ) ──────────────────────────────────────────────────────
  // Idaho Department of Environmental Quality
  // Primary Regulation: IDAPA 58.01.07; Idaho Code 39-8801 et seq.
  ID: [
    rule('STATE_ID_ANNUAL_REGISTRATION_FEE', 'FINANCIAL', 12,
      'Annual registration fee of up to $100 per tank or tank compartment.',
      'IDAPA 58.01.07.601; Idaho Code 39-8802(d)',
      { notes: 'Per-tank or per-compartment fee.' }),
    rule('STATE_ID_PETROLEUM_STORAGE_TANK_FUND', 'FINANCIAL', 12,
      'Idaho Petroleum Storage Tank Fund (PSTF) provides financial responsibility coverage, funded by petroleum transfer fee.',
      'Idaho Code 41-4901 et seq.',
      { notes: 'State insurance fund for financial responsibility.' }),
    rule('STATE_ID_OPERATOR_DESIGNATION_NOTIFICATION', 'DOCUMENTATION', null,
      'Owner must designate Class A and B operators and notify DEQ in writing within 30 days of designation.',
      'IDAPA 58.01.07',
      { notes: '30-day notification requirement.' }),
    rule('STATE_ID_REGISTRATION_30_DAYS', 'CERTIFICATION', null,
      'USTs must be registered with DEQ within 30 days of bringing the tank into use.',
      'IDAPA 58.01.07',
      { notes: 'State-specific registration timeline.' }),
    rule('STATE_ID_COMPLIANCE_INSPECTION', 'INSPECTION', 36,
      'DEQ conducts compliance inspections at least once every 3 years per EPA program requirements.',
      'IDAPA 58.01.07',
      { notes: 'Triennial inspection cycle.' }),
  ],

  // ── IOWA (DNR) ───────────────────────────────────────────────────────
  // Iowa Department of Natural Resources
  // Primary Regulation: IAC 567, Chapters 135-136
  IA: [
    rule('STATE_IA_ANNUAL_TANK_MANAGEMENT_FEE', 'FINANCIAL', 12,
      'Annual tank management fee of $65 per compartment per year. $250/compartment late fee after March 1. Due January 15; renewal by February 28.',
      'IAC 567-135.3(3)',
      { notes: 'Steep late fee ($250/compartment!). Tanks >1,100 gal receive annual tank tag upon fee payment.' }),
    rule('STATE_IA_TANK_TAG_DISPLAY', 'DOCUMENTATION', 12,
      'Annual tank management tag must be displayed on tanks over 1,100 gallons upon fee payment. Tag serves as visual proof of compliance.',
      'IAC 567-135.3(3)',
      { notes: 'Fuel distributors may check for tag before delivery.' }),
    rule('STATE_IA_INITIAL_REGISTRATION_FEE', 'FINANCIAL', null,
      'One-time initial registration fee of $10 per tank at time of registration.',
      'IAC 567-135.3',
      { notes: 'Separate from annual tank management fee.' }),
    rule('STATE_IA_STORAGE_TANK_MANAGEMENT_ACCOUNT', 'FINANCIAL', null,
      'State fund providing up to $15,000 per facility for permanent UST closure costs. Funded by annual fees.',
      'IAC 567-136; Iowa Code 455G',
      { notes: 'Closure cost assistance fund. Must be in compliance to be eligible.' }),
    rule('STATE_IA_FINANCIAL_RESPONSIBILITY', 'FINANCIAL', 12,
      'All regulated USTs must maintain insurance or approved financial assurance mechanism. DNR verifies during compliance inspections.',
      'IAC 567-136',
      { notes: 'Iowa follows federal FA framework with state fund as option.' }),
  ],

  // ── KANSAS (KDHE) ────────────────────────────────────────────────────
  // Kansas Department of Health and Environment, Bureau of Environmental Remediation
  // Primary Regulation: KAR 28-44; K.S.A. 65-34,100 et seq.
  KS: [
    rule('STATE_KS_REGISTRATION_FEE', 'FINANCIAL', null,
      'One-time registration fee of $20 per tank (nonrefundable), submitted with notification form.',
      'KAR 28-44-17',
      { notes: 'Separate from annual operating permit fee.' }),
    rule('STATE_KS_ANNUAL_OPERATING_PERMIT', 'FINANCIAL', 12,
      'Annual operating permit fee of $25 per tank per year, due before April 30.',
      'KAR 28-44-17',
      { notes: 'Low annual fee compared to most states.' }),
    rule('STATE_KS_STORAGE_TANK_TRUST_FUND', 'FINANCIAL', 12,
      'State Storage Tank Trust Fund for corrective action reimbursement administered by KDHE.',
      'K.S.A. 65-34,113',
      { notes: 'State cleanup fund.' }),
    rule('STATE_KS_UST_REDEVELOPMENT_FUND', 'FINANCIAL', null,
      'UST Property Redevelopment Fund reimburses 90% of abandoned UST removal costs, up to $25,000 per facility.',
      'K.S.A. 65-34,187 (SB 406, 2012)',
      { notes: 'Unique state assistance for abandoned tank removal — rare among states.' }),
    rule('STATE_KS_OPERATOR_TRAINING', 'TRAINING', null,
      'Class A, B, and C operator training required per federal Subpart J. Retraining upon noncompliance.',
      'KAR 28-44',
      { notes: 'Kansas follows federal operator training framework.' }),
  ],

  // ── KENTUCKY (DEP) ───────────────────────────────────────────────────
  // Kentucky Energy and Environment Cabinet, DEP, Division of Waste Management, UST Branch
  // Primary Regulation: 401 KAR Chapter 42; KRS 224.60
  KY: [
    rule('STATE_KY_ANNUAL_REGISTRATION_FEE', 'FINANCIAL', 12,
      'Annual registration fee of $30 per tank. Invoiced by the cabinet; payment due within 30 days.',
      '401 KAR 42:020',
      { notes: 'Due July 1 each year.' }),
    rule('STATE_KY_ANNUAL_OPERATOR_RETRAINING', 'TRAINING', 12,
      'Designated Compliance Managers (Class A/B equivalent) and all facility employees must repeat training every 12 months.',
      '401 KAR 42:020, Section 16',
      { notes: 'MOST STRINGENT in the nation — annual retraining far exceeds federal standard (no mandated federal cycle).' }),
    rule('STATE_KY_DOUBLE_WALL_MANDATE', 'CERTIFICATION', null,
      'All USTs installed on or after April 1, 2012 must be double-walled with continuous electronic interstitial monitoring.',
      '401 KAR 42:020',
      { notes: 'Exceeds federal which allows single-wall with other release detection.' }),
    rule('STATE_KY_PSTEAF', 'FINANCIAL', 12,
      'Petroleum Storage Tank Environmental Assurance Fund (PSTEAF) financed by petroleum environmental assurance fees. Provides financial responsibility and cleanup funding.',
      'KRS 224.60-130',
      { notes: 'State cleanup fund and financial responsibility mechanism.' }),
    rule('STATE_KY_SOTRA', 'FINANCIAL', null,
      'Small Owners Tank Removal Account (SOTRA) reimburses small owners (average income under $100K over 5 years) for UST closure costs.',
      '401 KAR 42:330; KRS 224.60-130(1)(j)',
      { notes: 'Unique state assistance program for small operators not found in federal rules or most other states.' }),
  ],

  // ── MAINE (DEP) ──────────────────────────────────────────────────────
  // Maine Department of Environmental Protection, Bureau of Remediation and Waste Management
  // Primary Regulation: 06-096 CMR Chapter 691; 38 MRSA Sections 541-570
  ME: [
    rule('STATE_ME_DOUBLE_WALL_REQUIREMENT', 'CERTIFICATION', null,
      'All new or replacement USTs must be double-walled with continuous electronic monitoring.',
      '06-096 CMR 691',
      { notes: 'More stringent than federal which allows single-wall with alternative monitoring.' }),
    rule('STATE_ME_OPERATOR_TRAINING', 'TRAINING', null,
      'Class A/B operators must be trained via TankSmart program within 30 days of assuming duties. Retrained within 30 days if leak detection or overfill prevention methods change.',
      '06-096 CMR 693',
      { notes: 'Retraining triggered by system changes, not just a fixed schedule.' }),
    rule('STATE_ME_CLEANUP_FUND', 'FINANCIAL', 12,
      'Ground and Surface Waters Clean-up and Response Fund financed by per-barrel fees on petroleum products ($0.22/barrel on refined products).',
      '38 MRSA Section 551',
      { notes: 'State fund for investigation, mitigation, and cleanup of oil discharges from UST/AST systems.' }),
    rule('STATE_ME_THIRD_PARTY_INSPECTION', 'INSPECTION', 12,
      'Annual walk-through inspections required. Independent non-employee inspection required every 3 years at facilities where employees are certified inspectors.',
      '06-096 CMR 691',
      { notes: 'Annual inspections beyond federal 3-year cycle.' }),
    rule('STATE_ME_CLOSURE_ASSESSMENT', 'CLOSURE', null,
      'Environmental site assessment required at time of closure. Closure must be performed by DEP-certified individuals.',
      '06-096 CMR 691',
      { notes: 'State requires certified closers.' }),
  ],

  // ── MARYLAND (MDE) ───────────────────────────────────────────────────
  // Maryland Department of the Environment, Oil Control Program
  // Primary Regulation: COMAR 26.10
  MD: [
    rule('STATE_MD_ADVANCE_NOTIFICATION', 'DOCUMENTATION', null,
      '5 working days advance written notification required before UST installation.',
      'COMAR 26.10.02',
      { notes: 'Federal only requires 30-day notification of existence. MD requires shorter but pre-installation notice.' }),
    rule('STATE_MD_MONTHLY_INTERSTITIAL_MONITORING', 'INSPECTION', null,
      'Monthly interstitial monitoring required for all new/replacement USTs installed after January 12, 2009.',
      'COMAR 26.10',
      { frequencyDays: 30, notes: 'Federal allows multiple methods; Maryland mandates interstitial monitoring specifically.' }),
    rule('STATE_MD_OVERFILL_TESTING', 'TESTING', 36,
      'Overfill prevention equipment testing every 3 years by MDE-certified tester.',
      'COMAR 26.10',
      { equipmentType: 'overfill_prevention', notes: 'State-certified testers required.' }),
    rule('STATE_MD_CLEANUP_FUND', 'FINANCIAL', 12,
      'Oil Contaminated Site Environmental Cleanup Fund financed by per-barrel oil license fee at first point of transfer in state.',
      'Environment Article 4-705(c)',
      { notes: 'Reimburses site rehabilitation costs from UST releases.' }),
    rule('STATE_MD_CERTIFIED_TESTER', 'CERTIFICATION', null,
      'UST tightness testers and service providers must be MDE-certified. Certification required for overfill testing, tightness testing, and containment testing.',
      'COMAR 26.10',
      { notes: 'State-certified tester requirement goes beyond federal.' }),
  ],

  // ── MASSACHUSETTS (MassDEP) ──────────────────────────────────────────
  // Massachusetts Department of Environmental Protection
  // Primary Regulation: 310 CMR 80.00
  MA: [
    rule('STATE_MA_THIRD_PARTY_INSPECTION', 'INSPECTION', 36,
      'Mandatory third-party inspections (TPI) by MassDEP-certified inspectors every 3 years.',
      '310 CMR 80.49',
      { notes: 'State-specific certified inspector program.' }),
    rule('STATE_MA_COMPLIANCE_CERTIFICATION', 'CERTIFICATION', 36,
      'Compliance certification submitted by owner/operator midway between TPIs (every 3 years, offset from TPI).',
      '310 CMR 80.00',
      { notes: 'Unique state self-certification requirement not in federal rules.' }),
    rule('STATE_MA_ANNUAL_OPERATIONAL_TESTING', 'TESTING', 12,
      'Annual operational testing of overfill prevention devices and leak detection/line leak detectors.',
      '310 CMR 80.00',
      { equipmentType: 'overfill_prevention', notes: 'More frequent than federal 3-year testing cycle.' }),
    rule('STATE_MA_LINED_TANK_INTERNAL_INSPECTION', 'INSPECTION', 60,
      'Lined single-wall tanks require internal inspection every 5 years. All single-walled steel tanks were required to be closed by August 7, 2017.',
      '310 CMR 80.24(6)(a)-(b)',
      { appliesToMaterial: 'STEEL', notes: 'Aggressive phaseout timeline exceeding federal standards.' }),
    rule('STATE_MA_EQUIPMENT_DATE_TRACKING', 'DOCUMENTATION', null,
      'Equipment installation date tracking required in UST Data Management System for all components.',
      '310 CMR 80.00',
      { notes: 'State-specific data tracking requirement at registration/update.' }),
  ],

  // ── MINNESOTA (MPCA) ─────────────────────────────────────────────────
  // Minnesota Pollution Control Agency
  // Primary Regulation: Minnesota Rules Chapter 7150; Minnesota Statutes Section 116.46
  MN: [
    rule('STATE_MN_PRE_INSTALLATION_NOTIFICATION', 'DOCUMENTATION', null,
      '10-day advance notification required before installing or replacing a UST system or component.',
      'Minn. R. 7150.0090',
      { notes: 'More specific pre-installation notice than federal.' }),
    rule('STATE_MN_CERTIFIED_CONTRACTOR', 'CERTIFICATION', null,
      'MPCA-certified contractors required for all UST installation and service work.',
      'Minn. R. 7150',
      { notes: 'State contractor certification beyond federal requirements.' }),
    rule('STATE_MN_PETROFUND', 'FINANCIAL', 12,
      'Petrofund (Petroleum Tank Release Cleanup Fund) reimburses up to 90% of reasonable cleanup costs, funded by per-gallon petroleum tax.',
      'Minn. Stat. 115C',
      { notes: 'Administered by MN Dept. of Commerce. Generous 90% reimbursement rate.' }),
    rule('STATE_MN_CP_TESTING', 'TESTING', 12,
      'Impressed current CP systems tested annually by qualified service providers. Sacrificial anode systems tested every 3 years.',
      'Minn. R. 7150',
      { appliesToCorrosionProtection: 'IMPRESSED_CURRENT', notes: 'State specifies different frequencies by CP system type.' }),
    rule('STATE_MN_SECONDARY_CONTAINMENT_BROAD', 'CERTIFICATION', null,
      'Secondary containment with interstitial monitoring required for all new/replacement USTs, piping, submersible pumps, AND dispensers (except heating oil).',
      'Minn. R. 7150.0100, 7150.0205',
      { notes: 'Broader scope than federal — includes dispensers and submersible pumps.' }),
  ],

  // ── MISSISSIPPI (MDEQ) ───────────────────────────────────────────────
  // Mississippi DEQ, Groundwater Assessment and Remediation Division
  // Primary Regulation: 11 Miss. Admin. Code Pt. 5, Ch. 2
  MS: [
    rule('STATE_MS_ANNUAL_TANK_FEE', 'FINANCIAL', 12,
      'Annual tank fee of $150 per tank (including temporarily out-of-service tanks). Invoiced last week of May.',
      '11 Miss. Admin. Code Pt. 5',
      { notes: 'Applies even to temporarily closed tanks.' }),
    rule('STATE_MS_BIENNIAL_OPERATOR_RENEWAL', 'CERTIFICATION', 24,
      'UST Compliance Manager and Operations Clerk designations required at every manned facility. Operator certificates must be renewed every 2 years.',
      '11 Miss. Admin. Code Pt. 5',
      { notes: 'More frequent than federal. Unique terminology: "Compliance Manager" and "Operations Clerk".' }),
    rule('STATE_MS_OPERATIONS_CLERK_ON_DUTY', 'CERTIFICATION', null,
      'Operations Clerk must be on duty at all times petroleum fuel is dispensed at manned facilities.',
      '11 Miss. Admin. Code Pt. 5',
      { notes: 'Unique staffing requirement not in federal rules.' }),
    rule('STATE_MS_VIOLATION_RETRAINING', 'TRAINING', null,
      'Mandatory retraining within 6 months if facility found in significant violation.',
      '11 Miss. Admin. Code Pt. 5',
      { notes: 'Specific violation-triggered retraining requirement.' }),
    rule('STATE_MS_COMPLIANCE_INSPECTION', 'INSPECTION', 36,
      'MDEQ conducts compliance inspections of regulated UST facilities at least once every 3 years.',
      '11 Miss. Admin. Code Pt. 5',
      { notes: 'State-mandated triennial inspection cycle.' }),
  ],

  // ── MISSOURI (DNR) ───────────────────────────────────────────────────
  // Missouri Department of Natural Resources, Tanks Compliance and Enforcement
  // Primary Regulation: 10 CSR 26-2; RSMo Sections 319.100-319.139
  MO: [
    rule('STATE_MO_5_YEAR_REGISTRATION', 'CERTIFICATION', 60,
      'Registration fee of $75 per tank per 5-year cycle. Certificate valid for 5 years for compliant facilities.',
      '10 CSR 26-2',
      { notes: 'Unique 5-year registration cycle (not annual like most states).' }),
    rule('STATE_MO_ADVANCE_NOTIFICATION', 'DOCUMENTATION', null,
      '5-day advance notification before installation begins for inspector scheduling.',
      '10 CSR 26-2',
      { notes: 'State inspection at installation.' }),
    rule('STATE_MO_30_DAY_REGISTRATION', 'CERTIFICATION', null,
      'New tanks must be registered within 30 days of bringing into operation.',
      'RSMo 319.100-319.139',
      { notes: 'State-specific registration timeline.' }),
    rule('STATE_MO_PSTIF', 'FINANCIAL', 12,
      'Petroleum Storage Tank Insurance Fund (PSTIF) — voluntary fund providing $1M per occurrence / $2M annual aggregate coverage with $10,000 deductible. Satisfies federal financial responsibility requirement.',
      'RSMo 319.129-319.131',
      { notes: 'Unique voluntary state insurance fund. Annual participation fee required.' }),
    rule('STATE_MO_OPERATOR_TRAINING', 'TRAINING', null,
      'Class A/B operators must be trained. No standard periodic retraining, but violation-triggered retraining requires operator to demonstrate compliance understanding.',
      '10 CSR 26-2',
      { notes: 'Less prescriptive than most states on routine retraining.' }),
  ],

  // ── MONTANA (DEQ) ────────────────────────────────────────────────────
  // Montana Department of Environmental Quality, Tanks, Waste & Recycling Division
  // Primary Regulation: ARM Title 17, Chapter 56; MCA 75-11-301 et seq.
  MT: [
    rule('STATE_MT_ANNUAL_REGISTRATION_FEE', 'FINANCIAL', 12,
      'Annual tank registration fees: up to $300/tank (>1,100 gal) and $100/tank (<1,100 gal) after 2025 SB 46 increase.',
      'MCA 75-11-309; SB 46 (2025)',
      { notes: 'Recently increased fee caps (previously $108/$36).' }),
    rule('STATE_MT_AGE_BASED_TIGHTNESS_TESTING', 'TESTING', null,
      'Tightness testing required for tanks over 10 years old.',
      'ARM 17.56.402',
      { notes: 'State-specific age-based testing trigger.' }),
    rule('STATE_MT_MONTHLY_RELEASE_DETECTION', 'INSPECTION', null,
      'Monthly release detection equipment checks with records maintained for DEQ review.',
      'ARM 17.56.402',
      { frequencyDays: 30, notes: 'Explicit monthly check requirement with record-keeping.' }),
    rule('STATE_MT_PTRCF', 'FINANCIAL', 12,
      'Petroleum Tank Release Cleanup Fund (PTRCF) with $17,500 copayment. Must pair with additional financial assurance mechanism. Administered by Petroleum Tank Release Compensation Board.',
      'ARM 17.56.815; MCA 75-11-313',
      { notes: 'Unique copayment structure requires supplemental financial assurance.' }),
    rule('STATE_MT_OPERATOR_TRAINING', 'TRAINING', null,
      'Operator training under 3-class system covering spill prevention, emergency response, and maintenance. State-mandated curriculum.',
      'ARM 17.56.1502',
      { notes: 'State-mandated training curriculum.' }),
  ],

  // ── NEBRASKA (SFM/NDEE) ─────────────────────────────────────────────
  // Nebraska State Fire Marshal (compliance); Nebraska Dept. of Environment and Energy (remediation)
  // Primary Regulation: Title 159 Nebraska Administrative Code
  NE: [
    rule('STATE_NE_ANNUAL_REGISTRATION_FEE', 'FINANCIAL', 12,
      'Annual registration fee of $60 per tank (operating or temporarily closed). Invoiced Nov/Dec, due by January 1.',
      'Title 159',
      { notes: 'Separate from remediation fund fee.' }),
    rule('STATE_NE_REMEDIAL_ACTION_FUND_FEE', 'FINANCIAL', 12,
      'Annual Petroleum Release Remedial Action Fund fee of $90 per tank.',
      'Neb. Rev. Stat. 66-1519',
      { notes: 'Combined with registration = $150/tank/year total.' }),
    rule('STATE_NE_CONTRACTOR_LICENSING', 'CERTIFICATION', null,
      'State contractor licensing and individual certification required for all UST work.',
      'Title 159, Ch. 3',
      { notes: 'State licensing beyond federal requirements.' }),
    rule('STATE_NE_SECONDARY_CONTAINMENT_2007', 'CERTIFICATION', null,
      'Mandatory secondary containment with interstitial monitoring for all USTs installed or replaced after September 19, 2007.',
      'Title 159, Ch. 4',
      { notes: 'Pre-dates the 2015 federal secondary containment requirement by 8 years.' }),
    rule('STATE_NE_CLOSURE_ASSESSMENT', 'CLOSURE', null,
      'Mandatory closure assessment at time of permanent closure or replacement.',
      'Title 159',
      { notes: 'State-specific closure assessment requirements.' }),
  ],

  // ── NEVADA (NDEP) ────────────────────────────────────────────────────
  // Nevada Division of Environmental Protection, Bureau of Corrective Actions
  // Primary Regulation: NAC 459.9921-459.9995; NRS 459.800-459.856
  NV: [
    rule('STATE_NV_PETROLEUM_FUND_FEE', 'FINANCIAL', 12,
      'Annual Petroleum Fund enrollment fee of $100 per tank. Invoiced in August, due by October 1. Enrollment satisfies federal financial responsibility.',
      'NRS 445C.340',
      { notes: 'State fund for financial responsibility.' }),
    rule('STATE_NV_CERTIFIED_TANK_HANDLER', 'CERTIFICATION', null,
      'NDEP Certified Tank Handler must supervise all federally regulated UST work.',
      'NAC 459.970-459.9729',
      { notes: 'State-specific handler certification requirement.' }),
    rule('STATE_NV_CERTIFIED_TESTER', 'CERTIFICATION', null,
      'NDEP Certified Underground Storage Tank Tester (UTT) required for tightness testing.',
      'NAC 459.970-459.9729',
      { notes: 'Separate tester certification program.' }),
    rule('STATE_NV_TRIENNIAL_TESTING', 'TESTING', 36,
      'Triennial testing of spill buckets, overfill equipment, and containment sumps per 40 CFR 280.35.',
      'NAC 459.9921-459.999',
      { equipmentType: 'spill_containment', notes: 'State codifies federal triennial testing requirement.' }),
    rule('STATE_NV_UPGRADE_GRANT_PROGRAM', 'FINANCIAL', null,
      'Petroleum Fund grant program for UST system upgrades available to eligible owners.',
      'NRS 445C',
      { notes: 'Unique state financial assistance for system modernization.' }),
  ],

  // ── NEW HAMPSHIRE (DES) ──────────────────────────────────────────────
  // New Hampshire Dept. of Environmental Services, Waste Management Division
  // Primary Regulation: Env-Or 400; RSA 146-C; RSA 146-D
  NH: [
    rule('STATE_NH_TRIENNIAL_SPILL_BUCKET_TESTING', 'TESTING', 36,
      'Triennial spill bucket testing required. Spill containment minimum 5-gallon capacity.',
      'Env-Or 400',
      { equipmentType: 'spill_containment', notes: 'State-established testing schedule with minimum capacity requirement.' }),
    rule('STATE_NH_OIL_POLLUTION_CONTROL_FUND', 'FINANCIAL', 12,
      'Oil Pollution Control Fund financed by per-gallon import fees on petroleum ($0.01625/gal gasoline, $0.01375/gal fuel oil).',
      'RSA 146-A:11-a',
      { notes: 'State fund for oil discharge cleanup and response. Fee collected at import.' }),
    rule('STATE_NH_PETROLEUM_REIMBURSEMENT_FUND', 'FINANCIAL', 12,
      'Petroleum Reimbursement Fund provides excess insurance coverage for corrective action and third-party damages.',
      'RSA 146-D (Env-Odb 400)',
      { notes: 'Separate from Oil Pollution Control Fund; covers both UST and AST contamination.' }),
    rule('STATE_NH_UNKNOWN_CAPACITY_TANKS', 'CERTIFICATION', null,
      'NH applies to tanks >110 gallons and explicitly captures unknown-capacity tanks in its regulatory scope.',
      'Env-Or 401.01',
      { notes: 'Broader scope than federal — includes tanks of unknown capacity.' }),
    rule('STATE_NH_OPERATOR_TRAINING', 'TRAINING', null,
      'Class A, B, and C operator training required. Retraining upon noncompliance finding.',
      'Env-Or 400',
      { notes: 'NH follows federal Subpart J framework.' }),
  ],

  // ── NEW MEXICO (NMED) ────────────────────────────────────────────────
  // New Mexico Environment Department, Petroleum Storage Tank Bureau
  // Primary Regulation: 20.5 NMAC
  NM: [
    rule('STATE_NM_ANNUAL_REGISTRATION_FEE', 'FINANCIAL', 12,
      'Annual registration fee of $100 per UST, due within 30 days of putting tank into service.',
      '20.5 NMAC',
      { notes: 'State-specific annual fee.' }),
    rule('STATE_NM_ADVANCE_NOTICE', 'DOCUMENTATION', null,
      '30-day advance written notice required before commencing installation activities.',
      '20.5 NMAC',
      { notes: 'More advance notice than federal 30-day post-installation notification.' }),
    rule('STATE_NM_INSTALLER_CERTIFICATION', 'CERTIFICATION', null,
      'NMED PSTB installer certification required for anyone installing, replacing, repairing, or modifying UST/AST systems.',
      '20.5.105 NMAC',
      { notes: 'Comprehensive state certification covering both UST and AST work.' }),
    rule('STATE_NM_CORRECTIVE_ACTION_FUND', 'FINANCIAL', 12,
      'Corrective Action Fund (CAF) financed by per-load fee at wholesale distribution loading docks (per 8,000-gallon load). Covers cleanup and monitoring.',
      '20.5.121 NMAC; 20.5.123 NMAC',
      { notes: 'State fund for petroleum release cleanup and long-term monitoring.' }),
    rule('STATE_NM_COMPLIANCE_INSPECTION', 'INSPECTION', 36,
      'NMED Petroleum Storage Tank Bureau conducts compliance inspections at least every 3 years.',
      '20.5 NMAC',
      { notes: 'Triennial inspection cycle.' }),
  ],

  // ── NORTH DAKOTA (NDDEQ) ─────────────────────────────────────────────
  // North Dakota Department of Environmental Quality, Waste Management Division
  // Primary Regulation: NDCC 23.1-12; NDAC 33.1-12-01
  ND: [
    rule('STATE_ND_ANNUAL_PTRCF_FEE', 'FINANCIAL', 12,
      'Petroleum Tank Release Compensation Fund (PTRCF) annual fee of $150-$300 per tank depending on risk classification category.',
      'NDCC 23.1-12; NDAC 33.1-12-01',
      { notes: 'Risk-based fee tiers — unique tiered approach.' }),
    rule('STATE_ND_OPERATOR_RETRAINING', 'TRAINING', 36,
      'Class A, B, and C operators must be retrained every 3 years. North Dakota recognizes reciprocity from other states\' training programs.',
      'NDAC 33.1-24-08',
      { notes: 'Reciprocity with other states.' }),
    rule('STATE_ND_PTRCF_COMPLIANCE', 'FINANCIAL', 12,
      'PTRCF reimburses 90% of costs between $5,000-$155,000, and 100% of costs between $155,000-$1,000,000. Tank must be in "substantial compliance" at time of release.',
      'NDCC 23.1-12-18',
      { notes: 'Substantial compliance required with EPA, fire marshal, and NDDEQ rules.' }),
    rule('STATE_ND_COMPLIANCE_INSPECTION', 'INSPECTION', 36,
      'NDDEQ conducts compliance inspections at least every 3 years.',
      'NDAC 33.1-24',
      { notes: 'State-mandated triennial inspection cycle.' }),
    rule('STATE_ND_RELEASE_REPORTING', 'REPORTING', null,
      'Releases must be reported to NDDEQ within 24 hours of discovery.',
      'NDAC 33.1-24',
      { notes: '24-hour reporting requirement.' }),
  ],

  // ── OKLAHOMA (OCC) ───────────────────────────────────────────────────
  // Oklahoma Corporation Commission, Petroleum Storage Tank Division
  // Primary Regulation: OAC 165:25
  OK: [
    rule('STATE_OK_ANNUAL_REGISTRATION_FEE', 'FINANCIAL', 12,
      'Annual tank registration fee of $25 per tank per year. Invoices issued May 1, due by June 30.',
      'OAC 165:25-1-101',
      { notes: 'Low annual fee.' }),
    rule('STATE_OK_OPERATOR_RECERTIFICATION', 'TRAINING', 36,
      'Class A/B operators must complete OCC PSTD training, pass each of 3 sections with 80% minimum score. Recertification every 3 years.',
      'OAC 165:25-1, Part 19',
      { notes: '80% pass score requirement is state-specific. More rigorous than most states.' }),
    rule('STATE_OK_INSTALLER_LICENSING', 'CERTIFICATION', null,
      'UST Installers, Removers, Monitor Well Technicians, and UST Environmental Consultants must be licensed by PSTD.',
      'OAC 165:25-1-101, 165:25-1-102, 165:25-1-103',
      { notes: 'Multiple license categories — more granular than most states.' }),
    rule('STATE_OK_DOUBLE_WALL_2008', 'CERTIFICATION', null,
      'All UST systems installed after July 1, 2008 must be double-walled and use interstitial monitoring for both tanks and piping.',
      'OAC 165:25',
      { notes: 'Pre-dates 2015 federal secondary containment requirement.' }),
    rule('STATE_OK_COMPLIANCE_INSPECTION', 'INSPECTION', 36,
      'OCC PSTD conducts compliance inspections of regulated facilities at least every 3 years.',
      'OAC 165:25',
      { notes: 'State-mandated triennial inspections.' }),
  ],

  // ── OREGON (DEQ) ─────────────────────────────────────────────────────
  // Oregon Department of Environmental Quality, Tanks Program
  // Primary Regulation: OAR 340-150
  OR: [
    rule('STATE_OR_REGISTRATION_CERTIFICATE', 'CERTIFICATION', null,
      'Must apply at least 30 days before installing, operating, or decommissioning a UST. No UST may operate without a registration certificate.',
      'OAR 340-150-0020',
      { notes: '30-day pre-registration required.' }),
    rule('STATE_OR_ANNUAL_COMPLIANCE_FEE', 'FINANCIAL', 12,
      'Annual compliance fee of $135 per tank.',
      'OAR 340-150-0110',
      { notes: 'Amount subject to update.' }),
    rule('STATE_OR_DECOMMISSIONING_REPORTING', 'CLOSURE', null,
      'Within 30 days of completing field work, must submit decommissioning checklist and site assessment report signed by owner, permittee, and service provider.',
      'OAR 340-150-0168',
      { notes: 'Three-party signature requirement.' }),
    rule('STATE_OR_OPERATOR_RETRAINING', 'TRAINING', null,
      'Class A/B operators must complete initial training within 30 days. Retraining within 30 days if facility fails compliance inspection.',
      'OAR 340-150-0210',
      { notes: 'Retraining triggered by compliance failure.' }),
    rule('STATE_OR_SECONDARY_CONTAINMENT', 'DOCUMENTATION', null,
      'All new or replacement USTs and connected piping must be secondarily contained and monitored via interstitial monitoring.',
      'OAR 340-150-0135',
      { equipmentType: 'tanks_piping', notes: 'Applies to all new/replacement installations.' }),
    rule('STATE_OR_COMPLIANCE_INSPECTION', 'INSPECTION', 36,
      'Oregon DEQ conducts compliance inspections of each regulated UST facility at least every 3 years.',
      'OAR 340-150',
      { notes: 'Triennial inspection cycle.' }),
  ],

  // ── RHODE ISLAND (DEM) ───────────────────────────────────────────────
  // Rhode Island Department of Environmental Management
  // Primary Regulation: 250-RICR-140-25-1
  RI: [
    rule('STATE_RI_ANNUAL_REGISTRATION_FEE', 'FINANCIAL', 12,
      'Annual registration fee of $100 per tank (not to exceed $2,500 per site).',
      '250-RICR-140-25-1',
      { notes: 'Site cap on total fees.' }),
    rule('STATE_RI_FINANCIAL_RESPONSIBILITY_FUND', 'FINANCIAL', 12,
      'UST Financial Responsibility Fund funded by 0.5 cents/gallon surcharge on motor fuel. $150 application fee for reimbursement claims.',
      'R.I. Gen. Laws 46-12.9; 250-RICR-140-25-1.8',
      { notes: 'State-operated fund for UST release cleanup.' }),
    rule('STATE_RI_ENHANCED_TIGHTNESS_STANDARD', 'TESTING', null,
      'Tests must detect 0.1 gal/hr leak rate with probability of detection no less than 95% and false alarm rate no more than 5%.',
      '250-RICR-140-25-1.10',
      { notes: 'Enhanced statistical standard for testing.' }),
    rule('STATE_RI_SINGLE_WALL_PHASEOUT', 'CERTIFICATION', null,
      'All federally regulated single-walled USTs and product pipelines must be removed and permanently closed prior to December 22, 2017 or 32 years from installation, whichever is sooner. Exceeds federal timeline.',
      '250-RICR-140-25-1.11',
      { notes: '32-year maximum tank life for single-wall systems.' }),
    rule('STATE_RI_COMPLIANCE_INSPECTION', 'INSPECTION', 36,
      'RI DEM conducts compliance inspections of regulated UST facilities at least every 3 years.',
      '250-RICR-140-25-1',
      { notes: 'Triennial inspection cycle.' }),
  ],

  // ── SOUTH CAROLINA (SCDES) ───────────────────────────────────────────
  // South Carolina Department of Environmental Services (formerly DHEC)
  // Primary Regulation: S.C. Code 44-2; R.61-92
  SC: [
    rule('STATE_SC_ANNUAL_TANK_FEE', 'FINANCIAL', 12,
      'Annual tank registration fee. Invoices mailed end of May, due July 31. Failure to pay by July 31 triggers delivery prohibition on August 1.',
      'S.C. Code 44-2-60; R.61-92',
      { notes: 'Fee reverts to $100/tank under certain fund balance conditions.' }),
    rule('STATE_SC_BIENNIAL_OPERATOR_RETRAINING', 'TRAINING', 24,
      'All Class A, B, and C operators must be re-certified every 2 years. More frequent than federal 3-year standard.',
      'R.61-92, Part 280.35',
      { notes: 'Biennial retraining is among the most frequent in the nation.' }),
    rule('STATE_SC_ANNUAL_STATE_INSPECTION', 'INSPECTION', 12,
      'UST systems inspected by the Department annually, exceeding the federal 3-year inspection cycle.',
      'R.61-92, Part 280',
      { notes: 'Annual state inspections — most states only inspect every 3 years.' }),
    rule('STATE_SC_SUPERB_FUND', 'FINANCIAL', 12,
      'State Underground Petroleum Environmental Response Bank (SUPERB) fund operates like insurance. Funded by fuel impact fee plus annual registration fees.',
      'S.C. Code 44-2 (SUPERB Act of 1988)',
      { notes: 'Per-occurrence claims with deductible.' }),
    rule('STATE_SC_DELIVERY_PROHIBITION', 'REPORTING', 12,
      'Failure to pay annual tank registration fee by July 31 triggers delivery prohibition on August 1. No regulated substance may be delivered to unregistered tanks.',
      'S.C. Code 44-2-60',
      { notes: 'Automatic delivery prohibition — unique enforcement mechanism.' }),
  ],

  // ── SOUTH DAKOTA (DANR) ──────────────────────────────────────────────
  // South Dakota Department of Agriculture and Natural Resources
  // Primary Regulation: SDCL 34A-2; ARSD 74:56
  SD: [
    rule('STATE_SD_PRCF', 'FINANCIAL', 12,
      'Petroleum Release Compensation Fund (PRCF) covers up to $1,000,000 per occurrence with $10,000 deductible. Funded by $0.02/gallon tank inspection fee.',
      'SDCL 34A-2; ARSD 74:56',
      { notes: 'PRCF receives 17% of tank inspection fee revenues.' }),
    rule('STATE_SD_24_HOUR_RELEASE_REPORTING', 'REPORTING', null,
      'Any detection of a release must be reported to DANR within 24 hours of discovery.',
      'ARSD 74:56:02',
      { notes: 'Immediate 24-hour reporting requirement.' }),
    rule('STATE_SD_TRIENNIAL_INSPECTION', 'INSPECTION', 36,
      'DANR performs compliance inspections of each regulated UST system at least once every 3 years.',
      'ARSD 74:56:01',
      { notes: 'State-mandated triennial inspection cycle.' }),
    rule('STATE_SD_OPERATOR_TRAINING', 'TRAINING', null,
      'Initial training within 30 days of assuming responsibilities. Retraining of Class A/B operators upon noncompliance also triggers Class C retraining.',
      'ARSD 74:56:01:38.01',
      { notes: 'Noncompliance retraining cascades to Class C operators — unique trigger mechanism.' }),
    rule('STATE_SD_REGISTRATION', 'CERTIFICATION', null,
      'All regulated USTs must be registered with DANR. Registration required before bringing tank into use.',
      'ARSD 74:56:01',
      { notes: 'State registration requirement.' }),
  ],

  // ── UTAH (DEQ) ───────────────────────────────────────────────────────
  // Utah Department of Environmental Quality, Division of Environmental Response and Remediation
  // Primary Regulation: UAC R311; Utah Code 19-6
  UT: [
    rule('STATE_UT_CERTIFICATE_OF_COMPLIANCE', 'CERTIFICATION', 12,
      'Certificate of Compliance (COC) required to operate a regulated petroleum UST. New USTs at new facilities: $150/tank; existing facilities: $150 or $450/tank.',
      'UAC R311-206; Utah Code 19-6-402',
      { notes: 'Operating without COC is a VIOLATION of the UST Act.' }),
    rule('STATE_UT_PST_FUND', 'FINANCIAL', 12,
      'Petroleum Storage Tank Fund / Environmental Assurance Program funded by tank fees and 0.65 cents/gallon on first sale/use of petroleum.',
      'UAC R311-206; Utah Code 19-6-409',
      { notes: 'Owners opt in by checking a box on COC application.' }),
    rule('STATE_UT_AS_BUILT_DRAWING', 'DOCUMENTATION', null,
      'As-built drawings required showing tank excavation, buildings, tanks, product lines, vent lines, cathodic protection systems, and leak detection systems.',
      'UAC R311-203-3(g)',
      { notes: 'Required at installation.' }),
    rule('STATE_UT_OPERATOR_REGISTRATION', 'TRAINING', null,
      'Class A and Class B operators must be designated and registered with DERR. Training completed through state-approved program.',
      'UAC R311-201-12',
      { notes: 'Registration with DERR is state-specific requirement.' }),
    rule('STATE_UT_COMPLIANCE_INSPECTION', 'INSPECTION', 36,
      'DERR conducts compliance inspections at least every 3 years.',
      'UAC R311-201',
      { notes: 'Triennial inspection cycle.' }),
  ],

  // ── VERMONT (DEC) ────────────────────────────────────────────────────
  // Vermont Department of Environmental Conservation, Waste Management Division
  // Primary Regulation: Vermont UST Rules (effective October 26, 2020)
  VT: [
    rule('STATE_VT_ANNUAL_PERMIT_FEE', 'FINANCIAL', 12,
      'Annual tank permit fee of $125 per tank per year for permitted USTs.',
      'Vermont UST Rules',
      { notes: 'Per-tank annual fee.' }),
    rule('STATE_VT_BROAD_REGISTRATION', 'CERTIFICATION', null,
      'Registration required for all USTs except <1,100 gal at farms/single-family residences. Includes diesel, fuel oil, kerosene, gasoline, new oil, waste oil, chemical products, and out-of-service tanks.',
      'Vermont UST Rules, Section 3',
      { notes: 'Broader scope than federal. USTs at public buildings register regardless of size.' }),
    rule('STATE_VT_PETROLEUM_CLEANUP_FUND', 'FINANCIAL', 12,
      'Petroleum Cleanup Fund (PCF) — 96% of Vermont tank owners participate. First-year assessment payment accompanies registration.',
      '10 V.S.A. Chapter 59; Vermont UST Rules',
      { notes: 'Very high participation rate. State financial assurance mechanism.' }),
    rule('STATE_VT_CONSTRUCTION_PERMIT', 'CERTIFICATION', null,
      'Construction permit required for any "substantial alteration" — defined as any change requiring uncovering the top of the tank and/or any portion of piping.',
      'Vermont UST Rules',
      { notes: 'Permit required for substantial alterations.' }),
    rule('STATE_VT_OPERATOR_TRAINING', 'TRAINING', null,
      'Class A/B operators must be designated and trained through a state-approved program. Training must be completed before assuming operator responsibilities.',
      'Vermont UST Rules, Section 9',
      { notes: 'Training per designation — no fixed renewal interval.' }),
    rule('STATE_VT_COMPLIANCE_INSPECTION', 'INSPECTION', 36,
      'Vermont DEC conducts compliance inspections of regulated UST facilities at least every 3 years.',
      'Vermont UST Rules',
      { notes: 'Triennial inspection cycle.' }),
  ],

  // ── WASHINGTON (ECY) ─────────────────────────────────────────────────
  // Washington State Department of Ecology, Toxics Cleanup Program
  // Primary Regulation: WAC 173-360A
  WA: [
    rule('STATE_WA_ANNUAL_TANK_LICENSE', 'CERTIFICATION', 12,
      'Each tank must maintain an annual license. Operating without a license is prohibited.',
      'WAC 173-360A-0200; WAC 173-360A-0210',
      { notes: 'Fees paid to Department of Revenue.' }),
    rule('STATE_WA_PLIA_FINANCIAL_ASSURANCE', 'FINANCIAL', 12,
      'Pollution Liability Insurance Agency (PLIA) age-tiered annual fees: $1,000/tank (0-10 yrs); $1,500/tank (11-20 yrs); $2,000/tank (21-30 yrs); $2,500/tank (30+ yrs).',
      'Laws of 2023, ch. 170; RCW 70A.325',
      { notes: 'Among the MOST EXPENSIVE state financial requirements nationally. Age of tank determines fee.' }),
    rule('STATE_WA_OPERATOR_CERTIFICATION', 'TRAINING', 12,
      'Class A/B operators who retrain annually are exempt from mandatory retraining upon noncompliance finding.',
      'WAC 173-360A-0530',
      { notes: 'Annual retraining is optional but provides valuable exemption benefit.' }),
    rule('STATE_WA_STATE_LAW_SUPERSEDES', 'CERTIFICATION', null,
      'Washington has full federal program approval — state law (not federal) applies to all UST systems in the state.',
      'WAC 173-360A',
      { notes: 'State program approval means Ecology (not EPA) is the primary regulatory authority.' }),
    rule('STATE_WA_COMPLIANCE_INSPECTION', 'INSPECTION', 36,
      'Department of Ecology conducts compliance inspections at least every 3 years.',
      'WAC 173-360A',
      { notes: 'Triennial inspection cycle administered by Ecology.' }),
  ],

  // ── WEST VIRGINIA (DEP) ──────────────────────────────────────────────
  // West Virginia Department of Environmental Protection, Tanks Section
  // Primary Regulation: 33CSR30
  WV: [
    rule('STATE_WV_ANNUAL_REGISTRATION_FEE', 'FINANCIAL', 12,
      'Annual tank registration fee of $90 per tank.',
      '33CSR30-3',
      { notes: 'Valid for one year, invoiced annually.' }),
    rule('STATE_WV_INSTALLER_CERTIFICATION', 'CERTIFICATION', null,
      'Individuals who install, repair, retrofit, upgrade, close, or tightness-test UST systems must be certified by WVDEP. Includes corrosion protection installers/testers.',
      '33CSR30-3',
      { notes: 'Comprehensive state certification — covers more activities than most states.' }),
    rule('STATE_WV_ADVANCE_NOTIFICATION', 'DOCUMENTATION', null,
      'At least 30 days prior written notification to the Secretary required for installation, upgrade, or repair of internal lining or corrosion protection systems.',
      '33CSR30-4',
      { notes: '30-day advance notice for specific work types.' }),
    rule('STATE_WV_OPERATOR_TRAINING', 'TRAINING', null,
      'Class A/B operators must be trained within 30 days of assuming responsibilities. No periodic recertification required, but retraining mandatory upon noncompliance.',
      '33CSR30-6',
      { notes: 'No fixed retraining interval — only noncompliance-triggered.' }),
    rule('STATE_WV_COMPLIANCE_INSPECTION', 'INSPECTION', 36,
      'WVDEP conducts compliance inspections at least every 3 years.',
      '33CSR30',
      { notes: 'State-mandated triennial inspections.' }),
  ],

  // ── WISCONSIN (DATCP/DNR) ────────────────────────────────────────────
  // Wisconsin DATCP (compliance); DNR (cleanup)
  // Primary Regulation: ATCP 93; Wis. Stat. 101.143
  WI: [
    rule('STATE_WI_ANNUAL_PERMIT_TO_OPERATE', 'CERTIFICATION', 12,
      'Underground storage tank permits expire annually on the 28th day of the month specified in the initial permit.',
      'ATCP 93.145',
      { notes: 'Must be maintained. Registration within 15 days of installation (ATCP 93.140).' }),
    rule('STATE_WI_PECFA', 'FINANCIAL', 12,
      'Petroleum Environmental Cleanup Fund Award (PECFA) — state cleanup fund for petroleum contamination. Eligibility conditioned on prior tank registration.',
      'Wis. Stat. 101.143',
      { notes: 'Administered by DATCP.' }),
    rule('STATE_WI_WELL_SETBACK', 'DOCUMENTATION', null,
      'USTs must be at least 50 feet from potable water reservoirs (NR 811) and 25 feet from potable water mains.',
      'ATCP 93.260',
      { notes: 'Ongoing compliance required. References NR 812 for private well distances.' }),
    rule('STATE_WI_15_DAY_REGISTRATION', 'CERTIFICATION', null,
      'Owners/operators must register USTs with DATCP within 15 days of installation completion. Stricter than many states.',
      'ATCP 93.140',
      { notes: '15-day deadline is among the shortest registration windows nationally.' }),
    rule('STATE_WI_OPERATOR_TRAINING', 'TRAINING', null,
      'Operator training does not expire and there is no renewal requirement. Retraining required only for operators of non-compliant systems.',
      'ATCP 93',
      { notes: 'No periodic recertification — only noncompliance-triggered retraining.' }),
  ],

  // ── WYOMING (WDEQ) ──────────────────────────────────────────────────
  // Wyoming Department of Environmental Quality, Storage Tank Program
  // Primary Regulation: W.S. 35-11; WDEQ Water Quality Rules Chapter 17
  WY: [
    rule('STATE_WY_ANNUAL_STORAGE_TANK_FEE', 'FINANCIAL', 12,
      'Annual storage tank fee of $200 per tank per year, due before January 1. Required for Corrective Action Account eligibility.',
      'W.S. 35-11-1425; WDEQ Water Quality Rules Chapter 17',
      { notes: 'Fee payment is prerequisite for cleanup fund eligibility.' }),
    rule('STATE_WY_CORRECTIVE_ACTION_ACCOUNT', 'FINANCIAL', null,
      'State cleanup fund for petroleum releases. Participation requires annual fee payment, site documentation, and completion of Monitoring Site Assessment (MSA).',
      'W.S. 35-11-1424; Chapter 17',
      { notes: 'Per-occurrence claims.' }),
    rule('STATE_WY_ICC_OPERATOR_EXAM', 'CERTIFICATION', null,
      'Class A/B operators must pass an International Code Council (ICC) exam on Wyoming-specific storage tank laws to become licensed and registered.',
      'WDEQ Water Quality Rules Chapter 17',
      { notes: 'ICC exam requirement is unique to Wyoming.' }),
    rule('STATE_WY_SECONDARY_CONTAINMENT', 'DOCUMENTATION', null,
      'All tanks and piping installed or replaced after December 1, 2005 must be secondarily contained with interstitial monitoring. Predates the 2015 federal mandate by 10 years.',
      'WDEQ Water Quality Rules Chapter 17, Section 6',
      { equipmentType: 'tanks_piping', notes: 'Early adopter — secondary containment required since 2005.' }),
    rule('STATE_WY_COMPLIANCE_INSPECTION', 'INSPECTION', 36,
      'WDEQ conducts compliance inspections of regulated UST facilities at least every 3 years.',
      'WDEQ Water Quality Rules Chapter 17',
      { notes: 'Triennial inspection cycle.' }),
  ],
};
