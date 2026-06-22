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

  // Parse color filter from searchParams
  const colorFilter = resolvedSearchParams.color 
    ? (Array.isArray(resolvedSearchParams.color) ? resolvedSearchParams.color : [resolvedSearchParams.color]) 
    : [];

  // Extract available dynamic specs from allBaseProducts (exclude color-related specs)
  const availableSpecs = {};
  allBaseProducts.forEach(p => {
    if (p.specs) {
      try {
        const parsed = JSON.parse(p.specs);
        if (Array.isArray(parsed)) {
          parsed.forEach(spec => {
            if (spec.key && spec.value) {
              const keyLower = spec.key.toLowerCase();
              if (keyLower.includes('màu') || keyLower.includes('color')) return; // skip color specs
              if (!availableSpecs[spec.key]) availableSpecs[spec.key] = new Set();
              availableSpecs[spec.key].add(spec.value);
            }
          });
        } else if (typeof parsed === 'object' && parsed !== null) {
          for (const [key, val] of Object.entries(parsed)) {
            const keyLower = key.toLowerCase();
            if (keyLower.includes('màu') || keyLower.includes('color')) continue; // skip color specs
            if (!availableSpecs[key]) availableSpecs[key] = new Set();
            availableSpecs[key].add(val);
          }
        }
      } catch (e) {}
    }
  });

  // Extract real colors from baseVariantName + variant names (normalize to merge duplicates)
  const colorMap = new Map(); // lowercase -> display name
  allBaseProducts.forEach(p => {
    if (p.baseVariantName) {
      const key = p.baseVariantName.trim().toLowerCase();
      if (!colorMap.has(key)) colorMap.set(key, p.baseVariantName.trim());
    }
    if (p.variants?.length > 0) {
      p.variants.forEach(v => {
        if (v.name) {
          const key = v.name.trim().toLowerCase();
          if (!colorMap.has(key)) colorMap.set(key, v.name.trim());
        }
      });
    }
  });

  // Convert Sets to Arrays for passing to Client Component
  const dynamicSpecsOptions = {};
  for (const key in availableSpecs) {
    dynamicSpecsOptions[key] = Array.from(availableSpecs[key]).sort();
  }

  const colorOptions = Array.from(colorMap.values()).sort();

  // Filter products by color if color filter is active
  let filteredProducts = products;
  if (colorFilter.length > 0) {
    const normalizeColor = (c) => (c || '').toLowerCase().trim();
    const filterColors = colorFilter.map(normalizeColor);
    
    filteredProducts = products.filter(p => {
      // Check baseVariantName
      if (p.baseVariantName && filterColors.includes(normalizeColor(p.baseVariantName))) return true;
      // Check variant names
      if (p.variants?.some(v => filterColors.includes(normalizeColor(v.name)))) return true;
      return false;
    });
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
          {/* MAIN CONTENT */}
          <main className={styles.main}>
            {filters.search && (
              <div style={{ marginBottom: '1rem' }}>
                <Link href="/products" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', display: 'inline-block' }}>
                  Xóa tìm kiếm: "{filters.search}"
                </Link>
              </div>
            )}
            
            <ProductFilters 
              categories={categories} 
              brands={brands} 
              dynamicSpecs={dynamicSpecsOptions}
              colorOptions={colorOptions}
              totalProducts={filteredProducts.length}
              currentSort={filters.sortBy}
            />

            {filteredProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                Không tìm thấy sản phẩm nào phù hợp với bộ lọc.
              </div>
            ) : (
              <div className={styles.grid}>
                {filteredProducts.map((product) => (
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
