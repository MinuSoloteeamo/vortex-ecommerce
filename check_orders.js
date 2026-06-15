const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const orders = await prisma.order.findMany({
    select: { id: true, orderNumber: true, status: true, totalAmount: true, userId: true },
    where: { status: 'DELIVERED' }
  });
  console.log('Delivered Orders:', orders);
}
main().finally(() => prisma.$disconnect());
