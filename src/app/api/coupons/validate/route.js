import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(req) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Vui lòng đăng nhập' }, { status: 401 });
    }

    const { code, totalValue } = await req.json();

    if (!code) {
      return NextResponse.json({ message: 'Vui lòng nhập mã giảm giá' }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ message: 'Mã giảm giá không tồn tại hoặc đã bị khóa' }, { status: 404 });
    }

    if (new Date() > new Date(coupon.validUntil)) {
      return NextResponse.json({ message: 'Mã giảm giá đã hết hạn' }, { status: 400 });
    }

    if (coupon.usedCount >= coupon.maxUsage) {
      return NextResponse.json({ message: 'Mã giảm giá đã hết lượt sử dụng' }, { status: 400 });
    }

    if (totalValue < coupon.minOrderValue) {
      return NextResponse.json({ 
        message: `Mã này chỉ áp dụng cho đơn từ ${new Intl.NumberFormat('vi-VN').format(coupon.minOrderValue)}đ` 
      }, { status: 400 });
    }

    // Check if user already used this coupon
    const usedByUser = await prisma.order.findFirst({
      where: {
        userId: session.user.id,
        couponCode: coupon.code,
        status: { not: 'CANCELLED' }
      }
    });

    if (usedByUser) {
      return NextResponse.json({ message: 'Bạn đã sử dụng mã giảm giá này rồi' }, { status: 400 });
    }

    // Return the discount details
    return NextResponse.json({
      message: 'Áp dụng mã thành công',
      coupon: {
        code: coupon.code,
        discountPercent: coupon.discountPercent,
        discountAmount: coupon.discountAmount
      }
    });

  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json({ message: 'Lỗi server' }, { status: 500 });
  }
}
