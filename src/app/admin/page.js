import { prisma } from '@/lib/prisma';
import styles from './admin.module.css';
import DateFilter from './components/DateFilter';
import RevenueCharts from './components/RevenueCharts';
import TopCustomers from '@/components/admin/TopCustomers';
import BehaviorAnalytics from './components/BehaviorAnalytics';

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price) + '₫';
}

export default async function AdminDashboard({ searchParams }) {
  const params = await searchParams;
  const startDateParam = params?.startDate;
  const endDateParam = params?.endDate;

  let dateFilter = {};
  if (startDateParam && endDateParam) {
    const start = new Date(startDateParam);
    const end = new Date(endDateParam);
    // Cộng thêm 1 ngày vào endDate để bao gồm trọn vẹn ngày đó đến 23:59:59
    end.setDate(end.getDate() + 1); 

    dateFilter = {
      createdAt: {
        gte: start,
        lt: end
      }
    };
  }

  // --- Stat cards ---
  const [totalOrders, totalProducts, totalUsers, vipUsers] = await Promise.all([
    prisma.order.count({ where: dateFilter }),
    prisma.product.count(), // Products are typically all-time
    prisma.user.count({ where: dateFilter }), // New users in period
    prisma.user.count({ where: { vipTier: { not: 'MEMBER' }, ...dateFilter } }), // New VIPs in period
  ]);

  // Tổng doanh thu 
  const revenueResult = await prisma.order.aggregate({
    where: { status: { not: 'CANCELLED' }, ...dateFilter },
    _sum: { totalAmount: true },
  });

  const totalRevenue = revenueResult._sum.totalAmount || 0;

  // Lấy 5 đơn hàng mới nhất
  const recentOrders = await prisma.order.findMany({
    take: 5,
    where: dateFilter,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  // --- Tính toán top sản phẩm & doanh mục dựa trên OrderItem trong kỳ ---
  // Lấy tất cả OrderItem thuộc các đơn hàng không bị CANCEL và nằm trong kỳ lọc
  const orderItems = await prisma.orderItem.findMany({
    where: {
      order: {
        status: { not: 'CANCELLED' },
        ...dateFilter
      }
    },
    include: {
      product: {
        include: { category: true }
      }
    }
  });

  // Gom nhóm dữ liệu
  const productStats = {};
  const categoryStats = {};
  const brandStats = {};

  orderItems.forEach(item => {
    const p = item.product;
    const rev = item.quantity * item.price;
    const qty = item.quantity;

    // Product
    if (!productStats[p.id]) {
      productStats[p.id] = { id: p.id, name: p.name, brand: p.brand, categoryName: p.category?.name, totalSold: 0, totalRevenue: 0 };
    }
    productStats[p.id].totalSold += qty;
    productStats[p.id].totalRevenue += rev;

    // Category
    const catName = p.category?.name || 'Chưa phân loại';
    if (!categoryStats[catName]) categoryStats[catName] = { name: catName, totalSold: 0, totalRevenue: 0 };
    categoryStats[catName].totalSold += qty;
    categoryStats[catName].totalRevenue += rev;

    // Brand
    const brandName = p.brand || 'Không rõ';
    if (!brandStats[brandName]) brandStats[brandName] = { name: brandName, totalSold: 0, totalRevenue: 0 };
    brandStats[brandName].totalSold += qty;
    brandStats[brandName].totalRevenue += rev;
  });

  const topProducts = Object.values(productStats).sort((a, b) => b.totalSold - a.totalSold).slice(0, 5);
  const salesByCategory = Object.values(categoryStats).sort((a, b) => b.totalRevenue - a.totalRevenue);
  const salesByBrand = Object.values(brandStats).sort((a, b) => b.totalRevenue - a.totalRevenue);


  // --- Section header helper ---
  const sectionStyle = {
    fontSize: 'var(--font-size-lg)',
    fontWeight: '600',
    marginBottom: 'var(--space-lg)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-sm)',
  };

  return (
    <div>
      <DateFilter />

      {/* ========== STAT CARDS ========== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 'var(--space-xl)',
          marginBottom: 'var(--space-2xl)',
        }}
      >
        <div className={styles.card}>
          <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-xs)' }}>
            💰 Doanh thu
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
            {formatPrice(totalRevenue)}
          </div>
        </div>

        <div className={styles.card}>
          <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-xs)' }}>
            📦 Đơn hàng
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {totalOrders}
          </div>
        </div>

        <div className={styles.card}>
          <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-xs)' }}>
            🛒 Tổng Sản phẩm
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {totalProducts}
          </div>
        </div>

        <div className={styles.card}>
          <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-xs)' }}>
            👥 Người dùng mới
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-secondary)' }}>
            {totalUsers}
          </div>
        </div>

        <div className={styles.card}>
          <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-xs)' }}>
            🌟 VIP Mới
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-success, #22c55e)' }}>
            {vipUsers}
          </div>
        </div>
      </div>

      {/* ========== REVENUE CHARTS ========== */}
      <RevenueCharts />

      {/* ========== RECENT ORDERS ========== */}
      <div className={styles.card} style={{ marginBottom: 'var(--space-2xl)' }}>
        <h2 style={sectionStyle}>🧾 Đơn hàng trong kỳ</h2>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Mã Đơn</th>
              <th>Khách Hàng</th>
              <th>Ngày Đặt</th>
              <th>Tổng Tiền</th>
              <th>Trạng Thái</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--text-muted)' }}>
                  Không có đơn hàng nào
                </td>
              </tr>
            ) : (
              recentOrders.map((order) => (
                <tr key={order.id}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>{order.orderNumber}</td>
                  <td>
                    <div>{order.recipientName}</div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{order.user?.email}</div>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td style={{ fontWeight: 'bold' }}>{formatPrice(order.totalAmount)}</td>
                  <td>
                    <span className={`${styles.badge} ${order.status === 'PENDING' ? styles.badgePending : order.status === 'DELIVERED' ? styles.badgeDelivered : styles.badgeProcessing}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ========== TOP SELLING PRODUCTS ========== */}
      <div className={styles.card} style={{ marginBottom: 'var(--space-2xl)' }}>
        <h2 style={sectionStyle}>🏆 Sản phẩm bán chạy nhất</h2>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Sản phẩm</th>
              <th>Thương hiệu</th>
              <th>Danh mục</th>
              <th style={{ textAlign: 'right' }}>Đã bán</th>
              <th style={{ textAlign: 'right' }}>Doanh thu</th>
            </tr>
          </thead>
          <tbody>
            {topProducts.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--text-muted)' }}>
                  Chưa có dữ liệu bán hàng
                </td>
              </tr>
            ) : (
              topProducts.map((product, index) => {
                return (
                  <tr key={product.id}>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: 'var(--radius-full)', background: index === 0 ? 'rgba(234, 179, 8, 0.2)' : index === 1 ? 'rgba(192, 192, 192, 0.2)' : index === 2 ? 'rgba(205, 127, 50, 0.2)' : 'rgba(255,255,255,0.05)', color: index === 0 ? '#eab308' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : 'var(--text-muted)', fontWeight: 'bold', fontSize: 'var(--font-size-sm)' }}>
                        {index + 1}
                      </span>
                    </td>
                    <td style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{product.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{product.brand || '—'}</td>
                    <td>
                      <span style={{ background: 'var(--color-primary-dim)', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-xs)', fontWeight: '600' }}>
                        {product.categoryName}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{product.totalSold.toLocaleString('vi-VN')}</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--color-primary)' }}>{formatPrice(product.totalRevenue)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ========== SALES BY CATEGORY & BRAND ========== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-xl)' }}>
        {/* Sales by Category */}
        <div className={styles.card}>
          <h2 style={sectionStyle}>📂 Doanh thu theo danh mục</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Danh mục</th>
                <th style={{ textAlign: 'right' }}>Đã bán</th>
                <th style={{ textAlign: 'right' }}>Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {salesByCategory.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--text-muted)' }}>Chưa có dữ liệu</td>
                </tr>
              ) : (
                salesByCategory.map((cat) => (
                  <tr key={cat.name}>
                    <td style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{cat.name}</td>
                    <td style={{ textAlign: 'right' }}>{cat.totalSold.toLocaleString('vi-VN')}</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--color-primary)' }}>{formatPrice(cat.totalRevenue)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Sales by Brand */}
        <div className={styles.card}>
          <h2 style={sectionStyle}>🏷️ Doanh thu theo thương hiệu</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Thương hiệu</th>
                <th style={{ textAlign: 'right' }}>Đã bán</th>
                <th style={{ textAlign: 'right' }}>Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {salesByBrand.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--text-muted)' }}>Chưa có dữ liệu</td>
                </tr>
              ) : (
                salesByBrand.map((brand) => (
                  <tr key={brand.name}>
                    <td style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{brand.name}</td>
                    <td style={{ textAlign: 'right' }}>{brand.totalSold.toLocaleString('vi-VN')}</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--color-primary)' }}>{formatPrice(brand.totalRevenue)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========== BEHAVIOR ANALYTICS ========== */}
      <BehaviorAnalytics />
      
      {/* ========== TOP CUSTOMERS ========== */}
      <TopCustomers />
    </div>
  );
}
