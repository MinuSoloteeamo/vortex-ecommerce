'use client';

import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import styles from './FrequentlyBoughtTogether.module.css';

export default function FrequentlyBoughtTogether({ productSlug }) {
  // Trạng thái lưu danh sách sản phẩm gợi ý mua kèm
  const [products, setProducts] = useState([]);
  // Trạng thái theo dõi quá trình đang tải dữ liệu
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hàm gọi API lấy danh sách combo sản phẩm liên quan
    async function fetchCombo() {
      try {
        // Gửi yêu cầu lấy dữ liệu theo slug của sản phẩm hiện tại
        const res = await fetch(`/api/products/${productSlug}/related-combo`);
        if (res.ok) {
          const data = await res.json();
          // Cập nhật danh sách sản phẩm vào state
          setProducts(data);
        }
      } catch (error) {
        console.error('Lỗi khi tải danh sách sản phẩm mua kèm:', error);
      } finally {
        // Hoàn tất quá trình tải (dù thành công hay thất bại)
        setLoading(false);
      }
    }
    fetchCombo();
  }, [productSlug]);

  // Nếu đang tải HOẶC không có sản phẩm gợi ý nào thì ẩn hoàn toàn giao diện (trả về null)
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
        {/* Duyệt qua từng sản phẩm để hiển thị thẻ ProductCard */}
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
