import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(req, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const data = await req.json();
    const { recipientName, phoneNumber, province, district, ward, street, isDefault } = data;

    // Verify ownership
    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false }
      });
    }

    const updated = await prisma.address.update({
      where: { id },
      data: {
        recipientName,
        phoneNumber,
        province,
        district,
        ward,
        street,
        isDefault
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Address update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    
    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.address.delete({ where: { id } });

    // If deleted was default, make the newest remaining one default
    if (existing.isDefault) {
      const newest = await prisma.address.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' }
      });
      if (newest) {
        await prisma.address.update({
          where: { id: newest.id },
          data: { isDefault: true }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Address delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
