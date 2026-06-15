'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function ViewedProductTracker({ product }) {
  const { data: session } = useSession();

  useEffect(() => {
    if (!product || !product.id) return;
    
    try {
      // Append userId to key to keep history separate per account
      const storageKey = `vortex_viewed_products_${session?.user?.id || 'guest'}`;
      const stored = localStorage.getItem(storageKey);
      let viewed = stored ? JSON.parse(stored) : [];
      
      // Remove if exists
      viewed = viewed.filter(p => p.id !== product.id);
      
      // Add to beginning
      viewed.unshift(product);
      
      // Keep max 20
      if (viewed.length > 20) viewed.pop();
      
      localStorage.setItem(storageKey, JSON.stringify(viewed));
    } catch (e) {
      console.error('Failed to save viewed product', e);
    }
  }, [product, session]);

  return null;
}
