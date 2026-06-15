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
        <form className={styles.form} onSubmit={handleSubmit}>
          <h3 className={styles.formTitle}>Viết đánh giá của bạn</h3>
          
          {error && <div className={styles.error}>{error}</div>}
          
          <div className={styles.ratingSelect}>
            <span>Chọn mức độ:</span>
            <div className={styles.starSelect}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star} 
                  type="button"
                  className={`${styles.starBtn} ${rating >= star ? styles.activeStar : ''}`}
                  onClick={() => setRating(star)}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          
          <textarea 
            className={styles.textarea}
            placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            required
          />
          
          <button 
            type="submit" 
            className={`btn btn-primary ${styles.submitBtn}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
        </form>
      ) : (
        <div className={styles.loginPrompt}>
          Vui lòng <button onClick={() => useAuthModalStore.getState().openModal('login')} className={styles.link} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', padding: 0 }}>Đăng nhập</button> để gửi đánh giá.
        </div>
      )}

      <div className={styles.reviewList}>
        {reviews.length === 0 ? (
          <div className={styles.noReviews}>Chưa có đánh giá nào cho sản phẩm này.</div>
        ) : (
          reviews.map(review => (
            <div key={review.id} className={styles.reviewItem}>
              <div className={styles.reviewAvatar}>
                {review.user?.avatar ? (
                  <img src={review.user.avatar} alt={review.user.name} />
                ) : (
                  <span>{review.user?.name?.[0] || 'U'}</span>
                )}
              </div>
              <div className={styles.reviewContent}>
                <div className={styles.reviewHeader}>
                  <strong className={styles.reviewerName}>{review.user?.name}</strong>
                  <span className={styles.reviewDate}>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className={styles.reviewStars}>
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </div>
                <p className={styles.reviewText}>{review.comment}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
