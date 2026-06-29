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

    const newReview = await prisma.review.create({
      data: {
        userId,
        productId,
        rating,
        comment
      }
    });

    // Cập nhật Wilson Score
    await ReviewService.updateWilsonScore(productId);

    return newReview;
  }

  /**
   * Tính toán và cập nhật Wilson Score Interval cho sản phẩm
   */
  static async updateWilsonScore(productId) {
    const aggregations = await prisma.review.groupBy({
      by: ['productId'],
      where: { productId },
      _count: { rating: true },
    });

    const totalReviews = aggregations.length > 0 ? aggregations[0]._count.rating : 0;
    if (totalReviews === 0) return;

    const positiveReviewsAgg = await prisma.review.aggregate({
      where: { productId, rating: { gte: 4 } },
      _count: { rating: true }
    });
    
    const positiveReviews = positiveReviewsAgg._count.rating;
    
    // Công thức Wilson Score Interval (95% confidence)
    const z = 1.95996; 
    const p = positiveReviews / totalReviews;
    const denominator = 1 + z * z / totalReviews;
    const centreAdjustedProbability = p + z * z / (2 * totalReviews);
    const adjustedStandardDeviation = Math.sqrt((p * (1 - p) + z * z / (4 * totalReviews)) / totalReviews);
    
    const wilsonScore = (centreAdjustedProbability - z * adjustedStandardDeviation) / denominator;

    await prisma.product.update({
      where: { id: productId },
      data: { wilsonScore }
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
