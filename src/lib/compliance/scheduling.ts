import { prisma } from '@/lib/prisma';

/**
 * Generate compliance schedule for a facility based on its tanks,
 * state rules, and federal EPA rules.
 */
export async function generateComplianceSchedule(facilityId: string): Promise<void> {
  const facility = await prisma.facility.findUnique({
    where: { id: facilityId },
    include: {
      tanks: true,
      state: {
        include: { complianceRules: { where: { isActive: true } } },
      },
    },
  });

  if (!facility) {
    throw new Error(`Facility ${facilityId} not found`);
  }

  // Get federal (EPA) rules
  const federalRules = await prisma.complianceRule.findMany({
    where: { stateId: null, ruleSource: 'EPA', isActive: true },
  });

  // Combine state + federal rules
  const allRules = [...federalRules, ...facility.state.complianceRules];

  // Equipment types that apply at the facility level (one item per facility, not per tank).
  // OPERATOR: training, certification, retraining — applies to people, not individual tanks.
  // FINANCIAL: tank fees, insurance, fund participation — one obligation per facility.
  const FACILITY_LEVEL_EQUIPMENT = new Set(['OPERATOR', 'FINANCIAL']);

  for (const rule of allRules) {
    if (!rule.frequencyMonths && !rule.frequencyDays) {
      continue; // Skip one-time / as-needed rules for automatic scheduling
    }

    const isFacilityLevel = FACILITY_LEVEL_EQUIPMENT.has(rule.equipmentType ?? '');

    // Facility-level rules: create one item per facility (not per tank)
    if (isFacilityLevel) {
      const existing = await prisma.complianceItem.findFirst({
        where: { facilityId, ruleId: rule.id, tankId: null, status: { not: 'COMPLETED' } },
      });

      if (!existing) {
        const dueDate = calculateDueDate(rule.frequencyMonths, rule.frequencyDays);
        await prisma.complianceItem.create({
          data: {
            facilityId,
            ruleId: rule.id,
            itemType: mapCategoryToItemType(rule.category),
            description: rule.description,
            dueDate,
            status: 'UPCOMING',
          },
        });
      }
      continue;
    }

    // Tank-specific rules: determine which tanks this rule applies to
    const applicableTanks = facility.tanks.filter((tank) => {
      if (rule.appliesToMaterial && tank.material !== rule.appliesToMaterial) return false;
      if (rule.appliesToLeakDetection && tank.leakDetectionMethod !== rule.appliesToLeakDetection) return false;
      if (rule.appliesToCorrosionProtection && tank.corrosionProtectionType !== rule.appliesToCorrosionProtection) return false;
      return true;
    });

    // If no tanks match but rule has no filters, create one facility-level item
    if (applicableTanks.length === 0 && !rule.appliesToMaterial && !rule.appliesToLeakDetection && !rule.appliesToCorrosionProtection) {
      const existing = await prisma.complianceItem.findFirst({
        where: { facilityId, ruleId: rule.id, tankId: null, status: { not: 'COMPLETED' } },
      });

      if (!existing) {
        const dueDate = calculateDueDate(rule.frequencyMonths, rule.frequencyDays);
        await prisma.complianceItem.create({
          data: {
            facilityId,
            ruleId: rule.id,
            itemType: mapCategoryToItemType(rule.category),
            description: rule.description,
            dueDate,
            status: 'UPCOMING',
          },
        });
      }
    }

    // For each matching tank, create one item per tank
    for (const tank of applicableTanks) {
      const existing = await prisma.complianceItem.findFirst({
        where: { facilityId, ruleId: rule.id, tankId: tank.id, status: { not: 'COMPLETED' } },
      });

      if (!existing) {
        const dueDate = calculateDueDate(rule.frequencyMonths, rule.frequencyDays);
        await prisma.complianceItem.create({
          data: {
            facilityId,
            tankId: tank.id,
            ruleId: rule.id,
            itemType: mapCategoryToItemType(rule.category),
            description: rule.description,
            dueDate,
            status: 'UPCOMING',
          },
        });
      }
    }
  }
}

