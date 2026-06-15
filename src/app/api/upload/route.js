import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ message: 'Không tìm thấy file' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Đảm bảo thư mục public/uploads tồn tại
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // Đã tồn tại
    }

    // Tạo tên file ngẫu nhiên để tránh trùng
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniqueSuffix + '-' + file.name.replace(/\s+/g, '-');
    
    const filePath = join(uploadDir, filename);

    // Lưu file vào ổ cứng
    await writeFile(filePath, buffer);

    // Trả về đường dẫn để frontend có thể hiển thị (<img src="/uploads/..." />)
    const fileUrl = `/uploads/${filename}`;
    return NextResponse.json({ url: fileUrl, message: 'Upload thành công' });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ message: 'Lỗi server khi upload file' }, { status: 500 });
  }
}
