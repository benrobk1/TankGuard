import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { generateAuditPdf } from '@/lib/reports/audit-pdf';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const customerId = session.user.customer?.id;
    if (!customerId) {
      return new Response(JSON.stringify({ error: 'No customer profile' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { facilityId } = await request.json();

    if (!facilityId) {
      return new Response(JSON.stringify({ error: 'facilityId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify facility belongs to customer
    const facility = await prisma.facility.findFirst({
      where: { id: facilityId, customerId },
      include: { state: true },
    });
    if (!facility) {
      return new Response(JSON.stringify({ error: 'Facility not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get tank inventory
    const tanks = await prisma.tank.findMany({
      where: { facilityId },
      orderBy: { tankNumber: 'asc' },
    });

    // Get all compliance items
    const complianceItems = await prisma.complianceItem.findMany({
      where: { facilityId },
      include: {
        tank: { select: { id: true, tankNumber: true } },
        rule: { select: { id: true, citation: true, inspectionType: true, description: true } },
      },
      orderBy: { dueDate: 'asc' },
    });

    // Get operators
    const operators = await prisma.operator.findMany({
      where: { facilityId },
      orderBy: { name: 'asc' },
    });

    const complianceSummary = {
      total: complianceItems.length,
      upcoming: complianceItems.filter((i) => i.status === 'UPCOMING').length,
      dueSoon: complianceItems.filter((i) => i.status === 'DUE_SOON').length,
      overdue: complianceItems.filter((i) => i.status === 'OVERDUE').length,
      completed: complianceItems.filter((i) => i.status === 'COMPLETED').length,
      waived: complianceItems.filter((i) => i.status === 'WAIVED').length,
    };

    const auditData = {
      generatedAt: new Date().toISOString(),
      facility,
      tanks: tanks.map((t) => ({
        ...t,
        material: t.material as string,
        productStored: t.productStored as string,
        status: t.status as string,
        leakDetectionMethod: t.leakDetectionMethod as string,
        corrosionProtectionType: t.corrosionProtectionType as string | null,
        installationDate: t.installationDate?.toISOString() ?? null,
      })),
      complianceSummary,
      complianceItems: complianceItems.map((i) => ({
        ...i,
        dueDate: i.dueDate.toISOString(),
        status: i.status as string,
        completedDate: i.completedDate?.toISOString() ?? null,
      })),
      operators: operators.map((o) => ({
        ...o,
        operatorClass: o.operatorClass as string,
        certificationDate: o.certificationDate?.toISOString() ?? null,
        certificationExpiration: o.certificationExpiration?.toISOString() ?? null,
      })),
    };

    const pdfBuffer = await generateAuditPdf(auditData);

    const safeFilename = facility.name.replace(/[^a-zA-Z0-9-_]/g, '_');

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="TankGuard_Audit_${safeFilename}_${new Date().toISOString().split('T')[0]}.pdf"`,
        'Content-Length': String(pdfBuffer.length),
      },
    });
  } catch (error) {
    console.error('Audit PDF error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate PDF' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
