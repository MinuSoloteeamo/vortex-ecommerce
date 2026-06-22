import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(req) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Aggregate Product views
    const stats = await prisma.productView.groupBy({
      by: ['productId'],
      _count: { id: true },
      _sum: { viewDuration: true },
    });

    // Count conversions (where converted = true)
    const conversions = await prisma.productView.groupBy({
      by: ['productId'],
      _count: { id: true },
      where: {
        converted: true
      }
    });

    // Fetch product details
    const productIds = stats.map(s => s.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, slug: true, images: true, category: { select: { name: true } } }
    });

    // Merge data
    const analyticsData = products.map(product => {
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

    // Sort by views descending
    analyticsData.sort((a, b) => b.views - a.views);

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('Admin analytics error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
