import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const customerId = session.user.customer?.id;
    if (!customerId) return NextResponse.json({ error: 'No customer profile' }, { status: 400 });
    const { companyName, phone } = await request.json();
    if (!companyName || typeof companyName !== 'string' || companyName.trim().length === 0) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }
    const customer = await prisma.customer.update({
      where: { id: customerId },
      data: { companyName: companyName.trim(), phone: phone?.trim() || null },
    });
    return NextResponse.json({ customer });
  } catch (error) {
    console.error('Settings company error:', error);
    return NextResponse.json({ error: 'Failed to update company information' }, { status: 500 });
  }
}
