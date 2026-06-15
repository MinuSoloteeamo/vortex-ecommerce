import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function VIPWelcomeMessage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, points: true, vipTier: true, dob: true }
  });

  if (!user) return null;

  let message = '';
  let subMessage = '';
  let bgColor = 'var(--bg-glass)';
  let borderColor = 'var(--border-subtle)';

  // Kiểm tra tháng sinh nhật
  const currentMonth = new Date().getMonth();
  const isBirthdayMonth = user.dob && new Date(user.dob).getMonth() === currentMonth;

  if (user.points === 0 && user.vipTier === 'MEMBER') {
    message = `👋 Chào mừng tân binh ${user.name} gia nhập vũ trụ VORTEX!`;
    subMessage = 'Tặng bạn cơ hội tích lũy điểm V-Points cho đơn hàng đầu tiên. Săn gear xịn ngay để thăng hạng VIP nhé!';
    bgColor = 'rgba(0, 240, 255, 0.05)';
    borderColor = 'var(--color-primary)';
  } else if (user.vipTier === 'GOLD' || user.vipTier === 'DIAMOND') {
    message = `👑 Mừng ${user.name} đã trở lại!`;
    subMessage = `VORTEX luôn ưu tiên dành những deal VIP nhất cho các bậc thầy công nghệ như bạn. Bạn đang có ${user.points} điểm V-Points.`;
    bgColor = 'rgba(255, 215, 0, 0.05)'; // Gold tint
    borderColor = '#ffd700';
  } else {
    // SILVER or regular MEMBER with > 0 points
    message = `🚀 Chào mừng ${user.name} quay lại VORTEX!`;
    subMessage = `Bạn đang là Hạng ${user.vipTier} với ${user.points} điểm V-Points. Hãy tích cực mua sắm để nhận thêm nhiều ưu đãi.`;
  }

  return (
    <div className="container" style={{ marginTop: '2rem' }}>
      <div style={{
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Sparkle decoration */}
        <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '3rem', opacity: 0.1, transform: 'rotate(15deg)' }}>
          ✨
        </div>

        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
          {message}
        </h3>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          {subMessage}
        </p>
        
        {isBirthdayMonth && (
          <div style={{ marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#ff69b4', fontWeight: 600 }}>
            🎂 Chúc mừng tháng sinh nhật của bạn! Đừng quên kiểm tra quà tặng đặc biệt trong ví.
          </div>
        )}

        <div style={{ marginTop: '1rem' }}>
          <Link href="/account/vip" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
            Xem Đặc Quyền VIP
          </Link>
        </div>
      </div>
    </div>
  );
}
