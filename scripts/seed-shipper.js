const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'shipper@vortex.com';
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    console.log('Shipper user already exists. Updating role to SHIPPER...');
    await prisma.user.update({
      where: { email },
      data: { role: 'SHIPPER' }
    });
    console.log('Done!');
  } else {
    console.log('Creating Shipper user...');
    const hashedPassword = await bcrypt.hash('123456', 10);
    await prisma.user.create({
      data: {
        email,
        name: 'VORTEX Shipper',
        password: hashedPassword,
        role: 'SHIPPER',
        gender: 'Nam',
        phone: '0987654321',
      }
    });
    console.log('Done! User: shipper@vortex.com | Pass: 123456');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
