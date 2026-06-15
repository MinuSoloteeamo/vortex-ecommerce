import { prisma } from '@/lib/prisma';

export class ReviewService {
  /**
   * Add a new review
   */
  static async addReview(userId, productId, rating, comment) {
    // Check if user has already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: { userId, productId }
    });

    if (existingReview) {
      throw new Error('Bạn đã đánh giá sản phẩm này rồi');
    }

    return prisma.review.create({
      data: {
        userId,
        productId,
        rating,
        comment
      }
    });
  }

  /**
   * Get reviews for a product with pagination
   */
  static async getProductReviews(productId, skip = 0, take = 10) {
    const [reviews, totalCount, aggregations] = await Promise.all([
      prisma.review.findMany({
        where: { productId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, avatar: true } }
        }
      }),
      prisma.review.count({ where: { productId } }),
      prisma.review.aggregate({
        where: { productId },
        _avg: { rating: true }
      })
    ]);

    return {
      reviews,
      totalCount,
      averageRating: aggregations._avg.rating || 0
    };
  }
}
