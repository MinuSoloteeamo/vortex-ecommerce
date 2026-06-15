const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const topUsersQuery = await prisma.order.groupBy({
      by: ['userId'],
      where: {
        status: 'DELIVERED',
        userId: { not: null }
      },
      _sum: {
        totalAmount: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _sum: {
          totalAmount: 'desc'
        }
      },
      take: 10
    });
    console.log(topUsersQuery);
  } catch (e) {
    console.error('Error:', e);
  }
}
main().finally(() => prisma.$disconnect());
