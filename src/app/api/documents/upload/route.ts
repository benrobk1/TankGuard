import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const customerId = session.user.customer?.id;
    if (!customerId) {
      return NextResponse.json({ error: 'No customer profile' }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const facilityId = formData.get('facilityId') as string | null;
    const tankId = formData.get('tankId') as string | null;
    const complianceItemId = formData.get('complianceItemId') as string | null;
    const documentType = formData.get('documentType') as string | null;
    const notes = formData.get('notes') as string | null;
    const expirationDate = formData.get('expirationDate') as string | null;

    if (!file || !facilityId || !documentType) {
      return NextResponse.json(
        { error: 'file, facilityId, and documentType are required' },
        { status: 400 },
      );
    }

    // Validate file type
    const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv', 'text/plain'];
    const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.txt'];
    const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json({ error: `File type ${ext} not allowed. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}` }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 25MB limit' }, { status: 400 });
    }

    // Verify facility belongs to customer
    const facility = await prisma.facility.findFirst({
      where: { id: facilityId, customerId },
    });
    if (!facility) {
      return NextResponse.json({ error: 'Facility not found' }, { status: 404 });
    }

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${timestamp}_${sanitizedName}`;
    const filePath = path.join(uploadDir, fileName);

    // Write file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/uploads/${fileName}`;

    // Save document record
    const document = await prisma.document.create({
      data: {
        facilityId,
        tankId: tankId || null,
        complianceItemId: complianceItemId || null,
        documentType: documentType as Parameters<typeof prisma.document.create>[0]['data']['documentType'],
        fileName: file.name,
        fileUrl,
        fileSize: file.size,
        mimeType: file.type || null,
        expirationDate: expirationDate ? new Date(expirationDate) : null,
        notes: notes || null,
      },
      include: {
        facility: { select: { id: true, name: true } },
        tank: { select: { id: true, tankNumber: true } },
      },
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
  }
}
