'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function UsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'USER' });
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  async function fetchUsers() {
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Lỗi tải dữ liệu');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Không thể tải danh sách người dùng' });
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi tạo tài khoản');
      setMessage({ type: 'success', text: data.message });
      setFormData({ name: '', email: '', password: '', role: 'USER' });
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setCreating(false);
    }
  }

  async function handleRoleChange(userId, role) {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi cập nhật');
      setMessage({ type: 'success', text: data.message });
      fetchUsers();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  function getVipBadgeStyle(tier) {
    const baseStyle = {
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 'var(--radius-full)',
      fontSize: 'var(--font-size-xs)',
      fontWeight: 600,
      border: '1px solid',
    };
    switch (tier) {
      case 'DIAMOND':
        return { ...baseStyle, color: '#00f0ff', background: 'rgba(0, 240, 255, 0.15)', borderColor: 'rgba(0, 240, 255, 0.3)' };
      case 'GOLD':
        return { ...baseStyle, color: '#fbbf24', background: 'rgba(251, 191, 36, 0.15)', borderColor: 'rgba(251, 191, 36, 0.3)' };
      case 'SILVER':
        return { ...baseStyle, color: '#9ca3af', background: 'rgba(156, 163, 175, 0.15)', borderColor: 'rgba(156, 163, 175, 0.3)' };
      default:
        return { ...baseStyle, color: 'var(--text-secondary)', background: 'var(--bg-glass)', borderColor: 'var(--border-default)' };
    }
  }

  if (loading) {
    return (
      <div style={sx.loadingWrap}>
        <div style={sx.spinner} />
        <p style={{ color: 'var(--text-muted)' }}>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div style={sx.container}>
      {/* Header bar */}
      <div style={sx.topBar}>
        <div>
          <h2 style={sx.title}>Quản lý Người dùng</h2>
          <p style={sx.subtitle}>{users.length} tài khoản trong hệ thống</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={showForm ? sx.btnCancel : sx.btnCreate}
        >
          {showForm ? '✕ Đóng' : '+ Tạo tài khoản'}
        </button>
      </div>

      {/* Notification */}
      {message && (
        <div style={message.type === 'success' ? sx.alertSuccess : sx.alertError}>
          <span>{message.type === 'success' ? '✓' : '✕'}</span>
          <span>{message.text}</span>
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} style={sx.form}>
          <h3 style={sx.formTitle}>Tạo tài khoản mới</h3>
          <div style={sx.formGrid}>
            <div style={sx.field}>
              <label style={sx.label}>Tên</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nguyễn Văn A"
                style={sx.input}
              />
            </div>
            <div style={sx.field}>
              <label style={sx.label}>Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
                style={sx.input}
              />
            </div>
            <div style={sx.field}>
              <label style={sx.label}>Mật khẩu</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                placeholder="Tối thiểu 6 ký tự"
                style={sx.input}
              />
            </div>
            <div style={sx.field}>
              <label style={sx.label}>Vai trò</label>
              <select
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                style={sx.input}
              >
                <option value="USER">USER</option>
                <option value="SHIPPER">SHIPPER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
          </div>
          <div style={sx.formActions}>
            <button type="button" onClick={() => setShowForm(false)} style={sx.btnSecondary}>
              Hủy
            </button>
            <button type="submit" disabled={creating} style={sx.btnPrimary}>
              {creating ? 'Đang tạo...' : '✓ Tạo tài khoản'}
            </button>
          </div>
        </form>
      )}

      {/* Users table */}
      <div style={sx.tableWrap}>
        <table style={sx.table}>
          <thead>
            <tr>
              <th style={sx.th}>Tên</th>
              <th style={sx.th}>Email</th>
              <th style={sx.th}>Vai trò</th>
              <th style={sx.th}>Số ĐT</th>
              <th style={sx.th}>Cấp VIP</th>
              <th style={sx.th}>Ngày tạo</th>
              <th style={{ ...sx.th, textAlign: 'center' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={sx.tr}>
                <td style={sx.td}>
                  <div style={sx.nameCell}>
                    <div style={sx.avatarSmall}>{user.name?.[0]?.toUpperCase() || '?'}</div>
                    <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{user.name}</span>
                  </div>
                </td>
                <td style={sx.td}>
                  <span style={{ color: 'var(--text-secondary)' }}>{user.email}</span>
                </td>
                <td style={sx.td}>
                  <span style={user.role === 'ADMIN' ? sx.badgeAdmin : user.role === 'SHIPPER' ? sx.badgeShipper : sx.badgeUser}>
                    {user.role}
                  </span>
                </td>
                <td style={sx.td}>
                  <span style={{ color: 'var(--text-muted)' }}>{user.phone || '—'}</span>
                </td>
                <td style={sx.td}>
                  <span style={getVipBadgeStyle(user.vipTier)}>{user.vipTier || 'MEMBER'}</span>
                </td>
                <td style={sx.td}>
                  <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                    {formatDate(user.createdAt)}
                  </span>
                </td>
                <td style={{ ...sx.td, textAlign: 'center' }}>
                  {user.id !== session?.user?.id ? (
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        background: 'var(--bg-glass)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-default)',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="USER">USER</option>
                      <option value="SHIPPER">SHIPPER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>
                      Bạn
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={7} style={{ ...sx.td, textAlign: 'center', padding: 'var(--space-2xl)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Chưa có người dùng nào</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ──────────────────── Inline Styles ────────────────────
const sx = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-lg)',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 'var(--space-md)',
  },
  title: {
    margin: 0,
    fontSize: 'var(--font-size-2xl)',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  subtitle: {
    margin: 0,
    marginTop: 'var(--space-xs)',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--text-muted)',
  },
  loadingWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-md)',
    padding: 'var(--space-2xl)',
  },
  spinner: {
    width: 36,
    height: 36,
    border: '3px solid var(--border-subtle)',
    borderTopColor: 'var(--color-primary)',
    borderRadius: 'var(--radius-full)',
    animation: 'spin 0.8s linear infinite',
  },

  // Alerts
  alertSuccess: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-sm)',
    padding: 'var(--space-sm) var(--space-md)',
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--color-success)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 500,
  },
  alertError: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-sm)',
    padding: 'var(--space-sm) var(--space-md)',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--color-danger)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 500,
  },

  // Buttons
  btnCreate: {
    padding: 'var(--space-sm) var(--space-lg)',
    background: 'var(--color-primary)',
    color: '#000',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'var(--transition-base)',
  },
  btnCancel: {
    padding: 'var(--space-sm) var(--space-lg)',
    background: 'transparent',
    color: 'var(--text-muted)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'var(--transition-base)',
  },
  btnPrimary: {
    padding: 'var(--space-sm) var(--space-xl)',
    background: 'var(--color-primary)',
    color: '#000',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'var(--transition-base)',
  },
  btnSecondary: {
    padding: 'var(--space-sm) var(--space-xl)',
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'var(--transition-base)',
  },
  btnPromote: {
    padding: 'var(--space-xs) var(--space-md)',
    background: 'rgba(16, 185, 129, 0.1)',
    color: 'var(--color-success)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    borderRadius: 'var(--radius-md)',
    fontSize: 'var(--font-size-xs)',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'var(--transition-base)',
    whiteSpace: 'nowrap',
  },
  btnDemote: {
    padding: 'var(--space-xs) var(--space-md)',
    background: 'rgba(239, 68, 68, 0.1)',
    color: 'var(--color-danger)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    borderRadius: 'var(--radius-md)',
    fontSize: 'var(--font-size-xs)',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'var(--transition-base)',
    whiteSpace: 'nowrap',
  },

  // Create form
  form: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-xl)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-lg)',
  },
  formTitle: {
    margin: 0,
    fontSize: 'var(--font-size-lg)',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: 'var(--space-md)',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-xs)',
  },
  label: {
    fontSize: 'var(--font-size-sm)',
    fontWeight: 500,
    color: 'var(--text-secondary)',
  },
  input: {
    padding: 'var(--space-sm) var(--space-md)',
    background: 'var(--bg-glass)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: 'var(--font-size-sm)',
    outline: 'none',
    transition: 'var(--transition-base)',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 'var(--space-sm)',
  },

  // Table
  tableWrap: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: 'var(--space-md) var(--space-lg)',
    textAlign: 'left',
    fontSize: 'var(--font-size-xs)',
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid var(--border-subtle)',
    background: 'var(--bg-glass)',
  },
  tr: {
    transition: 'var(--transition-fast)',
  },
  td: {
    padding: 'var(--space-md) var(--space-lg)',
    borderBottom: '1px solid var(--border-subtle)',
    fontSize: 'var(--font-size-sm)',
  },
  nameCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-sm)',
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 'var(--radius-full)',
    background: 'var(--color-primary-dim)',
    color: 'var(--color-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'var(--font-size-xs)',
    fontWeight: 700,
    flexShrink: 0,
  },

  // Badges
  badgeAdmin: {
    display: 'inline-block',
    padding: '2px var(--space-sm)',
    background: 'rgba(16, 185, 129, 0.15)',
    color: 'var(--color-success)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    borderRadius: 'var(--radius-full)',
    fontSize: 'var(--font-size-xs)',
    fontWeight: 600,
  },
  badgeShipper: {
    display: 'inline-block',
    padding: '2px var(--space-sm)',
    background: 'rgba(245, 158, 11, 0.15)',
    color: '#fbbf24',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    borderRadius: 'var(--radius-full)',
    fontSize: 'var(--font-size-xs)',
    fontWeight: 600,
  },
  badgeUser: {
    display: 'inline-block',
    padding: '2px var(--space-sm)',
    background: 'rgba(59, 130, 246, 0.15)',
    color: '#60a5fa',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    borderRadius: 'var(--radius-full)',
    fontSize: 'var(--font-size-xs)',
    fontWeight: 600,
  },
};
