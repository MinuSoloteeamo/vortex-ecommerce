'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCartStore } from '@/store/cart';
import { useAuthModalStore } from '@/store/authModal';
import styles from './page.module.css';

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price) + '₫';
}

export default function CartPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const { openModal } = useAuthModalStore();
  const { status } = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={styles.page} style={{ minHeight: '50vh' }}></div>;
  }

  const subtotal = items.reduce((sum, item) => {
    const price = item.salePrice || item.price;
    return sum + price * item.quantity;
  }, 0);

  if (items.length === 0) {
    return (
      <div className={styles.page}>
        <div className="container">
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>🛒</span>
            <h1 className={styles.emptyTitle}>Giỏ hàng của bạn đang trống</h1>
            <p className={styles.emptyDesc}>Hãy quay lại trang sản phẩm để chọn những món đồ bạn yêu thích nhé.</p>
            <Link href="/products" className="btn btn-primary">
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className={styles.title}>Giỏ hàng</h1>
        
        <div className={styles.content}>
          {/* Item List */}
          <div className={styles.itemsList}>
            {items.map((item) => {
              const itemPrice = item.salePrice || item.price;
              const imageSrc = item.images?.[0]?.url || '📦';

              return (
                <div key={item.id} className={styles.cartItem}>
                  <Link href={`/products/${item.slug}`} className={styles.itemImage}>
                    <span className={styles.emoji}>{imageSrc}</span>
                  </Link>
                  
                  <div className={styles.itemInfo}>
                    <Link href={`/products/${item.slug}`} className={styles.itemName}>
                      {item.name}
                    </Link>
                    <div className={styles.itemPrice}>{formatPrice(itemPrice)}</div>
                    
                    <div className={styles.itemActions}>
                      <div className={styles.quantityCtrl}>
                        <button 
                          className={styles.qtyBtn}
                          onClick={() => updateQuantity(item.id, item.variantId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <input 
                          type="number" 
                          className={styles.qtyInput}
                          value={item.quantity}
                          min="1"
                          max="99"
                          onChange={(e) => {
                            let val = parseInt(e.target.value);
                            if (isNaN(val)) return;
                            if (val > 99) val = 99;
                            updateQuantity(item.id, item.variantId, val);
                          }}
                          onBlur={(e) => {
                            let val = parseInt(e.target.value);
                            if (isNaN(val) || val < 1) {
                              updateQuantity(item.id, item.variantId, 1);
                            }
                          }}
                        />
                        <button 
                          className={styles.qtyBtn}
                          onClick={() => updateQuantity(item.id, item.variantId, item.quantity + 1)}
                          disabled={item.quantity >= 99}
                        >
                          +
                        </button>
                      </div>
                      
                      <button 
                        className={styles.removeBtn}
                        onClick={() => removeItem(item.id, item.variantId)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18" strokeLinecap="round"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeLinecap="round"/>
                        </svg>
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className={styles.summary}>
            <h2 className={styles.summaryTitle}>Tóm tắt đơn hàng</h2>
            
            <div className={styles.summaryRow}>
              <span>Tạm tính ({items.length} sản phẩm)</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            
            <div className={styles.summaryRow}>
              <span>Phí vận chuyển</span>
              <span>Tính ở bước thanh toán</span>
            </div>
            
            <div className={`${styles.summaryRow} ${styles.total}`}>
              <span>Tổng cộng</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            
            <button 
              className={`btn btn-primary ${styles.checkoutBtn}`}
              onClick={() => {
                if (status === 'unauthenticated') {
                  openModal('login');
                } else {
                  router.push('/checkout');
                }
              }}
            >
              Tiến hành thanh toán
            </button>
            
            <Link 
              href="/products" 
              style={{ display: 'block', textAlign: 'center', marginTop: '1rem', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}
            >
              ← Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
