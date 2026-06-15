import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { createUserNotification } from '@/lib/notification';

export async function POST() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, dob: true, name: true }
    });

    if (!user || !user.dob) {
      return NextResponse.json({ message: 'No birthday configured' });
    }

    const today = new Date();
    const dob = new Date(user.dob);
    
    // Check if today is their birthday (same month and day)
    if (today.getMonth() === dob.getMonth() && today.getDate() === dob.getDate()) {
      const currentYear = today.getFullYear();
      
      // Check if we already gave them a birthday gift this year
      // We look at pointHistories with type BONUS_BIRTHDAY created this year
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
        // Give 500 birthday points!
        const bonusPoints = 500;
        
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

        await createUserNotification(
          user.id,
          '🎂 Chúc mừng sinh nhật!',
          `VORTEX chúc ${user.name} một ngày sinh nhật thật tuyệt vời! Hệ thống đã gửi tặng bạn ${bonusPoints} V-Points như một món quà nhỏ.`,
          'BIRTHDAY',
          '/account/vip'
        );

        return NextResponse.json({ message: 'Birthday bonus granted!' });
      } else {
        return NextResponse.json({ message: 'Birthday bonus already granted this year' });
      }
    }

    return NextResponse.json({ message: 'Not birthday today' });
  } catch (error) {
    console.error('Birthday Check Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
