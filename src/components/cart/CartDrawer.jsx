'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart';
import { useAuthModalStore } from '@/store/authModal';
import { useSession } from 'next-auth/react';
import styles from './CartDrawer.module.css';

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price) + '₫';
}

export default function CartDrawer() {
  const [mounted, setMounted] = useState(false);
  const { isDrawerOpen, closeDrawer, items, removeItem, updateQuantity } = useCartStore();
  const { openModal } = useAuthModalStore();
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const subtotal = items.reduce((sum, item) => {
    const price = item.salePrice || item.price;
    return sum + price * item.quantity;
  }, 0);

  const handleCheckout = () => {
    closeDrawer();
    if (status === 'unauthenticated') {
      openModal('login');
    } else {
      router.push('/checkout');
    }
  };

  return (
    <>
      <div 
        className={`${styles.overlay} ${isDrawerOpen ? styles.open : ''}`} 
        onClick={closeDrawer}
      />
      <div className={`${styles.drawer} ${isDrawerOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <h2>Giỏ hàng <span>{items.length}</span></h2>
          <button className={styles.closeBtn} onClick={closeDrawer}>✕</button>
        </div>

        <div className={styles.content}>
          {items.length === 0 ? (
            <div className={styles.empty}>
              Giỏ hàng của bạn đang trống.
            </div>
          ) : (
            <div className={styles.itemsList}>
              {items.map((item) => {
                const itemPrice = item.salePrice || item.price;
                const imageSrc = item.images?.[0]?.url || item.image || '📦';

                return (
                  <div key={`${item.id}-${item.variantId}`} className={styles.item}>
                    <div className={styles.itemImage}>
                      {imageSrc.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) ? (
                        <img src={imageSrc} alt={item.name} />
                      ) : (
                        <span className={styles.emoji}>{imageSrc}</span>
                      )}
                    </div>
                    <div className={styles.itemInfo}>
                      <Link href={`/products/${item.slug}`} className={styles.itemName} onClick={closeDrawer}>
                        {item.name}
                      </Link>
                      {item.variantName && <div className={styles.variantName}>{item.variantName}</div>}
                      <div className={styles.itemPrice}>{formatPrice(itemPrice)}</div>
                      <div className={styles.actions}>
                        <div className={styles.quantityCtrl}>
                          <button 
                            onClick={() => updateQuantity(item.id, item.variantId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >-</button>
                          <span>{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.variantId, item.quantity + 1)}
                          >+</button>
                        </div>
                        <button 
                          className={styles.removeBtn}
                          onClick={() => removeItem(item.id, item.variantId)}
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.totalRow}>
              <span>Tổng cộng:</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
            <div className={styles.buttons}>
              <Link href="/cart" className={styles.cartLink} onClick={closeDrawer}>
                Xem giỏ hàng
              </Link>
              <button className={styles.checkoutBtn} onClick={handleCheckout}>
                Thanh toán
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
