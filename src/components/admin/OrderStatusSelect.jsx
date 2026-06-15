'use client';

import { useState } from 'react';
import { useToastStore } from '@/store/toast';

const STATUSES = ['PENDING', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'FAILED_DELIVERY', 'CANCELLED'];

const STATUS_FLOW = {
  'PENDING': ['PENDING', 'PROCESSING', 'CANCELLED'],
  'PROCESSING': ['PROCESSING', 'SHIPPING', 'CANCELLED'],
  'SHIPPING': ['SHIPPING', 'DELIVERED', 'FAILED_DELIVERY', 'CANCELLED'],
  'DELIVERED': ['DELIVERED'], // Terminal
  'FAILED_DELIVERY': ['FAILED_DELIVERY', 'PENDING', 'CANCELLED'], // Can reset to pending to retry
  'CANCELLED': ['CANCELLED'] // Terminal
};

const STATUS_LABELS = {
  'PENDING': 'Chờ xử lý',
  'PROCESSING': 'Đang chuẩn bị',
  'SHIPPING': 'Đang giao hàng',
  'DELIVERED': 'Giao thành công',
  'FAILED_DELIVERY': 'Giao thất bại',
  'CANCELLED': 'Đã hủy'
};

export default function OrderStatusSelect({ orderId, currentStatus }) {
  const [status, setStatus] = useState(currentStatus);
  const [isLoading, setIsLoading] = useState(false);

  const allowedNextStatuses = STATUS_FLOW[currentStatus] || [currentStatus];

  const handleChange = async (e) => {
    const newStatus = e.target.value;
    
    if (!allowedNextStatuses.includes(newStatus)) {
      useToastStore.getState().error(`Không thể nhảy cóc! Vui lòng thực hiện đúng quy trình.`);
      return;
    }

    let cancelReason = null;
    if (newStatus === 'CANCELLED') {
      cancelReason = prompt('Nhập lý do hủy đơn hàng:');
      if (cancelReason === null) {
        return; // User cancelled
      }
    }

    setStatus(newStatus);
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus, cancelReason }),
      });

      if (!res.ok) {
        throw new Error('Failed to update status');
      }
      
      useToastStore.getState().success('Cập nhật trạng thái thành công!');
    } catch (error) {
      console.error(error);
      useToastStore.getState().error('Có lỗi xảy ra khi cập nhật trạng thái');
      setStatus(currentStatus); // Revert
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <select 
      value={status} 
      onChange={handleChange}
      disabled={isLoading}
      style={{
        padding: '6px 10px',
        borderRadius: '6px',
        background: 'var(--bg-body)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-default)',
        fontSize: '13px',
        fontWeight: '500',
        cursor: isLoading ? 'not-allowed' : 'pointer'
      }}
    >
      {STATUSES.map(s => {
        const isAllowed = allowedNextStatuses.includes(s);
        return (
          <option 
            key={s} 
            value={s} 
            disabled={!isAllowed}
            style={{ color: isAllowed ? 'var(--text-primary)' : 'var(--text-muted)' }}
          >
            {isAllowed ? s : `🔒 ${s}`} 
          </option>
        );
      })}
    </select>
  );
}
