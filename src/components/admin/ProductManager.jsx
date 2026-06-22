'use client';

import { useState, useMemo } from 'react';
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

function parseSpecsOrFeatures(str, isFeature = false) {
  if (!str) return [];
  try {
    const parsed = JSON.parse(str);
    if (Array.isArray(parsed)) {
      return parsed.map(item => {
        if (typeof item === 'string') return { key: isFeature ? 'Điểm nổi bật' : 'Thông số', value: item };
        return item;
      });
    }
    if (typeof parsed === 'object' && parsed !== null) {
      return Object.entries(parsed).map(([key, value]) => ({ key, value: String(value) }));
    }
  } catch (e) {
    console.error('Parse error:', e);
  }
  return [];
}

export default function ProductManager({ initialProducts, categories }) {
  const router = useRouter();
  
  const [products, setProducts] = useState(initialProducts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [expandedVariantIndex, setExpandedVariantIndex] = useState(null);

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterStock, setFilterStock] = useState('all');

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const nameMatch = p.name?.toLowerCase().includes(q);
        const brandMatch = p.brand?.toLowerCase().includes(q);
        const skuMatch = p.id?.toLowerCase().includes(q);
        if (!nameMatch && !brandMatch && !skuMatch) return false;
      }
      if (filterCategory !== 'all' && p.categoryId !== filterCategory) return false;
      if (filterStatus === 'active' && !p.isActive) return false;
      if (filterStatus === 'hidden' && p.isActive) return false;
      if (filterStock === 'instock' && p.stock <= 0) return false;
      if (filterStock === 'outofstock' && p.stock > 0) return false;
      return true;
    });
  }, [products, searchQuery, filterCategory, filterStatus, filterStock]);

  // Category Management State
  const [categoryList, setCategoryList] = useState(categories);
  const [isCategoryPanelOpen, setIsCategoryPanelOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', description: '', parentGroup: 'gaming', sortOrder: 0 });
  const [categoryError, setCategoryError] = useState('');

  const resetCategoryForm = () => {
    setEditingCategory(null);
    setCategoryForm({ name: '', slug: '', description: '', parentGroup: 'gaming', sortOrder: 0 });
    setCategoryError('');
  };

  const handleCategoryFormChange = (field, value) => {
    setCategoryForm(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'name' && !editingCategory) {
        updated.slug = generateSlug(value);
      }
      return updated;
    });
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name || !categoryForm.slug) {
      setCategoryError('Tên và slug là bắt buộc');
      return;
    }
    try {
      setCategoryError('');
      const method = editingCategory ? 'PUT' : 'POST';
      const body = editingCategory ? { id: editingCategory.id, ...categoryForm } : categoryForm;
      const res = await fetch('/api/admin/categories', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      useToastStore.getState().success(data.message);
      resetCategoryForm();
      // Refresh categories
      const catRes = await fetch('/api/admin/categories');
      const cats = await catRes.json();
      setCategoryList(cats);
    } catch (err) {
      setCategoryError(err.message);
    }
  };

  const handleEditCategory = (cat) => {
    setEditingCategory(cat);
    setCategoryForm({ name: cat.name, slug: cat.slug, description: cat.description || '', parentGroup: cat.parentGroup, sortOrder: cat.sortOrder });
  };

  const handleDeleteCategory = async (cat) => {
    const productCount = cat._count?.products || products.filter(p => p.categoryId === cat.id).length;
    if (productCount > 0) {
      setCategoryError(`Không thể xóa "${cat.name}" vì còn ${productCount} sản phẩm. Hãy ẩn/xóa hết sản phẩm trước.`);
      return;
    }
    if (!confirm(`Xóa danh mục "${cat.name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/categories?id=${cat.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      useToastStore.getState().success(data.message);
      setCategoryError('');
      const catRes = await fetch('/api/admin/categories');
      const cats = await catRes.json();
      setCategoryList(cats);
    } catch (err) {
      setCategoryError(err.message);
    }
  };

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    baseVariantName: '',
    specs: [],
    features: [],
    variants: [],
    price: '',
    salePrice: '',
    stock: '',
    categoryId: '',
    imageUrls: [],
    isActive: true
  });

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || '',
        baseVariantName: product.baseVariantName || '',
        specs: parseSpecsOrFeatures(product.specs),
        features: parseSpecsOrFeatures(product.features, true),
        variants: product.variants?.map(v => ({
          ...v,
          imageUrls: v.images?.map(img => img.url) || (v.imageUrl ? [v.imageUrl] : []),
          specs: parseSpecsOrFeatures(v.specs),
          features: parseSpecsOrFeatures(v.features, true)
        })) || [],
        price: product.price || '',
        salePrice: product.salePrice || '',
        stock: product.stock || '',
        brand: product.brand || '',
        categoryId: product.categoryId || '',
        imageUrls: product.images?.filter(img => !img.variantId).map(img => img.url) || [],
        isActive: product.isActive
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '', slug: '', description: '', baseVariantName: '', specs: [], features: [], variants: [], price: '', salePrice: '', stock: '', brand: '', categoryId: categoryList[0]?.id || '', imageUrls: [], isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFileToUpload(null);
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    try {
      const uploadedUrls = [];
      for (const file of files) {
        const uploadForm = new FormData();
        uploadForm.append('file', file);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadForm
        });
        if (!uploadRes.ok) throw new Error('Upload failed');
        const uploadData = await uploadRes.json();
        uploadedUrls.push(uploadData.url);
      }
      setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, ...uploadedUrls] }));
    } catch (err) {
      setError('Lỗi khi tải ảnh lên.');
    }
  };

  const handleSpecChange = (index, field, value) => {
    const newSpecs = [...formData.specs];
    newSpecs[index][field] = value;
    setFormData({ ...formData, specs: newSpecs });
  };

  const handleAddSpec = () => {
    setFormData({ ...formData, specs: [...formData.specs, { key: '', value: '' }] });
  };

  const handleRemoveSpec = (index) => {
    setFormData({ ...formData, specs: formData.specs.filter((_, i) => i !== index) });
  };

  const handleFeatureChange = (index, field, value) => {
    const newFeatures = [...formData.features];
    let feat = newFeatures[index];
    if (typeof feat === 'string') {
      feat = { key: 'Điểm nổi bật', value: feat };
    }
    newFeatures[index] = { ...feat, [field]: value };
    setFormData({ ...formData, features: newFeatures });
  };

  const handleAddFeature = () => {
    setFormData({ ...formData, features: [...formData.features, { key: '', value: '' }] });
  };

  const handleRemoveFeature = (index) => {
    setFormData({ ...formData, features: formData.features.filter((_, i) => i !== index) });
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...formData.variants];
    newVariants[index][field] = value;
    
    // Auto-generate SKU if name is changed and SKU is empty
    if (field === 'name' && (!newVariants[index].sku || newVariants[index].sku.startsWith(formData.slug + '-'))) {
      if (value) {
        newVariants[index].sku = `${formData.slug || 'vtx'}-${generateSlug(value)}`.toUpperCase();
      } else {
        newVariants[index].sku = '';
      }
    }
    
    setFormData({ ...formData, variants: newVariants });
  };

  const handleVariantFileChange = async (index, e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    try {
      const uploadedUrls = [];
      for (const file of files) {
        const uploadForm = new FormData();
        uploadForm.append('file', file);
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadForm
        });
        
        if (!uploadRes.ok) throw new Error('Upload failed');
        
        const uploadData = await uploadRes.json();
        uploadedUrls.push(uploadData.url);
      }
      const newVariants = [...formData.variants];
      newVariants[index].imageUrls = [...(newVariants[index].imageUrls || []), ...uploadedUrls];
      setFormData({ ...formData, variants: newVariants });
    } catch (err) {
      setError('Lỗi khi tải ảnh biến thể lên.');
    }
  };

  const handleAddVariant = () => {
    setFormData({ ...formData, variants: [...formData.variants, { name: '', sku: '', stock: 0, priceOffset: 0, imageUrls: [], specs: [], features: [] }] });
  };

  const handleVariantSpecChange = (vIndex, sIndex, field, value) => {
    const newVariants = [...formData.variants];
    if (!newVariants[vIndex].specs) newVariants[vIndex].specs = [];
    newVariants[vIndex].specs[sIndex][field] = value;
    setFormData({ ...formData, variants: newVariants });
  };

  const handleAddVariantSpec = (vIndex) => {
    const newVariants = [...formData.variants];
    if (!newVariants[vIndex].specs) newVariants[vIndex].specs = [];
    newVariants[vIndex].specs.push({ key: '', value: '' });
    setFormData({ ...formData, variants: newVariants });
  };

  const handleRemoveVariantSpec = (vIndex, sIndex) => {
    const newVariants = [...formData.variants];
    newVariants[vIndex].specs = newVariants[vIndex].specs.filter((_, i) => i !== sIndex);
    setFormData({ ...formData, variants: newVariants });
  };

  const handleVariantFeatureChange = (vIndex, fIndex, field, value) => {
    const newVariants = [...formData.variants];
    if (!newVariants[vIndex].features) newVariants[vIndex].features = [];
    let feat = newVariants[vIndex].features[fIndex];
    if (typeof feat === 'string') feat = { key: 'Điểm nổi bật', value: feat };
    newVariants[vIndex].features[fIndex] = { ...feat, [field]: value };
    setFormData({ ...formData, variants: newVariants });
  };

  const handleAddVariantFeature = (vIndex) => {
    const newVariants = [...formData.variants];
    if (!newVariants[vIndex].features) newVariants[vIndex].features = [];
    newVariants[vIndex].features.push({ key: '', value: '' });
    setFormData({ ...formData, variants: newVariants });
  };

  const handleRemoveVariantFeature = (vIndex, fIndex) => {
    const newVariants = [...formData.variants];
    newVariants[vIndex].features = newVariants[vIndex].features.filter((_, i) => i !== fIndex);
    setFormData({ ...formData, variants: newVariants });
  };

  const handleRemoveVariant = (index) => {
    setFormData({ ...formData, variants: formData.variants.filter((_, i) => i !== index) });
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
      // Validate inputs
      if (parseFloat(formData.price) < 0 || (formData.salePrice && parseFloat(formData.salePrice) < 0)) {
        throw new Error('Giá sản phẩm không được là số âm');
      }
      if (parseInt(formData.stock) < 0) {
        throw new Error('Tồn kho không được là số âm');
      }
      for (const v of formData.variants) {
        if (v.priceOffset < 0 && Math.abs(v.priceOffset) > parseFloat(formData.price)) {
          throw new Error(`Biến thể ${v.name} có giá giảm vượt quá giá gốc`);
        }
        if (v.stock < 0) {
          throw new Error(`Tồn kho của biến thể ${v.name} không được âm`);
        }
      }

      const url = '/api/admin/products';
      const method = editingProduct ? 'PUT' : 'POST';
      const bodyData = editingProduct 
        ? { id: editingProduct.id, ...formData } 
        : { ...formData };

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
        <h2 style={{ fontSize: 'var(--font-size-lg)' }}>Danh sách Sản phẩm</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => { setIsCategoryPanelOpen(!isCategoryPanelOpen); resetCategoryForm(); }}
            style={{ padding: '0.5rem 1rem', fontSize: 'var(--font-size-sm)', background: isCategoryPanelOpen ? 'var(--bg-glass-strong)' : 'transparent', border: '1px solid var(--border-default)', borderRadius: '8px', color: 'var(--text-primary)', cursor: 'pointer' }}
          >
            🗂️ Quản lý Danh mục
          </button>
          <button 
            onClick={() => handleOpenModal()} 
            className="btn btn-primary" 
            style={{ padding: '0.5rem 1rem', fontSize: 'var(--font-size-sm)' }}
          >
            + Thêm Sản Phẩm Mới
          </button>
        </div>
      </div>

      {/* Category Management Panel */}
      {isCategoryPanelOpen && (
        <div style={{ marginBottom: 'var(--space-md)', padding: '16px 20px', background: 'var(--bg-body)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>🗂️ Quản lý Danh mục</h3>
            <button onClick={() => { setIsCategoryPanelOpen(false); resetCategoryForm(); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px' }}>✕</button>
          </div>

          {categoryError && (
            <div style={{ padding: '8px 12px', background: 'rgba(255,50,50,0.1)', border: '1px solid rgba(255,50,50,0.3)', borderRadius: '8px', color: '#ff6b6b', fontSize: '12px', marginBottom: '12px' }}>
              ⚠️ {categoryError}
            </div>
          )}

          {/* Add/Edit Category Form */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 150px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Tên danh mục *</label>
              <input type="text" value={categoryForm.name} onChange={(e) => handleCategoryFormChange('name', e.target.value)} placeholder="vd: Chuột gaming" style={{ width: '100%', padding: '7px 10px', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px' }} />
            </div>
            <div style={{ flex: '1 1 120px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Slug *</label>
              <input type="text" value={categoryForm.slug} onChange={(e) => handleCategoryFormChange('slug', e.target.value)} placeholder="chuot-gaming" style={{ width: '100%', padding: '7px 10px', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px' }} />
            </div>
            <div style={{ flex: '1 1 100px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Nhóm</label>
              <select value={categoryForm.parentGroup} onChange={(e) => handleCategoryFormChange('parentGroup', e.target.value)} style={{ width: '100%', padding: '7px 10px', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px', cursor: 'pointer' }}>
                <option value="gaming">Gaming Gear</option>
                <option value="tech">Phụ Kiện CN</option>
              </select>
            </div>
            <div style={{ flex: '0 0 70px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Thứ tự</label>
              <input type="number" value={categoryForm.sortOrder} onChange={(e) => handleCategoryFormChange('sortOrder', e.target.value)} min="0" style={{ width: '100%', padding: '7px 10px', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px' }} />
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={handleSaveCategory} style={{ padding: '7px 16px', background: 'var(--color-primary)', color: '#000', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {editingCategory ? '✔ Cập nhật' : '+ Thêm'}
              </button>
              {editingCategory && (
                <button onClick={resetCategoryForm} style={{ padding: '7px 12px', background: 'transparent', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer' }}>Hủy</button>
              )}
            </div>
          </div>

          {/* Category List */}
          <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '11px' }}>Tên</th>
                  <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '11px' }}>Slug</th>
                  <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '11px' }}>Nhóm</th>
                  <th style={{ textAlign: 'center', padding: '6px 8px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '11px' }}>SP</th>
                  <th style={{ textAlign: 'center', padding: '6px 8px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '11px' }}>TT</th>
                  <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '11px' }}></th>
                </tr>
              </thead>
              <tbody>
                {categoryList.map(cat => {
                  const productCount = cat._count?.products ?? products.filter(p => p.categoryId === cat.id).length;
                  return (
                    <tr key={cat.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '8px', fontWeight: '500', color: 'var(--text-primary)' }}>{cat.name}</td>
                      <td style={{ padding: '8px', color: 'var(--text-muted)', fontSize: '12px' }}>{cat.slug}</td>
                      <td style={{ padding: '8px' }}>
                        <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '10px', background: cat.parentGroup === 'gaming' ? 'rgba(0,200,255,0.1)' : 'rgba(200,150,255,0.1)', color: cat.parentGroup === 'gaming' ? '#00c8ff' : '#c896ff', border: '1px solid' }}>
                          {cat.parentGroup === 'gaming' ? 'Gaming' : 'Phụ kiện'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', padding: '8px', fontWeight: '600' }}>{productCount}</td>
                      <td style={{ textAlign: 'center', padding: '8px' }}>
                        <span style={{ color: cat.isActive ? 'var(--color-success, #00ff88)' : 'var(--color-danger)', fontSize: '16px' }}>
                          {cat.isActive ? '●' : '○'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', padding: '8px' }}>
                        <button onClick={() => handleEditCategory(cat)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '12px', marginRight: '8px' }}>✏️ Sửa</button>
                        <button onClick={() => handleDeleteCategory(cat)} style={{ background: 'none', border: 'none', color: productCount > 0 ? 'var(--text-muted)' : 'var(--color-danger)', cursor: productCount > 0 ? 'not-allowed' : 'pointer', fontSize: '12px', opacity: productCount > 0 ? 0.5 : 1 }} title={productCount > 0 ? `Còn ${productCount} sản phẩm` : 'Xóa danh mục'}>🗑️ Xóa</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: 'var(--space-md)', flexWrap: 'wrap', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-body)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
        {/* Search */}
        <div style={{ flex: '1 1 220px', position: 'relative' }}>
          <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: 'var(--text-muted)', pointerEvents: 'none' }}>🔍</span>
          <input
            type="text"
            placeholder="Tìm theo tên, thương hiệu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '8px 10px 8px 32px', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
          />
        </div>

        {/* Category Filter */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{ padding: '8px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px', cursor: 'pointer', minWidth: '150px' }}
        >
          <option value="all">📂 Tất cả danh mục</option>
          {categoryList.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ padding: '8px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px', cursor: 'pointer', minWidth: '130px' }}
        >
          <option value="all">🏷️ Trạng thái</option>
          <option value="active">✅ Đang bán</option>
          <option value="hidden">🚫 Đã ẩn</option>
        </select>

        {/* Stock Filter */}
        <select
          value={filterStock}
          onChange={(e) => setFilterStock(e.target.value)}
          style={{ padding: '8px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px', cursor: 'pointer', minWidth: '130px' }}
        >
          <option value="all">📦 Tồn kho</option>
          <option value="instock">✅ Còn hàng</option>
          <option value="outofstock">⚠️ Hết hàng</option>
        </select>

        {/* Result count */}
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          {filteredProducts.length}/{products.length} sản phẩm
        </span>

        {/* Clear filters */}
        {(searchQuery || filterCategory !== 'all' || filterStatus !== 'all' || filterStock !== 'all') && (
          <button
            type="button"
            onClick={() => { setSearchQuery(''); setFilterCategory('all'); setFilterStatus('all'); setFilterStock('all'); }}
            style={{ padding: '6px 12px', background: 'transparent', border: '1px solid var(--border-default)', borderRadius: '8px', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '12px', whiteSpace: 'nowrap' }}
          >
            ✕ Xóa bộ lọc
          </button>
        )}
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
          {filteredProducts.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--text-muted)' }}>
                {products.length === 0 ? 'Chưa có sản phẩm nào' : 'Không tìm thấy sản phẩm phù hợp với bộ lọc'}
              </td>
            </tr>
          ) : (
            filteredProducts.map((product) => (
              <tr key={product.id}>
                <td>
                  <div style={{ width: '40px', height: '40px', background: 'var(--bg-body)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', border: '1px solid var(--border-subtle)' }}>
                    {product.images?.[0]?.url?.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) ? (
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
                  <select name="categoryId" required value={formData.categoryId} onChange={handleChange} className={styles.input}>
                    <option value="">-- Chọn danh mục --</option>
                    {categoryList.map(cat => (
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
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label className={styles.label}>Giá gốc (*)</label>
                  <input type="number" name="price" value={formData.price} onChange={handleChange} className={styles.input} required min="0" />
                  {parseFloat(formData.price) < 0 && <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem' }}>Giá không được âm</span>}
                </div>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label className={styles.label}>Giá khuyến mãi</label>
                  <input type="number" name="salePrice" value={formData.salePrice} onChange={handleChange} className={styles.input} min="0" />
                  {parseFloat(formData.salePrice) < 0 && <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem' }}>Giá không được âm</span>}
                </div>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label className={styles.label}>Tồn kho (*)</label>
                  <input type="number" name="stock" value={formData.stock} onChange={handleChange} className={styles.input} required min="0" />
                  {parseInt(formData.stock) < 0 && <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem' }}>Kho không được âm</span>}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Hình ảnh sản phẩm (có thể thêm nhiều ảnh)</label>
                
                {formData.imageUrls.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '8px 0' }}>
                    {formData.imageUrls.map((imgUrl, imgIdx) => (
                      <div key={imgIdx} style={{ position: 'relative', width: '60px', height: '60px', border: '1px solid var(--border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                        {imgUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) ? (
                          <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        ) : (
                          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', fontSize: '1.5rem' }}>{imgUrl}</span>
                        )}
                        <button type="button" onClick={() => {
                          setFormData(prev => ({ ...prev, imageUrls: prev.imageUrls.filter((_, i) => i !== imgIdx) }));
                        }} style={{ position: 'absolute', top: '0', right: '0', width: '18px', height: '18px', background: 'rgba(255,50,50,0.85)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '10px', lineHeight: '18px', textAlign: 'center', borderRadius: '0 0 0 4px' }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div style={{ padding: '8px', border: '1px solid var(--border-default)', borderRadius: '4px', marginBottom: '8px' }}>
                  <input 
                    type="file" 
                    accept="image/*,.png,.jpg,.jpeg,.gif,.webp,.svg" 
                    multiple
                    onChange={handleFileChange} 
                    className={styles.input} 
                    style={{ border: 'none', padding: 0 }}
                  />
                </div>
              </div>


              <div className={styles.formGroup}>
                <label className={styles.label}>Mô tả chi tiết (Hỗ trợ HTML)</label>
                <textarea name="description" rows="5" value={formData.description} onChange={handleChange} className={styles.textarea} placeholder="Nhập mô tả sản phẩm, có thể dùng <b>in đậm</b>, <br> xuống dòng..."></textarea>
              </div>

              {/* Thông số kỹ thuật */}
              <div className={styles.formGroup}>
                <label className={styles.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Thông số kỹ thuật</span>
                  <button type="button" onClick={handleAddSpec} style={{ fontSize: '0.8rem', color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer' }}>+ Thêm thông số</button>
                </label>
                {formData.specs.map((spec, index) => (
                  <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <input type="text" placeholder="Tên (vd: Switch)" value={spec.key} onChange={(e) => handleSpecChange(index, 'key', e.target.value)} className={styles.input} style={{ flex: 1 }} />
                    <input type="text" placeholder="Giá trị (vd: Cherry MX)" value={spec.value} onChange={(e) => handleSpecChange(index, 'value', e.target.value)} className={styles.input} style={{ flex: 2 }} />
                    <button type="button" onClick={() => handleRemoveSpec(index)} style={{ color: 'var(--color-danger)', background: 'none', border: 'none', cursor: 'pointer' }}>✖</button>
                  </div>
                ))}
              </div>

              {/* Điểm nổi bật */}
              <div className={styles.formGroup}>
                <label className={styles.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Điểm nổi bật (Features)</span>
                  <button type="button" onClick={handleAddFeature} style={{ fontSize: '0.8rem', color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer' }}>+ Thêm điểm nổi bật</button>
                </label>
                {formData.features.map((feature, index) => (
                  <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <input type="text" placeholder="Tên (vd: Công nghệ)" value={feature.key || ''} onChange={(e) => handleFeatureChange(index, 'key', e.target.value)} className={styles.input} style={{ flex: 1 }} />
                    <input type="text" placeholder="Giá trị (vd: LIGHTSPEED)" value={feature.value || ''} onChange={(e) => handleFeatureChange(index, 'value', e.target.value)} className={styles.input} style={{ flex: 2 }} />
                    <button type="button" onClick={() => handleRemoveFeature(index)} style={{ color: 'var(--color-danger)', background: 'none', border: 'none', cursor: 'pointer' }}>✖</button>
                  </div>
                ))}
              </div>

              {/* Biến thể sản phẩm */}
              <div className={styles.formGroup}>
                <label className={styles.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Biến thể sản phẩm (Màu sắc, Phiên bản)</span>
                  <button type="button" onClick={handleAddVariant} style={{ fontSize: '0.8rem', color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer' }}>+ Thêm biến thể</button>
                </label>
                
                {formData.variants.length > 0 && (
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Tên hiển thị cho phiên bản gốc (Bản tiêu chuẩn, Đen, ...)</label>
                    <input 
                      type="text" 
                      name="baseVariantName" 
                      value={formData.baseVariantName} 
                      onChange={handleChange} 
                      className={styles.input} 
                      placeholder="vd: Bản tiêu chuẩn" 
                    />
                  </div>
                )}
                {formData.variants.map((variant, index) => (
                  <div key={index} style={{ padding: '10px', border: '1px solid var(--border-default)', borderRadius: '8px', marginBottom: '10px', background: 'var(--bg-card)' }}>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                      <input type="text" placeholder="Tên (vd: Màu Trắng)" value={variant.name} onChange={(e) => handleVariantChange(index, 'name', e.target.value)} className={styles.input} style={{ flex: 1 }} required />
                      <input type="text" placeholder="SKU" value={variant.sku} onChange={(e) => handleVariantChange(index, 'sku', e.target.value)} className={styles.input} style={{ flex: 1 }} />
                      <button type="button" onClick={() => handleRemoveVariant(index)} style={{ color: 'var(--color-danger)', background: 'none', border: 'none', cursor: 'pointer', padding: '0 10px' }}>Xóa biến thể</button>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Kho riêng</label>
                        <input type="number" value={variant.stock} onChange={(e) => handleVariantChange(index, 'stock', parseInt(e.target.value) || 0)} className={styles.input} min="0" />
                        {variant.stock < 0 && <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem' }}>Không được âm</span>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Chênh lệch giá (+/-)</label>
                        <input type="number" value={variant.priceOffset} onChange={(e) => handleVariantChange(index, 'priceOffset', parseFloat(e.target.value) || 0)} className={styles.input} />
                      </div>
                    </div>
                    <div style={{ marginTop: '10px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Hình ảnh biến thể (có thể thêm nhiều ảnh)</label>
                      
                      {(variant.imageUrls || []).length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '8px 0' }}>
                          {variant.imageUrls.map((imgUrl, imgIdx) => (
                            <div key={imgIdx} style={{ position: 'relative', width: '60px', height: '60px', border: '1px solid var(--border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                              {imgUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) ? (
                                <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                              ) : (
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', fontSize: '1.5rem' }}>{imgUrl}</span>
                              )}
                              <button type="button" onClick={() => {
                                const newVariants = [...formData.variants];
                                newVariants[index].imageUrls = newVariants[index].imageUrls.filter((_, i) => i !== imgIdx);
                                setFormData({ ...formData, variants: newVariants });
                              }} style={{ position: 'absolute', top: '0', right: '0', width: '18px', height: '18px', background: 'rgba(255,50,50,0.85)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '10px', lineHeight: '18px', textAlign: 'center', borderRadius: '0 0 0 4px' }}>✕</button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div style={{ padding: '8px', border: '1px solid var(--border-default)', borderRadius: '4px', marginBottom: '8px' }}>
                        <input type="file" accept="image/*,.png,.jpg,.jpeg,.gif,.webp,.svg" multiple onChange={(e) => handleVariantFileChange(index, e)} className={styles.input} style={{ border: 'none', padding: 0 }} />
                      </div>
                      
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Hoặc nhập trực tiếp link ảnh:
                        <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                          <input type="text" id={`variant-img-input-${index}`} className={styles.input} style={{ flex: 1 }} placeholder="vd: https://link-anh.com/mau-trang.png" />
                          <button type="button" onClick={() => {
                            const input = document.getElementById(`variant-img-input-${index}`);
                            if (input.value.trim()) {
                              const newVariants = [...formData.variants];
                              newVariants[index].imageUrls = [...(newVariants[index].imageUrls || []), input.value.trim()];
                              setFormData({ ...formData, variants: newVariants });
                              input.value = '';
                            }
                          }} style={{ padding: '4px 10px', background: 'var(--color-primary)', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>+ Thêm</button>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: '10px' }}>
                      <button type="button" onClick={() => setExpandedVariantIndex(expandedVariantIndex === index ? null : index)} style={{ fontSize: '0.8rem', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-default)', background: 'var(--bg-body)', color: 'var(--text-primary)', cursor: 'pointer' }}>
                        {expandedVariantIndex === index ? 'Thu gọn chi tiết' : 'Mở rộng chi tiết (Thông số, Nổi bật)'}
                      </button>
                    </div>

                    {expandedVariantIndex === index && (
                      <div style={{ marginTop: '15px', padding: '15px', border: '1px dashed var(--border-default)', borderRadius: '8px', background: 'var(--bg-body)' }}>
                        <div style={{ marginBottom: '15px' }}>
                          <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <strong style={{ fontSize: '0.85rem' }}>Điểm nổi bật riêng</strong>
                            <button type="button" onClick={() => handleAddVariantFeature(index)} style={{ fontSize: '0.8rem', color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer' }}>+ Thêm điểm</button>
                          </label>
                          {(variant.features || []).map((feature, fIndex) => (
                            <div key={fIndex} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                              <input type="text" placeholder="Tên" value={feature.key || ''} onChange={(e) => handleVariantFeatureChange(index, fIndex, 'key', e.target.value)} className={styles.input} style={{ flex: 1, padding: '4px 8px', fontSize: '0.8rem' }} />
                              <input type="text" placeholder="Giá trị" value={feature.value || ''} onChange={(e) => handleVariantFeatureChange(index, fIndex, 'value', e.target.value)} className={styles.input} style={{ flex: 2, padding: '4px 8px', fontSize: '0.8rem' }} />
                              <button type="button" onClick={() => handleRemoveVariantFeature(index, fIndex)} style={{ color: 'var(--color-danger)', background: 'none', border: 'none', cursor: 'pointer' }}>✖</button>
                            </div>
                          ))}
                          {(!variant.features || variant.features.length === 0) && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>* Sẽ dùng điểm nổi bật của sản phẩm gốc</div>}
                        </div>

                        <div>
                          <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <strong style={{ fontSize: '0.85rem' }}>Thông số kỹ thuật riêng</strong>
                            <button type="button" onClick={() => handleAddVariantSpec(index)} style={{ fontSize: '0.8rem', color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer' }}>+ Thêm thông số</button>
                          </label>
                          {(variant.specs || []).map((spec, sIndex) => (
                            <div key={sIndex} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                              <input type="text" placeholder="Tên" value={spec.key || ''} onChange={(e) => handleVariantSpecChange(index, sIndex, 'key', e.target.value)} className={styles.input} style={{ flex: 1, padding: '4px 8px', fontSize: '0.8rem' }} />
                              <input type="text" placeholder="Giá trị" value={spec.value || ''} onChange={(e) => handleVariantSpecChange(index, sIndex, 'value', e.target.value)} className={styles.input} style={{ flex: 2, padding: '4px 8px', fontSize: '0.8rem' }} />
                              <button type="button" onClick={() => handleRemoveVariantSpec(index, sIndex)} style={{ color: 'var(--color-danger)', background: 'none', border: 'none', cursor: 'pointer' }}>✖</button>
                            </div>
                          ))}
                          {(!variant.specs || variant.specs.length === 0) && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>* Sẽ dùng thông số của sản phẩm gốc</div>}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
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
