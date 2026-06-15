import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import styles from './page.module.css';
import AddToCartButton from '@/components/product/AddToCartButton';
import AddToWishlistButton from '@/components/product/AddToWishlistButton';
import ProductCard from '@/components/product/ProductCard';
import ImageMagnifier from '@/components/ui/ImageMagnifier';
import { ReviewService } from '@/services/ReviewService';
import ReviewSection from '@/components/product/ReviewSection';
import ViewedProductTracker from '@/components/product/ViewedProductTracker';
import { auth } from '@/auth';
import { ProductService } from '@/services/ProductService';

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price) + '₫';
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const product = await prisma.product.findUnique({
    where: { slug: resolvedParams.slug },
  });

  if (!product) {
    return { title: 'Không tìm thấy sản phẩm | VORTEX' };
  }

  return {
    title: `${product.name} | VORTEX`,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }) {
  const resolvedParams = await params;
  
  // Fetch product data & session
  const [product, session] = await Promise.all([
    prisma.product.findUnique({
      where: { slug: resolvedParams.slug },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
      },
    }),
    auth()
  ]);

  if (!product || !product.isActive) {
    notFound();
  }

  // Fetch reviews and related products
  const [reviewsData, relatedProductsCategory, recommendedProducts, wishlistedEntry] = await Promise.all([
    ReviewService.getProductReviews(product.id),
    prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isActive: true,
      },
      take: 4,
      include: {
        images: true,
        category: true,
      }
    }),
    ProductService.getFrequentlyBoughtTogether(product.id, 4),
    session?.user?.id
      ? prisma.wishlist.findUnique({
          where: {
            userId_productId: {
              userId: session.user.id,
              productId: product.id,
            }
          }
        })
      : null
  ]);

  const { reviews, totalCount, averageRating } = reviewsData;
  const isWishlisted = !!wishlistedEntry;
  
  // Use recommended if available, otherwise fallback to category related
  const displayRelatedProducts = recommendedProducts.length > 0 ? recommendedProducts : relatedProductsCategory;
  const relatedTitle = recommendedProducts.length > 0 ? "Thường được mua cùng" : "Sản Phẩm Liên Quan";

  const mainImage = product.images?.[0]?.url || '📦';
  
  // Setup object for cart
  const cartProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    salePrice: product.salePrice,
    images: product.images,
    stock: product.stock,
  };

  return (
    <div className={styles.page}>
      <ViewedProductTracker product={cartProduct} />
      <div className={`container ${styles.container}`}>
        {/* GALLERY */}
        <div className={styles.gallery}>
          <div className={styles.mainImage}>
            <ImageMagnifier src={mainImage} alt={product.name} />
          </div>
          <div className={styles.thumbnails}>
            <div className={`${styles.thumbnail} ${styles.active}`}>
              {mainImage.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) ? (
                <img src={mainImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <span className={styles.thumbEmoji}>{mainImage}</span>
              )}
            </div>
            {/* Fake thumbnails for UI demo */}
            {[1, 2, 3].map(i => (
              <div key={i} className={styles.thumbnail}>
                {mainImage.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) ? (
                  <img src={mainImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: 0.5 }} />
                ) : (
                  <span className={styles.thumbEmoji}>{mainImage}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* INFO */}
        <div className={styles.info}>
          <div className={styles.breadcrumb}>
            <Link href="/">Trang chủ</Link>
            <span>/</span>
            <Link href={`/products?category=${product.category?.slug}`}>
              {product.category?.name}
            </Link>
            <span>/</span>
            <span style={{ color: 'var(--text-primary)' }}>{product.name}</span>
          </div>

          {product.isFeatured && (
            <span className={styles.badge}>Sản phẩm nổi bật</span>
          )}

          <h1 className={styles.title}>{product.name}</h1>
          
          <div className={styles.brand}>
            Thương hiệu: <strong>{product.brand || 'VORTEX'}</strong> | SKU: VTX-{product.id.slice(-6).toUpperCase()}
          </div>

          <div className={styles.pricing}>
            {product.salePrice ? (
              <>
                <span className={styles.salePrice}>{formatPrice(product.salePrice)}</span>
                <span className={styles.originalPrice}>{formatPrice(product.price)}</span>
              </>
            ) : (
              <span className={styles.price}>{formatPrice(product.price)}</span>
            )}
          </div>

          <div className={`${styles.stockStatus} ${product.stock > 0 ? styles.inStock : styles.outOfStock}`}>
            <span style={{ fontSize: '1.2rem' }}>{product.stock > 0 ? '✓' : '✗'}</span>
            {product.stock > 0 ? `Còn hàng (${product.stock} sản phẩm)` : 'Tạm hết hàng'}
          </div>

          <div className={styles.description}>
            {product.description || 'Chưa có mô tả cho sản phẩm này.'}
          </div>

          <div className={styles.actions}>
            <div style={{ flex: 1 }}>
              <AddToCartButton product={cartProduct} fullWidth={true} />
            </div>
            <AddToWishlistButton productId={product.id} initialWishlisted={isWishlisted} />
          </div>

          <div className={styles.tabs}>
            <div className={styles.tabList}>
              <button className={`${styles.tab} ${styles.active}`}>Mô tả chi tiết</button>
              <button className={styles.tab}>Thông số kỹ thuật</button>
            </div>
            <div className={styles.tabContent}>
              <p>{product.description}</p>
              <p style={{ marginTop: '1rem' }}>
                * Sản phẩm được bảo hành chính hãng 24 tháng theo quy định của nhà sản xuất. Hỗ trợ đổi trả miễn phí trong 30 ngày đầu nếu có lỗi phần cứng.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* RELATED PRODUCTS */}
      {displayRelatedProducts.length > 0 && (
        <div className="container" style={{ marginTop: 'var(--space-4xl)', paddingTop: 'var(--space-4xl)', borderTop: '1px solid var(--border-subtle)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-2xl)', fontWeight: '800', marginBottom: 'var(--space-2xl)' }}>
            {relatedTitle}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--space-lg)' }}>
            {displayRelatedProducts.map(relProduct => (
              <ProductCard key={relProduct.id} product={relProduct} />
            ))}
          </div>
        </div>
      )}

      <div className="container" style={{ marginTop: 'var(--space-4xl)' }}>
        <ReviewSection 
          productId={product.id}
          initialReviews={reviews}
          totalCount={totalCount}
          averageRating={averageRating}
        />
      </div>
    </div>
  );
}
