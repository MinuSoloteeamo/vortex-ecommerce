'use client';

import { useState, useEffect } from 'react';
import styles from './TopCustomers.module.css';

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price) + '₫';
}

export default function TopCustomers() {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/revenue/top-customers')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setCustomers(data);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className={styles.loading}>Đang tải thống kê khách hàng...</div>;
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>🏆 Top Khách Hàng Thân Thiết</h3>
      {customers.length === 0 ? (
        <p className={styles.empty}>Chưa có dữ liệu giao dịch thành công.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Hạng</th>
                <th>Khách hàng</th>
                <th>Số đơn</th>
                <th>Tổng chi tiêu</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((cust, idx) => (
                <tr key={cust.userId}>
                  <td className={styles.rank}>
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                  </td>
                  <td>
                    <div className={styles.userInfo}>
                      <span className={styles.userName}>{cust.name}</span>
                      <span className={styles.userEmail}>{cust.email}</span>
                    </div>
                  </td>
                  <td>{cust.orderCount}</td>
                  <td className={styles.totalSpent}>{formatPrice(cust.totalSpent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
