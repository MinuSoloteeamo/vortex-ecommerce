'use client';

import { useState, useEffect } from 'react';
import { useToastStore } from '@/store/toast';
import styles from './page.module.css';

export default function AdminNewsPage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [form, setForm] = useState({
    title: '',
    category: 'Tin tức',
    description: '',
    content: '',
    image: '',
    bgColor: '#e2d1f9',
    isFeatured: false
  });

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await fetch('/api/admin/news');
      if (res.ok) {
        setNews(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (newsItem = null) => {
    if (newsItem) {
      setEditingNews(newsItem);
      setForm({
        title: newsItem.title,
        category: newsItem.category,
        description: newsItem.description || '',
        content: newsItem.content || '',
        image: newsItem.image || '',
        bgColor: newsItem.bgColor || '#e2d1f9',
        isFeatured: newsItem.isFeatured || false
      });
    } else {
      setEditingNews(null);
      setForm({
        title: '',
        category: 'Tin tức',
        description: '',
        content: '',
        image: '',
        bgColor: '#e2d1f9',
        isFeatured: false
      });
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (res.ok) {
        const data = await res.json();
        setForm({ ...form, image: data.url });
      } else {
        useToastStore.getState().error('Upload ảnh thất bại!');
      }
    } catch (error) {
      console.error(error);
      useToastStore.getState().error('Lỗi kết nối khi upload ảnh');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const method = editingNews ? 'PUT' : 'POST';
    const url = editingNews ? `/api/admin/news/${editingNews.id}` : '/api/admin/news';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchNews();
      } else {
        const errorData = await res.json().catch(() => ({}));
        useToastStore.getState().error(errorData.error || 'Có lỗi xảy ra khi lưu tin tức');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa bài viết này?')) return;
    try {
      const res = await fetch(`/api/admin/news/${id}`, { method: 'DELETE' });
      if (res.ok) fetchNews();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Quản lý Tin tức</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Thêm bài viết mới</button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Hình ảnh</th>
              <th>Tiêu đề</th>
              <th>Danh mục</th>
              <th>Tác giả</th>
              <th>Ngày đăng</th>
              <th>Nổi bật</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {news.map(item => (
              <tr key={item.id}>
                <td>
                  {item.image ? (
                    <img src={item.image} alt="Cover" style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }} />
                  ) : (
                    <div style={{ width: 50, height: 50, background: '#eee', borderRadius: 4 }}></div>
                  )}
                </td>
                <td>{item.title}</td>
                <td>{item.category}</td>
                <td>{item.author}</td>
                <td>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</td>
                <td>{item.isFeatured ? '⭐ Có' : 'Không'}</td>
                <td>
                  <button className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', marginRight: '0.5rem' }} onClick={() => openModal(item)}>Sửa</button>
                  <button className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', color: 'red', borderColor: 'red' }} onClick={() => handleDelete(item.id)}>Xóa</button>
                </td>
              </tr>
            ))}
            {news.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Chưa có bài viết nào</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>{editingNews ? 'Sửa bài viết' : 'Thêm bài viết mới'}</h2>
            
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Tiêu đề bài viết</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={form.title} 
                  onChange={e => setForm({...form, title: e.target.value})} 
                  required 
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Danh mục</label>
                  <select 
                    className={styles.input} 
                    value={form.category} 
                    onChange={e => setForm({...form, category: e.target.value})}
                  >
                    <option value="Mới nhất">Mới nhất</option>
                    <option value="Tin tức">Tin tức</option>
                    <option value="Đánh giá">Đánh giá</option>
                    <option value="Tư vấn">Tư vấn</option>
                    <option value="Thủ thuật">Thủ thuật</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Màu nền (Nếu là tin nổi bật)</label>
                  <input 
                    type="color" 
                    className={styles.colorInput} 
                    value={form.bgColor} 
                    onChange={e => setForm({...form, bgColor: e.target.value})} 
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Ảnh đại diện</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  {form.image && <img src={form.image} alt="Preview" style={{ height: 60, borderRadius: 4 }} />}
                  <label className="btn btn-secondary" style={{ cursor: 'pointer', opacity: uploadingImage ? 0.5 : 1 }}>
                    {uploadingImage ? 'Đang tải lên...' : 'Chọn ảnh từ máy tính'}
                    <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                  </label>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Mô tả ngắn</label>
                <textarea 
                  className={styles.textarea} 
                  value={form.description} 
                  onChange={e => setForm({...form, description: e.target.value})}
                  rows={3}
                  placeholder="Mô tả tóm tắt hiển thị ở trang danh sách tin tức..."
                ></textarea>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Nội dung chi tiết bài viết</label>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 0.5rem 0' }}>
                  Hỗ trợ HTML cơ bản: &lt;b&gt;, &lt;i&gt;, &lt;br&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;blockquote&gt;
                </p>
                <textarea 
                  className={styles.textarea} 
                  value={form.content} 
                  onChange={e => setForm({...form, content: e.target.value})}
                  rows={12}
                  placeholder="Viết nội dung bài viết đầy đủ ở đây... Bạn có thể sử dụng HTML cơ bản để định dạng."
                  style={{ fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: '1.6' }}
                ></textarea>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <input 
                    type="checkbox" 
                    checked={form.isFeatured} 
                    onChange={e => setForm({...form, isFeatured: e.target.checked})}
                    style={{ marginRight: '0.5rem' }}
                  /> 
                  Đặt làm tin nổi bật (Hiển thị to bên trái)
                </label>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu bài viết</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
