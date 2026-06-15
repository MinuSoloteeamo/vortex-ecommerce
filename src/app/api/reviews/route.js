import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { ReviewService } from '@/services/ReviewService';

export async function POST(req) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ message: 'Bạn cần đăng nhập để đánh giá' }, { status: 401 });
    }

    const { productId, rating, comment } = await req.json();

    if (!productId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ message: 'Dữ liệu không hợp lệ' }, { status: 400 });
    }

    const review = await ReviewService.addReview(session.user.id, productId, rating, comment);

    return NextResponse.json({ message: 'Đánh giá thành công', review }, { status: 201 });
  } catch (error) {
    if (error.message === 'Bạn đã đánh giá sản phẩm này rồi') {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    console.error('Add review error:', error);
    return NextResponse.json({ message: 'Lỗi server' }, { status: 500 });
  }
}
