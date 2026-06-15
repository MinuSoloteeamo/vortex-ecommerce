import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(req) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit')) || 20;

    const history = await prisma.pointHistory.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { points: true, vipTier: true }
    });

    return NextResponse.json({ history, user }, { status: 200 });
  } catch (error) {
    console.error('Points API Error:', error);
    return NextResponse.json({ message: 'Lỗi server' }, { status: 500 });
  }
}
