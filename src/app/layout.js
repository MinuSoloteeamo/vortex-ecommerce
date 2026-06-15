import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AuthProvider from '@/components/providers/AuthProvider';
import PageTransition from '@/components/layout/PageTransition';
import AIChatBox from '@/components/layout/AIChatBox';
import ToastContainer from '@/components/ui/Toast';
import CartSync from '@/components/providers/CartSync';

import AuthModal from '@/components/auth/AuthModal';

export const viewport = {
  themeColor: '#0a0a0f',
};

export const metadata = {
  title: 'VORTEX — Gaming Gear & Phụ Kiện Công Nghệ',
  description: 'Thiết bị gaming & phụ kiện công nghệ chính hãng. Bàn phím cơ, chuột gaming, tai nghe, ốp điện thoại và hơn thế nữa. Nâng tầm trải nghiệm số của bạn cùng VORTEX.',
  keywords: 'gaming gear, phụ kiện công nghệ, bàn phím cơ, chuột gaming, tai nghe gaming, vortex',
  openGraph: {
    title: 'VORTEX — Gaming Gear & Phụ Kiện Công Nghệ',
    description: 'Thiết bị gaming & phụ kiện công nghệ chính hãng. Nâng tầm trải nghiệm số cùng VORTEX.',
    type: 'website',
    locale: 'vi_VN',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        <AuthProvider>
          <Header />
          <main style={{ minHeight: '100vh', paddingTop: 'var(--header-height)' }}>
            <PageTransition>
              {children}
            </PageTransition>
          </main>
          <Footer />
          <AIChatBox />
          <ToastContainer />
          <CartSync />
          <AuthModal />
        </AuthProvider>
      </body>
    </html>
  );
}
