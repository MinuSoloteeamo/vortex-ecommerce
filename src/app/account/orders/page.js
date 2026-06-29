'use client';

import { useState, useEffect } from 'react';
import { useToastStore } from '@/store/toast';
import Link from 'next/link';
import styles from './orders.module.css';

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price) + '₫';
}

function getStatusBadge(status) {
  const map = {
    PENDING: { text: 'Chờ thanh toán', class: styles.badgeWarning },
    CONFIRMED: { text: 'Đã xác nhận', class: styles.badgeInfo },
    PROCESSING: { text: 'Đang xử lý', class: styles.badgePrimary },
    SHIPPING: { text: 'Đang vận chuyển', class: styles.badgePrimary },
    DELIVERED: { text: 'Hoàn thành', class: styles.badgeSuccess },
    CANCELLED: { text: 'Đã hủy', class: styles.badgeDanger },
  };
  const s = map[status] || { text: status, class: '' };
  return <span className={`${styles.badge} ${s.class}`}>{s.text}</span>;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [reviewModal, setReviewModal] = useState({ isOpen: false, orderId: null, product: null });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewedProductIds, setReviewedProductIds] = useState([]);

  const [cancelModal, setCancelModal] = useState({ isOpen: false, orderId: null });
  const [cancelReason, setCancelReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const CANCEL_REASONS = [
    'Muốn thay đổi địa chỉ giao hàng',
    'Muốn thay đổi sản phẩm/màu sắc',
    'Tìm thấy giá rẻ hơn ở nơi khác',
    'Đổi ý, không muốn mua nữa',
    'Thay đổi phương thức thanh toán',
    'Khác'
  ];

  const QUICK_REVIEWS = [
    'Sản phẩm rất tốt 👍',
    'Giao hàng nhanh đúng hạn 🚀',
    'Đóng gói cẩn thận 📦',
    'Chất lượng tuyệt vời ⭐',
    'Sẽ ủng hộ shop tiếp ❤️'
  ];

  const tabs = [
    { id: 'ALL', label: 'Tất cả' },
    { id: 'PENDING', label: 'Mới' },
    { id: 'PROCESSING', label: 'Đang xử lý' },
    { id: 'SHIPPING', label: 'Đang vận chuyển' },
    { id: 'DELIVERED', label: 'Hoàn thành' },
    { id: 'CANCELLED', label: 'Đã hủy' },
  ];

  useEffect(() => {
    fetchOrders(activeTab);
  }, [activeTab]);

  const fetchOrders = async (status) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/user/orders?status=${status}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setReviewedProductIds(data.reviewedProductIds || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openCancelModal = (orderId) => {
    setCancelModal({ isOpen: true, orderId });
    setCancelReason('');
    setCustomReason('');
  };

  const submitCancelOrder = async () => {
    const finalReason = cancelReason === 'Khác' ? customReason : cancelReason;
    if (!finalReason) {
      useToastStore.getState().error('Vui lòng chọn lý do hủy');
      return;
    }
    try {
      const res = await fetch('/api/user/orders/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: cancelModal.orderId, reason: finalReason })
      });
      if (res.ok) {
        useToastStore.getState().success('Đã hủy đơn hàng thành công');
        setCancelModal({ isOpen: false, orderId: null });
        fetchOrders(activeTab); // refresh list
      } else {
        useToastStore.getState().error('Lỗi khi hủy đơn hàng');
      }
    } catch (e) {
      useToastStore.getState().error('Lỗi hệ thống');
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/user/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: reviewModal.orderId,
          productId: reviewModal.product.id,
          rating: reviewForm.rating,
          comment: reviewForm.comment
        })
      });
      if (res.ok) {
        useToastStore.getState().success('Đánh giá thành công! Cảm ơn bạn. ❤️');
        setReviewedProductIds([...reviewedProductIds, reviewModal.product.id]);
        setReviewModal({ isOpen: false, orderId: null, product: null });
        setReviewForm({ rating: 5, comment: '' });
      } else {
        const data = await res.json();
        useToastStore.getState().error(data.error || 'Có lỗi xảy ra');
      }
    } catch (e) {
      useToastStore.getState().error('Lỗi kết nối');
    }
  };

  const filteredOrders = orders.filter(o => 
    searchQuery === '' || o.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Quản Lý Đơn Hàng</h1>
      </div>

      <div className={styles.tabs}>
        {tabs.map(tab => (
          <button 
            key={tab.id}
            className={`${styles.tabBtn} ${activeTab === tab.id ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.searchBar}>
        <input 
          type="text" 
          placeholder="Tìm kiếm theo Mã đơn hàng..." 
          className={styles.searchInput}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <span className={styles.searchIcon}>🔍</span>
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: '300px' }}></div>
      ) : filteredOrders.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📦</div>
          <div>Không có đơn hàng nào</div>
        </div>
      ) : (
        <div className={styles.orderList}>
          {filteredOrders.map(order => (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div>
                  <span className={styles.orderId}>#{order.id.substring(order.id.length - 8).toUpperCase()}</span>
                  <span className={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <div>{getStatusBadge(order.status)}</div>
              </div>

              {order.status === 'CANCELLED' && order.cancelReason && (
                <div className={styles.cancelReason}>
                  <strong>Lý do hủy:</strong> {order.cancelReason}
                </div>
              )}

              <div className={styles.orderItems}>
                {order.items.map(item => (
                  <div key={item.id} className={styles.itemRow}>
                    <div className={styles.itemImage}>
                      {item.product?.images?.[0]?.url ? (
                        <img src={item.product.images[0].url} alt={item.product.name} />
                      ) : <div className={styles.noImage}>📦</div>}
                    </div>
                    <div className={styles.itemInfo}>
                      <Link href={`/products/${item.product?.slug}`} className={styles.itemName}>
                        {item.product?.name || 'Sản phẩm không tồn tại'}
                      </Link>
                      <div className={styles.itemQty}>x{item.quantity}</div>
                    </div>
                    <div className={styles.itemPriceActions}>
                      <div className={styles.itemPrice}>{formatPrice(item.price)}</div>
                      
                      {order.status === 'DELIVERED' && (
                        reviewedProductIds.includes(item.product.id) ? (
                          <div style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem', marginTop: '0.5rem', color: 'var(--color-success)', border: '1px solid var(--color-success)', borderRadius: 'var(--radius-sm)', display: 'inline-block' }}>
                            Đã đánh giá ✓
                          </div>
                        ) : (
                          <button 
                            className="btn btn-outline" 
                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem', marginTop: '0.5rem' }}
                            onClick={() => setReviewModal({ isOpen: true, orderId: order.id, product: item.product })}
                          >
                            Đánh giá
                          </button>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.orderFooter}>
                <div className={styles.totalLabel}>Tổng tiền:</div>
                <div className={styles.totalValue} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {formatPrice(order.totalAmount)}
                  {order.status === 'PENDING' && (
                    <button 
                      className="btn btn-outline" 
                      style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem', borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
                      onClick={() => openCancelModal(order.id)}
                    >
                      Hủy đơn
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {reviewModal.isOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 style={{ marginBottom: '1rem' }}>Đánh giá sản phẩm</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <img src={reviewModal.product?.images?.[0]?.url} alt="" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}/>
              <strong style={{ fontSize: '0.9rem' }}>{reviewModal.product?.name}</strong>
            </div>
            
            <form onSubmit={submitReview}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Chất lượng sản phẩm</label>
                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '1.5rem', cursor: 'pointer' }}>
                  {[1,2,3,4,5].map(star => (
                    <span 
                      key={star} 
                      onClick={() => setReviewForm({...reviewForm, rating: star})}
                      style={{ color: star <= reviewForm.rating ? '#fbbf24' : '#4b5563' }}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Nhận xét</label>
                <textarea 
                  className="input-field" 
                  rows="4" 
                  placeholder="Hãy chia sẻ nhận xét của bạn về sản phẩm này nhé..."
                  value={reviewForm.comment}
                  onChange={e => setReviewForm({...reviewForm, comment: e.target.value})}
                  required
                ></textarea>
                
                {/* Gợi ý đánh giá nhanh */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                  {QUICK_REVIEWS.map((text, idx) => (
                    <span 
                      key={idx}
                      onClick={() => {
                        const currentComment = reviewForm.comment ? reviewForm.comment.trim() + ' ' : '';
                        setReviewForm({...reviewForm, comment: currentComment + text});
                      }}
                      style={{
                        padding: '4px 10px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '99px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        color: 'var(--text-secondary)',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-blue)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    >
                      {text}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setReviewModal({ isOpen: false, orderId: null, product: null })}>Trở lại</button>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Gửi đánh giá</button>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Modal Cute */}
      {cancelModal.isOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '0.5rem', lineHeight: '1' }}>🥺</div>
            <h2 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>Tại sao bạn lại hủy đơn?</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Vortex sẽ rất buồn nếu bạn rời đi...</p>
            
            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {CANCEL_REASONS.map(reason => (
                <label key={reason} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.75rem', border: '1px solid', borderColor: cancelReason === reason ? 'var(--color-primary)' : 'var(--border-subtle)', borderRadius: 'var(--radius-md)', background: cancelReason === reason ? 'var(--bg-card-hover)' : 'transparent', transition: 'all 0.2s ease' }}>
                  <input 
                    type="radio" 
                    name="cancelReason" 
                    value={reason}
                    checked={cancelReason === reason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    style={{ accentColor: 'var(--color-primary)', width: '18px', height: '18px' }}
                  />
                  <span style={{ fontSize: '0.9rem' }}>{reason}</span>
                </label>
              ))}
              
              {cancelReason === 'Khác' && (
                <textarea 
                  className="input"
                  placeholder="Nhập lý do của bạn để chúng mình cải thiện nhé..."
                  rows="3"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}
                />
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                className="btn btn-outline" 
                style={{ flex: 1, padding: '0.75rem' }}
                onClick={() => setCancelModal({ isOpen: false, orderId: null })}
              >
                Không hủy nữa
              </button>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1, padding: '0.75rem', background: 'var(--color-danger)', borderColor: 'var(--color-danger)', color: '#fff' }}
                onClick={submitCancelOrder}
              >
                Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
