'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import styles from '@/app/products/[slug]/page.module.css';
import AddToCartButton from './AddToCartButton';
import AddToWishlistButton from './AddToWishlistButton';
import ImageMagnifier from '@/components/ui/ImageMagnifier';

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price) + '₫';
}

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
  return '#444444';
}

export default function ProductInteractive({ product, isWishlisted, cartProduct }) {
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [quantity, setQuantity] = useState(1);

  const selectedVariant = useMemo(() => {
    if (!selectedVariantId) return null;
    return product.variants?.find(v => v.id === selectedVariantId);
  }, [selectedVariantId, product.variants]);

  // Auto-select most recently created in-stock variant if base product is out of stock
  useEffect(() => {
    if (product.stock <= 0 && product.variants?.length > 0) {
      const newestAvailable = [...product.variants].reverse().find(v => v.stock > 0);
      if (newestAvailable) {
        setSelectedVariantId(newestAvailable.id);
      }
    }
  }, [product.stock, product.variants]);

  // Determine current image
  const productImages = product.images?.filter(img => !img.variantId).map(img => img.url) || [];
  
  const galleryImages = useMemo(() => {
    if (selectedVariant) {
      const variantImgs = selectedVariant.images?.map(img => img.url) || [];
      if (variantImgs.length > 0) return variantImgs;
    }
    if (productImages.length > 0) return productImages;
    return ['📦'];
  }, [selectedVariant, productImages]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') { setLightboxIndex(null); setIsZoomed(false); }
      if (e.key === 'ArrowLeft') {
        setIsZoomed(false);
        setLightboxIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
      }
      if (e.key === 'ArrowRight') {
        setIsZoomed(false);
        setLightboxIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, galleryImages.length]);

  const handleVariantSelect = (variant) => {
    if (!variant) {
      setSelectedVariantId(null);
      return;
    }
    setSelectedVariantId(variant.id);
  };

  // Pricing
  const basePrice = product.price;
  const salePrice = product.salePrice;
  const priceOffset = selectedVariant?.priceOffset || 0;
  
  const currentPrice = (salePrice || basePrice) + priceOffset;
  const currentOriginalPrice = salePrice ? basePrice + priceOffset : null;

  // Stock
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  
  // Specs & Features
  const specs = useMemo(() => {
    let sourceSpecs = product.specs;
    if (selectedVariant && selectedVariant.specs) {
      try {
        const parsed = JSON.parse(selectedVariant.specs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          sourceSpecs = selectedVariant.specs;
        }
      } catch (e) {}
    }
    if (!sourceSpecs) return [];
    try {
      const parsed = JSON.parse(sourceSpecs);
      return Array.isArray(parsed) ? parsed : (typeof parsed === 'string' ? [{key: 'Thông số', value: parsed}] : []);
    } catch {
      return typeof sourceSpecs === 'string' ? [{key: 'Thông số', value: sourceSpecs}] : [];
    }
  }, [product.specs, selectedVariant]);

  const features = useMemo(() => {
    let sourceFeatures = product.features;
    if (selectedVariant && selectedVariant.features) {
      try {
        const parsed = JSON.parse(selectedVariant.features);
        if (Array.isArray(parsed) && parsed.length > 0) {
          sourceFeatures = selectedVariant.features;
        }
      } catch (e) {}
    }
    if (!sourceFeatures) return [];
    try {
      const parsed = JSON.parse(sourceFeatures);
      return Array.isArray(parsed) ? parsed : (typeof parsed === 'string' ? [parsed] : []);
    } catch {
      return typeof sourceFeatures === 'string' ? [sourceFeatures] : [];
    }
  }, [product.features, selectedVariant]);

  return (
    <>
      {/* GALLERY */}
      <div className={styles.gallery}>
        {galleryImages.map((imgUrl, i) => (
          <div 
            key={i} 
            className={styles.galleryItem} 
            onClick={() => setLightboxIndex(i)}
            style={{ cursor: 'zoom-in' }}
          >
            {imgUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) ? (
              <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '24px' }} />
            ) : (
              <span className={styles.thumbEmoji}>{imgUrl}</span>
            )}
          </div>
        ))}
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

        <h1 className={styles.title}>
          {product.name}
          {selectedVariant ? ` - ${selectedVariant.name}` : (product.baseVariantName ? ` - ${product.baseVariantName}` : '')}
        </h1>
        
        <div className={styles.brand}>
          Thương hiệu: <strong>{product.brand || 'VORTEX'}</strong> | SKU: {selectedVariant?.sku || `VTX-${product.id.slice(-6).toUpperCase()}`}
        </div>

        <div className={styles.pricing}>
          {currentOriginalPrice ? (
            <>
              <span className={styles.salePrice}>{formatPrice(currentPrice)}</span>
              <span className={styles.originalPrice}>{formatPrice(currentOriginalPrice)}</span>
            </>
          ) : (
            <span className={styles.price}>{formatPrice(currentPrice)}</span>
          )}
        </div>

        {/* VARIANTS SELECTOR */}
        {product.variants?.length > 0 && (
          <div style={{ marginBottom: 'var(--space-2xl)' }}>
            <div style={{ fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
              Màu sắc: <span style={{ fontWeight: 'normal', color: 'var(--text-secondary)' }}>{selectedVariant ? selectedVariant.name : (product.baseVariantName || 'Bản tiêu chuẩn')}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', paddingLeft: '4px' }}>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => handleVariantSelect(null)}
                  style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    backgroundColor: getColorFromName(product.baseVariantName || 'Bản tiêu chuẩn'),
                    border: 'none',
                    boxShadow: selectedVariantId === null 
                      ? '0 0 0 3px var(--color-primary)' 
                      : '0 0 0 1px rgba(255,255,255,0.2)',
                    cursor: 'pointer',
                    opacity: product.stock > 0 ? 1 : 0.5,
                    transition: 'all 0.2s',
                    padding: 0
                  }}
                  title={product.baseVariantName || 'Bản tiêu chuẩn'}
                />
                {product.stock <= 0 && (
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-45deg)', width: '100%', height: '2px', background: 'var(--color-danger)', pointerEvents: 'none' }} />
                )}
              </div>
              {product.variants.map(variant => {
                return (
                  <div key={variant.id} style={{ position: 'relative' }}>
                    <button
                      onClick={() => handleVariantSelect(variant)}
                      style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        backgroundColor: getColorFromName(variant.name),
                        border: 'none',
                        boxShadow: selectedVariantId === variant.id 
                          ? '0 0 0 3px var(--color-primary)' 
                          : '0 0 0 1px rgba(255,255,255,0.2)',
                        cursor: 'pointer',
                        opacity: variant.stock > 0 ? 1 : 0.5,
                        transition: 'all 0.2s',
                        padding: 0
                      }}
                      title={variant.name}
                    />
                    {variant.stock <= 0 && (
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-45deg)', width: '100%', height: '2px', background: 'var(--color-danger)', pointerEvents: 'none' }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className={`${styles.stockStatus} ${currentStock > 0 ? styles.inStock : styles.outOfStock}`}>
          <span style={{ fontSize: '1.2rem' }}>{currentStock > 0 ? '✓' : '✗'}</span>
          {currentStock > 0 ? `Còn hàng (${currentStock} sản phẩm)` : 'Tạm hết hàng'}
        </div>

        <div className={styles.description}>
          {/* We'll show brief text or nothing, and full details in Tabs */}
        </div>

        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Số lượng:</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '8px', overflow: 'hidden' }}>
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              style={{ background: 'none', border: 'none', width: '44px', height: '44px', fontSize: '1.2rem', color: 'var(--text-primary)', cursor: quantity <= 1 ? 'not-allowed' : 'pointer', opacity: quantity <= 1 ? 0.5 : 1 }}
            >-</button>
            <input 
              type="number" 
              value={quantity}
              min="1"
              max={currentStock || 99}
              onChange={(e) => {
                let val = parseInt(e.target.value);
                if (!isNaN(val)) setQuantity(Math.min(currentStock || 99, Math.max(1, val)));
              }}
              style={{ width: '50px', textAlign: 'center', background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '1rem', fontWeight: '500', outline: 'none', appearance: 'textfield' }}
            />
            <button 
              onClick={() => setQuantity(Math.min(currentStock || 99, quantity + 1))}
              disabled={quantity >= (currentStock || 99)}
              style={{ background: 'none', border: 'none', width: '44px', height: '44px', fontSize: '1.2rem', color: 'var(--text-primary)', cursor: quantity >= (currentStock || 99) ? 'not-allowed' : 'pointer', opacity: quantity >= (currentStock || 99) ? 0.5 : 1 }}
            >+</button>
          </div>
        </div>

        <div className={styles.actions}>
          <div style={{ flex: 1 }}>
            <AddToCartButton 
              product={{...cartProduct, stock: currentStock}} 
              variant={selectedVariant} 
              quantity={quantity}
              fullWidth={true} 
            />
          </div>
          <AddToWishlistButton productId={product.id} initialWishlisted={isWishlisted} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2xl)', marginTop: 'var(--space-3xl)' }}>
          
          {/* FEATURES / HIGHLIGHTS */}
          {features.length > 0 && (
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '12px', color: 'var(--text-primary)' }}>Đặc điểm nổi bật</h3>
              <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                {features.map((feat, i) => (
                  <li key={i} style={{ whiteSpace: 'pre-wrap', marginBottom: '8px' }}>
                    {typeof feat === 'string' ? feat : (
                      <>
                        <strong style={{ color: 'var(--text-primary)' }}>{feat.key}:</strong> {feat.value}
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* DESCRIPTION */}
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '12px', color: 'var(--text-primary)' }}>Mô tả sản phẩm</h3>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.7' }} dangerouslySetInnerHTML={{ __html: product.description || 'Chưa có mô tả.' }} />
          </div>

          {/* SPECS */}
          {specs.filter(s => s.key && s.value).length > 0 && (
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '12px', color: 'var(--text-primary)' }}>Thông số kỹ thuật</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                <tbody>
                  {specs.filter(s => s.key && s.value).map((spec, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px 0', fontWeight: '600', color: 'var(--text-primary)', width: '40%', verticalAlign: 'top' }}>{spec.key}</td>
                      <td style={{ padding: '12px 0', whiteSpace: 'pre-wrap' }}>{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>

      {/* LIGHTBOX */}
      {lightboxIndex !== null && galleryImages[lightboxIndex] && (
        <div className={styles.lightboxOverlay} onClick={() => { setLightboxIndex(null); setIsZoomed(false); }}>
          <div className={styles.lightboxModal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.lightboxClose} onClick={() => { setLightboxIndex(null); setIsZoomed(false); }}>✕</button>
            
            <button 
              className={`${styles.lightboxNav} ${styles.lightboxPrev}`} 
              onClick={() => {
                setIsZoomed(false);
                setLightboxIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
              }}
            >
              ‹
            </button>
            
            <div 
              className={styles.lightboxContent}
              style={{ cursor: isZoomed ? 'zoom-out' : 'zoom-in', overflow: 'hidden' }}
              onClick={() => setIsZoomed(!isZoomed)}
              onMouseMove={(e) => {
                if (!isZoomed) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                setZoomPos({ x, y });
              }}
            >
              {galleryImages[lightboxIndex].match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) ? (
                <img 
                  src={galleryImages[lightboxIndex]} 
                  alt={product.name} 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '100%', 
                    objectFit: 'contain',
                    transition: isZoomed ? 'none' : 'transform 0.3s ease',
                    transform: isZoomed ? `scale(2.5)` : 'scale(1)',
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                    pointerEvents: 'none'
                  }} 
                />
              ) : (
                <span className={styles.emoji} style={{ fontSize: '10rem' }}>{galleryImages[lightboxIndex]}</span>
              )}
            </div>

            <button 
              className={`${styles.lightboxNav} ${styles.lightboxNext}`} 
              onClick={() => {
                setIsZoomed(false);
                setLightboxIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
              }}
            >
              ›
            </button>

            {/* LIGHTBOX THUMBNAILS */}
            {galleryImages.length > 1 && (
              <div className={styles.lightboxThumbnails}>
                {galleryImages.map((imgUrl, i) => (
                  <div key={i} onClick={() => { setIsZoomed(false); setLightboxIndex(i); }}>
                    {imgUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) ? (
                      <img 
                        src={imgUrl} 
                        className={`${styles.lightboxThumb} ${i === lightboxIndex ? styles.lightboxThumbActive : ''}`} 
                      />
                    ) : (
                      <div className={`${styles.lightboxThumb} ${i === lightboxIndex ? styles.lightboxThumbActive : ''}`} style={{ background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                        {imgUrl}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
