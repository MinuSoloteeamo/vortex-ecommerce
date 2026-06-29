'use client';

import { useState, useMemo } from 'react';
import OrderKanbanBoard from './OrderKanbanBoard';
import OrderStatusSelect from './OrderStatusSelect';
import styles from '../../app/admin/admin.module.css';

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price) + '₫';
}

export default function OrderManagerClient({ orders }) {
  const [activeTab, setActiveTab] = useState('kanban');
  
  // Lọc thời gian cho Lịch sử
  const [filterType, setFilterType] = useState('all'); // all, year, quarter, month, day
  const [filterValue, setFilterValue] = useState('');

  // Tách đơn hàng ra
  const activeOrders = orders.filter(o => ['PENDING', 'PROCESSING', 'SHIPPING'].includes(o.status));
  const historyOrders = orders.filter(o => ['DELIVERED', 'FAILED_DELIVERY'].includes(o.status));
  const cancelledOrders = orders.filter(o => o.status === 'CANCELLED');

  // Logic lọc lịch sử
  const filteredHistory = useMemo(() => {
    if (filterType === 'all') return historyOrders;
    
    return historyOrders.filter(order => {
      const d = new Date(order.createdAt);
      if (filterType === 'year') {
        return d.getFullYear().toString() === filterValue;
      }
      if (filterType === 'month') {
        const [y, m] = filterValue.split('-');
        return d.getFullYear().toString() === y && (d.getMonth() + 1).toString().padStart(2, '0') === m;
      }
      if (filterType === 'day') {
        const [y, m, day] = filterValue.split('-');
        return d.getFullYear().toString() === y && 
               (d.getMonth() + 1).toString().padStart(2, '0') === m &&
               d.getDate().toString().padStart(2, '0') === day;
      }
      if (filterType === 'quarter') {
        const [y, q] = filterValue.split('-');
        const quarter = Math.floor(d.getMonth() / 3) + 1;
        return d.getFullYear().toString() === y && quarter.toString() === q;
      }
      return true;
    });
  }, [historyOrders, filterType, filterValue]);

  // Generate options cho filter
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({length: 5}, (_, i) => currentYear - i);

  return (
    <div>
      {/* TABS */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid var(--border-subtle)' }}>
        <button 
          onClick={() => setActiveTab('kanban')}
          style={{ 
            padding: '12px 24px', 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'kanban' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'kanban' ? 'var(--color-primary)' : 'var(--text-muted)',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Tiến độ xử lý
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          style={{ 
            padding: '12px 24px', 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'history' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'history' ? 'var(--color-primary)' : 'var(--text-muted)',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Lịch sử Đơn Hàng
        </button>
        <button 
          onClick={() => setActiveTab('cancel')}
          style={{ 
            padding: '12px 24px', 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'cancel' ? '2px solid var(--color-danger)' : '2px solid transparent',
            color: activeTab === 'cancel' ? 'var(--color-danger)' : 'var(--text-muted)',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Xử lý Đơn Hủy ({cancelledOrders.length})
        </button>
      </div>

      {activeTab === 'kanban' && (
        <div>
          <OrderKanbanBoard initialOrders={activeOrders} />
        </div>
      )}

      {activeTab === 'history' && (
        <div className={styles.card}>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold' }}>Lọc theo:</span>
            <select 
              value={filterType} 
              onChange={(e) => {
                setFilterType(e.target.value);
                setFilterValue('');
              }}
              className="input"
              style={{ width: 'auto', padding: '8px' }}
            >
              <option value="all">Tất cả</option>
              <option value="year">Năm</option>
              <option value="quarter">Quý</option>
              <option value="month">Tháng</option>
              <option value="day">Ngày</option>
            </select>

            {filterType === 'year' && (
              <select value={filterValue} onChange={e => setFilterValue(e.target.value)} className="input" style={{ width: 'auto', padding: '8px' }}>
                <option value="">Chọn năm...</option>
                {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            )}

            {filterType === 'quarter' && (
              <select value={filterValue} onChange={e => setFilterValue(e.target.value)} className="input" style={{ width: 'auto', padding: '8px' }}>
                <option value="">Chọn quý...</option>
                {yearOptions.map(y => (
                  <optgroup key={y} label={`Năm ${y}`}>
                    <option value={`${y}-1`}>Quý 1 / {y}</option>
                    <option value={`${y}-2`}>Quý 2 / {y}</option>
                    <option value={`${y}-3`}>Quý 3 / {y}</option>
                    <option value={`${y}-4`}>Quý 4 / {y}</option>
                  </optgroup>
                ))}
              </select>
            )}

            {filterType === 'month' && (
              <input 
                type="month" 
                value={filterValue} 
                onChange={e => setFilterValue(e.target.value)} 
                className="input" 
                style={{ width: 'auto', padding: '8px' }}
              />
            )}

            {filterType === 'day' && (
              <input 
                type="date" 
                value={filterValue} 
                onChange={e => setFilterValue(e.target.value)} 
                className="input" 
                style={{ width: 'auto', padding: '8px' }}
              />
            )}
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>Mã Đơn</th>
                <th>Khách Hàng</th>
                <th>Thông Tin Giao Hàng</th>
                <th>Tổng Tiền</th>
                <th>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--text-muted)' }}>
                    Không có đơn hàng nào trong thời gian này
                  </td>
                </tr>
              ) : (
                filteredHistory.map((order) => (
                  <tr key={order.id}>
                    <td style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                      <div>{order.orderNumber}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleString('vi-VN')}</div>
                    </td>
                    <td>
                      <div><strong>{order.recipientName}</strong></div>
                      <div style={{ fontSize: 'var(--font-size-xs)' }}>{order.recipientPhone}</div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{order.user?.email}</div>
                    </td>
                    <td style={{ maxWidth: '250px' }}>
                      <div style={{ fontSize: 'var(--font-size-sm)' }}>{order.shippingAddress}</div>
                      {order.cancelReason && <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-danger)', marginTop: '4px' }}>Lý do: {order.cancelReason}</div>}
                    </td>
                    <td>
                      <div style={{ fontWeight: 'bold' }}>{formatPrice(order.totalAmount)}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{order.paymentMethod}</div>
                    </td>
                    <td>
                      <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'cancel' && (
        <div className={styles.card}>
          <h2 style={{ marginBottom: '1rem', color: 'var(--color-danger)' }}>Danh sách Đơn Hủy</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Mã Đơn</th>
                <th>Khách Hàng</th>
                <th>Thông Tin Giao Hàng & Lý do</th>
                <th>Tổng Tiền</th>
                <th>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {cancelledOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--text-muted)' }}>
                    Không có đơn hàng nào bị hủy
                  </td>
                </tr>
              ) : (
                cancelledOrders.map((order) => (
                  <tr key={order.id}>
                    <td style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                      <div>{order.orderNumber}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleString('vi-VN')}</div>
                    </td>
                    <td>
                      <div><strong>{order.recipientName}</strong></div>
                      <div style={{ fontSize: 'var(--font-size-xs)' }}>{order.recipientPhone}</div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{order.user?.email}</div>
                    </td>
                    <td style={{ maxWidth: '300px' }}>
                      <div style={{ fontSize: 'var(--font-size-sm)' }}>{order.shippingAddress}</div>
                      <div style={{ 
                        fontSize: 'var(--font-size-sm)', 
                        color: '#b91c1c', 
                        marginTop: '8px', 
                        padding: '8px', 
                        background: '#fee2e2', 
                        borderRadius: '6px',
                        borderLeft: '4px solid #ef4444'
                      }}>
                        <strong>Lý do hủy:</strong> {order.cancelReason || 'Không có lý do'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 'bold' }}>{formatPrice(order.totalAmount)}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{order.paymentMethod}</div>
                    </td>
                    <td>
                      <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
