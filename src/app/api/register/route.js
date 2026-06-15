import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Vui lòng điền đầy đủ thông tin' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ message: 'Email đã được sử dụng' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      }
    });

    const { createUserNotification } = await import('@/lib/notification');
    await createUserNotification(
      user.id,
      '🎉 Chào mừng bạn gia nhập VORTEX!',
      `Cảm ơn ${user.name} đã đăng ký tài khoản. Bắt đầu khám phá và mua sắm ngay hôm nay nhé!`,
      'WELCOME',
      '/'
    );

    return NextResponse.json({ message: 'Đăng ký thành công', user: { id: user.id, name: user.name, email: user.email } }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'Đã xảy ra lỗi khi đăng ký' }, { status: 500 });
  }
}
