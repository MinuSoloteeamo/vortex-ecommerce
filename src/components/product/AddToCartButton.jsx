'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCartStore } from '@/store/cart';

export default function AddToCartButton({ product, className, fullWidth }) {
  const addItem = useCartStore((state) => state.addItem);
  const [showToast, setShowToast] = useState(false);

  const handleAdd = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    setShowToast(true);
  }, [addItem, product]);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  return (
    <>
      <button 
        onClick={handleAdd} 
        disabled={product.stock === 0}
        className={`${className || 'btn btn-primary'}`}
        style={{
          ...(fullWidth ? { width: '100%' } : {}),
          ...(product.stock === 0 ? { opacity: 0.5, cursor: 'not-allowed', background: 'var(--bg-muted)', color: 'var(--text-muted)' } : {})
        }}
      >
        {product.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
        {product.stock > 0 && (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '8px', display: 'inline-block' }}>
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
        )}
      </button>

      {showToast && <Toast product={product} />}
    </>
  );
}

function Toast({ product }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return require('react-dom').createPortal(
    <div
      style={{
        position: 'fixed',
        top: '5rem',
        right: '2rem',
        zIndex: 9999,
        padding: '1rem 1.5rem',
        background: 'rgba(17, 17, 24, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(0, 240, 255, 0.3)',
        borderRadius: '12px',
        boxShadow: '0 0 20px rgba(0, 240, 255, 0.15), 0 8px 32px rgba(0, 0, 0, 0.5)',
        color: '#f0f0f5',
        fontSize: '0.875rem',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        animation: 'slideInRight 0.3s ease',
      }}
    >
      <span style={{ fontSize: '1.25rem' }}>✅</span>
      Đã thêm <strong style={{ color: '#00f0ff' }}>{product.name}</strong> vào giỏ hàng!
    </div>,
    document.body
  );
}