/**
 * Generate the next occurrence of a recurring compliance item
 * after it has been completed.
 */
export async function generateNextOccurrence(complianceItemId: string): Promise<void> {
  const item = await prisma.complianceItem.findUnique({
    where: { id: complianceItemId },
    include: { rule: true },
  });

  if (!item || !item.rule) return;

  const { rule } = item;
  if (!rule.frequencyMonths && !rule.frequencyDays) return;

  const dueDate = calculateDueDate(rule.frequencyMonths, rule.frequencyDays);

  await prisma.complianceItem.create({
    data: {
      facilityId: item.facilityId,
      tankId: item.tankId,
      ruleId: item.ruleId,
      itemType: item.itemType,
      description: item.description,
      dueDate,
      status: 'UPCOMING',
    },
  });
}

/**
 * Update statuses of compliance items based on their due dates.
 * Called periodically (e.g., daily cron).
 */
export async function updateComplianceStatuses(): Promise<number> {
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Mark overdue items
  const overdueResult = await prisma.complianceItem.updateMany({
    where: {
      status: { in: ['UPCOMING', 'DUE_SOON'] },
      dueDate: { lt: now },
    },
    data: { status: 'OVERDUE' },
  });

  // Mark due soon items (within 30 days)
  const dueSoonResult = await prisma.complianceItem.updateMany({
    where: {
      status: 'UPCOMING',
      dueDate: { gte: now, lte: thirtyDaysFromNow },
    },
    data: { status: 'DUE_SOON' },
  });

  return overdueResult.count + dueSoonResult.count;
}

/**
 * Get compliance summary for all items across the system.
 */
export async function getComplianceSummary() {
  const items = await prisma.complianceItem.groupBy({
    by: ['status'],
    _count: { status: true },
  });

  const summary: Record<string, number> = {};
  for (const item of items) {
    summary[item.status] = item._count.status;
  }
  return summary;
}

/**
 * Get compliance summary for a specific customer.
 */
export async function getCustomerComplianceSummary(customerId: string) {
  const items = await prisma.complianceItem.groupBy({
    by: ['status'],
    where: { facility: { customerId } },
    _count: { status: true },
  });

  const summary: Record<string, number> = {};
  for (const item of items) {
    summary[item.status] = item._count.status;
  }
  return summary;
}

function calculateDueDate(frequencyMonths: number | null, frequencyDays: number | null): Date {
  const now = new Date();
  if (frequencyMonths) {
    const target = new Date(now);
    const originalDay = target.getDate();
    target.setMonth(target.getMonth() + frequencyMonths);
    // Handle month overflow (e.g., Jan 31 + 1 month should be Feb 28, not Mar 3)
    if (target.getDate() !== originalDay) {
      target.setDate(0); // Set to last day of previous month
    }
    return target;
  } else if (frequencyDays) {
    return new Date(now.getTime() + frequencyDays * 24 * 60 * 60 * 1000);
  }
  return now;
}

function mapCategoryToItemType(category: string): 'INSPECTION' | 'TEST' | 'CERTIFICATION' | 'TRAINING' | 'DOCUMENTATION' | 'REPORTING' | 'FINANCIAL' | 'CLOSURE' {
  switch (category) {
    case 'INSPECTION': return 'INSPECTION';
    case 'TESTING': return 'TEST';
    case 'CERTIFICATION': return 'CERTIFICATION';
    case 'TRAINING': return 'TRAINING';
    case 'REPORTING': return 'REPORTING';
    case 'FINANCIAL': return 'FINANCIAL';
    case 'CLOSURE': return 'CLOSURE';
    case 'DOCUMENTATION':
    default: return 'DOCUMENTATION';
  }
}
