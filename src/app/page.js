import Link from 'next/link';
import styles from './page.module.css';
import NewsletterForm from '@/components/home/NewsletterForm';
import TechNews from '@/components/home/TechNews';
import ScrollReveal from '@/components/ui/ScrollRevealWrapper';

const FEATURED_PRODUCTS = [
  {
    id: '1',
    name: 'Razer DeathAdder V3 Pro',
    slug: 'razer-deathadder-v3-pro',
    price: 3290000,
    salePrice: 2790000,
    image: '🖱️',
    category: 'Chuột gaming',
    badge: 'Hot',
  },
  {
    id: '2',
    name: 'Keychron Q1 Max',
    slug: 'keychron-q1-max',
    price: 4590000,
    salePrice: null,
    image: '⌨️',
    category: 'Bàn phím cơ',
    badge: 'Mới',
  },
  {
    id: '3',
    name: 'Sony WH-1000XM5',
    slug: 'sony-wh-1000xm5',
    price: 7990000,
    salePrice: 6490000,
    image: '🎧',
    category: 'Tai nghe',
    badge: '-19%',
  },
  {
    id: '4',
    name: 'Anker 737 GaNPrime',
    slug: 'anker-737-ganprime',
    price: 1890000,
    salePrice: 1490000,
    image: '🔌',
    category: 'Sạc & Cáp',
    badge: 'Bán chạy',
  },
];

const CATEGORIES = [
  { name: 'Bàn phím cơ', slug: 'ban-phim-co', icon: '⌨️', count: 45, color: '#00f0ff' },
  { name: 'Chuột gaming', slug: 'chuot-gaming', icon: '🖱️', count: 38, color: '#a855f7' },
  { name: 'Tai nghe', slug: 'tai-nghe', icon: '🎧', count: 52, color: '#f43f5e' },
  { name: 'Bàn di chuột', slug: 'ban-di-chuot', icon: '🖼️', count: 24, color: '#22c55e' },
  { name: 'Ghế gaming', slug: 'ghe-gaming', icon: '🪑', count: 18, color: '#f59e0b' },
  { name: 'Ốp điện thoại', slug: 'op-dien-thoai', icon: '📱', count: 120, color: '#00f0ff' },
  { name: 'Sạc & Cáp', slug: 'sac-cap', icon: '🔌', count: 67, color: '#a855f7' },
  { name: 'Phụ kiện laptop', slug: 'phu-kien-laptop', icon: '💻', count: 43, color: '#f43f5e' },
  { name: 'Loa & Âm thanh', slug: 'loa-am-thanh', icon: '🔊', count: 31, color: '#22c55e' },
  { name: 'USB & Lưu trữ', slug: 'usb-luu-tru', icon: '💾', count: 29, color: '#f59e0b' },
];

const FEATURES = [
  { icon: '🚚', title: 'Giao hàng miễn phí', desc: 'Đơn hàng từ 500K' },
  { icon: '🔄', title: 'Đổi trả 30 ngày', desc: 'Miễn phí đổi trả' },
  { icon: '🛡️', title: 'Bảo hành chính hãng', desc: 'Lên đến 24 tháng' },
  { icon: '💬', title: 'Hỗ trợ 24/7', desc: 'Luôn sẵn sàng' },
];

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price) + '₫';
}

