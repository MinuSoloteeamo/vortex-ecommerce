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

    // Trường hợp 1: Đã xác thực
    if (status === 'authenticated' && currentUserId && prevUserId !== currentUserId) {
      // Nếu trạng thái trước đó là 'unauthenticated', nghĩa là người dùng vừa mới bấm đăng nhập
      // Nếu trạng thái trước đó là 'loading', nghĩa là người dùng vừa F5/reload trang
      const isJustLoggedIn = prevStatus === 'unauthenticated';
      
      // Tải giỏ hàng từ server về (chỉ gộp nếu vừa đăng nhập, còn reload thì đè luôn)
      useCartStore.getState().loadFromServer(isJustLoggedIn);
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
