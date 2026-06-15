import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Lấy top khách hàng dựa trên tổng chi tiêu của các đơn hàng DELIVERED
    const topUsersQuery = await prisma.order.groupBy({
      by: ['userId'],
      where: {
        status: 'DELIVERED',
      },
      _sum: {
        totalAmount: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _sum: {
          totalAmount: 'desc'
        }
      },
      take: 10
    });

    // groupBy không trả về relation, nên phải lấy thông tin User thủ công
    const userIds = topUsersQuery.map(u => u.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true, role: true }
    });

    const results = topUsersQuery.map(group => {
      const user = users.find(u => u.id === group.userId);
      return {
        userId: group.userId,
        name: user?.name || 'Khách Vô Danh',
        email: user?.email || '',
        role: user?.role || 'USER',
        totalSpent: group._sum.totalAmount || 0,
        orderCount: group._count.id || 0
      };
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error('Fetch Top Customers Error:', error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
