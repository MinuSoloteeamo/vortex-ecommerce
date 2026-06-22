import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(req) {
  try {
    const { productId, sessionId } = await req.json();
    if (!productId || !sessionId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const session = await auth();
    const userId = session?.user?.id || null;

    const view = await prisma.productView.create({
      data: {
        productId,
        sessionId,
        userId,
      }
    });

    return NextResponse.json({ id: view.id });
  } catch (error) {
    console.error('Analytics view error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const { id, duration } = await req.json();
    if (!id || duration === undefined) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Accumulate the duration or set it directly. 
    // Usually the frontend sends the total elapsed duration since the page load.
    const view = await prisma.productView.update({
      where: { id },
      data: {
        viewDuration: duration
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics update error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
