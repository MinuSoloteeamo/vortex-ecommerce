import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { createUserNotification } from '@/lib/notification';

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { couponId } = body;

    if (!couponId) {
      return NextResponse.json({ message: 'Thiếu thông tin mã giảm giá' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // ... same logic inside transaction
      const user = await tx.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, points: true }
      });

      const coupon = await tx.coupon.findUnique({
        where: { id: couponId }
      });

      if (!coupon || !coupon.isActive || !coupon.costInPoints) {
        throw new Error('Mã giảm giá không hợp lệ hoặc không thể đổi');
      }

      if (coupon.usedCount >= coupon.maxUsage) {
        throw new Error('Mã giảm giá đã hết lượt đổi');
      }

      if (new Date() > new Date(coupon.validUntil)) {
        throw new Error('Mã giảm giá đã hết hạn');
      }

      if (user.points < coupon.costInPoints) {
        throw new Error('Không đủ điểm để đổi mã này');
      }

      // Deduct points
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { points: { decrement: coupon.costInPoints } }
      });

      const discountText = coupon.discountPercent ? `${coupon.discountPercent}%` : `${new Intl.NumberFormat('vi-VN').format(coupon.discountAmount)}đ`;

      // Record history
      await tx.pointHistory.create({
        data: {
          userId: user.id,
          points: -coupon.costInPoints,
          type: 'REDEEM_COUPON',
          description: `Đổi mã giảm giá ${discountText} (Mã: ${coupon.code})`
        }
      });

      return { success: true, code: coupon.code, pointsRemaining: updatedUser.points, cost: coupon.costInPoints };
    });

    if (result.success) {
      await createUserNotification(
        session.user.id,
        'Đổi thưởng thành công',
        `Bạn đã đổi ${result.cost} điểm lấy mã giảm giá: ${result.code}`,
        'POINTS_REDEEMED',
        '/account/vip'
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Exchange API Error:', error);
    return NextResponse.json({ message: error.message || 'Lỗi server' }, { status: 500 });
  }
}
