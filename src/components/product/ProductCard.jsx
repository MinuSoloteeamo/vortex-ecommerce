'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useAuthModalStore } from '@/store/authModal';
import AddToCartButton from './AddToCartButton';
import styles from './ProductCard.module.css';

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price) + '₫';
}

export default function ProductCard({ product, initialWishlisted = false }) {
  const { data: session } = useSession();
  const { openModal } = useAuthModalStore();
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    setIsWishlisted(initialWishlisted);
  }, [initialWishlisted]);

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      openModal('login');
      return;
    }

    setIsToggling(true);

    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id })
      });

      if (res.ok) {
        const data = await res.json();
        setIsWishlisted(data.wishlisted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsToggling(false);
    }
  };

  let currentStock = product.stock;
  let currentPrice = product.price;
  let currentSalePrice = product.salePrice;
  let imageSrc = product.images?.[0]?.url || '📦';
  let selectedVariant = null;

  if (currentStock <= 0 && product.variants?.length > 0) {
    const newestAvailable = [...product.variants].reverse().find(v => v.stock > 0);
    if (newestAvailable) {
      selectedVariant = newestAvailable;
      currentStock = newestAvailable.stock;
      currentPrice = (product.price || 0) + (newestAvailable.priceOffset || 0);
      if (product.salePrice) {
        currentSalePrice = product.salePrice + (newestAvailable.priceOffset || 0);
      }
      if (newestAvailable.images?.[0]?.url) {
        imageSrc = newestAvailable.images[0].url;
      }
    }
  }

  const cartProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: currentPrice,
    salePrice: currentSalePrice,
    images: product.images,
    stock: currentStock,
  };

  return (
    <div className={styles.productCard}>
      <Link href={`/products/${product.slug}`} className={styles.cardLink}>
        {/* Wishlist Button */}
        <button 
          onClick={toggleWishlist} 
          disabled={isToggling}
          className={`${styles.wishlistBtn} ${isWishlisted ? styles.active : ''}`}
          aria-label="Add to Wishlist"
        >
          <svg viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        <div className={styles.productImage}>
          {imageSrc.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) ? (
            <img src={imageSrc} alt={product.name} className={styles.img} />
          ) : (
            <span className={styles.productEmoji}>{imageSrc}</span>
          )}
        </div>

        <div className={styles.productInfo}>
          <span className={styles.productCategory}>{product.category?.name}</span>
          <h3 className={styles.productName}>{product.name}</h3>
          <div className={styles.productPricing}>
            {currentSalePrice ? (
              <>
                <span className={styles.productSalePrice}>
                  {formatPrice(currentSalePrice)}
                </span>
                <span className={styles.productOriginalPrice}>
                  {formatPrice(currentPrice)}
                </span>
              </>
            ) : (
              <span className={styles.productPrice}>
                {formatPrice(currentPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
      
      <div className={styles.productActions}>
         <AddToCartButton product={cartProduct} fullWidth={true} />
      </div>
    </div>
  );
}
