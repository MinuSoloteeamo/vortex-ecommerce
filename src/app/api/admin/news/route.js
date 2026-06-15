import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// GET all news
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    
    let where = {};
    if (category) {
      where.category = category;
    }

    const news = await prisma.news.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(news);
  } catch (error) {
    console.error('Fetch news error:', error);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}

// POST create news
export async function POST(req) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const data = await req.json();
    const category = data.category || 'Tin tức';
    const isFeatured = data.isFeatured || false;

    if (isFeatured) {
      const existingFeatured = await prisma.news.findFirst({
        where: {
          category,
          isFeatured: true
        }
      });
      if (existingFeatured) {
        return NextResponse.json({ error: 'Danh mục này đã có tin tức nổi bật. Vui lòng tắt nổi bật ở tin cũ trước khi tạo mới.' }, { status: 400 });
      }
    }
    
    // Tạo slug từ title
    const slug = data.title
      .toLowerCase()
      .replace(/đ/g, 'd')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-') + '-' + Math.round(Math.random() * 1000);

    const news = await prisma.news.create({
      data: {
        title: data.title,
        slug: slug,
        author: session.user.name || 'Admin',
        category: data.category || 'Tin tức',
        description: data.description,
        content: data.content,
        image: data.image,
        bgColor: data.bgColor,
        isFeatured: data.isFeatured || false,
      }
    });

    return NextResponse.json(news, { status: 201 });
  } catch (error) {
    console.error('Create news error:', error);
    return NextResponse.json({ error: 'Failed to create news' }, { status: 500 });
  }
}
