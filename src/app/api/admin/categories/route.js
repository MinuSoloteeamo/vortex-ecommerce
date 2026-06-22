import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

async function checkAdmin() {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return false;
  }
  return true;
}

// GET - List all categories with product count
export async function GET() {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ message: 'Lỗi server' }, { status: 500 });
  }
}

// POST - Create a new category
export async function POST(req) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    const { name, slug, description, image, parentGroup, sortOrder } = data;

    if (!name || !slug || !parentGroup) {
      return NextResponse.json({ message: 'Thiếu thông tin bắt buộc (tên, slug, nhóm)' }, { status: 400 });
    }

    // Check duplicate slug
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ message: 'Slug đã tồn tại, hãy chọn tên khác' }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null,
        image: image || null,
        parentGroup,
        sortOrder: parseInt(sortOrder) || 0,
        isActive: true,
      }
    });

    return NextResponse.json({ message: 'Tạo danh mục thành công', category }, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ message: 'Lỗi server', error: error.message }, { status: 500 });
  }
}

// PUT - Update a category
export async function PUT(req) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    const { id, name, slug, description, image, parentGroup, sortOrder, isActive } = data;

    if (!id) {
      return NextResponse.json({ message: 'Thiếu ID danh mục' }, { status: 400 });
    }

    // Check duplicate slug (exclude current)
    if (slug) {
      const existing = await prisma.category.findFirst({ where: { slug, NOT: { id } } });
      if (existing) {
        return NextResponse.json({ message: 'Slug đã tồn tại' }, { status: 400 });
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description: description || null }),
        ...(image !== undefined && { image: image || null }),
        ...(parentGroup !== undefined && { parentGroup }),
        ...(sortOrder !== undefined && { sortOrder: parseInt(sortOrder) || 0 }),
        ...(isActive !== undefined && { isActive }),
      }
    });

    return NextResponse.json({ message: 'Cập nhật danh mục thành công', category });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ message: 'Lỗi server', error: error.message }, { status: 500 });
  }
}

// DELETE - Delete a category (only if no active products)
export async function DELETE(req) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Thiếu ID danh mục' }, { status: 400 });
    }

    // Check if category has active products
    const activeProductCount = await prisma.product.count({
      where: { categoryId: id, isActive: true }
    });

    if (activeProductCount > 0) {
      return NextResponse.json({ 
        message: `Không thể xóa! Danh mục còn ${activeProductCount} sản phẩm đang bán. Hãy ẩn hoặc xóa hết sản phẩm trước.`,
        activeProductCount 
      }, { status: 400 });
    }

    // Check hidden products too
    const hiddenProductCount = await prisma.product.count({
      where: { categoryId: id, isActive: false }
    });

    if (hiddenProductCount > 0) {
      return NextResponse.json({ 
        message: `Không thể xóa! Danh mục còn ${hiddenProductCount} sản phẩm đã ẩn. Hãy xóa hết sản phẩm trước.`,
        hiddenProductCount 
      }, { status: 400 });
    }

    await prisma.category.delete({ where: { id } });

    return NextResponse.json({ message: 'Đã xóa danh mục thành công' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ message: 'Lỗi server', error: error.message }, { status: 500 });
  }
}
