import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function PUT(req, { params }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const data = await req.json();

    const currentNews = await prisma.news.findUnique({ where: { id } });
    if (!currentNews) {
      return NextResponse.json({ error: 'Không tìm thấy tin tức' }, { status: 404 });
    }

    const finalCategory = data.category !== undefined ? data.category : currentNews.category;
    const finalIsFeatured = data.isFeatured !== undefined ? data.isFeatured : currentNews.isFeatured;

    if (finalIsFeatured) {
      const existingFeatured = await prisma.news.findFirst({
        where: {
          category: finalCategory,
          isFeatured: true,
          id: { not: id }
        }
      });
      
      if (existingFeatured) {
        return NextResponse.json({ error: 'Danh mục này đã có tin tức nổi bật. Vui lòng tắt nổi bật ở tin cũ.' }, { status: 400 });
      }
    }

    const updateData = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.bgColor !== undefined) updateData.bgColor = data.bgColor;
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;

    const news = await prisma.news.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(news);
  } catch (error) {
    console.error('Update news error:', error);
    return NextResponse.json({ error: 'Failed to update news' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    await prisma.news.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete news error:', error);
    return NextResponse.json({ error: 'Failed to delete news' }, { status: 500 });
  }
}
