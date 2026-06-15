const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.findUnique({
    where: { id: 'cmpfnnl260005joqkhjd1axfj' }
  });
  console.log(user);
}
main().finally(() => prisma.$disconnect());
