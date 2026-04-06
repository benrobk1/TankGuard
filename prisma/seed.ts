import { PrismaClient } from '../src/generated/prisma';
import { federalRules } from '../src/lib/compliance/federal-rules';

const prisma = new PrismaClient();

const statesData = [
  { name: 'Alabama', abbreviation: 'AL', regulatoryAgency: 'ADEM - Alabama Dept. of Environmental Management' },
  { name: 'Alaska', abbreviation: 'AK', regulatoryAgency: 'ADEC - Alaska Dept. of Environmental Conservation' },
  { name: 'Arizona', abbreviation: 'AZ', regulatoryAgency: 'ADEQ - Arizona Dept. of Environmental Quality' },
  { name: 'Arkansas', abbreviation: 'AR', regulatoryAgency: 'ADEQ - Arkansas Dept. of Environmental Quality' },
  { name: 'California', abbreviation: 'CA', regulatoryAgency: 'SWRCB - State Water Resources Control Board' },
  { name: 'Colorado', abbreviation: 'CO', regulatoryAgency: 'CDLE - Division of Oil and Public Safety' },
  { name: 'Connecticut', abbreviation: 'CT', regulatoryAgency: 'DEEP - Dept. of Energy and Environmental Protection' },
  { name: 'Delaware', abbreviation: 'DE', regulatoryAgency: 'DNREC - Dept. of Natural Resources and Environmental Control' },
  { name: 'District of Columbia', abbreviation: 'DC', regulatoryAgency: 'DOEE - Dept. of Energy and Environment' },
  { name: 'Florida', abbreviation: 'FL', regulatoryAgency: 'DEP - Florida Dept. of Environmental Protection' },
  { name: 'Georgia', abbreviation: 'GA', regulatoryAgency: 'EPD - Environmental Protection Division' },
  { name: 'Hawaii', abbreviation: 'HI', regulatoryAgency: 'DOH - Dept. of Health' },
  { name: 'Idaho', abbreviation: 'ID', regulatoryAgency: 'DEQ - Idaho Dept. of Environmental Quality' },
  { name: 'Illinois', abbreviation: 'IL', regulatoryAgency: 'OSFM - Office of the State Fire Marshal' },
  { name: 'Indiana', abbreviation: 'IN', regulatoryAgency: 'IDEM - Indiana Dept. of Environmental Management' },
  { name: 'Iowa', abbreviation: 'IA', regulatoryAgency: 'DNR - Iowa Dept. of Natural Resources' },
  { name: 'Kansas', abbreviation: 'KS', regulatoryAgency: 'KDHE - Kansas Dept. of Health and Environment' },
  { name: 'Kentucky', abbreviation: 'KY', regulatoryAgency: 'DEP - Kentucky Dept. for Environmental Protection' },
  { name: 'Louisiana', abbreviation: 'LA', regulatoryAgency: 'DEQ - Louisiana Dept. of Environmental Quality' },
  { name: 'Maine', abbreviation: 'ME', regulatoryAgency: 'DEP - Maine Dept. of Environmental Protection' },
  { name: 'Maryland', abbreviation: 'MD', regulatoryAgency: 'MDE - Maryland Dept. of the Environment' },
  { name: 'Massachusetts', abbreviation: 'MA', regulatoryAgency: 'MassDEP - Dept. of Environmental Protection' },
  { name: 'Michigan', abbreviation: 'MI', regulatoryAgency: 'EGLE - Environment, Great Lakes, and Energy' },
  { name: 'Minnesota', abbreviation: 'MN', regulatoryAgency: 'MPCA - Minnesota Pollution Control Agency' },
  { name: 'Mississippi', abbreviation: 'MS', regulatoryAgency: 'MDEQ - Mississippi Dept. of Environmental Quality' },
  { name: 'Missouri', abbreviation: 'MO', regulatoryAgency: 'DNR - Missouri Dept. of Natural Resources' },
  { name: 'Montana', abbreviation: 'MT', regulatoryAgency: 'DEQ - Montana Dept. of Environmental Quality' },
  { name: 'Nebraska', abbreviation: 'NE', regulatoryAgency: 'NDEQ - Nebraska Dept. of Environment and Energy' },
  { name: 'Nevada', abbreviation: 'NV', regulatoryAgency: 'NDEP - Nevada Division of Environmental Protection' },
  { name: 'New Hampshire', abbreviation: 'NH', regulatoryAgency: 'DES - Dept. of Environmental Services' },
  { name: 'New Jersey', abbreviation: 'NJ', regulatoryAgency: 'DEP - New Jersey Dept. of Environmental Protection' },
  { name: 'New Mexico', abbreviation: 'NM', regulatoryAgency: 'NMED - New Mexico Environment Dept.' },
  { name: 'New York', abbreviation: 'NY', regulatoryAgency: 'DEC - New York Dept. of Environmental Conservation' },
  { name: 'North Carolina', abbreviation: 'NC', regulatoryAgency: 'DEQ - North Carolina Dept. of Environmental Quality' },
  { name: 'North Dakota', abbreviation: 'ND', regulatoryAgency: 'NDDH - North Dakota Dept. of Health' },
  { name: 'Ohio', abbreviation: 'OH', regulatoryAgency: 'BUSTR - Bureau of Underground Storage Tank Regulations' },
  { name: 'Oklahoma', abbreviation: 'OK', regulatoryAgency: 'DEQ - Oklahoma Dept. of Environmental Quality' },
  { name: 'Oregon', abbreviation: 'OR', regulatoryAgency: 'DEQ - Oregon Dept. of Environmental Quality' },
  { name: 'Pennsylvania', abbreviation: 'PA', regulatoryAgency: 'DEP - Pennsylvania Dept. of Environmental Protection' },
  { name: 'Rhode Island', abbreviation: 'RI', regulatoryAgency: 'DEM - Dept. of Environmental Management' },
  { name: 'South Carolina', abbreviation: 'SC', regulatoryAgency: 'DHEC - Dept. of Health and Environmental Control' },
  { name: 'South Dakota', abbreviation: 'SD', regulatoryAgency: 'DENR - Dept. of Environment and Natural Resources' },
  { name: 'Tennessee', abbreviation: 'TN', regulatoryAgency: 'TDEC - Tennessee Dept. of Environment and Conservation' },
  { name: 'Texas', abbreviation: 'TX', regulatoryAgency: 'TCEQ - Texas Commission on Environmental Quality' },
  { name: 'Utah', abbreviation: 'UT', regulatoryAgency: 'DEQ - Utah Dept. of Environmental Quality' },
  { name: 'Vermont', abbreviation: 'VT', regulatoryAgency: 'DEC - Vermont Dept. of Environmental Conservation' },
  { name: 'Virginia', abbreviation: 'VA', regulatoryAgency: 'DEQ - Virginia Dept. of Environmental Quality' },
  { name: 'Washington', abbreviation: 'WA', regulatoryAgency: 'ECY - Dept. of Ecology' },
  { name: 'West Virginia', abbreviation: 'WV', regulatoryAgency: 'DEP - West Virginia Dept. of Environmental Protection' },
  { name: 'Wisconsin', abbreviation: 'WI', regulatoryAgency: 'DNR - Wisconsin Dept. of Natural Resources' },
  { name: 'Wyoming', abbreviation: 'WY', regulatoryAgency: 'DEQ - Wyoming Dept. of Environmental Quality' },
];

