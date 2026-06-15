'use client';

import { useState, useEffect } from 'react';
import { useToastStore } from '@/store/toast';
import adminStyles from '@/app/admin/admin.module.css';

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price) + '₫';
}

function timeAgo(dateString) {
  const diff = Date.now() - new Date(dateString).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days} ngày trước`;
  if (hours > 0) return `${hours} giờ trước`;
  return 'Gần đây';
}

export default function AbandonedCartsPage() {
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState(null);

  useEffect(() => {
    fetchCarts();
  }, []);

  const fetchCarts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/abandoned-carts');
      if (res.ok) {
        setCarts(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRemind = async (userId) => {
    setSendingId(userId);
    try {
      const res = await fetch('/api/admin/abandoned-carts/remind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      
      const data = await res.json();
      if (res.ok) {
        useToastStore.getState().success(data.message);
      } else {
        useToastStore.getState().error(data.error);
      }
    } catch (e) {
      useToastStore.getState().error('Lỗi kết nối');
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className={adminStyles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
        <h2 style={{ fontSize: 'var(--font-size-lg)' }}>🛒 Quản lý Giỏ hàng Tồn (Abandoned Carts)</h2>
        <button onClick={fetchCarts} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
          🔄 Làm mới
        </button>
      </div>

      <table className={adminStyles.table}>
        <thead>
          <tr>
            <th>Khách Hàng</th>
            <th>Sản Phẩm Trong Giỏ</th>
            <th>Tổng Giá Trị</th>
            <th>Cập Nhật Cuối</th>
            <th style={{ textAlign: 'right' }}>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>Đang tải dữ liệu...</td>
            </tr>
          ) : carts.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                Không có giỏ hàng nào bị bỏ quên.
              </td>
            </tr>
          ) : (
            carts.map((cart) => (
              <tr key={cart.userId}>
                <td>
                  <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{cart.user.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{cart.user.email}</div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {cart.items.slice(0, 3).map((item, i) => (
                      <div key={i} style={{ fontSize: '0.8rem', background: 'var(--bg-body)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                        {item.quantity}x {item.product.name.length > 20 ? item.product.name.substring(0, 20) + '...' : item.product.name}
                      </div>
                    ))}
                    {cart.items.length > 3 && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>+{cart.items.length - 3} món nữa</span>
                    )}
                  </div>
                </td>
                <td style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>
                  {formatPrice(cart.totalValue)}
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>
                  {timeAgo(cart.lastUpdated)}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button 
                    className="btn btn-primary" 
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                    onClick={() => handleRemind(cart.userId)}
                    disabled={sendingId === cart.userId}
                  >
                    {sendingId === cart.userId ? 'Đang gửi...' : '🔔 Nhắc Nhở'}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
