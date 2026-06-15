const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function makeAdmin(email) {
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
    });
    console.log(`✅ Thành công! Tài khoản ${user.email} đã được cấp quyền ADMIN.`);
  } catch (error) {
    if (error.code === 'P2025') {
      console.error(`❌ Lỗi: Không tìm thấy tài khoản với email "${email}".`);
    } else {
      console.error('❌ Lỗi:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Thay đổi email bên dưới thành email bạn vừa đăng ký trên web
const targetEmail = 'tminhnkd1405@gmail.com';
makeAdmin(targetEmail);
