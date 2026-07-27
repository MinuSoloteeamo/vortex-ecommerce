import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { createUserNotification } from '@/lib/notification';

export async function POST(req) {
  try {
    // 1. Kiểm tra xác thực người dùng đã đăng nhập chưa
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { couponId } = body;

    if (!couponId) {
      return NextResponse.json({ message: 'Thiếu thông tin mã giảm giá' }, { status: 400 });
    }

    // 2. Thực hiện giao dịch an toàn (Transaction) để trừ điểm và đổi mã
    const result = await prisma.$transaction(async (tx) => {
      // 2a. Lấy điểm hiện tại của người dùng
      const user = await tx.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, points: true }
      });

      // 2b. Lấy thông tin mã giảm giá muốn đổi
      const coupon = await tx.coupon.findUnique({
        where: { id: couponId }
      });

      // 2c. Kiểm tra điều kiện tính hợp lệ của mã
      if (!coupon || !coupon.isActive || !coupon.costInPoints) {
        throw new Error('Mã giảm giá không hợp lệ hoặc không thể đổi');
      }

      // Kiểm tra xem mã đã hết tổng số lượt sử dụng chưa
      if (coupon.usedCount >= coupon.maxUsage) {
        throw new Error('Mã giảm giá đã hết lượt đổi');
      }

      // Kiểm tra xem mã đã hết hạn chưa
      if (new Date() > new Date(coupon.validUntil)) {
        throw new Error('Mã giảm giá đã hết hạn');
      }

      // Kiểm tra xem điểm của người dùng có đủ để đổi mã này không
      if (user.points < coupon.costInPoints) {
        throw new Error('Không đủ điểm để đổi mã này');
      }

      // 2d. Khấu trừ điểm của người dùng (Giảm số điểm tương ứng với costInPoints)
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { points: { decrement: coupon.costInPoints } }
      });

      // Định dạng chuỗi hiển thị mức giảm giá (% hoặc số tiền VND)
      const discountText = coupon.discountPercent ? `${coupon.discountPercent}%` : `${new Intl.NumberFormat('vi-VN').format(coupon.discountAmount)}đ`;

      // 2e. Ghi nhận lịch sử biến động điểm (PointHistory)
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

    // 3. Gửi thông báo đến người dùng sau khi đổi điểm thành công
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
    console.error('Lỗi khi đổi mã giảm giá bằng điểm:', error);
    return NextResponse.json({ message: error.message || 'Lỗi server' }, { status: 500 });
  }
}
