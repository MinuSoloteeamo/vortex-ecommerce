import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

async function checkAdmin() {
  const session = await auth();
  if (!session || session.user?.role !== 'ADMIN') return false;
  return session;
}

export async function PATCH(req, { params }) {
  try {
    const session = await checkAdmin();
    if (!session) {
      return NextResponse.json({ message: 'Không có quyền truy cập' }, { status: 403 });
    }

    const { id } = await params;
    const { role } = await req.json();

    if (!role || !['ADMIN', 'SHIPPER', 'USER'].includes(role)) {
      return NextResponse.json({ message: 'Vai trò không hợp lệ' }, { status: 400 });
    }

    // Prevent changing your own role
    if (session.user.id === id) {
      return NextResponse.json({ message: 'Không thể tự đổi quyền của chính mình' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ message: `Cập nhật quyền thành ${role} thành công`, user: updatedUser });
  } catch (error) {
    console.error('Update user role error:', error);
    return NextResponse.json({ message: 'Lỗi server' }, { status: 500 });
  }
}
