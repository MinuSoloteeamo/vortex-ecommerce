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
        setOrders(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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
                        <button 
                          className="btn btn-outline" 
                          style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem', marginTop: '0.5rem' }}
                          onClick={() => setReviewModal({ isOpen: true, orderId: order.id, product: item.product })}
                        >
                          Đánh giá
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.orderFooter}>
                <div className={styles.totalLabel}>Tổng tiền:</div>
                <div className={styles.totalValue}>{formatPrice(order.totalAmount)}</div>
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
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setReviewModal({ isOpen: false, orderId: null, product: null })}>Trở lại</button>
                <button type="submit" className="btn btn-primary">Hoàn thành</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
