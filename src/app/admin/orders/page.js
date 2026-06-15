import { prisma } from '@/lib/prisma';
import OrderManagerClient from '@/components/admin/OrderManagerClient';

export const dynamic = 'force-dynamic'; // Always fetch fresh orders

export default async function AdminOrders() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      items: true
    }
  });

  return (
    <OrderManagerClient orders={orders} />
  );
}
