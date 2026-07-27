import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { createUserNotification } from '@/lib/notification';

export async function POST() {
  try {
    // 1. Kiểm tra xác thực người dùng đã đăng nhập chưa
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // 2. Lấy thông tin ngày sinh (dob) của người dùng từ DB
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, dob: true, name: true }
    });

    if (!user || !user.dob) {
      return NextResponse.json({ message: 'Chưa cấu hình ngày sinh' });
    }

    const today = new Date();
    const dob = new Date(user.dob);
    
    // 3. Kiểm tra xem hôm nay có phải sinh nhật người dùng không (trùng tháng và ngày)
    if (today.getMonth() === dob.getMonth() && today.getDate() === dob.getDate()) {
      const currentYear = today.getFullYear();
      
      // 4. Kiểm tra xem năm nay người dùng đã nhận quà sinh nhật chưa
      // Tìm trong bảng PointHistory xem có lịch sử nhận thưởng sinh nhật (BONUS_BIRTHDAY) trong năm nay chưa
      const startOfYear = new Date(currentYear, 0, 1);
      const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

      const existingBonus = await prisma.pointHistory.findFirst({
        where: {
          userId: user.id,
          type: 'BONUS_BIRTHDAY',
          createdAt: {
            gte: startOfYear,
            lte: endOfYear
          }
        }
      });

      if (!existingBonus) {
        // 5. Cộng 500 điểm thưởng sinh nhật!
        const bonusPoints = 500;
        
        // Thực hiện transaction: Tăng điểm user và tạo lịch sử cộng điểm
        await prisma.$transaction([
          prisma.user.update({
            where: { id: user.id },
            data: { points: { increment: bonusPoints } }
          }),
          prisma.pointHistory.create({
            data: {
              userId: user.id,
              points: bonusPoints,
              type: 'BONUS_BIRTHDAY',
              description: `Quà tặng sinh nhật năm ${currentYear}`
            }
          })
        ]);

        // 6. Gửi thông báo chúc mừng sinh nhật cho người dùng
        await createUserNotification(
          user.id,
          '🎂 Chúc mừng sinh nhật!',
          `VORTEX chúc ${user.name} một ngày sinh nhật thật tuyệt vời! Hệ thống đã gửi tặng bạn ${bonusPoints} V-Points như một món quà nhỏ.`,
          'BIRTHDAY',
          '/account/vip'
        );

        return NextResponse.json({ message: 'Đã nhận thưởng sinh nhật thành công!' });
      } else {
        return NextResponse.json({ message: 'Đã nhận thưởng sinh nhật trong năm nay rồi' });
      }
    }

    return NextResponse.json({ message: 'Hôm nay không phải sinh nhật' });
  } catch (error) {
    console.error('Lỗi khi kiểm tra thưởng sinh nhật:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
