import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import ProductCard from '@/components/product/ProductCard';
import LoginButton from '@/components/auth/LoginButton';
import styles from './page.module.css';

export const metadata = {
  title: 'Danh sách yêu thích | VORTEX',
  description: 'Những sản phẩm công nghệ bạn yêu thích nhất tại VORTEX.',
};

export default async function WishlistPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className={styles.page}>
        <div className="container" style={{ textAlign: 'center', padding: '6rem 0' }}>
          <div className={styles.emptyIcon}>❤️</div>
          <h1 className={styles.title} style={{ marginBottom: '1.5rem' }}>Danh Sách Yêu Thích</h1>
          <p className={styles.text} style={{ marginBottom: '2.5rem', color: 'var(--text-secondary)' }}>
            Vui lòng đăng nhập tài khoản để xem các sản phẩm bạn đã thêm vào danh sách yêu thích.
          </p>
          <LoginButton className="btn btn-primary" style={{ padding: '0.8rem 2rem' }}>
            Đăng Nhập Ngay
          </LoginButton>
        </div>
      </div>
    );
  }

  // Fetch wishlisted products
  const wishlistItems = await prisma.wishlist.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        include: {
          images: true,
          category: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <h1 className={styles.title}>Danh Sách Yêu Thích của bạn</h1>
          <p className={styles.subtitle}>
            Bạn đang lưu trữ <strong>{wishlistItems.length}</strong> sản phẩm yêu thích.
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className={styles.emptyContainer}>
            <div className={styles.emptyIcon}>🖤</div>
            <p className={styles.emptyText}>Chưa có sản phẩm nào trong danh sách yêu thích của bạn.</p>
            <Link href="/products" className="btn btn-primary" style={{ marginTop: '2rem' }}>
              Khám Phá Sản Phẩm Ngay
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {wishlistItems.map((item) => (
              <ProductCard 
                key={item.id} 
                product={item.product} 
                initialWishlisted={true} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
