'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToastStore } from '@/store/toast';
import styles from './ProductManager.module.css';
import adminStyles from '@/app/admin/admin.module.css';

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price) + '₫';
}

function generateSlug(text) {
  return text.toString().toLowerCase()
    .replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a')
    .replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e')
    .replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i')
    .replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o')
    .replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u')
    .replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y')
    .replace(/đ/gi, 'd')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export default function ProductManager({ initialProducts, categories }) {
  const router = useRouter();
  
  const [products, setProducts] = useState(initialProducts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    salePrice: '',
    stock: '',
    brand: '',
    categoryId: '',
    imageUrl: '',
    isActive: true
  });

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || '',
        price: product.price || '',
        salePrice: product.salePrice || '',
        stock: product.stock || '',
        brand: product.brand || '',
        categoryId: product.categoryId || '',
        imageUrl: product.images?.[0]?.url || '',
        isActive: product.isActive
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '', slug: '', description: '', price: '', salePrice: '', stock: '', brand: '', categoryId: categories[0]?.id || '', imageUrl: '', isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFileToUpload(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileToUpload(file);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: finalValue };
      // Auto-generate slug if typing in name field and not editing an existing product
      if (name === 'name' && !editingProduct) {
        newData.slug = generateSlug(finalValue);
      }
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalImageUrl = formData.imageUrl;

      // Upload file if selected
      if (fileToUpload) {
        const uploadForm = new FormData();
        uploadForm.append('file', fileToUpload);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadForm
        });

        if (!uploadRes.ok) {
          throw new Error('Lỗi khi upload ảnh');
        }

        const uploadData = await uploadRes.json();
        finalImageUrl = uploadData.url;
      }

      const url = '/api/admin/products';
      const method = editingProduct ? 'PUT' : 'POST';
      const bodyData = editingProduct 
        ? { id: editingProduct.id, ...formData, imageUrl: finalImageUrl } 
        : { ...formData, imageUrl: finalImageUrl };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Có lỗi xảy ra');
      }

      // Refresh page data
      router.refresh();
      
      // Update local state for immediate feedback
      const { product } = await res.json();
      
      // A full refresh will fetch the related categories and images properly,
      // so we rely on router.refresh() mostly, but we can close modal now.
      handleCloseModal();
      
      // Small timeout to let router.refresh() kick in
      setTimeout(() => {
        window.location.reload();
      }, 500);

    } catch (error) {
      useToastStore.getState().error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn ẨN sản phẩm này? Sản phẩm sẽ không hiển thị với khách hàng nữa.')) return;

    try {
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Không thể ẩn sản phẩm');

      // Refresh
      router.refresh();
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      useToastStore.getState().error(error.message);
    }
  };

  return (
    <div className={adminStyles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
        <h2 style={{ fontSize: 'var(--font-size-lg)' }}>Danh sách Sản phẩm</h2>
        <button 
          onClick={() => handleOpenModal()} 
          className="btn btn-primary" 
          style={{ padding: '0.5rem 1rem', fontSize: 'var(--font-size-sm)' }}
        >
          + Thêm Sản Phẩm Mới
        </button>
      </div>
      
      <table className={adminStyles.table}>
        <thead>
          <tr>
            <th style={{ width: '60px' }}>Ảnh</th>
            <th>Tên Sản Phẩm</th>
            <th>Danh Mục</th>
            <th>Giá Bán</th>
            <th>Tồn Kho</th>
            <th>Trạng Thái</th>
            <th style={{ textAlign: 'right' }}>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--text-muted)' }}>
                Chưa có sản phẩm nào
              </td>
            </tr>
          ) : (
            products.map((product) => (
              <tr key={product.id}>
                <td>
                  <div style={{ width: '40px', height: '40px', background: 'var(--bg-body)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', border: '1px solid var(--border-subtle)' }}>
                    {product.images?.[0]?.url?.match(/\.(jpeg|jpg|gif|png|svg)$/i) ? (
                      <img src={product.images[0].url} alt="" style={{width: '100%', height: '100%', objectFit: 'contain'}} />
                    ) : (
                      product.images?.[0]?.url || '📦'
                    )}
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{product.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>SKU: VTX-{product.id.slice(-6).toUpperCase()}</div>
                </td>
                <td>
                  <span style={{ fontSize: 'var(--font-size-xs)', background: 'var(--bg-body)', padding: '2px 8px', borderRadius: '10px', border: '1px solid var(--border-default)' }}>
                    {product.category?.name}
                  </span>
                </td>
                <td>
                  <div style={{ fontWeight: 'bold' }}>{formatPrice(product.salePrice || product.price)}</div>
                  {product.salePrice && (
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                      {formatPrice(product.price)}
                    </div>
                  )}
                </td>
                <td>
                  <span style={{ 
                    color: product.stock > 0 ? 'var(--color-success, #00ff88)' : 'var(--color-danger)', 
                    fontWeight: 'bold',
                    fontSize: '0.85rem'
                  }}>
                    {product.stock > 0 ? 'Còn hàng' : 'Hết hàng'}
                  </span>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    ({product.stock} sản phẩm)
                  </div>
                </td>
                <td>
                  <span className={`${adminStyles.badge} ${product.isActive ? adminStyles.badgeDelivered : adminStyles.badgePending}`}>
                    {product.isActive ? 'ĐANG BÁN' : 'ĐÃ ẨN'}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button 
                    onClick={() => handleOpenModal(product)}
                    style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: '4px', marginRight: '8px' }}
                  >
                    ✏️ Sửa
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: '4px' }}
                  >
                    🗑️ Xóa
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Modal Form */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{editingProduct ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</h3>
              <button onClick={handleCloseModal} className={styles.closeBtn}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Tên sản phẩm *</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleChange} className={styles.input} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Đường dẫn (slug) *</label>
                  <input type="text" name="slug" required value={formData.slug} onChange={handleChange} className={styles.input} placeholder="vd: chuot-gaming-pro" />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Danh mục *</label>
                  <select name="categoryId" required value={formData.categoryId} onChange={handleChange} className={styles.select}>
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Thương hiệu</label>
                  <input type="text" name="brand" value={formData.brand} onChange={handleChange} className={styles.input} />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Giá gốc (VNĐ) *</label>
                  <input type="number" name="price" required min="0" value={formData.price} onChange={handleChange} className={styles.input} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Giá khuyến mãi (VNĐ)</label>
                  <input type="number" name="salePrice" min="0" value={formData.salePrice} onChange={handleChange} className={styles.input} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Tồn kho *</label>
                  <input type="number" name="stock" required min="0" value={formData.stock} onChange={handleChange} className={styles.input} />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Hình ảnh sản phẩm</label>
                
                {formData.imageUrl && !fileToUpload && (
                  <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '40px', height: '40px', background: 'var(--bg-body)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', border: '1px solid var(--border-subtle)' }}>
                      {formData.imageUrl.match(/\.(jpeg|jpg|gif|png|svg)$/i) ? (
                        <img src={formData.imageUrl} alt="" style={{width: '100%', height: '100%', objectFit: 'contain'}} />
                      ) : (
                        formData.imageUrl
                      )}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ảnh hiện tại</span>
                    <button type="button" onClick={() => setFormData({...formData, imageUrl: ''})} style={{ fontSize: '0.8rem', color: 'var(--color-danger)', background: 'none', border: 'none', cursor: 'pointer' }}>Xóa ảnh</button>
                  </div>
                )}
                
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/jpg, image/gif, image/webp" 
                  onChange={handleFileChange} 
                  className={styles.input} 
                />
                <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Hoặc nhập trực tiếp Emoji / Link ảnh:
                  <input 
                    type="text" 
                    name="imageUrl" 
                    value={formData.imageUrl} 
                    onChange={handleChange} 
                    className={styles.input} 
                    style={{ marginTop: '4px' }}
                    placeholder="vd: 🖱️ hoặc https://link-anh.com/anh.png" 
                    disabled={!!fileToUpload}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Mô tả</label>
                <textarea name="description" rows="3" value={formData.description} onChange={handleChange} className={styles.textarea}></textarea>
              </div>

              {editingProduct && (
                <div className={styles.formGroup}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} />
                    <strong>Đang bán (Hiển thị cho khách hàng)</strong>
                  </label>
                </div>
              )}

              <div className={styles.modalFooter}>
                <button type="button" onClick={handleCloseModal} className={`btn ${styles.cancelBtn}`}>Hủy</button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                  {isSubmitting ? 'Đang lưu...' : 'Lưu Sản Phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
