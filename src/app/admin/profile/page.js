'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function AdminProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [infoForm, setInfoForm] = useState({ name: '', phone: '', address: '' });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const [infoMsg, setInfoMsg] = useState({ type: '', text: '' });
  const [passMsg, setPassMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      if (res.ok) {
        const data = await res.json();
        // Redirect if not admin
        if (data.role !== 'ADMIN') {
          router.push('/account');
          return;
        }
        setProfile(data);
        setInfoForm({
          name: data.name || '',
          phone: data.phone || '',
          address: data.address || ''
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setInfoMsg({ type: '', text: '' });
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(infoForm)
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setInfoMsg({ type: 'success', text: 'Cập nhật thông tin thành công!' });
      } else {
        const err = await res.json();
        setInfoMsg({ type: 'error', text: err.error || 'Có lỗi xảy ra' });
      }
    } catch (error) {
      setInfoMsg({ type: 'error', text: 'Lỗi kết nối' });
    }
  };

  const handlePassSubmit = async (e) => {
    e.preventDefault();
    setPassMsg({ type: '', text: '' });
    
    if (passForm.newPassword !== passForm.confirmPassword) {
      setPassMsg({ type: 'error', text: 'Mật khẩu xác nhận không khớp' });
      return;
    }

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passForm.currentPassword,
          newPassword: passForm.newPassword
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setPassMsg({ type: 'success', text: 'Đổi mật khẩu thành công!' });
        setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPassMsg({ type: 'error', text: data.error || 'Có lỗi xảy ra' });
      }
    } catch (error) {
      setPassMsg({ type: 'error', text: 'Lỗi kết nối' });
    }
  };

  if (loading) {
    return <div className="skeleton" style={{ height: '400px' }}></div>;
  }

  if (!profile) return null;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Hồ Sơ Quản Trị Viên</h1>
      
      <div className={styles.layout}>
        {/* Personal Info */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Thông Tin Cá Nhân</h2>
            <p className={styles.cardSubtitle}>Cập nhật thông tin quản trị viên của bạn</p>
          </div>

          <form onSubmit={handleInfoSubmit}>
            <div className={styles.formGrid}>
              <div className="input-group">
                <label className="input-label">Họ và tên</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={infoForm.name}
                  onChange={e => setInfoForm({...infoForm, name: e.target.value})}
                  required
                />
              </div>
              <div className="input-group">
                <label className="input-label">Email</label>
                <input 
                  type="email" 
                  className="input-field" 
                  value={profile.email} 
                  disabled 
                  style={{ opacity: 0.6, cursor: 'not-allowed' }}
                />
              </div>
              <div className="input-group">
                <label className="input-label">Số điện thoại</label>
                <input 
                  type="tel" 
                  className="input-field" 
                  value={infoForm.phone}
                  onChange={e => setInfoForm({...infoForm, phone: e.target.value})}
                />
              </div>
              <div className={`input-group ${styles.formFull}`}>
                <label className="input-label">Địa chỉ</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={infoForm.address}
                  onChange={e => setInfoForm({...infoForm, address: e.target.value})}
                />
              </div>
            </div>

            {infoMsg.text && (
              <div className={`${styles.message} ${infoMsg.type === 'success' ? styles.messageSuccess : styles.messageError}`}>
                {infoMsg.text}
              </div>
            )}

            <button type="submit" className={`btn btn-primary ${styles.submitBtn}`}>
              Lưu thông tin
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Đổi Mật Khẩu</h2>
            <p className={styles.cardSubtitle}>Bảo mật tài khoản của bạn</p>
          </div>

          <form onSubmit={handlePassSubmit}>
            <div className={styles.formGrid}>
              <div className={`input-group ${styles.formFull}`}>
                <label className="input-label">Mật khẩu hiện tại</label>
                <input 
                  type="password" 
                  className="input-field" 
                  value={passForm.currentPassword}
                  onChange={e => setPassForm({...passForm, currentPassword: e.target.value})}
                  required
                />
              </div>
              <div className={`input-group ${styles.formFull}`}>
                <label className="input-label">Mật khẩu mới</label>
                <input 
                  type="password" 
                  className="input-field" 
                  value={passForm.newPassword}
                  onChange={e => setPassForm({...passForm, newPassword: e.target.value})}
                  required
                />
              </div>
              <div className={`input-group ${styles.formFull}`}>
                <label className="input-label">Xác nhận mật khẩu mới</label>
                <input 
                  type="password" 
                  className="input-field" 
                  value={passForm.confirmPassword}
                  onChange={e => setPassForm({...passForm, confirmPassword: e.target.value})}
                  required
                />
              </div>
            </div>

            {passMsg.text && (
              <div className={`${styles.message} ${passMsg.type === 'success' ? styles.messageSuccess : styles.messageError}`}>
                {passMsg.text}
              </div>
            )}

            <button type="submit" className={`btn btn-primary ${styles.submitBtn}`}>
              Cập nhật mật khẩu
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
