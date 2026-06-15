const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding VIP coupons...');

  // Create some exchangeable coupons
  await prisma.coupon.upsert({
    where: { code: 'VIP-50K' },
    update: {},
    create: {
      code: 'VIP-50K',
      discountAmount: 50000,
      minOrderValue: 200000,
      costInPoints: 100,
      validFrom: new Date(),
      validUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      maxUsage: 1000,
      isActive: true,
    }
  });

  await prisma.coupon.upsert({
    where: { code: 'VIP-10PERCENT' },
    update: {},
    create: {
      code: 'VIP-10PERCENT',
      discountPercent: 10,
      minOrderValue: 500000,
      costInPoints: 300,
      validFrom: new Date(),
      validUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      maxUsage: 1000,
      isActive: true,
    }
  });

  await prisma.coupon.upsert({
    where: { code: 'VIP-200K' },
    update: {},
    create: {
      code: 'VIP-200K',
      discountAmount: 200000,
      minOrderValue: 1000000,
      costInPoints: 500,
      validFrom: new Date(),
      validUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      maxUsage: 500,
      isActive: true,
    }
  });

  // Give all users 1000 points to test
  await prisma.user.updateMany({
    data: {
      points: 1000,
      vipTier: 'SILVER'
    }
  });

  console.log('Done!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
