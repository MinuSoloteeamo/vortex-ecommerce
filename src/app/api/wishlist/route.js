import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ message: 'Product ID required' }, { status: 400 });
    }

    // Check if wishlisted
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId
        }
      }
    });

    if (existing) {
      // Toggle off
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
      // Toggle on
      await prisma.wishlist.create({
        data: {
          userId: session.user.id,
          productId
        }
      });
      return NextResponse.json({ wishlisted: true });
    }
  } catch (error) {
    console.error('Wishlist error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

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
      orderBy: { createdAt: 'desc' }
    });

    const products = wishlist.map(item => item.product);

    return NextResponse.json(products);
  } catch (error) {
    console.error('Fetch wishlist error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
