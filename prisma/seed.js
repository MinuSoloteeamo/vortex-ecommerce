const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CATEGORIES = [
  { name: 'Bàn phím cơ', slug: 'ban-phim-co', parentGroup: 'gaming', icon: '⌨️' },
  { name: 'Chuột gaming', slug: 'chuot-gaming', parentGroup: 'gaming', icon: '🖱️' },
  { name: 'Tai nghe', slug: 'tai-nghe', parentGroup: 'gaming', icon: '🎧' },
  { name: 'Bàn di chuột', slug: 'ban-di-chuot', parentGroup: 'gaming', icon: '🖼️' },
  { name: 'Ghế gaming', slug: 'ghe-gaming', parentGroup: 'gaming', icon: '🪑' },
  { name: 'Ốp điện thoại', slug: 'op-dien-thoai', parentGroup: 'tech', icon: '📱' },
  { name: 'Sạc & Cáp', slug: 'sac-cap', parentGroup: 'tech', icon: '🔌' },
  { name: 'Phụ kiện laptop', slug: 'phu-kien-laptop', parentGroup: 'tech', icon: '💻' },
  { name: 'Loa & Âm thanh', slug: 'loa-am-thanh', parentGroup: 'tech', icon: '🔊' },
  { name: 'USB & Lưu trữ', slug: 'usb-luu-tru', parentGroup: 'tech', icon: '💾' },
];

const PRODUCTS = [
  {
    name: 'Razer DeathAdder V3 Pro',
    slug: 'razer-deathadder-v3-pro',
    description: 'Chuột gaming không dây siêu nhẹ cao cấp từ Razer, trang bị cảm biến quang học Focus Pro 30K siêu chính xác.',
    price: 3290000,
    salePrice: 2790000,
    categorySlug: 'chuot-gaming',
    brand: 'Razer',
    image: '🖱️',
    isFeatured: true,
  },
  {
    name: 'Keychron Q1 Max',
    slug: 'keychron-q1-max',
    description: 'Bàn phím cơ custom full nhôm 75% hỗ trợ QMK/VIA với kết nối không dây 2.4GHz và Bluetooth 5.1.',
    price: 4590000,
    salePrice: null,
    categorySlug: 'ban-phim-co',
    brand: 'Keychron',
    image: '⌨️',
    isFeatured: true,
  },
  {
    name: 'Sony WH-1000XM5',
    slug: 'sony-wh-1000xm5',
    description: 'Tai nghe chụp tai chống ồn hàng đầu, chất âm Hi-Res cực đỉnh cho cả nghe nhạc và gaming.',
    price: 7990000,
    salePrice: 6490000,
    categorySlug: 'tai-nghe',
    brand: 'Sony',
    image: '🎧',
    isFeatured: true,
  },
  {
    name: 'Logitech G Pro X Superlight',
    slug: 'logitech-g-pro-x-superlight',
    description: 'Chuột gaming eSports quốc dân, trọng lượng chưa đến 63 gram với cảm biến HERO 25K.',
    price: 3490000,
    salePrice: 2890000,
    categorySlug: 'chuot-gaming',
    brand: 'Logitech',
    image: '🖱️',
    isFeatured: false,
  },
  {
    name: 'Wooting 60HE+',
    slug: 'wooting-60he-plus',
    description: 'Bàn phím cơ analog switch từ trường nhanh nhất thế giới dành cho game thủ try-hard.',
    price: 5200000,
    salePrice: null,
    categorySlug: 'ban-phim-co',
    brand: 'Wooting',
    image: '⌨️',
    isFeatured: false,
  },
  {
    name: 'Anker 737 GaNPrime 120W',
    slug: 'anker-737-ganprime',
    description: 'Củ sạc siêu tốc 3 cổng hỗ trợ sạc nhanh cho cả Macbook và điện thoại cùng lúc.',
    price: 1890000,
    salePrice: 1490000,
    categorySlug: 'sac-cap',
    brand: 'Anker',
    image: '🔌',
    isFeatured: true,
  },
  {
    name: 'Marshall Stanmore III',
    slug: 'marshall-stanmore-3',
    description: 'Loa Bluetooth thiết kế classic đậm chất rock, âm thanh stereo sắc nét, âm bass trầm ấm.',
    price: 9990000,
    salePrice: 8490000,
    categorySlug: 'loa-am-thanh',
    brand: 'Marshall',
    image: '🔊',
    isFeatured: false,
  },
  {
    name: 'Spigen Tough Armor iPhone 15 Pro Max',
    slug: 'spigen-tough-armor-ip15pm',
    description: 'Ốp lưng siêu bền chống sốc quân đội có chân đế cho iPhone 15 Pro Max.',
    price: 790000,
    salePrice: 590000,
    categorySlug: 'op-dien-thoai',
    brand: 'Spigen',
    image: '📱',
    isFeatured: false,
  },
];

async function main() {
  console.log('Clearing old data...');
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  console.log('Seeding categories...');
  const catMap = {};
  for (const cat of CATEGORIES) {
    const created = await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        parentGroup: cat.parentGroup,
        image: cat.icon,
        isActive: true,
      },
    });
    catMap[cat.slug] = created.id;
  }

  console.log('Seeding products...');
  for (const prod of PRODUCTS) {
    await prisma.product.create({
      data: {
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        price: prod.price,
        salePrice: prod.salePrice,
        brand: prod.brand,
        categoryId: catMap[prod.categorySlug],
        stock: 100,
        isActive: true,
        isFeatured: prod.isFeatured,
        images: {
          create: [
            { url: prod.image, sortOrder: 0 } // Sử dụng emoji như là image path để render giả lập
          ]
        }
      },
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
