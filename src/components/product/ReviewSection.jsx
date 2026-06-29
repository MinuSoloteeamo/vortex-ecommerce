'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useAuthModalStore } from '@/store/authModal';
import styles from './ReviewSection.module.css';

export default function ReviewSection({ productId, initialReviews, totalCount, averageRating }) {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [reviews, setReviews] = useState(initialReviews);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session) return;
    
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, rating, comment })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Lỗi khi gửi đánh giá');
      }

      // Add optimistic review
      setReviews([
        {
          id: data.review.id,
          rating,
          comment,
          createdAt: new Date().toISOString(),
          user: { name: session.user.name, avatar: session.user.avatar }
        },
        ...reviews
      ]);
      
      setComment('');
      setRating(5);
      router.refresh(); // Refresh server data
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Đánh giá & Nhận xét ({totalCount})</h2>
      
      <div className={styles.header}>
        <div className={styles.averageBox}>
          <div className={styles.avgNumber}>{averageRating.toFixed(1)}</div>
          <div className={styles.stars}>
            {'★'.repeat(Math.round(averageRating))}{'☆'.repeat(5 - Math.round(averageRating))}
          </div>
          <div className={styles.totalText}>{totalCount} đánh giá</div>
        </div>
      </div>

      {session ? (
        <div style={{ marginTop: 'var(--space-xl)', padding: 'var(--space-lg)', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-subtle)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>
            Bạn có thể để lại đánh giá cho sản phẩm này sau khi mua và nhận hàng thành công tại mục <a href="/account/orders" style={{ color: 'var(--color-primary)', fontWeight: 'bold', textDecoration: 'underline' }}>Quản lý đơn hàng</a>.
          </p>
        </div>
      ) : (
        <div style={{ marginTop: 'var(--space-xl)', padding: 'var(--space-lg)', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Vui lòng đăng nhập để xem chi tiết và đánh giá sản phẩm.</p>
          <button className="btn btn-outline" style={{ marginTop: '1rem' }} onClick={() => useAuthModalStore.getState().open()}>
            Đăng nhập ngay
          </button>
        </div>
      )}

      <div className={styles.reviewList}>
        {reviews.length === 0 ? (
          <div className={styles.emptyReviews}>
            Chưa có đánh giá nào cho sản phẩm này.
          </div>
        ) : (
          reviews.map(review => {
            const safeRating = Math.max(0, Math.min(5, Number(review.rating) || 5));
            return (
              <div key={review.id} className={styles.reviewItem}>
                <div className={styles.reviewMeta}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img 
                      src={review.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user?.name || 'U')}&background=random`} 
                      alt="avatar" 
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.95rem' }}>{review.user?.name || 'Khách hàng'}</strong>
                      <div className={styles.reviewDate}>
                        {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>
                  <div className={styles.reviewStars}>
                    {'★'.repeat(safeRating)}{'☆'.repeat(5 - safeRating)}
                  </div>
                </div>
                <p className={styles.reviewComment}>{review.comment}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
