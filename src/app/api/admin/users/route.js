import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';

async function checkAdmin() {
  const session = await auth();
  if (!session || session.user?.role !== 'ADMIN') return false;
  return session;
}

export async function GET() {
  try {
    const session = await checkAdmin();
    if (!session) {
      return NextResponse.json({ message: 'Không có quyền truy cập' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        vipTier: true,
        points: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({ message: 'Lỗi server' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await checkAdmin();
    if (!session) {
      return NextResponse.json({ message: 'Không có quyền truy cập' }, { status: 403 });
    }

    const { name, email, password, role } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Vui lòng điền đầy đủ thông tin' }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'Email đã tồn tại trong hệ thống' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'USER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        vipTier: true,
        points: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ message: 'Tạo tài khoản thành công', user }, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ message: 'Lỗi server' }, { status: 500 });
  }
}
