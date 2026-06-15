import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import styles from './page.module.css';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const news = await prisma.news.findUnique({ where: { slug } });
  if (!news) return { title: 'Không tìm thấy bài viết | VORTEX' };
  return {
    title: `${news.title} | VORTEX`,
    description: news.description || news.title,
  };
}

export default async function NewsDetailPage({ params }) {
  const { slug } = await params;
  const news = await prisma.news.findUnique({ where: { slug } });

  if (!news) {
    notFound();
  }

  const hasHtml = news.content && (
    news.content.includes('<p>') ||
    news.content.includes('<br') ||
    news.content.includes('<h') ||
    news.content.includes('<ul') ||
    news.content.includes('<b>') ||
    news.content.includes('<strong') ||
    news.content.includes('<blockquote')
  );

  const bannerStyle = news.bgColor
    ? { background: `linear-gradient(135deg, ${news.bgColor}22 0%, ${news.bgColor}08 100%)` }
    : {};

  return (
    <div className={styles.page}>
      {/* Hero Banner */}
      <div className={styles.heroBanner} style={bannerStyle}>
        <div className="container">
          <div className={styles.heroContent}>
            {/* Breadcrumb */}
            <nav className={styles.breadcrumb}>
              <Link href="/">Trang chủ</Link>
              <span className={styles.breadcrumbSep}>/</span>
              <Link href="/news">Tin tức</Link>
              <span className={styles.breadcrumbSep}>/</span>
              <span style={{ color: 'var(--text-secondary)' }}>{news.category}</span>
            </nav>

            <span className={styles.category}>{news.category}</span>
            <h1 className={styles.heroTitle}>{news.title}</h1>

            <div className={styles.heroMeta}>
              <div className={styles.authorAvatar}>
                {news.author?.[0]?.toUpperCase() || 'V'}
              </div>
              <span>{news.author}</span>
              <span className={styles.metaDivider} />
              <span>{new Date(news.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      {news.image && (
        <div className="container">
          <div className={styles.featureImageWrapper}>
            <img src={news.image} alt={news.title} className={styles.featureImage} />
          </div>
        </div>
      )}

      {/* Article Body */}
      <div className={styles.articleBody}>
        {news.content ? (
          hasHtml ? (
            <div
              className={styles.articleContent}
              dangerouslySetInnerHTML={{ __html: news.content }}
            />
          ) : (
            <div className={styles.plainText}>
              {news.content}
            </div>
          )
        ) : news.description ? (
          <div className={styles.plainText}>
            {news.description}
          </div>
        ) : (
          <div className={styles.noContent}>
            <p>Bài viết chưa có nội dung chi tiết.</p>
          </div>
        )}

        <Link href="/news" className={styles.backLink}>
          ← Quay lại danh sách tin tức
        </Link>
      </div>
    </div>
  );
}
