import { NextResponse } from 'next/server';
import { ProductService } from '@/services/ProductService';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');

    if (!q || q.trim() === '') {
      return NextResponse.json({ categories: [], products: [] });
    }

    const { categories, products } = await ProductService.getSearchSuggestions(q);

    return NextResponse.json({
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        image: cat.image,
      })),
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        salePrice: p.salePrice,
        images: p.images,
      })),
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ message: 'Lỗi server' }, { status: 500 });
  }
}
