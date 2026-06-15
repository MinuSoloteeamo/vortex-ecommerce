import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const coupons = [
    {
      code: 'NEWBIE',
      discountAmount: 50000,
      minOrderValue: 200000,
      maxUsage: 1000,
      validUntil: new Date('2026-12-31T23:59:59Z'),
      isActive: true,
    },
    {
      code: 'VORTEXVIP',
      discountPercent: 10,
      minOrderValue: 0,
      maxUsage: 500,
      validUntil: new Date('2026-12-31T23:59:59Z'),
      isActive: true,
    },
    {
      code: 'HACKER',
      discountPercent: 99,
      minOrderValue: 0,
      maxUsage: 10,
      validUntil: new Date('2026-12-31T23:59:59Z'),
      isActive: true,
    }
  ];

  for (const c of coupons) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: {},
      create: c,
    });
  }
  
  console.log('Coupons seeded successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
