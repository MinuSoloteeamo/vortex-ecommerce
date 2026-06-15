'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './SearchBar.module.css';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef(null);
  const router = useRouter();

  // Debounce search
  useEffect(() => {
    if (!query.trim()) {
      setCategories([]);
      setProducts([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
          setProducts(data.products || []);
          setIsOpen(true);
        }
      } catch (error) {
        console.error('Search failed', error);
      } finally {
        setIsLoading(false);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/products?search=${encodeURIComponent(query)}`);
    }
  };

  const hasResults = categories.length > 0 || products.length > 0;

  return (
    <div className={styles.searchWrapper} ref={wrapperRef}>
      <form onSubmit={handleSearch} className={styles.searchForm}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Tìm kiếm sản phẩm..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (hasResults) setIsOpen(true); }}
        />
        <button type="submit" className={styles.searchBtn}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
        </button>
        {isLoading && <div className={styles.loader}></div>}
      </form>

      {isOpen && (
        <div className={styles.dropdown}>
          {hasResults ? (
            <ul className={styles.resultList}>
              {categories.length > 0 && (
                <>
                  <li className={styles.sectionTitle}>📂 Danh mục</li>
                  {categories.map(cat => (
                    <li key={`cat-${cat.id}`}>
                      <Link
                        href={`/products?category=${cat.slug}`}
                        className={styles.categoryItem}
                        onClick={() => setIsOpen(false)}
                      >
                        <span className={styles.categoryIcon}>
                          {cat.image || '📁'}
                        </span>
                        <span>{cat.name}</span>
                      </Link>
                    </li>
                  ))}
                </>
              )}

              {categories.length > 0 && products.length > 0 && (
                <li className={styles.separator}></li>
              )}

              {products.length > 0 && (
                <>
                  <li className={styles.sectionTitle}>📦 Sản phẩm</li>
                  {products.map(product => (
                    <li key={`prod-${product.id}`}>
                      <Link href={`/products/${product.slug}`} className={styles.resultItem} onClick={() => setIsOpen(false)}>
                        <div className={styles.resultImg}>
                          {product.images?.[0]?.url
                            ? <img src={product.images[0].url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                            : '📦'}
                        </div>
                        <div className={styles.resultInfo}>
                          <div className={styles.resultName}>{product.name}</div>
                          <div className={styles.resultPrice}>
                            {new Intl.NumberFormat('vi-VN').format(product.salePrice || product.price)}₫
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </>
              )}

              <li className={styles.viewAllItem}>
                <Link href={`/products?search=${encodeURIComponent(query)}`} className={styles.viewAllLink} onClick={() => setIsOpen(false)}>
                  Xem tất cả kết quả cho &quot;{query}&quot; →
                </Link>
              </li>
            </ul>
          ) : (
            <div className={styles.noResults}>Không tìm thấy sản phẩm nào</div>
          )}
        </div>
      )}
    </div>
  );
}
