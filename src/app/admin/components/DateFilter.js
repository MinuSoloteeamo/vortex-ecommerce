'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function DateFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialStart = searchParams.get('startDate') || '';
  const initialEnd = searchParams.get('endDate') || '';

  const [startDate, setStartDate] = useState(initialStart);
  const [endDate, setEndDate] = useState(initialEnd);

  useEffect(() => {
    setStartDate(searchParams.get('startDate') || '');
    setEndDate(searchParams.get('endDate') || '');
  }, [searchParams]);

  const handleApply = () => {
    if (!startDate && !endDate) {
        handleClear();
        return;
    }
    
    const params = new URLSearchParams();
    
    // Nếu chỉ chọn 1 trong 2 ngày, tự động gán ngày còn lại bằng ngày đã chọn để thành báo cáo 1 ngày
    const finalStart = startDate || endDate;
    const finalEnd = endDate || startDate;

    params.set('startDate', finalStart);
    params.set('endDate', finalEnd);
    
    router.push(`/admin?${params.toString()}`);
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    router.push('/admin');
  };

  return (
    <div style={{
      display: 'flex',
      gap: 'var(--space-md)',
      alignItems: 'center',
      padding: 'var(--space-md)',
      background: 'var(--bg-card)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-color)',
      marginBottom: 'var(--space-xl)',
      flexWrap: 'wrap'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
        <span style={{ fontWeight: '600' }}>📅 Từ ngày:</span>
        <input 
          type="date" 
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{ 
            padding: '8px', 
            borderRadius: '4px', 
            background: 'var(--bg-body)', 
            color: 'white', 
            border: '1px solid var(--border-color)',
            fontFamily: 'inherit',
            cursor: 'pointer',
            colorScheme: 'dark'
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
        <span style={{ fontWeight: '600' }}>Đến ngày:</span>
        <input 
          type="date" 
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          min={startDate} // Không cho chọn ngày kết thúc nhỏ hơn ngày bắt đầu
          style={{ 
            padding: '8px', 
            borderRadius: '4px', 
            background: 'var(--bg-body)', 
            color: 'white', 
            border: '1px solid var(--border-color)',
            fontFamily: 'inherit',
            cursor: 'pointer',
            colorScheme: 'dark'
          }}
        />
      </div>

      <button 
        onClick={handleApply}
        style={{
          padding: '8px 16px',
          background: 'var(--color-primary)',
          color: 'black',
          fontWeight: 'bold',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        🔍 Lọc dữ liệu
      </button>
      
      {(startDate || endDate) && (
        <button 
          onClick={handleClear}
          style={{
            padding: '8px 16px',
            background: 'transparent',
            color: 'var(--color-danger)',
            fontWeight: 'bold',
            border: '1px solid var(--color-danger)',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ✖ Bỏ lọc
        </button>
      )}
    </div>
  );
}
