import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price) + '₫';
}

export async function POST(req) {
  try {
    const { sessionId, content } = await req.json();
    if (!sessionId || !content) {
      return NextResponse.json({ message: 'Session ID and content required' }, { status: 400 });
    }

    // 1. Get current session
    let chatSession = await prisma.chatSession.findUnique({
      where: { id: sessionId }
    });

    if (!chatSession) {
      return NextResponse.json({ message: 'Session not found' }, { status: 404 });
    }

    // 2. Save user message in DB
    const userMessage = await prisma.chatMessage.create({
      data: {
        sessionId,
        senderType: 'USER',
        content
      }
    });

    // 3. Check session status
    if (chatSession.status === 'AI') {
      // Process AI response
      const lastMessage = content.toLowerCase();
      let reply = "";

      // 1. Fetch all categories to match user query dynamically
      const categories = await prisma.category.findMany();
      let matchedCategory = null;

      // Loại bỏ dấu tiếng Việt và ký tự đặc biệt
      const normalizedMsg = lastMessage.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase();
      const cleanMsg = normalizedMsg.replace(/[^a-z0-9\s]/g, ' ');
      const words = cleanMsg.split(/\s+/);

      for (const cat of categories) {
        const catName = cat.name.toLowerCase();
        const normalizedCat = catName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
        
        // Mảng các từ khóa (Bao gồm từ gốc và từ viết tắt)
        let matchKeywords = [normalizedCat];
        
        if (normalizedCat.includes('ban phim')) matchKeywords.push('ban phim', 'phim', 'phim co', 'bp', 'keyboard');
        else if (normalizedCat.includes('chuot')) matchKeywords.push('chuot', 'mouse');
        else if (normalizedCat.includes('tai nghe')) matchKeywords.push('tai nghe', 'headphone', 'earphone', 'tai');
        else if (normalizedCat.includes('man hinh')) matchKeywords.push('man hinh', 'man', 'monitor', 'lcd');
        else if (normalizedCat.includes('ghe')) matchKeywords.push('ghe', 'chair');
        else if (normalizedCat.includes('laptop')) matchKeywords.push('laptop', 'lap', 'may tinh', 'may tinh xach tay');
        else if (normalizedCat.includes('loa')) matchKeywords.push('loa', 'speaker');
        else if (normalizedCat.includes('tay cam')) matchKeywords.push('tay cam', 'gamepad', 'controller', 'tay');

        // Kiểm tra khớp từ khóa
        const isMatch = matchKeywords.some(kw => {
          // Đối với các từ viết tắt rất ngắn (vd: lap, man, bp, tai, tay), bắt buộc phải đứng độc lập như 1 từ để tránh nhận diện nhầm
          if (kw.length <= 3 || !kw.includes(' ')) { 
             return words.includes(kw);
          } else {
             return cleanMsg.includes(kw);
          }
        });

        if (isMatch) {
          matchedCategory = cat;
          break;
        }
      }

      // Smart database query matches
      if (matchedCategory) {
        const products = await prisma.product.findMany({
          where: {
            categoryId: matchedCategory.id,
            isActive: true
          },
          take: 4,
          orderBy: { createdAt: 'desc' }
        });

        if (products.length > 0) {
          reply = `✨ VORTEX đang có các sản phẩm thuộc danh mục **${matchedCategory.name}** nổi bật sau:\n\n` + 
            products.map(p => `• **[${p.name}](/products/${p.slug})** - Giá: ${formatPrice(p.salePrice || p.price)} ${p.stock === 0 ? '*(Tạm hết hàng)*' : ''}`).join('\n') + 
            `\n\nBạn có thể nhấn vào tên sản phẩm để xem chi tiết cấu hình và đặt hàng nhé!`;
        } else {
          reply = `😅 Hiện tại danh mục **${matchedCategory.name}** đang tạm hết sản phẩm hoặc chưa được cập nhật. Bạn tham khảo các danh mục khác giúp mình nhé!`;
        }
      }
      // Policies & General matches
      else if (normalizedMsg.includes('bao hanh') || normalizedMsg.includes('doi tra') || normalizedMsg.includes('hoan tien')) {
        reply = "🛡️ **Chính sách bảo hành tại VORTEX:**\n\n• Bảo hành chính hãng **24 tháng** cho mọi thiết bị Gaming Gear.\n• Áp dụng chính sách **1 đổi 1 trong 30 ngày đầu tiên** nếu phát sinh lỗi phần cứng từ nhà sản xuất.\n• Bạn chỉ cần đọc số điện thoại mua hàng để làm thủ tục bảo hành cực nhanh tại showroom.";
      }
      else if (normalizedMsg.includes('ship') || normalizedMsg.includes('van chuyen') || normalizedMsg.includes('giao hang') || normalizedMsg.includes('bao lau')) {
        reply = "🚚 **Thời gian & Quy định giao hàng:**\n\n• **Giao hàng hỏa tốc 2H:** Áp dụng khu vực nội thành TP. Hồ Chí Minh.\n• **Giao hàng tiêu chuẩn:** Miễn phí cho đơn hàng từ 1.000.000₫. Thời gian nhận hàng toàn quốc từ 1-3 ngày làm việc.\n• Quý khách luôn được đồng kiểm (kiểm tra ngoại quan sản phẩm trước khi thanh toán).";
      }
      else if (normalizedMsg.includes('lien he') || normalizedMsg.includes('showroom') || normalizedMsg.includes('dia chi') || normalizedMsg.includes('sdt') || normalizedMsg.includes('hotline')) {
        reply = "📞 **Thông tin liên hệ VORTEX Store:**\n\n• **Hotline hỗ trợ:** 1900 8888 (Phục vụ 24/7 - Miễn phí).\n• **Email hỗ trợ:** support@vortex.com\n• **Địa chỉ Showroom:** Số 123 Đường Neon, Quận Cyberpunk, TP. Hồ Chí Minh.\n\n*Chúng mình mở cửa đón tiếp các game thủ từ 8:00 đến 22:00 tất cả các ngày trong tuần!*";
      }
      else if (normalizedMsg.includes('chao') || normalizedMsg.includes('hi') || normalizedMsg.includes('hello') || normalizedMsg.includes('cam on') || normalizedMsg.includes('thanks')) {
        reply = "👋 Xin chào! Mình là trợ lý ảo VORTEX AI. Mình có thể giúp gì cho bạn hôm nay?\n\nBạn có thể hỏi mình các câu hỏi như:\n• *Tư vấn cho mình các mẫu bàn phím cơ*\n• *Showroom cửa hàng ở đâu?*\n• *Chính sách bảo hành của VORTEX ra sao?*";
      }
      else {
        reply = "🤖 Mình đã ghi nhận câu hỏi của bạn. Để được hỗ trợ chuyên sâu nhất về kỹ thuật hoặc đơn hàng cụ thể, bạn có thể gọi hotline miễn phí **1900 8888** hoặc nhắn tin trực tiếp cho các tư vấn viên tại Fanpage VORTEX nhé!\n\nBạn có muốn mình tìm kiếm dòng sản phẩm nào cụ thể như **Bàn phím**, **Chuột gaming**, hay **Tai nghe** không?";
      }

      // Save AI reply in DB
      const aiMessage = await prisma.chatMessage.create({
        data: {
          sessionId,
          senderType: 'AI',
          content: reply
        }
      });

      return NextResponse.json({
        status: 'AI',
        userMessage,
        aiMessage
      });
    }

    // If PENDING_HUMAN or HUMAN, return and wait for staff response
    return NextResponse.json({
      status: chatSession.status,
      userMessage,
      reply: null
    });

  } catch (error) {
    console.error('Chat AI Box API Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
