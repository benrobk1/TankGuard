import { PrismaClient } from '../src/generated/prisma';
import { federalRules } from '../src/lib/compliance/federal-rules';

const prisma = new PrismaClient();

const statesData: Array<{
  name: string;
  abbreviation: string;
  regulatoryAgency: string;
  ustProgramUrl?: string;
  agencyPhone?: string;
}> = [
  { name: 'Alabama', abbreviation: 'AL', regulatoryAgency: 'ADEM - Alabama Dept. of Environmental Management', ustProgramUrl: 'https://adem.alabama.gov/waste/ust-compliance-information', agencyPhone: '334-271-7730' },
  { name: 'Alaska', abbreviation: 'AK', regulatoryAgency: 'ADEC - Alaska Dept. of Environmental Conservation, SPAR Division', ustProgramUrl: 'https://dec.alaska.gov/spar/csp/tanks/ust-compliance-act', agencyPhone: '907-269-7529' },
  { name: 'Arizona', abbreviation: 'AZ', regulatoryAgency: 'ADEQ - Arizona Dept. of Environmental Quality', ustProgramUrl: 'https://azdeq.gov/USTProgram', agencyPhone: '602-771-4567' },
  { name: 'Arkansas', abbreviation: 'AR', regulatoryAgency: 'DEQ - Arkansas Division of Environmental Quality', ustProgramUrl: 'https://www.adeq.state.ar.us/rst/', agencyPhone: '501-682-0831' },
  { name: 'California', abbreviation: 'CA', regulatoryAgency: 'SWRCB - State Water Resources Control Board (local CUPAs)', ustProgramUrl: 'https://www.waterboards.ca.gov/ust/', agencyPhone: '916-341-5851' },
  { name: 'Colorado', abbreviation: 'CO', regulatoryAgency: 'OPS - Division of Oil and Public Safety, Dept. of Labor', ustProgramUrl: 'https://ops.colorado.gov/petroleum', agencyPhone: '303-318-8547' },
  { name: 'Connecticut', abbreviation: 'CT', regulatoryAgency: 'DEEP - Dept. of Energy and Environmental Protection', ustProgramUrl: 'https://portal.ct.gov/deep/permits-and-licenses/factsheets-waste-and-materials-management/underground-storage-tank-program-fact-sheet', agencyPhone: '860-424-3374' },
  { name: 'Delaware', abbreviation: 'DE', regulatoryAgency: 'DNREC - Dept. of Natural Resources and Environmental Control, Tanks Branch', ustProgramUrl: 'https://dnrec.delaware.gov/waste-hazardous/tanks/underground/', agencyPhone: '302-395-2500' },
  { name: 'District of Columbia', abbreviation: 'DC', regulatoryAgency: 'DOEE - Dept. of Energy and Environment', ustProgramUrl: 'https://doee.dc.gov/service/underground-storage-tanks-services', agencyPhone: '202-535-2600' },
  { name: 'Florida', abbreviation: 'FL', regulatoryAgency: 'DEP - Florida Dept. of Environmental Protection, Division of Waste Management', ustProgramUrl: 'https://floridadep.gov/waste/permitting-compliance-assistance', agencyPhone: '850-245-8705' },
  { name: 'Georgia', abbreviation: 'GA', regulatoryAgency: 'EPD - Environmental Protection Division, Land Protection Branch', ustProgramUrl: 'https://epd.georgia.gov/about-us/land-protection-branch/underground-storage-tanks', agencyPhone: '404-362-2687' },
  { name: 'Hawaii', abbreviation: 'HI', regulatoryAgency: 'DOH - Dept. of Health, Solid and Hazardous Waste Branch', ustProgramUrl: 'https://health.hawaii.gov/ust/', agencyPhone: '808-586-4226' },
  { name: 'Idaho', abbreviation: 'ID', regulatoryAgency: 'DEQ - Idaho Dept. of Environmental Quality', ustProgramUrl: 'https://www.deq.idaho.gov/waste-management-and-remediation/storage-tanks/', agencyPhone: '208-373-0502' },
  { name: 'Illinois', abbreviation: 'IL', regulatoryAgency: 'OSFM - Office of the State Fire Marshal, Petroleum & Chemical Safety', ustProgramUrl: 'https://sfm.illinois.gov/about/divisions/petroleum-chemical-safety/', agencyPhone: '217-785-0969' },
  { name: 'Indiana', abbreviation: 'IN', regulatoryAgency: 'IDEM - Indiana Dept. of Environmental Management, Office of Land Quality', ustProgramUrl: 'https://www.in.gov/idem/tanks/', agencyPhone: '317-232-8603' },
  { name: 'Iowa', abbreviation: 'IA', regulatoryAgency: 'DNR - Iowa Dept. of Natural Resources', ustProgramUrl: 'https://www.iowadnr.gov/environmental-protection/land-quality/underground-storage-tanks', agencyPhone: '515-725-8200' },
  { name: 'Kansas', abbreviation: 'KS', regulatoryAgency: 'KDHE - Kansas Dept. of Health and Environment, Bureau of Environmental Remediation', ustProgramUrl: 'https://www.kdhe.ks.gov/990/Storage-Tanks', agencyPhone: '785-296-1679' },
  { name: 'Kentucky', abbreviation: 'KY', regulatoryAgency: 'DEP - Kentucky Dept. for Environmental Protection, UST Branch', ustProgramUrl: 'https://eec.ky.gov/Environmental-Protection/Waste/underground-storage-tank/', agencyPhone: '502-564-5981' },
  { name: 'Louisiana', abbreviation: 'LA', regulatoryAgency: 'LDEQ - Louisiana Dept. of Environmental Quality, UST Division', ustProgramUrl: 'https://deq.louisiana.gov/page/underground-storage-tank-division', agencyPhone: '225-219-3180' },
  { name: 'Maine', abbreviation: 'ME', regulatoryAgency: 'DEP - Maine Dept. of Environmental Protection', ustProgramUrl: 'https://www.maine.gov/dep/waste/ust/', agencyPhone: '207-287-2651' },
  { name: 'Maryland', abbreviation: 'MD', regulatoryAgency: 'MDE - Maryland Dept. of the Environment, Oil Control Program', ustProgramUrl: 'https://mde.maryland.gov/programs/land/OilControl/', agencyPhone: '410-537-3442' },
  { name: 'Massachusetts', abbreviation: 'MA', regulatoryAgency: 'MassDEP - Dept. of Environmental Protection', ustProgramUrl: 'https://www.mass.gov/guides/massdep-underground-storage-tank-ust-program', agencyPhone: '617-292-5500' },
  { name: 'Michigan', abbreviation: 'MI', regulatoryAgency: 'LARA/EGLE - Bureau of Fire Services (compliance) / EGLE (remediation)', ustProgramUrl: 'https://www.michigan.gov/lara/bureau-list/bfs/storage-tanks/underground', agencyPhone: '517-335-7211' },
  { name: 'Minnesota', abbreviation: 'MN', regulatoryAgency: 'MPCA - Minnesota Pollution Control Agency', ustProgramUrl: 'https://www.pca.state.mn.us/business-with-us/underground-storage-tanks', agencyPhone: '651-296-6300' },
  { name: 'Mississippi', abbreviation: 'MS', regulatoryAgency: 'MDEQ - Mississippi Dept. of Environmental Quality, Groundwater Division', ustProgramUrl: 'https://www.mdeq.ms.gov/water/groundwater-assessment-and-remediation/underground-storage-tanks/', agencyPhone: '601-961-5171' },
  { name: 'Missouri', abbreviation: 'MO', regulatoryAgency: 'DNR - Missouri Dept. of Natural Resources, Tanks Compliance Section', ustProgramUrl: 'https://dnr.mo.gov/waste-recycling/business-industry/guidance-technical-assistance/underground-storage-tank-requirements', agencyPhone: '573-751-7929' },
  { name: 'Montana', abbreviation: 'MT', regulatoryAgency: 'DEQ - Montana Dept. of Environmental Quality, Tanks Division', ustProgramUrl: 'https://deq.mt.gov/twr/Programs/ust', agencyPhone: '406-444-5300' },
  { name: 'Nebraska', abbreviation: 'NE', regulatoryAgency: 'SFM - Nebraska State Fire Marshal (compliance) / NDEE (remediation)', ustProgramUrl: 'https://sfm.nebraska.gov/fuels-safety/underground-storage-tanks', agencyPhone: '402-471-2027' },
  { name: 'Nevada', abbreviation: 'NV', regulatoryAgency: 'NDEP - Nevada Division of Environmental Protection, Bureau of Corrective Actions', ustProgramUrl: 'https://ndep.nv.gov/land/underground-storage-tanks', agencyPhone: '775-687-9418' },
  { name: 'New Hampshire', abbreviation: 'NH', regulatoryAgency: 'DES - Dept. of Environmental Services, Waste Management Division', ustProgramUrl: 'https://www.des.nh.gov/business-and-community/fuel-storage-tanks', agencyPhone: '603-271-3503' },
  { name: 'New Jersey', abbreviation: 'NJ', regulatoryAgency: 'NJDEP - New Jersey Dept. of Environmental Protection', ustProgramUrl: 'https://dep.nj.gov/', agencyPhone: '609-292-2943' },
  { name: 'New Mexico', abbreviation: 'NM', regulatoryAgency: 'NMED - New Mexico Environment Dept., Petroleum Storage Tank Bureau', ustProgramUrl: 'https://www.env.nm.gov/petroleum_storage_tank/', agencyPhone: '505-476-4397' },
  { name: 'New York', abbreviation: 'NY', regulatoryAgency: 'DEC - New York Dept. of Environmental Conservation', ustProgramUrl: 'https://dec.ny.gov/environmental-protection/hazardous-substance-bulk-storage', agencyPhone: '518-402-9543' },
  { name: 'North Carolina', abbreviation: 'NC', regulatoryAgency: 'DEQ - North Carolina Dept. of Environmental Quality, UST Section', ustProgramUrl: 'https://www.deq.nc.gov/about/divisions/waste-management/underground-storage-tank-section', agencyPhone: '919-707-8171' },
  { name: 'North Dakota', abbreviation: 'ND', regulatoryAgency: 'NDDEQ - North Dakota Dept. of Environmental Quality, Waste Management Division', ustProgramUrl: 'https://deq.nd.gov/wm/UndergroundStorageTankProgram/', agencyPhone: '701-328-5166' },
  { name: 'Ohio', abbreviation: 'OH', regulatoryAgency: 'BUSTR - Bureau of Underground Storage Tank Regulations, State Fire Marshal', ustProgramUrl: 'https://sfmengage.com.ohio.gov/online-permit/', agencyPhone: '614-752-7938' },
  { name: 'Oklahoma', abbreviation: 'OK', regulatoryAgency: 'OCC - Oklahoma Corporation Commission, Petroleum Storage Tank Division', ustProgramUrl: 'https://oklahoma.gov/occ/divisions/petroleum-storage-tank.html', agencyPhone: '405-521-2481' },
  { name: 'Oregon', abbreviation: 'OR', regulatoryAgency: 'DEQ - Oregon Dept. of Environmental Quality, Tanks Program', ustProgramUrl: 'https://www.oregon.gov/deq/tanks/Pages/UST.aspx', agencyPhone: '503-229-5696' },
  { name: 'Pennsylvania', abbreviation: 'PA', regulatoryAgency: 'DEP - Pennsylvania Dept. of Environmental Protection, Storage Tanks Division', ustProgramUrl: 'https://www.pa.gov/agencies/dep/programs-and-services/land/storage-tanks', agencyPhone: '717-772-5599' },
  { name: 'Rhode Island', abbreviation: 'RI', regulatoryAgency: 'DEM - Dept. of Environmental Management, OLRSMM', ustProgramUrl: 'https://dem.ri.gov/environmental-protection-bureau/olrsmm/underground-storage-tank-management-program', agencyPhone: '401-222-2797' },
  { name: 'South Carolina', abbreviation: 'SC', regulatoryAgency: 'SCDES - South Carolina Dept. of Environmental Services (formerly DHEC)', ustProgramUrl: 'https://des.sc.gov/programs/bureau-land-waste-management/underground-storage-tanks/', agencyPhone: '803-898-0511' },
  { name: 'South Dakota', abbreviation: 'SD', regulatoryAgency: 'DANR - Dept. of Agriculture and Natural Resources', ustProgramUrl: 'https://danr.sd.gov/Agriculture/Inspection/StorageTanks/', agencyPhone: '605-773-3296' },
  { name: 'Tennessee', abbreviation: 'TN', regulatoryAgency: 'TDEC - Tennessee Dept. of Environment and Conservation, Division of USTs', ustProgramUrl: 'https://www.tn.gov/environment/ust.html', agencyPhone: '615-532-0945' },
  { name: 'Texas', abbreviation: 'TX', regulatoryAgency: 'TCEQ - Texas Commission on Environmental Quality', ustProgramUrl: 'https://www.tceq.texas.gov/permitting/registration/pst', agencyPhone: '512-239-2200' },
  { name: 'Utah', abbreviation: 'UT', regulatoryAgency: 'DEQ - Utah Dept. of Environmental Quality, DERR Division', ustProgramUrl: 'https://deq.utah.gov/environmental-response-and-remediation/', agencyPhone: '801-536-4100' },
  { name: 'Vermont', abbreviation: 'VT', regulatoryAgency: 'DEC - Vermont Dept. of Environmental Conservation', ustProgramUrl: 'https://dec.vermont.gov/waste-management/storage-tanks/underground-storage-tanks-usts', agencyPhone: '802-828-1138' },
  { name: 'Virginia', abbreviation: 'VA', regulatoryAgency: 'DEQ - Virginia Dept. of Environmental Quality', ustProgramUrl: 'https://www.deq.virginia.gov/land-waste/petroleum-tanks/underground-storage-tanks', agencyPhone: '804-698-4000' },
  { name: 'Washington', abbreviation: 'WA', regulatoryAgency: 'ECY - Dept. of Ecology, Toxics Cleanup Program', ustProgramUrl: 'https://ecology.wa.gov/spills-cleanup/contamination-cleanup/underground-storage-tanks', agencyPhone: '360-407-7170' },
  { name: 'West Virginia', abbreviation: 'WV', regulatoryAgency: 'DEP - West Virginia Dept. of Environmental Protection, Tanks Section', ustProgramUrl: 'https://dep.wv.gov/WWE/ee/tanks/ust/', agencyPhone: '304-926-0499' },
  { name: 'Wisconsin', abbreviation: 'WI', regulatoryAgency: 'DATCP - Dept. of Agriculture, Trade and Consumer Protection (compliance) / DNR (cleanup)', ustProgramUrl: 'https://datcp.wi.gov/Pages/Programs_Services/PetroleumHazStorageTanks.aspx', agencyPhone: '608-224-4500' },
  { name: 'Wyoming', abbreviation: 'WY', regulatoryAgency: 'WDEQ - Wyoming Dept. of Environmental Quality, Storage Tank Program', ustProgramUrl: 'https://deq.wyoming.gov/shwd/storage-tank/', agencyPhone: '307-777-7752' },
];

async function main() {
  console.log('Seeding states...');
  for (const state of statesData) {
    await prisma.state.upsert({
      where: { abbreviation: state.abbreviation },
      update: {
        regulatoryAgency: state.regulatoryAgency,
        ustProgramUrl: state.ustProgramUrl,
        agencyPhone: state.agencyPhone,
      },
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
