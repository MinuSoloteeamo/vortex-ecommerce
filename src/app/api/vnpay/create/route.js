import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createVnPayUrl } from '@/lib/vnpay';

export async function POST(req) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ message: 'Thiếu orderId' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return NextResponse.json({ message: 'Không tìm thấy đơn hàng' }, { status: 404 });
    }

    // Lấy IP client
    let ipAddr = req.headers.get('x-forwarded-for') || '127.0.0.1';
    if (ipAddr.includes(',')) {
      ipAddr = ipAddr.split(',')[0];
    }

    const orderInfo = `Thanh toan don hang ${order.orderNumber}`;
    
    // Tạo URL VNPay
    const vnpUrl = createVnPayUrl(order.id, order.totalAmount, ipAddr, orderInfo);

    return NextResponse.json({ url: vnpUrl });
  } catch (error) {
    console.error('VNPay Create Error:', error);
    return NextResponse.json({ message: 'Lỗi tạo URL thanh toán' }, { status: 500 });
  }
}
