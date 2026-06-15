import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ProductService } from '@/services/ProductService';
import { auth } from '@/auth';
import styles from './page.module.css';
import ProductCard from '@/components/product/ProductCard';
import ProductFilters from '@/components/product/ProductFilters';

// Format price utility
function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price) + '₫';
}

export const metadata = {
  title: 'Sản phẩm | VORTEX',
  description: 'Khám phá tất cả thiết bị gaming và phụ kiện công nghệ tại VORTEX.',
};

export default async function ProductsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  
  // Parse query params
  const filters = {
    category: resolvedSearchParams.category ? (Array.isArray(resolvedSearchParams.category) ? resolvedSearchParams.category : [resolvedSearchParams.category]) : undefined,
    group: resolvedSearchParams.group,
    brand: resolvedSearchParams.brand ? (Array.isArray(resolvedSearchParams.brand) ? resolvedSearchParams.brand : [resolvedSearchParams.brand]) : undefined,
    search: resolvedSearchParams.search,
    minPrice: resolvedSearchParams.minPrice,
    maxPrice: resolvedSearchParams.maxPrice,
    sortBy: resolvedSearchParams.sortBy,
  };

  // Parse dynamic spec filters from searchParams (keys starting with spec_)
  const specs = {};
  for (const [key, value] of Object.entries(resolvedSearchParams)) {
    if (key.startsWith('spec_')) {
      const specKey = key.replace('spec_', '');
      specs[specKey] = Array.isArray(value) ? value : [value];
    }
  }
  filters.specs = specs;

  // Fetch data & session
  // To show all available specs for the current category/search, we should ideally fetch base products
  // without spec filters. But for simplicity, we pass filters directly.
  const [products, allBaseProducts, categories, brandsResult, session] = await Promise.all([
    ProductService.getAllProducts(filters),
    ProductService.getAllProducts({ ...filters, specs: {} }), // fetch without specs to get all available options
    prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.product.findMany({ select: { brand: true }, distinct: ['brand'], where: { brand: { not: null } } }),
    auth()
  ]);

  const brands = brandsResult.map(b => b.brand);

  // Extract available dynamic specs from allBaseProducts
  const availableSpecs = {};
  allBaseProducts.forEach(p => {
    if (p.specs) {
      try {
        const parsed = JSON.parse(p.specs);
        for (const [key, val] of Object.entries(parsed)) {
          if (!availableSpecs[key]) availableSpecs[key] = new Set();
          availableSpecs[key].add(val);
        }
      } catch (e) {}
    }
  });

  // Convert Sets to Arrays for passing to Client Component
  const dynamicSpecsOptions = {};
  for (const key in availableSpecs) {
    dynamicSpecsOptions[key] = Array.from(availableSpecs[key]).sort();
  }

  // Fetch wishlisted product ids if user is logged in
  let wishlistedIds = [];
  if (session?.user?.id) {
    try {
      const userWishlist = await prisma.wishlist.findMany({
        where: { userId: session.user.id },
        select: { productId: true }
      });
      wishlistedIds = userWishlist.map(w => w.productId);
    } catch (e) {
      console.error("Failed to fetch wishlist:", e);
    }
  }

  // Helper to build URL
  const buildUrl = (key, value) => {
    const params = new URLSearchParams(resolvedSearchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    return `/products?${params.toString()}`;
  };

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <h1 className={styles.title}>
            {filters.search ? `Kết quả tìm kiếm cho "${filters.search}"` : 'Tất cả sản phẩm'}
          </h1>
        </div>

        <div className={styles.container}>
          {/* SIDEBAR */}
          <div style={{ width: '280px', flexShrink: 0 }}>
            {filters.search && (
              <div style={{ marginBottom: '1rem' }}>
                <Link href="/products" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', display: 'inline-block', width: '100%', textAlign: 'center' }}>
                  Xóa tìm kiếm: "{filters.search}"
                </Link>
              </div>
            )}
            <ProductFilters 
              categories={categories} 
              brands={brands} 
              dynamicSpecs={dynamicSpecsOptions}
            />
          </div>

          {/* MAIN CONTENT */}
          <main className={styles.main}>
            <div className={styles.toolbar} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
              <div className={styles.resultsCount}>
                Hiển thị <strong>{products.length}</strong> sản phẩm
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Sắp xếp:</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link href={buildUrl('sortBy', '')} style={{ padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.875rem', background: !filters.sortBy ? 'var(--color-primary-dim)' : 'var(--bg-glass)', color: !filters.sortBy ? 'var(--color-primary)' : 'var(--text-primary)', border: '1px solid var(--border-subtle)', textDecoration: 'none' }}>Mới nhất</Link>
                  <Link href={buildUrl('sortBy', 'price_asc')} style={{ padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.875rem', background: filters.sortBy === 'price_asc' ? 'var(--color-primary-dim)' : 'var(--bg-glass)', color: filters.sortBy === 'price_asc' ? 'var(--color-primary)' : 'var(--text-primary)', border: '1px solid var(--border-subtle)', textDecoration: 'none' }}>Giá Tăng</Link>
                  <Link href={buildUrl('sortBy', 'price_desc')} style={{ padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.875rem', background: filters.sortBy === 'price_desc' ? 'var(--color-primary-dim)' : 'var(--bg-glass)', color: filters.sortBy === 'price_desc' ? 'var(--color-primary)' : 'var(--text-primary)', border: '1px solid var(--border-subtle)', textDecoration: 'none' }}>Giá Giảm</Link>
                </div>
              </div>
            </div>

            {products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                Không tìm thấy sản phẩm nào phù hợp với bộ lọc.
              </div>
            ) : (
              <div className={styles.grid}>
                {products.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    initialWishlisted={wishlistedIds.includes(product.id)} 
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
