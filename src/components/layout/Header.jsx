'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useCartStore } from '@/store/cart';
import { useAuthModalStore } from '@/store/authModal';
import SearchBar from './SearchBar';
import NotificationBell from './NotificationBell';
import styles from './Header.module.css';

const handleSignOut = () => {
  // Xóa giỏ hàng local TRƯỚC KHI đăng xuất
  useCartStore.getState().clearLocal();
  signOut();
};

const CATEGORIES = {
  gaming: {
    label: '🎮 Gaming Gear',
    items: [
      { name: 'Bàn phím cơ', slug: 'ban-phim-co', icon: '⌨️' },
      { name: 'Chuột gaming', slug: 'chuot-gaming', icon: '🖱️' },
      { name: 'Tai nghe', slug: 'tai-nghe', icon: '🎧' },
      { name: 'Bàn di chuột', slug: 'ban-di-chuot', icon: '🖼️' },
      { name: 'Ghế gaming', slug: 'ghe-gaming', icon: '🪑' },
    ],
  },
  tech: {
    label: '💻 Phụ Kiện CN',
    items: [
      { name: 'Ốp điện thoại', slug: 'op-dien-thoai', icon: '📱' },
      { name: 'Sạc & Cáp', slug: 'sac-cap', icon: '🔌' },
      { name: 'Phụ kiện laptop', slug: 'phu-kien-laptop', icon: '💻' },
      { name: 'Loa & Âm thanh', slug: 'loa-am-thanh', icon: '🔊' },
      { name: 'USB & Lưu trữ', slug: 'usb-luu-tru', icon: '💾' },
    ],
  },
};

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mounted, setMounted] = useState(false);
  const { openModal } = useAuthModalStore();
  const pathname = usePathname();
  
  const { data: session } = useSession();

  const items = useCartStore((s) => s.items);
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMounted(true);
    
    // Check for birthday bonus if user is logged in
    if (session?.user) {
      fetch('/api/user/birthday-check', { method: 'POST' }).catch(console.error);
    }
  }, [session]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.headerInner}`}>
        {/* Logo */}
        <Link href="/" className={styles.logo} id="header-logo">
          <span className={styles.logoIcon}>🌀</span>
          <span className={styles.logoText}>VORTEX</span>
        </Link>

        {/* Desktop Nav */}
        <nav className={styles.nav} id="main-navigation">
          <Link href="/" className={`${styles.navLink} ${pathname === '/' ? styles.active : ''}`}>
            Trang chủ
          </Link>

          {/* Gaming Gear Dropdown */}
          <div
            className={styles.navDropdown}
            onMouseEnter={() => setActiveDropdown('gaming')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button className={`${styles.navLink} ${styles.navDropdownTrigger}`} id="nav-gaming">
              Gaming Gear
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={styles.chevron}>
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {activeDropdown === 'gaming' && (
              <div className={styles.dropdownMenu}>
                <div className={styles.dropdownHeader}>
                  <span>🎮</span> Gaming Gear
                </div>
                {CATEGORIES.gaming.items.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/products?category=${item.slug}`}
                    className={styles.dropdownItem}
                  >
                    <span className={styles.dropdownIcon}>{item.icon}</span>
                    {item.name}
                  </Link>
                ))}
                <div className={styles.dropdownFooter}>
                  <Link href="/products?group=gaming" className={styles.viewAll}>
                    Xem tất cả Gaming Gear →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Tech Accessories Dropdown */}
          <div
            className={styles.navDropdown}
            onMouseEnter={() => setActiveDropdown('tech')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button className={`${styles.navLink} ${styles.navDropdownTrigger}`} id="nav-tech">
              Phụ Kiện CN
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={styles.chevron}>
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {activeDropdown === 'tech' && (
              <div className={styles.dropdownMenu}>
                <div className={styles.dropdownHeader}>
                  <span>💻</span> Phụ Kiện Công Nghệ
                </div>
                {CATEGORIES.tech.items.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/products?category=${item.slug}`}
                    className={styles.dropdownItem}
                  >
                    <span className={styles.dropdownIcon}>{item.icon}</span>
                    {item.name}
                  </Link>
                ))}
                <div className={styles.dropdownFooter}>
                  <Link href="/products?group=tech" className={styles.viewAll}>
                    Xem tất cả Phụ Kiện →
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/products"
            className={`${styles.navLink} ${pathname === '/products' ? styles.active : ''}`}
          >
            Tất cả sản phẩm
          </Link>
        </nav>

        {/* Search Bar - Center/Right */}
        <SearchBar />

        {/* Actions */}
        <div className={styles.actions}>
          {/* Notification Bell */}
          {session?.user && <NotificationBell />}

          {/* Wishlist */}
          <Link href="/wishlist" className={styles.cartBtn} id="header-wishlist" title="Danh sách yêu thích" style={{ marginRight: '4px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </Link>

          {/* Cart */}
          <Link href="/cart" className={styles.cartBtn} id="header-cart" title="Giỏ hàng">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
              <path d="M3 6h18"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {mounted && cartCount > 0 && (
              <span className={styles.cartBadge}>{cartCount}</span>
            )}
          </Link>

          {/* Account */}
          {session?.user ? (
            <div
              className={styles.navDropdown}
              onMouseEnter={() => setActiveDropdown('account')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <div className={styles.userAvatar} id="header-account">
                {session.user.name?.[0]?.toUpperCase() || 'U'}
              </div>
              {activeDropdown === 'account' && (
                <div className={`${styles.dropdownMenu} ${styles.dropdownAccount}`}>
                  <div className={styles.dropdownHeader} style={{ fontSize: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                    <strong>{session.user.name}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{session.user.email}</div>
                  </div>
                  <Link href="/account" className={styles.dropdownItem} onClick={() => setActiveDropdown(null)}>
                    <span className={styles.dropdownIcon}>👤</span> Hồ sơ cá nhân
                  </Link>
                  <Link href="/wishlist" className={styles.dropdownItem} onClick={() => setActiveDropdown(null)}>
                    <span className={styles.dropdownIcon}>❤️</span> Sản phẩm yêu thích
                  </Link>
                  <Link href="/account/orders" className={styles.dropdownItem}>
                    <span className={styles.dropdownIcon}>📦</span> Đơn hàng của tôi
                  </Link>
                  {session.user?.role === 'ADMIN' && (
                    <Link href="/admin" className={styles.dropdownItem} onClick={() => setActiveDropdown(null)}>
                      <span className={styles.dropdownIcon}>⚡</span>
                      Trang Quản Trị
                    </Link>
                  )}
                  {session.user?.role === 'SHIPPER' && (
                    <Link href="/shipper" className={styles.dropdownItem} onClick={() => setActiveDropdown(null)}>
                      <span className={styles.dropdownIcon}>🚀</span>
                      Kênh Giao Hàng
                    </Link>
                  )}
                  <div className={styles.dropdownFooter}>
                    <button onClick={handleSignOut} className={styles.dropdownItem} style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-danger)' }}>
                      <span className={styles.dropdownIcon}>🚪</span>
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => openModal('login')} className={styles.actionBtn} id="header-account" title="Đăng nhập" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className={styles.mobileToggle}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            id="mobile-menu-toggle"
            aria-label="Menu"
          >
            <span className={`${styles.hamburger} ${isMobileMenuOpen ? styles.open : ''}`}>
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className={styles.mobileMenu} id="mobile-menu">
          <div className={styles.mobileMenuInner}>
            <Link href="/" className={styles.mobileLink}>Trang chủ</Link>

            <div className={styles.mobileGroup}>
              <div className={styles.mobileGroupLabel}>🎮 Gaming Gear</div>
              {CATEGORIES.gaming.items.map((item) => (
                <Link
                  key={item.slug}
                  href={`/products?category=${item.slug}`}
                  className={styles.mobileSubLink}
                >
                  {item.icon} {item.name}
                </Link>
              ))}
            </div>

            <div className={styles.mobileGroup}>
              <div className={styles.mobileGroupLabel}>💻 Phụ Kiện CN</div>
              {CATEGORIES.tech.items.map((item) => (
                <Link
                  key={item.slug}
                  href={`/products?category=${item.slug}`}
                  className={styles.mobileSubLink}
                >
                  {item.icon} {item.name}
                </Link>
              ))}
            </div>

            <Link href="/products" className={styles.mobileLink}>Tất cả sản phẩm</Link>

            <div className={styles.mobileDivider} />

            {session?.user ? (
              <>
                <div className={styles.mobileGroupLabel}>Tài khoản ({session.user.name})</div>
                <Link href="/account" className={styles.mobileSubLink}>Hồ sơ cá nhân</Link>
                <Link href="/wishlist" className={styles.mobileSubLink}>Sản phẩm yêu thích</Link>
                <Link href="/account/orders" className={styles.mobileSubLink}>Đơn hàng của tôi</Link>
                {session.user?.role === 'ADMIN' && (
                  <Link href="/admin" className={styles.mobileSubLink}>Trang Quản Trị</Link>
                )}
                {session.user?.role === 'SHIPPER' && (
                  <Link href="/shipper" className={styles.mobileSubLink}>Kênh Giao Hàng</Link>
                )}
                <button onClick={handleSignOut} className={styles.mobileSubLink} style={{ color: 'var(--color-danger)' }}>Đăng xuất</button>
              </>
            ) : (
              <button 
                onClick={() => { setIsMobileMenuOpen(false); openModal('login'); }} 
                className={styles.mobileLink} 
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: 'inherit' }}
              >
                Đăng nhập
              </button>
            )}
            <Link href="/cart" className={styles.mobileLink}>
              Giỏ hàng {mounted && cartCount > 0 && `(${cartCount})`}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
