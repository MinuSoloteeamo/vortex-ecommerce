'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCartStore } from '@/store/cart';

export default function AddToCartButton({ product, variant, quantity = 1, className, fullWidth }) {
  const { addItem, openDrawer } = useCartStore();

  const handleAdd = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) {
      alert('Sản phẩm hoặc biến thể này hiện đang tạm hết hàng!');
      return;
    }
    addItem(product, quantity, variant);
    openDrawer();
  }, [addItem, openDrawer, product, quantity, variant]);

  return (
    <button 
      onClick={handleAdd} 
      className={`${className || 'btn btn-primary'}`}
      style={{
        ...(fullWidth ? { width: '100%' } : {}),
        ...(product.stock <= 0 ? { opacity: 0.6, background: 'var(--bg-muted)', color: 'var(--text-muted)' } : {})
      }}
    >
      {product.stock <= 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
      {product.stock > 0 && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '8px', display: 'inline-block' }}>
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
      )}
    </button>
  );
}
