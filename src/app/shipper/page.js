'use client';

import { useState, useEffect } from 'react';

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price) + '₫';
}

export default function ShipperPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/shipper/orders');
      if (!res.ok) throw new Error('Không thể tải dữ liệu đơn hàng');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    let cancelReason = null;
    if (newStatus === 'FAILED_DELIVERY') {
      cancelReason = prompt('Nhập lý do giao thất bại (VD: Khách không nghe máy, Sai địa chỉ...):');
      if (!cancelReason) return; // User cancelled prompt
    }

    const confirmMsg = newStatus === 'DELIVERED' 
      ? 'Xác nhận ĐÃ GIAO THÀNH CÔNG đơn hàng này?' 
      : 'Xác nhận GIAO THẤT BẠI đơn hàng này?';
      
    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch('/api/shipper/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus, cancelReason })
      });

      if (!res.ok) {
        throw new Error('Lỗi cập nhật');
      }

      alert('Cập nhật thành công!');
      fetchOrders(); // Refresh list
    } catch (err) {
      alert('Có lỗi xảy ra: ' + err.message);
    }
  };

  if (isLoading) return <div style={{ textAlign: 'center', padding: '40px' }}>Đang tải...</div>;
  if (error) return <div style={{ color: '#ef4444', textAlign: 'center' }}>{error}</div>;

  return (
    <div>
      <h2 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: '600' }}>
        Đơn hàng đang giao ({orders.length})
      </h2>
      
      {orders.length === 0 ? (
        <div style={{ background: '#1e293b', padding: '32px', borderRadius: '12px', textAlign: 'center', color: '#94a3b8' }}>
          📦 Hiện không có đơn hàng nào chờ giao.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.map(order => (
            <div key={order.id} style={{ 
              background: '#1e293b', 
              borderRadius: '12px', 
              padding: '16px',
              border: '1px solid #334155'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px dashed #334155', paddingBottom: '12px' }}>
                <span style={{ fontWeight: 'bold', color: '#e2e8f0', fontSize: '14px' }}>Mã: {order.orderNumber}</span>
                <span style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '14px' }}>
                  {order.paymentMethod === 'COD' ? formatPrice(order.totalAmount) : 'ĐÃ THANH TOÁN'}
                </span>
              </div>
              
              <div style={{ marginBottom: '16px', fontSize: '14px', lineHeight: '1.6' }}>
                <div style={{ fontWeight: '600', color: '#f8fafc', fontSize: '16px', marginBottom: '4px' }}>
                  👤 {order.recipientName}
                </div>
                <div style={{ color: '#38bdf8', marginBottom: '4px' }}>
                  📞 <a href={`tel:${order.recipientPhone}`} style={{ color: 'inherit', textDecoration: 'none' }}>{order.recipientPhone}</a>
                </div>
                <div style={{ color: '#cbd5e1' }}>
                  📍 {order.shippingAddress}
                </div>
                {order.note && (
                  <div style={{ color: '#fcd34d', marginTop: '8px', padding: '8px', background: 'rgba(251, 191, 36, 0.1)', borderRadius: '4px' }}>
                    📝 Ghi chú: {order.note}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => handleUpdateStatus(order.id, 'FAILED_DELIVERY')}
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Giao thất bại
                </button>
                <button 
                  onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: '#22c55e', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Đã giao xong
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
