import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import styles from './page.module.css';

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price) + '₫';
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('vi-VN');
}

export const metadata = {
  title: 'Tất cả tin tức | VORTEX',
  description: 'Cập nhật tin tức công nghệ mới nhất từ VORTEX',
};


export default async function NewsPage() {
  // Fetch all news
  const newsList = await prisma.news.findMany({
    orderBy: { createdAt: 'desc' },
  });

  // Fetch top 6 best-selling products for sidebar
  const suggestedProducts = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { soldCount: 'desc' },
    take: 6,
    select: { id: true, name: true, slug: true, price: true, salePrice: true, images: { take: 1 } },
  });

  return (
    <div className={styles.page}>
      <div className="container">
        <header className={styles.header}>
          <h1 className={styles.title}>Tin Tức Công Nghệ</h1>
          <p className={styles.subtitle}>Cập nhật những xu hướng và thông tin mới nhất</p>
        </header>

        <div className={styles.layout}>
          {/* Main News List */}
          <main className={styles.newsList}>
            {newsList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                Chưa có tin tức nào được đăng.
              </div>
            ) : (
              newsList.map(news => (
                <Link href={`/news/${news.slug}`} key={news.id} className={styles.newsCard}>
                  <div className={styles.newsImageWrapper}>
                    {news.image ? (
                      <img src={news.image} alt={news.title} className={styles.newsImage} />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '3rem', opacity: 0.2 }}>
                        📰
                      </div>
                    )}
                  </div>
                  <div className={styles.newsContent}>
                    <span className={styles.newsCategory}>{news.category}</span>
                    <h2 className={styles.newsTitle}>{news.title}</h2>
                    <p className={styles.newsDesc}>{news.description}</p>
                    <div className={styles.newsMeta}>
                      <span>{news.author}</span>
                      <span>/</span>
                      <span>{formatDate(news.createdAt)}</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </main>

          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <h3 className={styles.sidebarTitle}>Sản Phẩm Gợi Ý</h3>
            <div className={styles.suggestedList}>
              {suggestedProducts.map(product => (
                <Link href={`/products/${product.slug}`} key={product.id} className={styles.suggestedItem}>
                  <div className={styles.suggestedImgWrapper}>
                    {product.images?.[0]?.url ? (
                      <img src={product.images[0].url} alt={product.name} className={styles.suggestedImg} />
                    ) : (
                      <span className={styles.suggestedEmoji}>📦</span>
                    )}
                  </div>
                  <div className={styles.suggestedInfo}>
                    <h4 className={styles.suggestedName}>{product.name}</h4>
                    <span className={styles.suggestedPrice}>
                      {formatPrice(product.salePrice || product.price)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
