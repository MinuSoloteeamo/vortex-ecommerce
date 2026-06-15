'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';

// Helper to mask phone and email
function maskEmail(email) {
  if (!email) return '';
  const [name, domain] = email.split('@');
  if (name.length <= 2) return email;
  return `${name.substring(0, 2)}***@${domain}`;
}

function maskPhone(phone) {
  if (!phone) return 'Chưa cập nhật';
  if (phone.length < 4) return phone;
  return `*******${phone.slice(-3)}`;
}

export default function AccountInfoPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [form, setForm] = useState({
    name: '',
    gender: 'Nam',
    phone: '',
    dobDay: '1',
    dobMonth: '1',
    dobYear: '2000'
  });

  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        
        let day = '1', month = '1', year = '2000';
        if (data.dob) {
          const d = new Date(data.dob);
          day = d.getDate().toString();
          month = (d.getMonth() + 1).toString();
          year = d.getFullYear().toString();
        }

        setForm({
          name: data.name || '',
          gender: data.gender || 'Nam',
          phone: data.phone || '',
          dobDay: day,
          dobMonth: month,
          dobYear: year
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    
    // Construct Date from dropdowns
    const dob = new Date(`${form.dobYear}-${form.dobMonth}-${form.dobDay}`);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          gender: form.gender,
          phone: form.phone,
          dob: dob.toISOString()
        })
      });
      
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setMsg({ type: 'success', text: 'Cập nhật hồ sơ thành công!' });
        setIsEditingPhone(false);
      } else {
        setMsg({ type: 'error', text: 'Có lỗi xảy ra' });
      }
    } catch (error) {
      setMsg({ type: 'error', text: 'Lỗi kết nối' });
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      setMsg({ type: 'error', text: 'Dung lượng file tối đa là 1MB' });
      return;
    }

    setUploadingAvatar(true);
    setMsg({ type: '', text: '' });

    try {
      // 1. Upload ảnh
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!uploadRes.ok) throw new Error('Upload failed');
      const uploadData = await uploadRes.json();
      const imageUrl = uploadData.url;

      // 2. Cập nhật profile DB
      const updateRes = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: imageUrl })
      });

      if (updateRes.ok) {
        const updated = await updateRes.json();
        setProfile(updated.user || updated);
        setMsg({ type: 'success', text: 'Cập nhật ảnh đại diện thành công!' });
      } else {
        setMsg({ type: 'error', text: 'Lỗi khi cập nhật avatar' });
      }
    } catch (error) {
      setMsg({ type: 'error', text: 'Lỗi upload ảnh' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) return <div className="skeleton" style={{ height: '400px', width: '100%' }}></div>;
  if (!profile) return null;

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Hồ Sơ Của Tôi</h1>
        <p className={styles.subtitle}>Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
      </div>

      <div className={styles.content}>
        {/* Form Area (Left) */}
        <div className={styles.formArea}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className={styles.formLabel}>Họ Tên</div>
              <div className={styles.formInput}>
                <input 
                  type="text" 
                  className={styles.inputField} 
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formLabel}>Email</div>
              <div className={styles.formInput}>
                <span className={styles.readOnlyText}>{maskEmail(profile.email)}</span>
                {/* <button type="button" className={styles.changeLink}>Thay Đổi</button> */}
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formLabel}>Số điện thoại</div>
              <div className={styles.formInput}>
                {isEditingPhone ? (
                  <input 
                    type="tel" 
                    className={styles.inputField} 
                    value={form.phone}
                    onChange={e => setForm({...form, phone: e.target.value})}
                    autoFocus
                  />
                ) : (
                  <>
                    <span className={styles.readOnlyText}>{maskPhone(profile.phone)}</span>
                    <button type="button" className={styles.changeLink} onClick={() => setIsEditingPhone(true)}>Thay Đổi</button>
                  </>
                )}
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formLabel}>Giới tính</div>
              <div className={styles.formInput}>
                <div className={styles.radioGroup}>
                  <label className={styles.radioLabel}>
                    <input 
                      type="radio" 
                      name="gender" 
                      value="Nam" 
                      checked={form.gender === 'Nam'} 
                      onChange={e => setForm({...form, gender: e.target.value})}
                    /> Nam
                  </label>
                  <label className={styles.radioLabel}>
                    <input 
                      type="radio" 
                      name="gender" 
                      value="Nữ" 
                      checked={form.gender === 'Nữ'}
                      onChange={e => setForm({...form, gender: e.target.value})}
                    /> Nữ
                  </label>
                  <label className={styles.radioLabel}>
                    <input 
                      type="radio" 
                      name="gender" 
                      value="Khác" 
                      checked={form.gender === 'Khác'}
                      onChange={e => setForm({...form, gender: e.target.value})}
                    /> Khác
                  </label>
                </div>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formLabel}>Ngày sinh</div>
              <div className={styles.formInput}>
                <div className={styles.dateGroup}>
                  <select className={styles.dateSelect} value={form.dobDay} onChange={e => setForm({...form, dobDay: e.target.value})}>
                    {Array.from({length: 31}, (_, i) => i + 1).map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <select className={styles.dateSelect} value={form.dobMonth} onChange={e => setForm({...form, dobMonth: e.target.value})}>
                    {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                      <option key={m} value={m}>Tháng {m}</option>
                    ))}
                  </select>
                  <select className={styles.dateSelect} value={form.dobYear} onChange={e => setForm({...form, dobYear: e.target.value})}>
                    {Array.from({length: 100}, (_, i) => new Date().getFullYear() - i).map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {msg.text && (
              <div className={`${styles.message} ${msg.type === 'success' ? styles.messageSuccess : styles.messageError}`}>
                {msg.text}
              </div>
            )}

            <button type="submit" className={`btn btn-primary ${styles.submitBtn}`}>
              Lưu thay đổi
            </button>
          </form>
        </div>

        {/* Avatar Area (Right) */}
        <div className={styles.avatarArea}>
          <div className={styles.avatarPreview} style={{ overflow: 'hidden' }}>
            {profile.avatar ? (
              <img src={profile.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              profile.name?.[0]?.toUpperCase() || 'U'
            )}
          </div>
          
          <label className="btn btn-secondary" style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem', cursor: 'pointer', opacity: uploadingAvatar ? 0.5 : 1 }}>
            {uploadingAvatar ? 'Đang tải...' : 'Chọn Ảnh'}
            <input 
              type="file" 
              accept="image/jpeg, image/png, image/webp" 
              style={{ display: 'none' }} 
              onChange={handleAvatarChange}
              disabled={uploadingAvatar}
            />
          </label>
          <div className={styles.avatarHint}>
            Dụng lượng file tối đa 1 MB<br/>
            Định dạng: .JPEG, .PNG, .WEBP
          </div>
        </div>
      </div>
    </div>
  );
}
