'use client';

import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import styles from './FrequentlyBoughtTogether.module.css';

export default function FrequentlyBoughtTogether({ productSlug }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCombo() {
      try {
        const res = await fetch(`/api/products/${productSlug}/related-combo`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (error) {
        console.error('Failed to fetch combo:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCombo();
  }, [productSlug]);

  if (loading || products.length === 0) return null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h3 className={styles.title}>Thường được mua cùng</h3>
        <span className={styles.badge}>Gợi ý thông minh</span>
      </div>
      <p className={styles.subtitle}>
        Khách hàng mua sản phẩm này cũng thường kết hợp thêm các phụ kiện dưới đây để có trải nghiệm tốt nhất.
      </p>
      <div className={styles.grid}>
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
