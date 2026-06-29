import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req, { params }) {
  try {
    const { slug } = params;

    // 1. Get the target product
    const targetProduct = await prisma.product.findUnique({
      where: { slug, isActive: true },
      select: { id: true, categoryId: true }
    });

    if (!targetProduct) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const targetProductId = targetProduct.id;

    // 2. Find all orders that contain this product
    const orderItemsWithTarget = await prisma.orderItem.findMany({
      where: { productId: targetProductId },
      select: { orderId: true }
    });

    const orderIds = [...new Set(orderItemsWithTarget.map(item => item.orderId))];

    // If no one bought this yet, fallback to same category
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

    // 3. Find frequently bought together products in those orders
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
      // Fallback if they only ever bought this item alone
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

    // 4. Fetch full product details for the combo
    const comboProducts = await prisma.product.findMany({
      where: { id: { in: relatedProductIds }, isActive: true },
      include: { images: true }
    });

    // Sort to match the frequency order
    comboProducts.sort((a, b) => relatedProductIds.indexOf(a.id) - relatedProductIds.indexOf(b.id));

    return NextResponse.json(comboProducts);

  } catch (error) {
    console.error('Related combo error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
