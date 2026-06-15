'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthModalStore } from '@/store/authModal';
import styles from './AddToWishlistButton.module.css';

export default function AddToWishlistButton({ productId, initialWishlisted = false }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    setIsWishlisted(initialWishlisted);
  }, [initialWishlisted]);

  const toggleWishlist = async () => {
    if (!session) {
      useAuthModalStore.getState().openModal('login');
      return;
    }

    setIsToggling(true);

    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      });

      if (res.ok) {
        const data = await res.json();
        setIsWishlisted(data.wishlisted);
      }
    } catch (err) {
      console.error(err);
    } finally {
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
      <svg viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
