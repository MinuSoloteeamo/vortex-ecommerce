import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(req) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Check if notification already sent today to prevent spam
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingNotif = await prisma.notification.findFirst({
      where: {
        userId,
        type: 'CART_REMINDER',
        createdAt: { gte: today }
      }
    });

    if (existingNotif) {
      return NextResponse.json({ error: 'Đã gửi nhắc nhở cho người dùng này hôm nay rồi!' }, { status: 400 });
    }

    // Create Notification
    await prisma.notification.create({
      data: {
        userId,
        type: 'CART_REMINDER',
        title: 'Giỏ hàng của bạn đang chờ!',
        message: 'Bạn có sản phẩm chưa thanh toán trong giỏ hàng. Nhanh tay hoàn tất thanh toán trước khi hết hàng nhé!',
        link: '/cart',
        isRead: false
      }
    });

    return NextResponse.json({ success: true, message: 'Đã gửi nhắc nhở thành công!' });
  } catch (error) {
    console.error('Remind Cart Error:', error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
