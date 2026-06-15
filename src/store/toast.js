import { create } from 'zustand';

let toastId = 0;

export const useToastStore = create((set, get) => ({
  toasts: [],

  addToast: (type, message, duration = 4000) => {
    const id = ++toastId;
    set((state) => ({
      toasts: [...state.toasts, { id, type, message }],
    }));

    // Tự động xóa sau duration
    setTimeout(() => {
      get().removeToast(id);
    }, duration);

    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  // Shorthand helpers
  success: (message) => get().addToast('success', message),
  error: (message) => get().addToast('error', message, 5000),
  warning: (message) => get().addToast('warning', message),
  info: (message) => get().addToast('info', message),
}));
