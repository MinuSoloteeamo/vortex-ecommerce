import { create } from 'zustand';

export const useAuthModalStore = create((set) => ({
  isOpen: false,
  view: 'login', // 'login' hoặc 'register'

  openModal: (view = 'login') => set({ isOpen: true, view }),
  closeModal: () => set({ isOpen: false }),
  switchView: () => set((state) => ({ view: state.view === 'login' ? 'register' : 'login' })),
  setView: (view) => set({ view }),
}));
