'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './TechNews.module.css';

const TABS = ['Mới nhất', 'Tin tức', 'Đánh giá', 'Tư vấn', 'Thủ thuật'];

export default function TechNews() {
  const [activeTab, setActiveTab] = useState('Mới nhất');
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/news')
      .then(res => res.json())
      .then(data => {
        setNewsData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return null;

  // Logic filter
  const filteredNews = activeTab === 'Mới nhất' 
    ? newsData 
    : newsData.filter(n => n.category.toLowerCase() === activeTab.toLowerCase());

  const featured = filteredNews.length > 0 ? (filteredNews.find(n => n.isFeatured) || filteredNews[0]) : null;
  // the rest is everything else up to 4 items
  const rest = featured ? filteredNews.filter(n => n.id !== featured.id).slice(0, 4) : [];

  return (
    <section className={`section ${styles.techNewsSection}`}>
      <div className="container">
        <h2 className={styles.sectionTitle}>Tin tức công nghệ</h2>
        
        {newsData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
            Chưa có bài viết nào được đăng. Hãy truy cập trang Quản trị để thêm bài viết mới nhé!
          </div>
        ) : (
          <>
            <div className={styles.tabs}>
              {TABS.map(tab => (
                <button
                  key={tab}
                  className={`${styles.tabBtn} ${activeTab === tab ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className={styles.newsGrid}>
              {/* LEFT: Featured */}
              {featured && (
                <div className={styles.featuredCard} style={featured.bgColor ? { backgroundColor: featured.bgColor } : {}}>
                  <div className={styles.featuredCategory}>{featured.category}</div>
                  <h3 className={styles.featuredTitle}>
                    <Link href={`/news/${featured.slug}`}>{featured.title}</Link>
                  </h3>
                  <div className={styles.meta}>
                    <span className={styles.author}>{featured.author}</span>
                    <span className={styles.divider}>/</span>
                    <span className={styles.date}>{new Date(featured.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  
                  <div className={styles.featuredImageWrapper}>
                    {featured.image && <img src={featured.image} alt={featured.title} className={styles.featuredImg} />}
                  </div>

                  <p className={styles.featuredDesc}>{featured.description}</p>
                </div>
              )}

              {/* RIGHT: List */}
              <div className={styles.listCol}>
                {rest.map(item => (
                  <div key={item.id} className={styles.listItem}>
                    <div className={styles.listImgWrapper}>
                      {item.image && <img src={item.image} alt={item.title} className={styles.listImg} />}
                    </div>
                    <div className={styles.listContent}>
                      <h4 className={styles.listTitle}>
                        <Link href={`/news/${item.slug}`}>{item.title}</Link>
                      </h4>
                      <div className={styles.meta}>
                        <span className={styles.author}>{item.author}</span>
                        <span className={styles.divider}>/</span>
                        <span className={styles.date}>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>
                ))}

                <div className={styles.viewAllWrapper}>
                  <Link href="/news" className={styles.viewAllBtn}>
                    Xem tất cả <span className={styles.viewAllIcon}>→</span>
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