async function main() {
  console.log('Seeding states...');
  for (const state of statesData) {
    await prisma.state.upsert({
      where: { abbreviation: state.abbreviation },
      update: { regulatoryAgency: state.regulatoryAgency },
      create: state,
    });
  }
  console.log(`Seeded ${statesData.length} states.`);

  console.log('Seeding federal compliance rules...');
  for (const rule of federalRules) {
    const existing = await prisma.complianceRule.findFirst({
      where: { inspectionType: rule.inspectionType, stateId: null },
    });
    if (!existing) {
      await prisma.complianceRule.create({
        data: {
          stateId: null,
          ruleSource: rule.ruleSource as 'EPA' | 'STATE',
          equipmentType: rule.equipmentType,
          inspectionType: rule.inspectionType,
          frequencyMonths: rule.frequencyMonths,
          frequencyDays: rule.frequencyDays,
          description: rule.description,
          citation: rule.citation,
          category: rule.category as any,
          appliesToMaterial: rule.appliesToMaterial,
          appliesToLeakDetection: rule.appliesToLeakDetection,
          appliesToCorrosionProtection: rule.appliesToCorrosionProtection,
          notes: rule.notes,
          isActive: true,
        },
      });
    }
  }
  console.log(`Seeded ${federalRules.length} federal rules.`);

  // Seed state-specific rules
  try {
    const { stateRules } = await import('../src/lib/compliance/state-rules');
    console.log('Seeding state-specific compliance rules...');
    let stateRuleCount = 0;
    for (const [abbr, rules] of Object.entries(stateRules)) {
      const state = await prisma.state.findUnique({ where: { abbreviation: abbr } });
      if (!state) continue;
      for (const rule of rules) {
        const existing = await prisma.complianceRule.findFirst({
          where: { inspectionType: rule.inspectionType, stateId: state.id },
        });
        if (!existing) {
          await prisma.complianceRule.create({
            data: {
              stateId: state.id,
              ruleSource: 'STATE',
              equipmentType: rule.equipmentType,
              inspectionType: rule.inspectionType,
              frequencyMonths: rule.frequencyMonths,
              frequencyDays: rule.frequencyDays,
              description: rule.description,
              citation: rule.citation,
              category: rule.category as any,
              appliesToMaterial: rule.appliesToMaterial,
              appliesToLeakDetection: rule.appliesToLeakDetection,
              appliesToCorrosionProtection: rule.appliesToCorrosionProtection,
              notes: rule.notes,
              isActive: true,
            },
          });
          stateRuleCount++;
        }
      }
    }
    console.log(`Seeded ${stateRuleCount} state-specific rules.`);
  } catch (e) {
    console.log('State rules file not found yet, skipping state rules seeding.');
  }

  console.log('Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
