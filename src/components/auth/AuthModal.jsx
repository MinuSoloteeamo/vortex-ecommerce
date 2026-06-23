'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useAuthModalStore } from '@/store/authModal';
import { useToastStore } from '@/store/toast';
import styles from './AuthModal.module.css';

export default function AuthModal() {
  const { isOpen, view, closeModal, switchView } = useAuthModalStore();
  const { success, error: toastError } = useToastStore();
  
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (view === 'login') {
        const res = await signIn('credentials', {
          redirect: false,
          email: formData.email,
          password: formData.password,
        });

        if (res?.error) {
          toastError('Email hoặc mật khẩu không chính xác!');
        } else {
          success('Đăng nhập thành công!');
          closeModal();
          window.location.reload(); // Hoặc router.refresh() nếu dùng useRouter
        }
      } else {
        // Handle Register
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          toastError(data.error || 'Đăng ký thất bại');
        } else {
          success('Đăng ký thành công! Đang tự động đăng nhập...');
          // Đăng nhập luôn sau khi đăng ký
          const loginRes = await signIn('credentials', {
            redirect: false,
            email: formData.email,
            password: formData.password,
          });
          
          if (!loginRes?.error) {
            closeModal();
            window.location.reload();
          }
        }
      }
    } catch (err) {
      toastError('Có lỗi xảy ra, vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    signIn(provider, { callbackUrl: '/' });
  };

  return (
    <div className={styles.modalOverlay} onClick={closeModal}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={closeModal}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className={styles.formSection}>
          <h2 className={styles.title}>
            {view === 'login' ? 'Xin chào,' : 'Tạo tài khoản'}
          </h2>
          <p className={styles.subtitle}>
            {view === 'login' ? 'Chào mừng bạn quay lại với VORTEX' : 'Tham gia cộng đồng VORTEX ngay hôm nay'}
          </p>

          <form onSubmit={handleSubmit}>
            {view === 'register' && (
              <div className={styles.formGroup}>
                <svg className={styles.inputIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <input
                  type="text"
                  placeholder="Họ và tên"
                  className={styles.input}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            )}

            <div className={styles.formGroup}>
              <svg className={styles.inputIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <input
                type="email"
                placeholder="Email của bạn"
                className={styles.input}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <svg className={styles.inputIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input
                type="password"
                placeholder="Nhập mật khẩu"
                className={styles.input}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Đang xử lý...' : (view === 'login' ? 'Đăng nhập' : 'Đăng ký')}
            </button>
          </form>



          <div className={styles.divider}>Hoặc tiếp tục bằng</div>

          <div className={styles.socialGrid}>
            <button className={styles.socialBtn} onClick={() => handleSocialLogin('google')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.761H12.545z"/>
              </svg>
              Google
            </button>
          </div>

          <div className={styles.toggleView}>
            {view === 'login' ? (
              <>Chưa có tài khoản? <button className={styles.toggleLink} onClick={switchView}>Tạo tài khoản</button></>
            ) : (
              <>Đã có tài khoản? <button className={styles.toggleLink} onClick={switchView}>Đăng nhập</button></>
            )}
          </div>
        </div>

        <div className={styles.imageSection}>
          <div className={styles.logoText}>VORTEX</div>
        </div>
      </div>
    </div>
  );
}
