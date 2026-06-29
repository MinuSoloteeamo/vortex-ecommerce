import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(req) {
  try {
    const session = await auth();
    if (!session || !session.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { orderId, reason } = await req.json();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!order || order.userId !== session.user.id) {
      return NextResponse.json({ message: 'Không tìm thấy đơn hàng' }, { status: 404 });
    }

    if (order.status !== 'PENDING') {
      return NextResponse.json({ message: 'Không thể hủy đơn hàng ở trạng thái này' }, { status: 400 });
    }

    // Cập nhật trạng thái và lý do hủy
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
        cancelReason: reason || 'Khách hàng hủy không nêu lý do'
      }
    });

    // Hoàn lại số lượng tồn kho (stock)
    for (const item of order.items) {
      if (item.variantId) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } }
        });
      }
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: { increment: item.variantId ? 0 : item.quantity },
          soldCount: { decrement: item.quantity }
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cancel order error:', error);
    return NextResponse.json({ message: 'Lỗi server' }, { status: 500 });
  }
}
