'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import styles from './layout.module.css';

export default function AccountLayout({ children }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const NAV_ITEMS = [
    { path: '/account', label: 'Thông tin tài khoản', icon: '👤' },
    { path: '/account/vip', label: 'Thẻ VIP VORTEX', icon: '💎' },
    { path: '/account/addresses', label: 'Sổ địa chỉ', icon: '📍' },
    { path: '/account/orders', label: 'Quản lý đơn hàng', icon: '📦' },
    { path: '/account/viewed', label: 'Sản phẩm đã xem', icon: '👁️' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.layout}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              {session?.user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className={styles.userDetails}>
              <div className={styles.userName}>{session?.user?.name || 'Thành viên'}</div>
              <div className={styles.userEmail}>{session?.user?.email}</div>
            </div>
          </div>
          
          <nav className={styles.navMenu}>
            {NAV_ITEMS.map(item => (
              <Link 
                key={item.path} 
                href={item.path}
                className={`${styles.navItem} ${pathname === item.path ? styles.active : ''}`}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {item.label}
              </Link>
            ))}
            
            <button onClick={() => signOut({ callbackUrl: '/' })} className={`${styles.navItem} ${styles.logoutBtn}`}>
              <span className={styles.navIcon}>🚪</span>
              Đăng xuất
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
    </div>
  );
}
