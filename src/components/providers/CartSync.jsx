'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useCartStore } from '@/store/cart';

export default function CartSync() {
  const { data: session, status } = useSession();
  const prevStatusRef = useRef(status);
  const prevUserIdRef = useRef(null);

  useEffect(() => {
    const prevStatus = prevStatusRef.current;
    const prevUserId = prevUserIdRef.current;
    const currentUserId = session?.user?.id || null;

    // Trường hợp 1: Vừa đăng nhập thành công
    if (status === 'authenticated' && currentUserId && prevUserId !== currentUserId) {
      // Tải giỏ hàng từ server về
      useCartStore.getState().loadFromServer();
    }

    // Trường hợp 2: Vừa đăng xuất
    if (status === 'unauthenticated' && prevStatus === 'authenticated') {
      // Xóa giỏ local — KHÔNG xóa trên server (để khi login lại vẫn còn)
      useCartStore.getState().clearLocal();
    }

    prevStatusRef.current = status;
    prevUserIdRef.current = currentUserId;
  }, [status, session?.user?.id]);

  return null; // Component không render gì
}
