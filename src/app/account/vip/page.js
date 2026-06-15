import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import VIPDashboard from './VIPDashboard';

export const metadata = {
  title: 'V-Rewards - Hệ thống Thành viên | VORTEX',
  description: 'Quản lý điểm thưởng, hạng thành viên và đổi quà VORTEX',
};

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function VIPPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/?login=true');
  }

  // Lấy thông tin user mới nhất
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { points: true, vipTier: true, name: true, createdAt: true }
  });

  // Lấy lịch sử điểm
  const pointHistory = await prisma.pointHistory.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 20
  });

  // Lấy danh sách Coupon có thể đổi bằng điểm
  const exchangeableCoupons = await prisma.coupon.findMany({
    where: { 
      isActive: true, 
      costInPoints: { not: null },
      validUntil: { gt: new Date() }
    },
    orderBy: { costInPoints: 'asc' }
  });

  return (
    <VIPDashboard 
      user={user} 
      pointHistory={pointHistory} 
      exchangeableCoupons={exchangeableCoupons} 
    />
  );
}
