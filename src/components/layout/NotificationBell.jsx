'use client';

import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import Link from 'next/link';

const fetcher = url => fetch(url).then(res => res.json());

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Poll every 30 seconds
  const { data, mutate } = useSWR('/api/notifications', fetcher, { 
    refreshInterval: 30000,
    revalidateOnFocus: true
  });

  const unreadCount = data?.unreadCount || 0;
  const notifications = data?.notifications || [];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id = null) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(id ? { notificationId: id } : { markAll: true })
      });
      mutate(); // Refresh SWR
    } catch (error) {
      console.error('Failed to mark notification', error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'ORDER_PLACED': return '📦';
      case 'LOW_STOCK': return '⚠️';
      case 'POINTS_REDEEMED': return '💎';
      case 'CART_ADDED': return '🛒';
      case 'SUPPORT_MSG': return '💬';
      case 'ORDER_STATUS': return '🚀';
      case 'SUPPORT_REPLY': return '💬';
      case 'WELCOME': return '🎉';
      case 'BIRTHDAY': return '🎂';
      case 'VIP_UPGRADE': return '🌟';
      default: return '🔔';
    }
  };

  const getBgColor = (targetRole, isRead) => {
    if (isRead) return 'var(--bg-body)';
    return targetRole === 'ADMIN' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0, 240, 255, 0.1)';
  };

  return (
    <div className="notification-container" ref={dropdownRef} style={{ position: 'relative' }}>
      <button 
        className="icon-btn" 
        onClick={() => setIsOpen(!isOpen)}
        style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '0.5rem' }}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '0',
            right: '0',
            background: '#ef4444',
            color: 'white',
            fontSize: '0.7rem',
            padding: '2px 6px',
            borderRadius: '10px',
            fontWeight: 'bold',
            border: '2px solid var(--bg-card)'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: '-50px',
          width: '350px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          zIndex: 1000,
          marginTop: '0.5rem',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Thông báo</h3>
            {unreadCount > 0 && (
              <button 
                onClick={() => handleMarkAsRead()} 
                style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                Đánh dấu đã đọc tất cả
              </button>
            )}
          </div>

          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                📭 Chưa có thông báo nào
              </div>
            ) : (
              notifications.map(notif => (
                <div 
                  key={notif.id}
                  onClick={() => {
                    if (!notif.isRead) handleMarkAsRead(notif.id);
                  }}
                  style={{ 
                    padding: '1rem', 
                    borderBottom: '1px solid var(--border-subtle)',
                    background: getBgColor(notif.targetRole, notif.isRead),
                    display: 'flex',
                    gap: '1rem',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                >
                  <div style={{ fontSize: '1.5rem' }}>{getIcon(notif.type)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: notif.isRead ? 'normal' : 'bold', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                      {notif.targetRole === 'ADMIN' && <span style={{ color: '#ef4444', fontSize: '0.75rem', border: '1px solid #ef4444', padding: '1px 4px', borderRadius: '4px', marginRight: '6px' }}>ADMIN</span>}
                      {notif.title}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      {notif.message}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{new Date(notif.createdAt).toLocaleString('vi-VN')}</span>
                      {notif.link && (
                        <Link href={notif.link} style={{ color: 'var(--color-primary)' }}>Xem chi tiết</Link>
                      )}
                    </div>
                  </div>
                  {!notif.isRead && (
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary)', marginTop: '6px' }} />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
