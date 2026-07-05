import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const { orderId, productId, rating, comment } = data;

    // Check if order exists and is delivered
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order || order.userId !== session.user.id || order.status !== 'DELIVERED') {
      return NextResponse.json({ error: 'Invalid order for review' }, { status: 400 });
    }

    // Check if user already reviewed this product in THIS order
    const existing = await prisma.review.findFirst({
      where: {
        userId: session.user.id,
        productId: productId,
        orderId: orderId
      }
    });

    if (existing) {
      return NextResponse.json({ error: 'Bạn đã đánh giá sản phẩm này trong đơn hàng này rồi' }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        productId,
        orderId,
        rating: parseInt(rating),
        comment
      }
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Review create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
