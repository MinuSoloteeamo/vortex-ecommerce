const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.product.updateMany({
    where: { name: { contains: 'Mouse' } },
    data: { specs: JSON.stringify({ "Kết nối": "Wireless", "Cảm biến": "Optical", "Màu sắc": "Đen" }) }
  });
  await prisma.product.updateMany({
    where: { name: { contains: 'Keyboard' } },
    data: { specs: JSON.stringify({ "Kết nối": "Wired", "Switch": "Red", "Size": "TKL" }) }
  });
  await prisma.product.update({
    where: { slug: 'logitech-g-pro-x-superlight' },
    data: { specs: JSON.stringify({ "Kết nối": "Wireless", "Cảm biến": "HERO 25K", "Màu sắc": "Trắng" }) }
  });
  await prisma.product.updateMany({
    where: { slug: 'razer-deathadder-v3-pro' },
    data: { specs: JSON.stringify({ "Kết nối": "Wireless", "Cảm biến": "Focus Pro 30K", "Màu sắc": "Đen" }) }
  });
  await prisma.product.updateMany({
    where: { slug: 'keychron-q1-max' },
    data: { specs: JSON.stringify({ "Kết nối": "Wireless", "Switch": "Brown", "Size": "75%" }) }
  });
  await prisma.product.updateMany({
    where: { slug: 'wooting-60he' },
    data: { specs: JSON.stringify({ "Kết nối": "Wired", "Switch": "Lekker", "Size": "60%" }) }
  });
  console.log('Specs updated');
}
main().finally(() => prisma.$disconnect());
