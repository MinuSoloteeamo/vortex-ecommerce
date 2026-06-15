import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(addresses);
  } catch (error) {
    console.error('Addresses fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const { recipientName, phoneNumber, province, district, ward, street, isDefault } = data;

    // If this is set as default, remove default from others
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false }
      });
    }

    // Check if it's the first address, if so, make it default automatically
    const count = await prisma.address.count({ where: { userId: session.user.id } });
    const shouldBeDefault = count === 0 ? true : isDefault;

    const newAddress = await prisma.address.create({
      data: {
        userId: session.user.id,
        recipientName,
        phoneNumber,
        province,
        district,
        ward,
        street,
        isDefault: shouldBeDefault || false
      }
    });

    return NextResponse.json(newAddress, { status: 201 });
  } catch (error) {
    console.error('Address create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
