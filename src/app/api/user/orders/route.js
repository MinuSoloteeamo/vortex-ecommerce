import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    console.log('--- API /api/user/orders ---');
    console.log('Session User ID:', session.user.id);
    console.log('Session User Email:', session.user.email);
    console.log('Status param:', status);

    const whereClause = { userId: session.user.id };
    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const userReviews = await prisma.review.findMany({
      where: { userId: session.user.id },
      select: { orderId: true, productId: true }
    });
    
    // Tạo mảng string "orderId_productId" để dễ check ở FE
    const reviewedItems = userReviews.map(r => `${r.orderId}_${r.productId}`);

    return NextResponse.json({ orders, reviewedItems });
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
