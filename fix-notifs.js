const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixLinks() {
  console.log('Fixing notification links...');
  const orders = await prisma.notification.findMany({
    where: { link: { startsWith: '/admin/orders/' } }
  });
  const products = await prisma.notification.findMany({
    where: { link: { startsWith: '/admin/products/' } }
  });

  for (const notif of orders) {
    await prisma.notification.update({
      where: { id: notif.id },
      data: { link: '/admin/orders' }
    });
  }
  for (const notif of products) {
    await prisma.notification.update({
      where: { id: notif.id },
      data: { link: '/admin/products' }
    });
  }

  console.log(`Fixed ${orders.length} orders notifications and ${products.length} products notifications.`);
}

fixLinks().catch(console.error).finally(() => prisma.$disconnect());
