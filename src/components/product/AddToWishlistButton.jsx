'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthModalStore } from '@/store/authModal';
import styles from './AddToWishlistButton.module.css';

export default function AddToWishlistButton({ productId, initialWishlisted = false }) {
  const { data: session } = useSession();
  const router = useRouter();
  // State theo dõi sản phẩm đang được yêu thích (true/false)
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  // State theo dõi trạng thái đang bấm gửi request để tránh người dùng click liên tục
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    // Cập nhật lại trạng thái yêu thích ban đầu nếu prop thay đổi
    setIsWishlisted(initialWishlisted);
  }, [initialWishlisted]);

  // Hàm xử lý khi bấm vào nút Trái tim (Thêm / Xóa Yêu thích)
  const toggleWishlist = async () => {
    // 1. Nếu người dùng chưa đăng nhập -> Mở popup đăng nhập
    if (!session) {
      useAuthModalStore.getState().openModal('login');
      return;
    }

    // 2. Khóa tạm nút bấm trong lúc gửi request
    setIsToggling(true);

    try {
      // 3. Gửi request POST lên API /api/wishlist
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      });

      if (res.ok) {
        const data = await res.json();
        // 4. Cập nhật lại màu sắc trái tim theo kết quả trả về từ server
        setIsWishlisted(data.wishlisted);
      }
    } catch (err) {
      console.error('Lỗi khi bấm yêu thích:', err);
    } finally {
      // 5. Mở lại nút bấm sau khi hoàn tất
      setIsToggling(false);
    }
  };

  return (
    <button
      onClick={toggleWishlist}
      disabled={isToggling}
      className={`${styles.wishlistBtn} ${isWishlisted ? styles.active : ''}`}
      title={isWishlisted ? "Xóa khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"}
    >
      {/* Icon Trái tim SVG: Tô màu đỏ/hồng khi isWishlisted = true */}
      <svg viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
