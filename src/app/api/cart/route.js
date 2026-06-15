import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// GET — Lấy giỏ hàng của user đang đăng nhập
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json([], { status: 200 });
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          include: {
            images: { take: 1, orderBy: { sortOrder: 'asc' } }
          }
        }
      }
    });

    // Format cho Zustand store
    const items = cartItems
      .filter(item => item.product) // Bỏ qua sản phẩm đã bị xóa
      .map(item => ({
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        price: item.product.salePrice || item.product.price,
        originalPrice: item.product.price,
        image: item.product.images?.[0]?.url || '/images/placeholder.png',
        quantity: item.quantity,
      }));

    return NextResponse.json(items);
  } catch (error) {
    console.error('Get cart error:', error);
    return NextResponse.json({ error: 'Failed to get cart' }, { status: 500 });
  }
}

// POST — Đồng bộ toàn bộ giỏ hàng từ client lên DB
export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { items } = await req.json();
    const userId = session.user.id;

    // Xóa toàn bộ giỏ cũ của user
    await prisma.cartItem.deleteMany({ where: { userId } });

    // Thêm lại toàn bộ items mới
    if (items && items.length > 0) {
      await prisma.cartItem.createMany({
        data: items.map(item => ({
          userId,
          productId: item.id,
          quantity: item.quantity,
        })),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Sync cart error:', error);
    return NextResponse.json({ error: 'Failed to sync cart' }, { status: 500 });
  }
}

// DELETE — Xóa toàn bộ giỏ hàng của user (khi checkout xong)
export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.cartItem.deleteMany({ where: { userId: session.user.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Clear cart error:', error);
    return NextResponse.json({ error: 'Failed to clear cart' }, { status: 500 });
  }
}
