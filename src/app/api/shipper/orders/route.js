import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { createUserNotification } from '@/lib/notification';

export async function GET(req) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== 'SHIPPER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const orders = await prisma.order.findMany({
      where: { status: 'SHIPPING' },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        recipientName: true,
        recipientPhone: true,
        shippingAddress: true,
        note: true,
        totalAmount: true,
        paymentMethod: true,
        status: true,
      }
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching shipper orders:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== 'SHIPPER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { orderId, status, cancelReason } = body;

    if (!orderId || !status) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    // Fetch current order to check payment method
    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!currentOrder) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { 
        status,
        cancelReason: cancelReason || null,
        paymentStatus: status === 'DELIVERED' && currentOrder.paymentMethod === 'COD' ? 'PAID' : undefined
      }
    });

    // Send notification to customer
    if (status === 'DELIVERED') {
      await createUserNotification(
        updatedOrder.userId,
        `📦 Giao hàng thành công!`,
        `Đơn hàng ${updatedOrder.orderNumber} của bạn đã được giao thành công. Cảm ơn bạn đã mua sắm tại VORTEX!`,
        'ORDER_DELIVERED',
        `/account/orders/${updatedOrder.id}`
      );
    } else if (status === 'FAILED_DELIVERY') {
      await createUserNotification(
        updatedOrder.userId,
        `❌ Giao hàng thất bại`,
        `Đơn hàng ${updatedOrder.orderNumber} giao thất bại. Lý do: ${cancelReason}. Vui lòng liên hệ CSKH.`,
        'ORDER_FAILED',
        `/account/orders/${updatedOrder.id}`
      );
    }

    return NextResponse.json({ message: 'Updated successfully', order: updatedOrder });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
