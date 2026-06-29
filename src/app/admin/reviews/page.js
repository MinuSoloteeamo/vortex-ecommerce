'use client';

import { useState, useEffect } from 'react';
import styles from '../admin.module.css';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch('/api/admin/reviews');
        if (res.ok) {
          const data = await res.json();
          setReviews(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, []);

  if (loading) return <div>Đang tải dữ liệu đánh giá...</div>;

  return (
    <div className="card">
      <h2 style={{ marginBottom: '1rem' }}>Quản lý Đánh giá & Phân tích Sắc thái (AI)</h2>
      
      {/* Thống kê nhanh */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ padding: '1rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.3)', flex: 1 }}>
          <h3 style={{ color: '#22c55e', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Tích cực</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{reviews.filter(r => r.sentimentLabel === 'POSITIVE').length}</p>
        </div>
        <div style={{ padding: '1rem', background: 'rgba(156, 163, 175, 0.1)', borderRadius: '8px', border: '1px solid rgba(156, 163, 175, 0.3)', flex: 1 }}>
          <h3 style={{ color: '#9ca3af', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Trung lập</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{reviews.filter(r => r.sentimentLabel === 'NEUTRAL').length}</p>
        </div>
        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)', flex: 1 }}>
          <h3 style={{ color: '#ef4444', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Tiêu cực</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{reviews.filter(r => r.sentimentLabel === 'NEGATIVE').length}</p>
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Khách hàng</th>
            <th>Sản phẩm</th>
            <th>Rating</th>
            <th>Nội dung (Comment)</th>
            <th>Sắc thái (Sentiment)</th>
            <th>Ngày</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map(review => (
            <tr key={review.id}>
              <td>{review.user?.name}</td>
              <td>{review.product?.name}</td>
              <td>{review.rating} ⭐</td>
              <td style={{ maxWidth: '300px' }}>{review.comment || <i>Không có bình luận</i>}</td>
              <td>
                {review.sentimentLabel === 'POSITIVE' && <span style={{ background: '#22c55e', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>Tích cực</span>}
                {review.sentimentLabel === 'NEGATIVE' && <span style={{ background: '#ef4444', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>Tiêu cực</span>}
                {review.sentimentLabel === 'NEUTRAL' && <span style={{ background: '#6b7280', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>Trung lập</span>}
              </td>
              <td>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</td>
            </tr>
          ))}
          {reviews.length === 0 && (
            <tr><td colSpan="6" style={{ textAlign: 'center' }}>Chưa có đánh giá nào</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
