import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req, { params }) {
  try {
    // Trong Next.js 15/16, params là một Promise nên cần await
    const resolvedParams = await params;
    const slug = resolvedParams?.slug;

    // 1. Lấy thông tin sản phẩm mục tiêu đang xem
    const targetProduct = await prisma.product.findUnique({
      where: { slug, isActive: true },
      select: { id: true, categoryId: true }
    });

    if (!targetProduct) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const targetProductId = targetProduct.id;

    // 2. Tìm tất cả các đơn hàng THÀNH CÔNG (loại trừ các đơn bị HỦY) đã từng chứa sản phẩm này
    const orderItemsWithTarget = await prisma.orderItem.findMany({
      where: { 
        productId: targetProductId,
        order: { status: { not: 'CANCELLED' } } // Chỉ tính các đơn không bị hủy
      },
      select: { orderId: true }
    });

    const orderIds = [...new Set(orderItemsWithTarget.map(item => item.orderId))];

    // Nếu chưa có ai mua sản phẩm này (SP mới) → Chuyển sang phương án dự phòng (Fallback) lấy sản phẩm cùng danh mục
    if (orderIds.length === 0) {
       const fallbackProducts = await prisma.product.findMany({
         where: { 
           categoryId: targetProduct.categoryId, 
           isActive: true,
           id: { not: targetProductId }
         },
         take: 3,
         orderBy: { soldCount: 'desc' },
         include: { images: true }
       });
       return NextResponse.json(fallbackProducts);
    }

    // 3. Tìm các sản phẩm thường được mua cùng nhiều nhất trong các đơn hàng đó
    const relatedItemsCounts = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        orderId: { in: orderIds },
        productId: { not: targetProductId }
      },
      _count: { productId: true },
      orderBy: { _count: { productId: 'desc' } },
      take: 3
    });

    const relatedProductIds = relatedItemsCounts.map(item => item.productId);

    if (relatedProductIds.length === 0) {
      // Dự phòng nếu khách hàng từ trước đến nay chỉ mua đơn lẻ duy nhất món này
       const fallbackProducts = await prisma.product.findMany({
         where: { 
           categoryId: targetProduct.categoryId, 
           isActive: true,
           id: { not: targetProductId }
         },
         take: 3,
         orderBy: { soldCount: 'desc' },
         include: { images: true }
       });
       return NextResponse.json(fallbackProducts);
    }

    // 4. Lấy chi tiết đầy đủ thông tin các sản phẩm gợi ý mua kèm (chỉ lấy các sản phẩm đang mở bán)
    let comboProducts = await prisma.product.findMany({
      where: { id: { in: relatedProductIds }, isActive: true },
      include: { images: true }
    });

    // Nếu sau khi lọc sản phẩm active mà bị rỗng (do các SP mua kèm bị admin ẩn hết) → Fallback về sản phẩm cùng danh mục
    if (comboProducts.length === 0) {
      comboProducts = await prisma.product.findMany({
        where: { 
          categoryId: targetProduct.categoryId, 
          isActive: true,
          id: { not: targetProductId }
        },
        take: 3,
        orderBy: { soldCount: 'desc' },
        include: { images: true }
      });
      return NextResponse.json(comboProducts);
    }

    // Sắp xếp lại danh sách để khớp đúng theo thứ tự tần suất mua kèm (từ nhiều nhất đến ít nhất)
    comboProducts.sort((a, b) => relatedProductIds.indexOf(a.id) - relatedProductIds.indexOf(b.id));

    return NextResponse.json(comboProducts);

    return NextResponse.json(comboProducts);

  } catch (error) {
    console.error('Related combo error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
