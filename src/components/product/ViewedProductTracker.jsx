'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';

function getOrCreateSessionId() {
  let sid = sessionStorage.getItem('vortex_session_id');
  if (!sid) {
    sid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('vortex_session_id', sid);
  }
  return sid;
}

export default function ViewedProductTracker({ product }) {
  const { data: session } = useSession();
  const viewIdRef = useRef(null);

  useEffect(() => {
    if (!product || !product.id) return;
    
    // 1. Local history saving
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

    // 2. Server analytics tracking
    const sid = getOrCreateSessionId();
    let startTime = Date.now();
    let intervalId;

    fetch('/api/analytics/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product.id, sessionId: sid })
    })
      .then(res => res.json())
      .then(data => {
        if (data.id) {
          viewIdRef.current = data.id;
          
          // Start interval to ping view duration every 5s
          intervalId = setInterval(() => {
            const duration = Math.floor((Date.now() - startTime) / 1000);
            fetch('/api/analytics/view', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: viewIdRef.current, duration })
            }).catch(() => {});
          }, 5000);
        }
      })
      .catch(e => console.error('Analytics init error', e));

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (viewIdRef.current) {
        const duration = Math.floor((Date.now() - startTime) / 1000);
        try {
           fetch('/api/analytics/view', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: viewIdRef.current, duration }),
              keepalive: true
           }).catch(() => {});
        } catch (err) {}
      }
    };
  }, [product, session]);

  return null;
}
