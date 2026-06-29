import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { analyzeSentiment } from '@/utils/sentiment';

export async function GET(req) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { name: true, slug: true } }
      }
    });

    // Phân tích sắc thái cho từng review
    const analyzedReviews = reviews.map(review => {
      const sentiment = analyzeSentiment(review.comment || '');
      return {
        ...review,
        sentimentLabel: sentiment.label,
        sentimentScore: sentiment.score
      };
    });

    return NextResponse.json(analyzedReviews);
  } catch (error) {
    console.error('Admin reviews error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
