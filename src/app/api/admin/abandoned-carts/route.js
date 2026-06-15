import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all users who have items in their cart
    // We group by userId and include their user info and product details
    const cartItems = await prisma.cartItem.findMany({
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { name: true, price: true, salePrice: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });

    const groupedCarts = {};
    cartItems.forEach(item => {
      if (!groupedCarts[item.userId]) {
        groupedCarts[item.userId] = {
          userId: item.userId,
          user: item.user,
          items: [],
          totalValue: 0,
          lastUpdated: item.updatedAt
        };
      }
      
      groupedCarts[item.userId].items.push(item);
      const price = item.product.salePrice || item.product.price;
      groupedCarts[item.userId].totalValue += (price * item.quantity);
      
      if (new Date(item.updatedAt) > new Date(groupedCarts[item.userId].lastUpdated)) {
        groupedCarts[item.userId].lastUpdated = item.updatedAt;
      }
    });

    const cartsArray = Object.values(groupedCarts).sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));

    return NextResponse.json(cartsArray);
  } catch (error) {
    console.error('Fetch Abandoned Carts Error:', error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
