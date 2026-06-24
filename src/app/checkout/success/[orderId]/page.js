import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ProductCard from '@/components/product/ProductCard';

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price) + '₫';
}

export default async function CheckoutSuccessPage({ params }) {
  const resolvedParams = await params;
  
  const order = await prisma.order.findUnique({
    where: { id: resolvedParams.orderId },
    include: {
      items: {
        include: { product: true }
      }
    }
  });

  if (!order) {
    notFound();
  }

  // Fetch related products
  const categoryIds = [...new Set(order.items.map(item => item.product?.categoryId))].filter(Boolean);
  const boughtProductIds = order.items.map(item => item.productId);
  let relatedProducts = [];
  
  if (categoryIds.length > 0) {
    relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: { in: categoryIds },
        id: { notIn: boughtProductIds },
        isActive: true
      },
      take: 4, // Show 4 suggestions
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' }, take: 1 }
      }
    });
  }

  return (
    <div style={{ minHeight: 'calc(100vh - var(--header-height))', padding: 'var(--space-2xl) 0', background: 'var(--bg-body)' }}>
      <div className="container">
        
        {/* Banner Status Area */}
        <div style={{ 
          maxWidth: '800px',
          margin: '0 auto',
          background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(255,51,102,0.15) 100%)', 
          padding: 'var(--space-3xl) var(--space-2xl)', 
          borderRadius: 'var(--radius-xl)',
          border: '1px solid rgba(124,58,237,0.3)',
          textAlign: 'center',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          marginBottom: 'var(--space-3xl)'
        }}>
          {/* Icon */}
          <div style={{ 
            width: '80px', height: '80px', 
            background: order.paymentStatus === 'PAID' ? 'var(--color-success, #00C853)' : 'var(--bg-card)', 
            borderRadius: '50%', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto var(--space-lg)',
            boxShadow: order.paymentStatus === 'PAID' ? '0 0 20px rgba(0, 200, 83, 0.4)' : '0 4px 12px rgba(0,0,0,0.5)',
            color: order.paymentStatus === 'PAID' ? '#000' : 'var(--color-primary)'
          }}>
            {order.paymentStatus === 'PAID' ? (
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            ) : (
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            )}
          </div>
          
          <h1 style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: 'var(--font-size-2xl)', 
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-md)'
          }}>
            {order.paymentStatus === 'PAID' ? 'Thanh toán thành công' : 'Đang chờ thanh toán'}
          </h1>
          
          <div style={{ 
            color: 'var(--text-secondary)', 
            marginBottom: 'var(--space-xl)',
            fontSize: 'var(--font-size-md)',
            lineHeight: '1.6',
            maxWidth: '600px',
            margin: '0 auto var(--space-xl)'
          }}>
            {order.paymentStatus === 'PAID' ? (
              <>
                <p style={{ color: 'var(--color-success, #00C853)', fontWeight: 'bold', marginBottom: 'var(--space-xs)', fontSize: '1.1rem' }}>
                  Cảm ơn bạn đã mua sắm tại VORTEX!
                </p>
                <p>Đơn hàng của bạn đã được thanh toán an toàn qua VNPAY.</p>
                <p>Hóa đơn điện tử chi tiết đã được gửi về email của bạn.</p>
              </>
            ) : (
              <>
                <p style={{ color: 'var(--color-danger, #ff3366)', fontWeight: 'bold', marginBottom: 'var(--space-xs)' }}>
                  ⚠️ Để tránh mất tiền vào tay kẻ lừa đảo mạo danh Shipper, bạn tuyệt đối:
                </p>
                <p>KHÔNG chuyển khoản cho Shipper khi chưa nhận hàng</p>
                <p>KHÔNG nhấn vào đường dẫn (Link) lạ của Shipper gửi</p>
              </>
            )}
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', maxWidth: '500px', margin: '0 auto' }}>
            <Link href="/" className="btn btn-primary" style={{ flex: 1, background: 'transparent', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}>
              Trang chủ
            </Link>
            <Link href="/account/orders" className="btn btn-primary" style={{ flex: 1 }}>
              Đơn mua
            </Link>
          </div>
        </div>

        {/* You May Also Like */}
        {relatedProducts.length > 0 && (
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-xl)' }}>
              <div style={{ height: '1px', background: 'var(--border-subtle)', flex: 1 }}></div>
              <h2 style={{ padding: '0 var(--space-lg)', fontSize: 'var(--font-size-lg)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px' }}>
                Có thể bạn cũng thích
              </h2>
              <div style={{ height: '1px', background: 'var(--border-subtle)', flex: 1 }}></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--space-lg)' }}>
              {relatedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
