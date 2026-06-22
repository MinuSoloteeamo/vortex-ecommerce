import { prisma } from '@/lib/prisma';
import ProductManager from '@/components/admin/ProductManager';

export const dynamic = 'force-dynamic';

export default async function AdminProducts() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        images: true,
        variants: {
          include: {
            images: { orderBy: { sortOrder: 'asc' } }
          }
        },
      }
    }),
    prisma.category.findMany({
      orderBy: { sortOrder: 'asc' }
    })
  ]);

  return <ProductManager initialProducts={products} categories={categories} />;
}
