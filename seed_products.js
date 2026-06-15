const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding products...');

  let category = await prisma.category.findFirst({
    where: { parentGroup: 'gaming' }
  });

  if (!category) {
    category = await prisma.category.create({
      data: {
        name: 'Gaming Laptops',
        slug: 'gaming-laptops',
        parentGroup: 'gaming',
        description: 'High performance gaming laptops'
      }
    });
    console.log('Created category:', category.name);
  } else {
    console.log('Found category:', category.name);
  }

  const products = [
    {
      name: 'Vortex Phantom 15',
      slug: 'vortex-phantom-15-' + Date.now(),
      description: 'The ultimate 15-inch gaming laptop with RTX 4080.',
      price: 45000000,
      salePrice: 42000000,
      stock: 20,
      brand: 'Vortex',
      isFeatured: true,
      categoryId: category.id,
      soldCount: 5,
    },
    {
      name: 'Vortex Nova Keyboard',
      slug: 'vortex-nova-keyboard-' + Date.now(),
      description: 'Mechanical gaming keyboard with custom RGB switches.',
      price: 3500000,
      salePrice: 3200000,
      stock: 50,
      brand: 'Vortex',
      isFeatured: false,
      categoryId: category.id,
      soldCount: 12,
    },
    {
      name: 'Vortex Precision Mouse',
      slug: 'vortex-precision-mouse-' + Date.now(),
      description: 'Ultra-lightweight wireless gaming mouse with 26K DPI.',
      price: 2500000,
      stock: 100,
      brand: 'Vortex',
      isFeatured: true,
      categoryId: category.id,
      soldCount: 45,
    },
    {
      name: 'Titan Pro 17',
      slug: 'titan-pro-17-' + Date.now(),
      description: 'Massive 17-inch screen with desktop-level cooling.',
      price: 55000000,
      salePrice: 50000000,
      stock: 15,
      brand: 'Titan',
      isFeatured: true,
      categoryId: category.id,
      soldCount: 2,
    },
    {
      name: 'Stealth Headset V2',
      slug: 'stealth-headset-v2-' + Date.now(),
      description: 'Immersive 7.1 surround sound gaming headset.',
      price: 4500000,
      stock: 30,
      brand: 'Stealth',
      isFeatured: false,
      categoryId: category.id,
      soldCount: 8,
    }
  ];

  for (const p of products) {
    const created = await prisma.product.create({
      data: p
    });
    console.log('Created product:', created.name);
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
