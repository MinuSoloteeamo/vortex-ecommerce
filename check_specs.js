const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const products = await prisma.product.findMany({ select: { name: true, specs: true } });
  console.log(products);
}
main().finally(() => prisma.$disconnect());
