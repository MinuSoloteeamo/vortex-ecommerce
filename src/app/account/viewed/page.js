'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import styles from './viewed.module.css';

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price) + '₫';
}

export default function ViewedProductsPage() {
  const [products, setProducts] = useState([]);
  const [mounted, setMounted] = useState(false);

  const { data: session } = useSession();

  useEffect(() => {
    setMounted(true);
    if (session === undefined) return; // Wait for session to load

    try {
      const storageKey = `vortex_viewed_products_${session?.user?.id || 'guest'}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setProducts(JSON.parse(stored));
      } else {
        setProducts([]);
      }
    } catch (e) {
      console.error('Failed to parse viewed products', e);
    }
  }, [session]);

  const clearHistory = () => {
    if (confirm('Bạn có chắc muốn xóa lịch sử xem?')) {
      const storageKey = `vortex_viewed_products_${session?.user?.id || 'guest'}`;
      localStorage.removeItem(storageKey);
      setProducts([]);
    }
  };

  if (!mounted) return <div className="skeleton" style={{ height: '300px' }}></div>;

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Sản Phẩm Đã Xem</h1>
          <p className={styles.subtitle}>Xem lại những sản phẩm bạn đã quan tâm gần đây</p>
        </div>
        {products.length > 0 && (
          <button className="btn btn-outline" onClick={clearHistory}>
            Xóa lịch sử
          </button>
        )}
      </div>

      {products.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>👁️</div>
          <div>Bạn chưa xem sản phẩm nào gần đây.</div>
          <Link href="/products" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
            Khám phá ngay
          </Link>
        </div>
      ) : (
        <div className={styles.productGrid}>
          {products.map((product, idx) => (
            <Link key={`${product.id}-${idx}`} href={`/products/${product.slug}`} className={styles.productCard}>
              <div className={styles.imageWrapper}>
                {product.images?.[0]?.url ? (
                  <img src={product.images[0].url} alt={product.name} />
                ) : <div className={styles.noImage}>📦</div>}
              </div>
              <div className={styles.productInfo}>
                <h3 className={styles.productName}>{product.name}</h3>
                <div className={styles.pricing}>
                  {product.salePrice ? (
                    <>
                      <span className={styles.salePrice}>{formatPrice(product.salePrice)}</span>
                      <span className={styles.originalPrice}>{formatPrice(product.price)}</span>
                    </>
                  ) : (
                    <span className={styles.salePrice}>{formatPrice(product.price)}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
