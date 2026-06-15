import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// Lấy danh sách thông báo
export async function GET(req) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user;
    let notifications = [];

    if (user.role === 'ADMIN') {
      // Admin thấy thông báo của ADMIN và thông báo cá nhân (nếu có)
      notifications = await prisma.notification.findMany({
        where: {
          OR: [
            { targetRole: 'ADMIN' },
            { userId: user.id }
          ]
        },
        orderBy: { createdAt: 'desc' },
        take: 50 // Lấy 50 cái gần nhất
      });
    } else {
      // User thường chỉ thấy thông báo của mình
      notifications = await prisma.notification.findMany({
        where: {
          userId: user.id,
          targetRole: 'USER'
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      });
    }

    // Phân loại unread
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error('API /notifications GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Đánh dấu đã đọc
export async function PATCH(req) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user;
    const body = await req.json();
    const { notificationId, markAll } = body;

    if (markAll) {
      // Đánh dấu đọc tất cả
      if (user.role === 'ADMIN') {
        await prisma.notification.updateMany({
          where: {
            OR: [
              { targetRole: 'ADMIN' },
              { userId: user.id }
            ],
            isRead: false
          },
          data: { isRead: true }
        });
      } else {
        await prisma.notification.updateMany({
          where: {
            userId: user.id,
            targetRole: 'USER',
            isRead: false
          },
          data: { isRead: true }
        });
      }
    } else if (notificationId) {
      // Đánh dấu 1 cái
      // Verify quyền sở hữu
      const notif = await prisma.notification.findUnique({ where: { id: notificationId } });
      if (!notif) return NextResponse.json({ error: 'Not found' }, { status: 404 });

      if (notif.targetRole === 'ADMIN' && user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      if (notif.targetRole === 'USER' && notif.userId !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API /notifications PATCH Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
