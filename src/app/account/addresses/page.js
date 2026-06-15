'use client';

import { useState, useEffect } from 'react';
import { useToastStore } from '@/store/toast';
import styles from './addresses.module.css';

export default function AddressesPage() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Location API State
  const [locationData, setLocationData] = useState([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  
  const [form, setForm] = useState({
    id: null,
    recipientName: '',
    phoneNumber: '',
    province: '',
    district: '',
    ward: '',
    street: '',
    isDefault: false
  });

  useEffect(() => {
    fetchAddresses();
    
    // Fetch Vietnam administrative divisions
    setIsLoadingLocation(true);
    fetch('https://provinces.open-api.vn/api/?depth=3')
      .then(res => res.json())
      .then(data => {
        setLocationData(data);
        setIsLoadingLocation(false);
      })
      .catch(err => {
        console.error('Failed to load location data', err);
        setIsLoadingLocation(false);
      });
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await fetch('/api/user/addresses');
      if (res.ok) {
        setAddresses(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (addr = null) => {
    if (addr) {
      setForm(addr);
    } else {
      setForm({
        id: null, recipientName: '', phoneNumber: '', 
        province: '', district: '', ward: '', street: '', isDefault: false
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const method = form.id ? 'PUT' : 'POST';
    const url = form.id ? `/api/user/addresses/${form.id}` : '/api/user/addresses';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchAddresses();
      } else {
        useToastStore.getState().error('Có lỗi xảy ra khi lưu địa chỉ');
      }
    } catch (e) {
      useToastStore.getState().error('Lỗi kết nối');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa địa chỉ này?')) return;
    try {
      const res = await fetch(`/api/user/addresses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAddresses();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const setAsDefault = async (addr) => {
    if (addr.isDefault) return;
    try {
      const res = await fetch(`/api/user/addresses/${addr.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...addr, isDefault: true })
      });
      if (res.ok) {
        fetchAddresses();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="skeleton" style={{ height: '400px' }}></div>;

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Địa Chỉ Của Tôi</h1>
          <p className={styles.subtitle}>Quản lý thông tin giao hàng của bạn</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          + Thêm địa chỉ mới
        </button>
      </div>

      <div className={styles.addressList}>
        {addresses.length === 0 ? (
          <div className={styles.emptyState}>
            Bạn chưa có địa chỉ nào. Hãy thêm một địa chỉ để dễ dàng thanh toán nhé!
          </div>
        ) : (
          addresses.map(addr => (
            <div key={addr.id} className={styles.addressCard}>
              <div className={styles.addressInfo}>
                <div className={styles.nameRow}>
                  <span className={styles.name}>{addr.recipientName}</span>
                  <span className={styles.divider}>|</span>
                  <span className={styles.phone}>{addr.phoneNumber}</span>
                </div>
                <div className={styles.addressText}>
                  {addr.street}<br/>
                  {addr.ward}, {addr.district}, {addr.province}
                </div>
                {addr.isDefault && <span className={styles.defaultBadge}>Mặc định</span>}
              </div>
              <div className={styles.actions}>
                <div className={styles.actionLinks}>
                  <button onClick={() => openModal(addr)} className={styles.linkBtn}>Cập nhật</button>
                  {!addr.isDefault && (
                    <button onClick={() => handleDelete(addr.id)} className={styles.linkBtn}>Xóa</button>
                  )}
                </div>
                <button 
                  className={`btn ${addr.isDefault ? 'btn-secondary' : 'btn-outline'}`}
                  onClick={() => setAsDefault(addr)}
                  disabled={addr.isDefault}
                >
                  Thiết lập mặc định
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>{form.id ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}</h2>
            <form onSubmit={handleSave} className={styles.formGrid}>
              <div className={styles.formGroup}>
                <input required placeholder="Họ và tên" className="input-field" value={form.recipientName} onChange={e => setForm({...form, recipientName: e.target.value})} />
              </div>
              <div className={styles.formGroup}>
                <input required type="tel" placeholder="Số điện thoại" className="input-field" value={form.phoneNumber} onChange={e => setForm({...form, phoneNumber: e.target.value})} />
              </div>
              {isLoadingLocation ? (
                <div style={{ gridColumn: '1 / -1', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Đang tải dữ liệu địa giới hành chính...</div>
              ) : (
                <>
                  <div className={styles.formGroup}>
                    <select 
                      required 
                      className="input-field" 
                      value={form.province} 
                      onChange={e => setForm({...form, province: e.target.value, district: '', ward: ''})}
                    >
                      <option value="">Chọn Tỉnh / Thành phố</option>
                      {locationData.map(p => (
                        <option key={p.code} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <select 
                      required 
                      className="input-field" 
                      value={form.district} 
                      onChange={e => setForm({...form, district: e.target.value, ward: ''})}
                      disabled={!form.province}
                    >
                      <option value="">Chọn Quận / Huyện</option>
                      {(locationData.find(p => p.name === form.province)?.districts || []).map(d => (
                        <option key={d.code} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <select 
                      required 
                      className="input-field" 
                      value={form.ward} 
                      onChange={e => setForm({...form, ward: e.target.value})}
                      disabled={!form.district}
                    >
                      <option value="">Chọn Phường / Xã</option>
                      {((locationData.find(p => p.name === form.province)?.districts || [])
                        .find(d => d.name === form.district)?.wards || []).map(w => (
                        <option key={w.code} value={w.name}>{w.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <input required placeholder="Số nhà, Tên đường" className="input-field" value={form.street} onChange={e => setForm({...form, street: e.target.value})} />
                  </div>
                </>
              )}
              
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" checked={form.isDefault} onChange={e => setForm({...form, isDefault: e.target.checked})} />
                  Đặt làm địa chỉ mặc định
                </label>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Trở lại</button>
                <button type="submit" className="btn btn-primary">Hoàn thành</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
