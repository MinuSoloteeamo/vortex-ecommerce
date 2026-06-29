import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function PUT(req) {
  try {
    const session = await auth();

    // Bảo mật: Kiểm tra role ADMIN
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Không có quyền truy cập' }, { status: 403 });
    }

    const { orderId, status, cancelReason } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json({ message: 'Thiếu thông tin' }, { status: 400 });
    }

    const updateData = { status };
    if (status === 'CANCELLED' && cancelReason) {
      updateData.cancelReason = cancelReason;
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData
    });

    // Notify User
    const { createUserNotification } = await import('@/lib/notification');
    let title = 'Cập nhật đơn hàng';
    let message = `Đơn hàng ${updatedOrder.orderNumber} của bạn đã thay đổi trạng thái thành: ${status}.`;
    
    if (status === 'CONFIRMED') {
      title = '✅ Đơn hàng đã được xác nhận';
      message = `Đơn hàng ${updatedOrder.orderNumber} của bạn đã được xác nhận và đang được chuẩn bị.`;
    } else if (status === 'SHIPPING') {
      title = '🚚 Đơn hàng đang được giao';
      message = `Đơn hàng ${updatedOrder.orderNumber} đã được bàn giao cho đơn vị vận chuyển.`;
    } else if (status === 'DELIVERED') {
      title = '🎉 Giao hàng thành công - Chờ đánh giá';
      message = `Đơn hàng ${updatedOrder.orderNumber} đã được giao. Hãy chia sẻ cảm nhận và đánh giá sản phẩm ngay nhé!`;
    } else if (status === 'CANCELLED') {
      title = '❌ Đơn hàng đã bị hủy';
      message = `Đơn hàng ${updatedOrder.orderNumber} đã bị hủy. ${cancelReason ? 'Lý do: ' + cancelReason : ''}`;
    }

    await createUserNotification(
      updatedOrder.userId,
      title,
      message,
      'ORDER_STATUS',
      `/account/orders`
    );

    // Gửi thông báo cho tất cả Shipper khi có đơn hàng mới cần giao
    if (status === 'SHIPPING') {
      const shippers = await prisma.user.findMany({
        where: { role: 'SHIPPER' },
        select: { id: true }
      });
      
      const shipperNotifications = shippers.map(shipper => 
        createUserNotification(
          shipper.id,
          '📦 Có đơn hàng mới cần giao!',
          `Đơn hàng mã ${updatedOrder.orderNumber} vừa được chuyển sang trạng thái chờ giao.`,
          'NEW_DELIVERY',
          '/shipper'
        )
      );
      
      await Promise.all(shipperNotifications);
    }

    return NextResponse.json({ message: 'Cập nhật thành công', order: updatedOrder });
  } catch (error) {
    console.error('Update order status error:', error);
    return NextResponse.json({ message: 'Lỗi server' }, { status: 500 });
  }
}
