'use client';

import { useAuthModalStore } from '@/store/authModal';

export default function LoginButton({ className, style, children, view = 'login' }) {
  const { openModal } = useAuthModalStore();
  
  return (
    <button 
      onClick={() => openModal(view)} 
      className={className} 
      style={style}
    >
      {children}
    </button>
  );
}
