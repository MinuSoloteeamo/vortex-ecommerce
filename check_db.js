const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- USERS ---');
  console.log(await prisma.user.findMany({ select: { id: true, email: true, role: true } }));
  console.log('--- SESSIONS ---');
  console.log(await prisma.chatSession.findMany({ select: { id: true, status: true, userId: true } }));
}

main().catch(console.error).finally(() => prisma.$disconnect());
