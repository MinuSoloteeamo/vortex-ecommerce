'use client';

import { useToastStore } from '@/store/toast';
import styles from './Toast.module.css';

const ICONS = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${styles.toast} ${styles[toast.type]}`}
          role="alert"
        >
          <span className={styles.icon}>{ICONS[toast.type]}</span>
          <p className={styles.message}>{toast.message}</p>
          <button
            className={styles.close}
            onClick={() => removeToast(toast.id)}
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