export default function HomePage() {
  return (
    <div className={styles.page}>
      
      {/* ══ HERO SECTION ══ */}
      <section className={styles.hero} id="hero-section">
        {/* Animated background elements */}
        <div className={styles.heroBg}>
          <div className={styles.heroOrb1} />
          <div className={styles.heroOrb2} />
          <div className={styles.heroOrb3} />
          <div className={styles.heroGrid} />
        </div>

        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroText}>
            <span className={styles.heroBadge}>
              <span className={styles.heroBadgeDot} />
              Gaming Gear & Tech Accessories
            </span>
            <h1 className={styles.heroTitle}>
              <span className={styles.heroTitleLine1}>NÂNG TẦM</span>
              <span className={styles.heroTitleLine2}>
                TRẢI NGHIỆM <span className="text-gradient">SỐ</span>
              </span>
            </h1>
            <p className={styles.heroDesc}>
              Khám phá bộ sưu tập thiết bị gaming và phụ kiện công nghệ cao cấp. 
              Từ bàn phím cơ, chuột gaming đến phụ kiện smart — tất cả tại VORTEX.
            </p>
            <div className={styles.heroCTA}>
              <Link href="/products" className="btn btn-primary btn-lg" id="hero-shop-now">
                Mua sắm ngay
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14m-7-7 7 7-7 7"/>
                </svg>
              </Link>
              <Link href="/products?group=gaming" className="btn btn-secondary btn-lg" id="hero-gaming">
                🎮 Gaming Gear
              </Link>
            </div>

            {/* Stats */}
            <div className={styles.heroStats}>
              <div className={styles.stat}>
                <span className={styles.statNumber}>500+</span>
                <span className={styles.statLabel}>Sản phẩm</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.stat}>
                <span className={styles.statNumber}>50+</span>
                <span className={styles.statLabel}>Thương hiệu</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.stat}>
                <span className={styles.statNumber}>10K+</span>
                <span className={styles.statLabel}>Khách hàng</span>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className={styles.heroVisual}>
            <div className={styles.heroCard}>
              <div className={styles.heroCardGlow} />
              <div className={styles.heroEmoji}>🎮</div>
              <div className={styles.heroCardLabel}>GAME ON</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FEATURES BAR ══ */}
      <ScrollReveal direction="up" delay={100}>
      <section className={styles.features} id="features-bar">
        <div className="container">
          <div className={styles.featuresGrid}>
            {FEATURES.map((feature, i) => (
              <div key={i} className={styles.featureItem}>
                <span className={styles.featureIcon}>{feature.icon}</span>
                <div>
                  <div className={styles.featureTitle}>{feature.title}</div>
                  <div className={styles.featureDesc}>{feature.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* ══ CATEGORIES ══ */}
      <ScrollReveal direction="up" delay={150}>
      <section className={`section ${styles.categoriesSection}`} id="categories-section">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Danh mục</span>
            <h2 className={styles.sectionTitle}>
              Khám phá theo <span className="text-gradient">danh mục</span>
            </h2>
            <p className={styles.sectionDesc}>
              Tìm kiếm sản phẩm phù hợp theo từng danh mục chuyên biệt
            </p>
          </div>

          <div className={styles.categoriesGrid}>
            {CATEGORIES.map((cat, i) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className={styles.categoryCard}
                style={{ '--accent': cat.color, animationDelay: `${i * 0.05}s` }}
                id={`category-${cat.slug}`}
              >
                <span className={styles.categoryIcon}>{cat.icon}</span>
                <span className={styles.categoryName}>{cat.name}</span>
                <span className={styles.categoryCount}>{cat.count} sản phẩm</span>
                <div className={styles.categoryGlow} />
              </Link>
            ))}
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* ══ FEATURED PRODUCTS ══ */}
      <ScrollReveal direction="up" delay={200}>
      <section className={`section ${styles.productsSection}`} id="featured-products">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Nổi bật</span>
            <h2 className={styles.sectionTitle}>
              Sản phẩm <span className="text-gradient">bán chạy</span>
            </h2>
            <p className={styles.sectionDesc}>
              Những sản phẩm được yêu thích nhất tại VORTEX
            </p>
          </div>

          <div className={styles.productsGrid}>
            {FEATURED_PRODUCTS.map((product, i) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className={styles.productCard}
                style={{ animationDelay: `${i * 0.1}s` }}
                id={`product-${product.slug}`}
              >
                {product.badge && (
                  <span className={styles.productBadge}>{product.badge}</span>
                )}
                <div className={styles.productImage}>
                  <span className={styles.productEmoji}>{product.image}</span>
                </div>
                <div className={styles.productInfo}>
                  <span className={styles.productCategory}>{product.category}</span>
                  <h3 className={styles.productName}>{product.name}</h3>
                  <div className={styles.productPricing}>
                    {product.salePrice ? (
                      <>
                        <span className={styles.productSalePrice}>
                          {formatPrice(product.salePrice)}
                        </span>
                        <span className={styles.productOriginalPrice}>
                          {formatPrice(product.price)}
                        </span>
                      </>
                    ) : (
                      <span className={styles.productPrice}>
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>
                </div>
                <div className={styles.productCardGlow} />
              </Link>
            ))}
          </div>

          <div className={styles.viewAllBtn}>
            <Link href="/products" className="btn btn-secondary btn-lg" id="view-all-products">
              Xem tất cả sản phẩm →
            </Link>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* ══ PROMO BANNER ══ */}
      <ScrollReveal direction="left" delay={100}>
      <section className={styles.promoBanner} id="promo-section">
        <div className="container">
          <div className={styles.promoCard}>
            <div className={styles.promoGlow} />
            <div className={styles.promoContent}>
              <span className={styles.promoLabel}>🔥 Ưu đãi đặc biệt</span>
              <h2 className={styles.promoTitle}>
                GIẢM ĐẾN <span className={styles.promoHighlight}>30%</span>
              </h2>
              <p className={styles.promoDesc}>
                Bộ sưu tập Gaming Gear mới nhất. Nâng cấp setup của bạn ngay hôm nay!
              </p>
              <Link href="/products?group=gaming" className="btn btn-primary btn-lg">
                Khám phá ngay
              </Link>
            </div>
            <div className={styles.promoVisual}>
              <span className={styles.promoEmoji}>🎮</span>
              <span className={styles.promoEmoji2}>⌨️</span>
              <span className={styles.promoEmoji3}>🎧</span>
            </div>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* ══ TECH NEWS ══ */}
      <ScrollReveal direction="up" delay={100}>
        <TechNews />
      </ScrollReveal>

      {/* ══ NEWSLETTER ══ */}
      <ScrollReveal direction="up" delay={150}>
      <section className={`section ${styles.newsletter}`} id="newsletter-section">
        <div className="container">
          <div className={styles.newsletterCard}>
            <h2 className={styles.newsletterTitle}>
              Đăng ký nhận <span className="text-gradient">ưu đãi</span>
            </h2>
            <p className={styles.newsletterDesc}>
              Nhận thông tin sản phẩm mới và mã giảm giá độc quyền qua email
            </p>
            <NewsletterForm styles={styles} />
          </div>
        </div>
      </section>
      </ScrollReveal>
    </div>
  );
}
