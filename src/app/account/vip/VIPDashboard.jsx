'use client';

import { useState } from 'react';
import styles from './vip.module.css';
import { useRouter } from 'next/navigation';

export default function VIPDashboard({ user, pointHistory, exchangeableCoupons }) {
  const router = useRouter();
  const [exchanging, setExchanging] = useState(false);
  const [exchangeMsg, setExchangeMsg] = useState({ text: '', type: '' });
  const [successCode, setSuccessCode] = useState('');
  const [showCode, setShowCode] = useState(false);

  const copyToClipboard = () => {
    if (successCode) {
      navigator.clipboard.writeText(successCode);
      alert('Đã chép mã giảm giá vào khay nhớ tạm!');
    }
  };

  // Tiers: MEMBER (0), SILVER (1000), GOLD (3000), DIAMOND (10000)
  // 1 point = 10,000 VND
  const tiers = [
    { name: 'MEMBER', min: 0, 
      benefits: ['Tích lũy điểm V-Point', 'Quà sinh nhật tiêu chuẩn'] },
    { name: 'SILVER', min: 1000, 
      benefits: ['Giảm thẳng 2% mọi hóa đơn', 'Hỗ trợ kỹ thuật ưu tiên', 'Voucher sinh nhật 200k'] },
    { name: 'GOLD', min: 3000, 
      benefits: ['Giảm thẳng 5% mọi hóa đơn', 'Miễn phí vận chuyển toàn quốc', 'Voucher sinh nhật 500k'] },
    { name: 'DIAMOND', min: 10000, 
      benefits: ['Giảm thẳng 10% mọi hóa đơn', 'Miễn phí vận chuyển', 'Quà sinh nhật (Mô hình/Gear)', 'Chăm sóc viên 1-kèm-1'] }
  ];

  const currentTierIndex = tiers.findIndex(t => t.name === user.vipTier);
  const currentTier = tiers[currentTierIndex] || tiers[0];
  const nextTier = currentTierIndex < tiers.length - 1 ? tiers[currentTierIndex + 1] : null;

  let progress = 100;
  if (nextTier) {
    const range = nextTier.min - currentTier.min;
    const earned = user.points - currentTier.min;
    progress = Math.min(100, Math.max(0, (earned / range) * 100));
  }

  const handleExchange = async (couponId) => {
    if (!confirm('Bạn có chắc chắn muốn đổi điểm lấy mã giảm giá này?')) return;
    
    setExchanging(true);
    setExchangeMsg({ text: '', type: '' });
    
    try {
      const res = await fetch('/api/user/exchange-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponId })
      });
      const data = await res.json();
      
      if (res.ok) {
        setSuccessCode(data.code);
        setShowCode(false);
        setExchangeMsg({ text: 'Đổi thành công! Nhận mã của bạn bên dưới.', type: 'success' });
        router.refresh();
      } else {
        setSuccessCode('');
        setExchangeMsg({ text: data.message || 'Có lỗi xảy ra', type: 'error' });
      }
    } catch (err) {
      setExchangeMsg({ text: 'Có lỗi xảy ra', type: 'error' });
    } finally {
      setExchanging(false);
    }
  };

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Thẻ VIP VORTEX</h1>
        <p className={styles.subtitle}>Đặc quyền dành riêng cho khách hàng thân thiết</p>
      </div>

      {/* Current VIP Card */}
      <div className={styles.vipCard}>
        <div className={styles.vipHeader}>
          <div className={styles.vipName}>VORTEX {user.vipTier}</div>
          <div className={styles.vipPoints}>{user.points} Điểm</div>
        </div>
        
        {nextTier ? (
          <div className={styles.progressSection}>
            <div className={styles.progressBarContainer}>
              <div className={styles.progressBar} style={{ width: `${progress}%` }}></div>
            </div>
            <div className={styles.progressText}>
              <span>{currentTier.name} ({currentTier.min})</span>
              <span>Cần thêm {nextTier.min - user.points} điểm để lên {nextTier.name}</span>
              <span>{nextTier.name} ({nextTier.min})</span>
            </div>
          </div>
        ) : (
          <div className={styles.progressText}>
            <span>🎉 Bạn đã đạt hạng Kim Cương cao nhất!</span>
          </div>
        )}
      </div>

      {/* Benefits List */}
      <h3 className={styles.sectionTitle}>Đặc quyền hạng {user.vipTier} của bạn</h3>
      <div className={styles.benefitsGrid}>
        {currentTier.benefits.map((benefit, idx) => (
          <div key={idx} className={styles.benefitBox}>
            <div className={styles.benefitIcon}>⭐</div>
            <div className={styles.benefitText}>{benefit}</div>
          </div>
        ))}
      </div>

      {/* Coupon Exchange */}
      <h3 className={styles.sectionTitle} style={{ marginTop: '3rem' }}>Cửa hàng đổi điểm</h3>
      {exchangeMsg.text && (
        <div style={{ 
          marginBottom: '1.5rem', 
          padding: '1.25rem', 
          borderRadius: '12px', 
          background: exchangeMsg.type === 'success' ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.2))' : 'linear-gradient(90deg, rgba(239, 68, 68, 0.1), rgba(185, 28, 28, 0.2))', 
          border: `1px solid ${exchangeMsg.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          boxShadow: `0 4px 15px ${exchangeMsg.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}`,
          color: exchangeMsg.type === 'success' ? '#34d399' : '#f87171' 
        }}>
          <div style={{ fontWeight: 600, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {exchangeMsg.type === 'success' ? '✅' : '❌'} {exchangeMsg.text}
          </div>
          {successCode && exchangeMsg.type === 'success' && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '1.25rem', fontFamily: 'monospace', letterSpacing: '2px', fontWeight: 'bold' }}>
                {showCode ? successCode : '••••••••••••'}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => setShowCode(!showCode)} 
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer' }}
                  title={showCode ? 'Ẩn mã' : 'Hiện mã'}
                >
                  {showCode ? '🙈' : '👁️'}
                </button>
                <button 
                  onClick={copyToClipboard} 
                  style={{ background: 'linear-gradient(90deg, #10b981, #059669)', border: 'none', color: '#fff', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 10px rgba(16,185,129,0.3)' }}
                  title="Sao chép"
                >
                  📋 Copy
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      <div className={styles.couponGrid}>
        {exchangeableCoupons.length === 0 ? (
          <p>Hiện chưa có mã giảm giá nào để đổi.</p>
        ) : (
          exchangeableCoupons.map(coupon => (
            <div key={coupon.id} className={styles.couponBox}>
              <div className={styles.couponHeader}>
                <span className={styles.couponAmount}>
                  {coupon.discountPercent ? `Giảm ${coupon.discountPercent}%` : `Giảm ${new Intl.NumberFormat('vi-VN').format(coupon.discountAmount)}đ`}
                </span>
                <span className={styles.couponCost}>{coupon.costInPoints} Điểm</span>
              </div>
              <p className={styles.couponDesc}>
                Đơn tối thiểu: {new Intl.NumberFormat('vi-VN').format(coupon.minOrderValue)}đ
              </p>
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '1rem' }}
                onClick={() => handleExchange(coupon.id)}
                disabled={exchanging || user.points < coupon.costInPoints}
              >
                {user.points >= coupon.costInPoints ? 'Đổi Ngay' : 'Không Đủ Điểm'}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Point History */}
      <h3 className={styles.sectionTitle} style={{ marginTop: '3rem' }}>Lịch sử giao dịch điểm</h3>
      <div className={styles.tableWrapper}>
        <table className={styles.tierTable}>
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Loại</th>
              <th>Mô tả</th>
              <th>Điểm</th>
            </tr>
          </thead>
          <tbody>
            {pointHistory.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center' }}>Chưa có giao dịch nào</td></tr>
            ) : (
              pointHistory.map(history => (
                <tr key={history.id}>
                  <td>{new Date(history.createdAt).toLocaleString('vi-VN')}</td>
                  <td>{history.type}</td>
                  <td>{history.description}</td>
                  <td style={{ color: history.points > 0 ? '#198754' : '#dc3545', fontWeight: 'bold' }}>
                    {history.points > 0 ? `+${history.points}` : history.points}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
