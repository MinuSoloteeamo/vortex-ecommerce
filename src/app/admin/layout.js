'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import styles from './admin.module.css';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/orders', label: 'Quản lý Đơn hàng', icon: '📦' },
    { href: '/admin/products', label: 'Sản phẩm', icon: '💻' },
    { href: '/admin/abandoned-carts', label: 'Giỏ hàng Tồn', icon: '🛒' },
    { href: '/admin/support', label: 'Hỗ trợ Trực tuyến', icon: '💬' },
    { href: '/admin/users', label: 'Quản lý Người dùng', icon: '👥' },
    { href: '/admin/news', label: 'Quản lý Tin tức', icon: '📰' },
    { href: '/', label: 'Về trang Khách hàng', icon: '⬅️' },
  ];

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <Link href="/admin" className={styles.logo}>
          <span style={{ fontSize: '1.5rem', width: '24px', display: 'inline-flex', justifyContent: 'center' }}>⚡</span>
          <span className={styles.navText}>VORTEX Admin</span>
        </Link>
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}
              title={item.label}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navText}>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.headerTitle}>
            {navItems.find(item => item.href === pathname)?.label || 'Dashboard'}
          </h1>
          <div className={styles.headerActions}>
            <div className={styles.userInfo}>
              <span>Xin chào, <strong>{session?.user?.name || 'Admin'}</strong></span>
              <div className={styles.avatar}>{session?.user?.name?.[0] || 'A'}</div>
            </div>
            <button 
              onClick={() => signOut({ callbackUrl: '/' })} 
              className="btn btn-primary" 
              style={{ padding: '0.4rem 1rem', fontSize: '0.875rem' }}
            >
              Đăng xuất
            </button>
          </div>
        </header>
        
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
}
