import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOrderConfirmationEmail } from '@/lib/mail';

export async function POST(req) {
  try {
    const { orderId } = await req.json();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: {
          include: { product: true }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ message: 'Không tìm thấy đơn hàng' }, { status: 404 });
    }

    if (order.paymentStatus !== 'PAID') {
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'PAID', status: 'PROCESSING' }
      });

      const userEmail = order.user?.email;
      if (userEmail) {
        // Gửi email không đồng bộ để không block response
        sendOrderConfirmationEmail(userEmail, order, order.items).catch(console.error);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mock VNPay Error:', error);
    return NextResponse.json({ message: 'Lỗi server' }, { status: 500 });
  }
}
