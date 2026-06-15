import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { ProductService } from '@/services/ProductService';

// Middleware to check Admin role
async function checkAdmin() {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return false;
  }
  return true;
}

export async function POST(req) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    const product = await ProductService.createProduct(data);
    
    return NextResponse.json({ message: 'Tạo sản phẩm thành công', product }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ message: 'Lỗi server', error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    const { id, ...updateData } = data;
    
    if (!id) return NextResponse.json({ message: 'Thiếu ID sản phẩm' }, { status: 400 });

    const product = await ProductService.updateProduct(id, updateData);
    
    return NextResponse.json({ message: 'Cập nhật sản phẩm thành công', product }, { status: 200 });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ message: 'Lỗi server', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    if (!id) return NextResponse.json({ message: 'Thiếu ID sản phẩm' }, { status: 400 });

    const product = await ProductService.deleteProduct(id);
    
    return NextResponse.json({ message: 'Đã ẩn sản phẩm thành công', product }, { status: 200 });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ message: 'Lỗi server', error: error.message }, { status: 500 });
  }
}
