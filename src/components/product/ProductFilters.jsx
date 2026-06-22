'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import styles from './ProductFilters.module.css';
import Link from 'next/link';

function getColorFromName(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('trắng') || n.includes('white')) return '#F5F5F5';
  if (n.includes('đen') || n.includes('black')) return '#111111';
  if (n.includes('đỏ') || n.includes('red')) return '#E53935';
  if (n.includes('hồng') || n.includes('pink') || n.includes('magenta')) return '#D81B60';
  if (n.includes('xanh dương') || n.includes('blue')) return '#1E88E5';
  if (n.includes('xanh lá') || n.includes('green')) return '#43A047';
  if (n.includes('vàng') || n.includes('yellow')) return '#FDD835';
  if (n.includes('tím') || n.includes('purple')) return '#8E24AA';
  if (n.includes('xám') || n.includes('grey') || n.includes('gray')) return '#757575';
  if (n.includes('bạc') || n.includes('silver')) return '#BDBDBD';
  // Attempt to parse rgb/hex or fallback
  if (n.startsWith('#')) return n;
  return '#444444';
}

// Icons
const FilterIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
);
const ChevronDownIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
);
const ChevronUpIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
);
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

export default function ProductFilters({ categories, brands, dynamicSpecs = {}, colorOptions = [], totalProducts, currentSort }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Layout states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  
  // Accordion state
  const [expanded, setExpanded] = useState({ price: false, category: false, brand: false, color: false });
  const toggleAccordion = (key) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedSpecs, setSelectedSpecs] = useState({});
  const [selectedColors, setSelectedColors] = useState([]);

  useEffect(() => {
    setSelectedCategories(searchParams.getAll('category'));
    setSelectedBrands(searchParams.getAll('brand'));
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setSelectedColors(searchParams.getAll('color'));

    const newSelectedSpecs = {};
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith('spec_')) {
        const specKey = key.replace('spec_', '');
        if (!newSelectedSpecs[specKey]) newSelectedSpecs[specKey] = [];
        newSelectedSpecs[specKey].push(value);
      }
    }
    setSelectedSpecs(newSelectedSpecs);
  }, [searchParams, dynamicSpecs]);

  const applyFilters = (newCats = selectedCategories, newBrands = selectedBrands, min = minPrice, max = maxPrice, newSpecs = selectedSpecs, newColors = selectedColors) => {
    const params = new URLSearchParams(searchParams);
    params.delete('category');
    newCats.forEach(cat => params.append('category', cat));

    params.delete('brand');
    newBrands.forEach(brand => params.append('brand', brand));

    params.delete('color');
    newColors.forEach(color => params.append('color', color));

    if (min) params.set('minPrice', min); else params.delete('minPrice');
    if (max) params.set('maxPrice', max); else params.delete('maxPrice');

    for (const key of Array.from(params.keys())) {
      if (key.startsWith('spec_')) params.delete(key);
    }
    Object.entries(newSpecs).forEach(([specKey, values]) => {
      values.forEach(val => params.append(`spec_${specKey}`, val));
    });

    params.delete('page');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const toggleCategory = (slug) => {
    const newCats = selectedCategories.includes(slug) ? selectedCategories.filter(c => c !== slug) : [...selectedCategories, slug];
    applyFilters(newCats, selectedBrands, minPrice, maxPrice, selectedSpecs);
  };

  const toggleBrand = (brand) => {
    const newBrands = selectedBrands.includes(brand) ? selectedBrands.filter(b => b !== brand) : [...selectedBrands, brand];
    applyFilters(selectedCategories, newBrands, minPrice, maxPrice, selectedSpecs);
  };

  const toggleSpec = (specKey, value) => {
    const currentValues = selectedSpecs[specKey] || [];
    const newValues = currentValues.includes(value) ? currentValues.filter(v => v !== value) : [...currentValues, value];
    const newSpecs = { ...selectedSpecs };
    if (newValues.length === 0) delete newSpecs[specKey];
    else newSpecs[specKey] = newValues;
    applyFilters(selectedCategories, selectedBrands, minPrice, maxPrice, newSpecs, selectedColors);
  };

  const handlePriceApply = () => {
    if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
      alert("Vui lòng nhập giá tối thiểu nhỏ hơn hoặc bằng giá tối đa!");
      return;
    }
    applyFilters();
  };

  const toggleColor = (color) => {
    const newColors = selectedColors.includes(color) ? selectedColors.filter(c => c !== color) : [...selectedColors, color];
    applyFilters(selectedCategories, selectedBrands, minPrice, maxPrice, selectedSpecs, newColors);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('category');
    params.delete('brand');
    params.delete('color');
    params.delete('minPrice');
    params.delete('maxPrice');
    params.delete('group');
    for (const key of Array.from(params.keys())) {
      if (key.startsWith('spec_')) params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSort = (val) => {
    const params = new URLSearchParams(searchParams);
    if (val) params.set('sortBy', val);
    else params.delete('sortBy');
    router.push(`${pathname}?${params.toString()}`);
    setIsSortOpen(false);
  };

  const sortOptions = [
    { value: '', label: 'Mới nhất' },
    { value: 'price_asc', label: 'Giá thấp đến cao' },
    { value: 'price_desc', label: 'Giá cao đến thấp' }
  ];
  const activeSortLabel = sortOptions.find(o => o.value === (currentSort || ''))?.label;

  return (
    <>
      {/* TOOLBAR */}
      <div className={styles.toolbarWrapper}>
        <div className={styles.toolbarTop}>
          <button className={styles.btnFilterToggle} onClick={() => setIsDrawerOpen(true)}>
            <FilterIcon /> Tất cả bộ lọc
          </button>

          <div className={styles.sortDropdownContainer}>
            <button className={styles.btnSortToggle} onClick={() => setIsSortOpen(!isSortOpen)}>
              Phân loại: <span style={{fontWeight: 600, marginLeft: '4px'}}>{activeSortLabel}</span> <ChevronDownIcon />
            </button>
            {isSortOpen && (
              <>
                <div className={styles.sortDropdownBackdrop} onClick={() => setIsSortOpen(false)} />
                <div className={styles.sortDropdownMenu}>
                  {sortOptions.map(opt => (
                    <button 
                      key={opt.value} 
                      className={`${styles.sortDropdownItem} ${currentSort === opt.value || (!currentSort && !opt.value) ? styles.activeSort : ''}`}
                      onClick={() => handleSort(opt.value)}
                    >
                      {currentSort === opt.value || (!currentSort && !opt.value) ? '✔ ' : ''} {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className={styles.toolbarBottom}>
          Hiển thị {totalProducts} sản phẩm
        </div>
      </div>

      {/* OVERLAY */}
      {isDrawerOpen && <div className={styles.drawerOverlay} onClick={() => setIsDrawerOpen(false)} />}

      {/* SIDEBAR DRAWER */}
      <aside className={`${styles.drawer} ${isDrawerOpen ? styles.drawerOpen : ''}`}>
        <div className={styles.drawerHeader}>
          <h2 className={styles.drawerTitle}>Bộ lọc</h2>
          <button className={styles.drawerCloseBtn} onClick={() => setIsDrawerOpen(false)}>
            <CloseIcon />
          </button>
        </div>

        <div className={styles.drawerContent}>
          {/* CATEGORIES */}
          <div className={styles.accordionGroup}>
            <button className={styles.accordionHeader} onClick={() => toggleAccordion('category')}>
              Danh Mục {expanded.category ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </button>
            {expanded.category && (
              <div className={styles.accordionBody}>
                {categories.map((cat) => (
                  <label key={cat.id} className={styles.checkboxLabel}>
                    <input type="checkbox" checked={selectedCategories.includes(cat.slug)} onChange={() => toggleCategory(cat.slug)} />
                    <span className={styles.checkboxCustom}></span>
                    <span>{cat.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* BRANDS */}
          {brands.length > 0 && (
            <div className={styles.accordionGroup}>
              <button className={styles.accordionHeader} onClick={() => toggleAccordion('brand')}>
                Thương Hiệu {expanded.brand ? <ChevronUpIcon /> : <ChevronDownIcon />}
              </button>
              {expanded.brand && (
                <div className={styles.accordionBody}>
                  {brands.map((brand) => (
                    <label key={brand} className={styles.checkboxLabel}>
                      <input type="checkbox" checked={selectedBrands.includes(brand)} onChange={() => toggleBrand(brand)} />
                      <span className={styles.checkboxCustom}></span>
                      <span>{brand}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
          {/* COLORS (from variant names) */}
          {colorOptions.length > 0 && (
            <div className={styles.accordionGroup}>
              <button className={styles.accordionHeader} onClick={() => toggleAccordion('color')}>
                Màu sắc {expanded.color ? <ChevronUpIcon /> : <ChevronDownIcon />}
              </button>
              {expanded.color && (
                <div className={styles.accordionBody}>
                  <div className={styles.colorCircleGrid}>
                    {colorOptions.map((color) => {
                      const isActive = selectedColors.includes(color);
                      return (
                        <button
                          key={color}
                          onClick={() => toggleColor(color)}
                          className={styles.colorCircleBtn}
                          style={{
                            backgroundColor: getColorFromName(color),
                            boxShadow: isActive 
                              ? '0 0 0 3px var(--color-primary)' 
                              : '0 0 0 1px rgba(255,255,255,0.2)'
                          }}
                          title={color}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* DYNAMIC SPECS */}
          {Object.entries(dynamicSpecs).map(([specKey, values]) => {
            if (!values || values.length === 0) return null;
            
            return (
              <div key={specKey} className={styles.accordionGroup}>
                <button className={styles.accordionHeader} onClick={() => toggleAccordion(specKey)}>
                  {specKey} {expanded[specKey] ? <ChevronUpIcon /> : <ChevronDownIcon />}
                </button>
                {expanded[specKey] && (
                  <div className={styles.accordionBody}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {values.map((val) => (
                        <label key={val} className={styles.checkboxLabel}>
                          <input type="checkbox" checked={(selectedSpecs[specKey] || []).includes(val)} onChange={() => toggleSpec(specKey, val)} />
                          <span className={styles.checkboxCustom}></span>
                          <span>{val}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* PRICE RANGE */}
          <div className={styles.accordionGroup}>
            <button className={styles.accordionHeader} onClick={() => toggleAccordion('price')}>
              Khoảng Giá {expanded.price ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </button>
            {expanded.price && (
              <div className={styles.accordionBody}>
                <div className={styles.priceRange}>
                  <div className={styles.priceInputs}>
                    <input 
                      type="number" placeholder="Tối thiểu" className={styles.priceInput}
                      value={minPrice} min="0" onChange={(e) => { const val = e.target.value; if (val === '' || Number(val) >= 0) setMinPrice(val); }}
                    />
                    <span style={{color: 'var(--text-muted)'}}>-</span>
                    <input 
                      type="number" placeholder="Tối đa" className={styles.priceInput}
                      value={maxPrice} min="0" onChange={(e) => { const val = e.target.value; if (val === '' || Number(val) >= 0) setMaxPrice(val); }}
                    />
                  </div>
                  <button onClick={handlePriceApply} className={styles.applyPriceBtn}>Áp dụng</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM ACTIONS */}
        <div className={styles.drawerFooter}>
          <button className={styles.btnViewItems} onClick={() => setIsDrawerOpen(false)}>
            XEM CÁC MỤC ({totalProducts})
          </button>
          <button className={styles.btnClearAlt} onClick={clearAllFilters}>
            XÓA
          </button>
        </div>
      </aside>
    </>
  );
}
