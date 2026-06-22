import { prisma } from '@/lib/prisma';
import styles from '../admin.module.css';

export default async function BehaviorAnalytics() {
  const stats = await prisma.productView.groupBy({
    by: ['productId'],
    _count: { id: true },
    _sum: { viewDuration: true },
  });

  const conversions = await prisma.productView.groupBy({
    by: ['productId'],
    _count: { id: true },
    where: {
      converted: true
    }
  });

  const productIds = stats.map(s => s.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, slug: true, images: true, category: { select: { name: true } } }
  });

  const data = products.map(product => {
    const stat = stats.find(s => s.productId === product.id) || { _count: { id: 0 }, _sum: { viewDuration: 0 } };
    const conv = conversions.find(c => c.productId === product.id) || { _count: { id: 0 } };
    
    const views = stat._count.id;
    const totalDuration = stat._sum.viewDuration || 0;
    const avgDuration = views > 0 ? Math.floor(totalDuration / views) : 0;
    const purchases = conv._count.id;
    const conversionRate = views > 0 ? ((purchases / views) * 100).toFixed(2) : 0;

    return {
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        image: product.images[0]?.url,
        categoryName: product.category?.name
      },
      views,
      avgDuration,
      purchases,
      conversionRate: parseFloat(conversionRate)
    };
  });

  data.sort((a, b) => b.views - a.views);

  return (
    <div className={styles.card} style={{ marginTop: 'var(--space-2xl)' }}>
      <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600', marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
        📈 Thống kê Hành vi Duyệt Web
      </h2>
      <div style={{ overflowX: 'auto' }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th style={{ textAlign: 'center' }}>Lượt xem (Click)</th>
              <th style={{ textAlign: 'center' }}>Thời gian xem (TB)</th>
              <th style={{ textAlign: 'center' }}>Lượt mua hàng</th>
              <th style={{ textAlign: 'center' }}>Tỷ lệ chuyển đổi</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                  Chưa có dữ liệu thống kê
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr key={row.product.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                      <span style={{ fontWeight: '700', color: 'var(--text-muted)', width: '30px' }}>#{index + 1}</span>
                      <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                        {row.product.image ? (
                          <img src={row.product.image} alt={row.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          '📦'
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '2px' }}>{row.product.name}</div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>{row.product.categoryName}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <strong>{row.views}</strong>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {row.avgDuration > 60 
                      ? `${Math.floor(row.avgDuration / 60)} phút ${row.avgDuration % 60} giây` 
                      : `${row.avgDuration} giây`}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', padding: '0.25rem 0.75rem', borderRadius: '999px', fontWeight: '600', fontSize: 'var(--font-size-sm)' }}>
                      {row.purchases}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: '700', color: 'var(--color-primary)' }}>
                      {row.conversionRate}%
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
