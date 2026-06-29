const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.cartItem.deleteMany().then(() => {
  console.log('Carts cleared');
  return prisma.$disconnect();
}).catch(e => {
  console.error(e);
  process.exit(1);
});
