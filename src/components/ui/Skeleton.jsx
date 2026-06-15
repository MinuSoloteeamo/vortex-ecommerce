'use client';

import styles from './Skeleton.module.css';

export function Skeleton({ width, height, borderRadius, className = '' }) {
  return (
    <div
      className={`${styles.skeleton} ${className}`}
      style={{ width, height, borderRadius }}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className={styles.productCard}>
      <Skeleton height="200px" borderRadius="var(--radius-md) var(--radius-md) 0 0" />
      <div className={styles.productCardBody}>
        <Skeleton width="75%" height="16px" />
        <Skeleton width="50%" height="14px" />
        <Skeleton width="40%" height="20px" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className={styles.productGrid}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: 'var(--space-md)' }}>
          <Skeleton width={i === 0 ? '40px' : '80%'} height="16px" />
        </td>
      ))}
    </tr>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton key={i} cols={cols} />
      ))}
    </>
  );
}

export function NewsCardSkeleton() {
  return (
    <div className={styles.newsCard}>
      <Skeleton height="180px" borderRadius="var(--radius-md)" />
      <div className={styles.newsCardBody}>
        <Skeleton width="30%" height="12px" />
        <Skeleton width="90%" height="18px" />
        <Skeleton width="100%" height="14px" />
        <Skeleton width="70%" height="14px" />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className={styles.statCard}>
      <Skeleton width="60%" height="14px" />
      <Skeleton width="40%" height="32px" />
    </div>
  );
}
