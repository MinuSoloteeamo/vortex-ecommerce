'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './ProductFilters.module.css';

export default function ProductFilters({ categories, brands, dynamicSpecs = {} }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse current URL params into state arrays
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  
  // State for dynamic specs
  const [selectedSpecs, setSelectedSpecs] = useState({});

  // Sync state with URL when searchParams change
  useEffect(() => {
    setSelectedCategories(searchParams.getAll('category'));
    setSelectedBrands(searchParams.getAll('brand'));
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');

    const newSelectedSpecs = {};
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith('spec_')) {
        const specKey = key.replace('spec_', '');
        if (!newSelectedSpecs[specKey]) newSelectedSpecs[specKey] = [];
        newSelectedSpecs[specKey].push(value);
      }
    }
    setSelectedSpecs(newSelectedSpecs);
  }, [searchParams]);

  // Apply filters to URL
  const applyFilters = (newCats = selectedCategories, newBrands = selectedBrands, min = minPrice, max = maxPrice, newSpecs = selectedSpecs) => {
    const params = new URLSearchParams(searchParams);

    // Categories
    params.delete('category');
    newCats.forEach(cat => params.append('category', cat));

    // Brands
    params.delete('brand');
    newBrands.forEach(brand => params.append('brand', brand));

    // Price
    if (min) params.set('minPrice', min);
    else params.delete('minPrice');
    
    if (max) params.set('maxPrice', max);
    else params.delete('maxPrice');

    // Specs
    // First remove all existing spec_ params
    for (const key of Array.from(params.keys())) {
      if (key.startsWith('spec_')) params.delete(key);
    }
    // Then add new ones
    Object.entries(newSpecs).forEach(([specKey, values]) => {
      values.forEach(val => params.append(`spec_${specKey}`, val));
    });

    // Go to first page (if pagination exists)
    params.delete('page');

    router.push(`/products?${params.toString()}`);
  };

  const toggleCategory = (slug) => {
    const newCats = selectedCategories.includes(slug)
      ? selectedCategories.filter(c => c !== slug)
      : [...selectedCategories, slug];
    applyFilters(newCats, selectedBrands, minPrice, maxPrice, selectedSpecs);
  };

  const toggleBrand = (brand) => {
    const newBrands = selectedBrands.includes(brand)
      ? selectedBrands.filter(b => b !== brand)
      : [...selectedBrands, brand];
    applyFilters(selectedCategories, newBrands, minPrice, maxPrice, selectedSpecs);
  };

  const toggleSpec = (specKey, value) => {
    const currentValues = selectedSpecs[specKey] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
      
    const newSpecs = { ...selectedSpecs };
    if (newValues.length === 0) {
      delete newSpecs[specKey];
    } else {
      newSpecs[specKey] = newValues;
    }
    
    applyFilters(selectedCategories, selectedBrands, minPrice, maxPrice, newSpecs);
  };

  const handlePriceApply = () => {
    if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
      alert("Vui lòng nhập giá tối thiểu nhỏ hơn hoặc bằng giá tối đa!");
      return;
    }
    applyFilters(selectedCategories, selectedBrands, minPrice, maxPrice, selectedSpecs);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('category');
    params.delete('brand');
    params.delete('minPrice');
    params.delete('maxPrice');
    params.delete('group');
    for (const key of Array.from(params.keys())) {
      if (key.startsWith('spec_')) params.delete(key);
    }
    router.push(`/products?${params.toString()}`);
  };

  // Check if any filter is active
  const hasActiveSpecs = Object.keys(selectedSpecs).length > 0;
  const hasActiveFilters = selectedCategories.length > 0 || selectedBrands.length > 0 || minPrice || maxPrice || searchParams.has('group') || hasActiveSpecs;
  
  let specCount = 0;
  Object.values(selectedSpecs).forEach(arr => specCount += arr.length);
  const activeCount = selectedCategories.length + selectedBrands.length + (minPrice || maxPrice ? 1 : 0) + specCount;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <h2 className={styles.headerTitle}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
          Bộ lọc {activeCount > 0 && <span style={{ background: 'var(--color-primary)', color: '#000', padding: '0 6px', borderRadius: '12px', fontSize: '12px' }}>{activeCount}</span>}
        </h2>
        {hasActiveFilters && (
          <button onClick={clearAllFilters} className={styles.clearBtn}>
            Xóa lọc
          </button>
        )}
      </div>

      <div className={styles.filterGroup}>
        <h3 className={styles.groupTitle}>Khoảng Giá</h3>
        <div className={styles.priceRange}>
          <div className={styles.priceInputs}>
            <input 
              type="number" 
              placeholder="Tối thiểu" 
              className={`${styles.priceInput} ${minPrice && maxPrice && Number(minPrice) > Number(maxPrice) ? styles.priceInputError : ''}`}
              value={minPrice}
              min="0"
              onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || Number(val) >= 0) setMinPrice(val);
              }}
            />
            <span className={styles.priceSeparator}>-</span>
            <input 
              type="number" 
              placeholder="Tối đa" 
              className={`${styles.priceInput} ${minPrice && maxPrice && Number(minPrice) > Number(maxPrice) ? styles.priceInputError : ''}`}
              value={maxPrice}
              min="0"
              onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || Number(val) >= 0) setMaxPrice(val);
              }}
            />
          </div>
          {minPrice && maxPrice && Number(minPrice) > Number(maxPrice) && (
            <p className={styles.priceError}>⚠️ Giá tối thiểu không thể cao hơn giá tối đa.</p>
          )}
          <button onClick={handlePriceApply} className={styles.applyPriceBtn}>Áp dụng giá</button>
        </div>
      </div>

      <div className={styles.filterGroup}>
        <h3 className={styles.groupTitle}>Danh Mục</h3>
        <div className={styles.checkboxList}>
          {categories.map((cat) => (
            <label key={cat.id} className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={selectedCategories.includes(cat.slug)}
                onChange={() => toggleCategory(cat.slug)}
              />
              <span className={styles.categoryIcon}>
                {cat.image?.match(/\.(jpeg|jpg|gif|png|svg)$/i) ? (
                  <img src={cat.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  cat.image
                )}
              </span>
              <span>{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {brands.length > 0 && (
        <div className={styles.filterGroup}>
          <h3 className={styles.groupTitle}>Thương Hiệu</h3>
          <div className={styles.checkboxList}>
            {brands.map((brand) => (
              <label key={brand} className={styles.checkboxLabel}>
                <input 
                  type="checkbox" 
                  checked={selectedBrands.includes(brand)}
                  onChange={() => toggleBrand(brand)}
                />
                <span>{brand}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Specs Filters */}
      {Object.entries(dynamicSpecs).map(([specKey, values]) => {
        if (!values || values.length === 0) return null;
        return (
          <div key={specKey} className={styles.filterGroup}>
            <h3 className={styles.groupTitle}>{specKey}</h3>
            <div className={styles.checkboxList}>
              {values.map((val) => (
                <label key={val} className={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    checked={(selectedSpecs[specKey] || []).includes(val)}
                    onChange={() => toggleSpec(specKey, val)}
                  />
                  <span>{val}</span>
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </aside>
  );
}
