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
import ProductInteractive from '@/components/product/ProductInteractive';
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
        variants: {
          include: {
            images: { orderBy: { sortOrder: 'asc' } }
          }
        }
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
        <ProductInteractive 
          product={product} 
          isWishlisted={isWishlisted} 
          cartProduct={cartProduct} 
        />
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
