import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ProductService } from '@/services/ProductService';
import { auth } from '@/auth';
import styles from './page.module.css';
import ProductCard from '@/components/product/ProductCard';
import ProductFilters from '@/components/product/ProductFilters';

// Hàm định dạng hiển thị giá tiền VND
function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price) + '₫';
}

export const metadata = {
  title: 'Sản phẩm | VORTEX',
  description: 'Khám phá tất cả thiết bị gaming và phụ kiện công nghệ tại VORTEX.',
};

export default async function ProductsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  
  // 1. Trích xuất các tham số lọc cơ bản từ URL (Query Params)
  const filters = {
    category: resolvedSearchParams.category ? (Array.isArray(resolvedSearchParams.category) ? resolvedSearchParams.category : [resolvedSearchParams.category]) : undefined,
    group: resolvedSearchParams.group,
    brand: resolvedSearchParams.brand ? (Array.isArray(resolvedSearchParams.brand) ? resolvedSearchParams.brand : [resolvedSearchParams.brand]) : undefined,
    search: resolvedSearchParams.search,
    minPrice: resolvedSearchParams.minPrice,
    maxPrice: resolvedSearchParams.maxPrice,
    sortBy: resolvedSearchParams.sortBy,
  };

  // 2. Trích xuất các bộ lọc thông số kỹ thuật động (bắt đầu bằng spec_)
  const specs = {};
  for (const [key, value] of Object.entries(resolvedSearchParams)) {
    if (key.startsWith('spec_')) {
      const specKey = key.replace('spec_', '');
      specs[specKey] = Array.isArray(value) ? value : [value];
    }
  }
  filters.specs = specs;

  // 3. Truy vấn dữ liệu sản phẩm, danh mục, thương hiệu và phiên đăng nhập
  const [products, allBaseProducts, categories, brandsResult, session] = await Promise.all([
    ProductService.getAllProducts(filters),
    ProductService.getAllProducts({ ...filters, specs: {} }), // Lấy sản phẩm chưa lọc specs để lấy tất cả tùy chọn có sẵn
    prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.product.findMany({ select: { brand: true }, distinct: ['brand'], where: { brand: { not: null } } }),
    auth()
  ]);

  const brandMap = new Map();
  brandsResult.forEach(b => {
    if (b.brand) {
      const lower = b.brand.trim().toLowerCase();
      if (!brandMap.has(lower)) brandMap.set(lower, b.brand.trim());
    }
  });
  const brands = Array.from(brandMap.values()).sort();

  // 4. Trích xuất bộ lọc màu sắc từ URL
  const colorFilter = resolvedSearchParams.color 
    ? (Array.isArray(resolvedSearchParams.color) ? resolvedSearchParams.color : [resolvedSearchParams.color]) 
    : [];

  // 5. Tổng hợp danh sách các thông số kỹ thuật khả dụng từ các sản phẩm gốc (loại trừ màu sắc)
  const specsMap = new Map(); // lowercaseKey -> { originalKey, valuesMap: lowercaseValue -> originalValue }
  
  allBaseProducts.forEach(p => {
    if (p.specs) {
      try {
        const parsed = JSON.parse(p.specs);
        
        const processSpec = (rawKey, rawValue) => {
          if (!rawKey || !rawValue) return;
          const keyStr = String(rawKey).trim();
          const valStr = String(rawValue).trim();
          if (!keyStr || !valStr) return;

          const keyLower = keyStr.toLowerCase();
          if (keyLower.includes('màu') || keyLower.includes('color')) return;

          if (!specsMap.has(keyLower)) {
            specsMap.set(keyLower, { originalKey: keyStr, valuesMap: new Map() });
          }
          
          const valLower = valStr.toLowerCase();
          if (!specsMap.get(keyLower).valuesMap.has(valLower)) {
            specsMap.get(keyLower).valuesMap.set(valLower, valStr);
          }
        };

        if (Array.isArray(parsed)) {
          parsed.forEach(spec => processSpec(spec.key, spec.value));
        } else if (typeof parsed === 'object' && parsed !== null) {
          for (const [key, val] of Object.entries(parsed)) {
            processSpec(key, val);
          }
        }
      } catch (e) {}
    }
  });

  // 6. Tổng hợp danh sách màu sắc khả dụng từ các biến thể sản phẩm
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

  // 7. Chuyển đổi dữ liệu sang mảng để truyền xuống Client Component
  const dynamicSpecsOptions = {};
  for (const [keyLower, data] of specsMap.entries()) {
    dynamicSpecsOptions[data.originalKey] = Array.from(data.valuesMap.values()).sort();
  }

  const colorOptions = Array.from(colorMap.values()).sort();

  // 8. Thực hiện lọc danh sách sản phẩm theo màu sắc nếu có chọn bộ lọc màu
  let filteredProducts = products;
  if (colorFilter.length > 0) {
    const normalizeColor = (c) => (c || '').toLowerCase().trim();
    const filterColors = colorFilter.map(normalizeColor);
    
    filteredProducts = products.filter(p => {
      // Kiểm tra màu sắc ở sản phẩm gốc
      if (p.baseVariantName && filterColors.includes(normalizeColor(p.baseVariantName))) return true;
      // Kiểm tra màu sắc ở các biến thể
      if (p.variants?.some(v => filterColors.includes(normalizeColor(v.name)))) return true;
      return false;
    });
  }

  // 9. Lấy danh sách ID sản phẩm đã yêu thích nếu người dùng đã đăng nhập
  let wishlistedIds = [];
  if (session?.user?.id) {
    try {
      const userWishlist = await prisma.wishlist.findMany({
        where: { userId: session.user.id },
        select: { productId: true }
      });
      wishlistedIds = userWishlist.map(w => w.productId);
    } catch (e) {
      console.error("Lỗi khi lấy danh sách yêu thích:", e);
    }
  }

  // 10. Hàm hỗ trợ xây dựng đường dẫn URL mới
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
