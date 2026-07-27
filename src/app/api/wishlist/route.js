import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(req) {
  try {
    // 1. Kiểm tra xác thực xem người dùng đã đăng nhập chưa
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // 2. Lấy mã ID sản phẩm từ body của request
    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ message: 'Product ID required' }, { status: 400 });
    }

    // 3. Kiểm tra xem sản phẩm này đã có trong danh sách yêu thích của người dùng chưa
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId
        }
      }
    });

    // 4. Cơ chế Bật/Tắt (Toggle): Đã có thì Xóa, Chưa có thì Thêm mới
    if (existing) {
      // Đã có trong danh sách -> Thực hiện XÓA khỏi yêu thích (Toggle OFF)
      await prisma.wishlist.delete({
        where: {
          userId_productId: {
            userId: session.user.id,
            productId
          }
        }
      });
      return NextResponse.json({ wishlisted: false });
    } else {
      // Chưa có trong danh sách -> Thực hiện THÊM VÀO yêu thích (Toggle ON)
      await prisma.wishlist.create({
        data: {
          userId: session.user.id,
          productId
        }
      });
      return NextResponse.json({ wishlisted: true });
    }
  } catch (error) {
    console.error('Lỗi khi cập nhật danh sách yêu thích:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    // 1. Kiểm tra xác thực người dùng đã đăng nhập chưa
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // 2. Lấy danh sách sản phẩm yêu thích của người dùng (kèm thông tin ảnh và danh mục)
    const wishlist = await prisma.wishlist.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          include: {
            images: true,
            category: true
          }
        }
      },
      orderBy: { createdAt: 'desc' } // Sắp xếp sản phẩm mới thêm vào lên đầu
    });

    // 3. Bóc tách lấy ra mảng sản phẩm chi tiết
    const products = wishlist.map(item => item.product);

    return NextResponse.json(products);
  } catch (error) {
    console.error('Lỗi khi tải danh sách yêu thích:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
