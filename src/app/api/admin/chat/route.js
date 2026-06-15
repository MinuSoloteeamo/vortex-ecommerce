import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// Middleware-like Admin check
async function checkAdmin() {
  const session = await auth();
  if (!session || session.user?.role !== 'ADMIN') {
    return false;
  }
  return session;
}

export async function GET(req) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    // Fetch all sessions with messages
    const sessions = await prisma.chatSession.findMany({
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Admin Chat Get Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { sessionId, action, content } = await req.json();

    if (!sessionId || !action) {
      return NextResponse.json({ message: 'Missing parameters' }, { status: 400 });
    }

    // Connect human is triggered by client, doesn't need admin check
    if (action === 'CONNECT_HUMAN') {
      const updatedSession = await prisma.chatSession.update({
        where: { id: sessionId },
        data: { status: 'PENDING_HUMAN' }
      });

      await prisma.chatMessage.create({
        data: {
          sessionId,
          senderType: 'AI',
          content: '🔄 *Đang kết nối bạn với nhân viên tư vấn. Vui lòng đợi trong giây lát...*'
        }
      });

      return NextResponse.json(updatedSession);
    }

    if (action === 'TIMEOUT') {
      const updatedSession = await prisma.chatSession.update({
        where: { id: sessionId },
        data: { status: 'AI' }
      });

      const fallbackMsg = await prisma.chatMessage.create({
        data: {
          sessionId,
          senderType: 'AI',
          content: '🤖 **Trợ lý VORTEX:** Hiện tại không có nhân viên nào đang trực ca. Thay vào đó, AI trong chat box sẽ tiếp tục giúp bạn giải quyết các vấn đề có liên quan đến bài làm và thắc mắc của bạn nhé! \n\n📞 Hoặc bạn có thể liên hệ hotline **1900 8888** để được hỗ trợ khẩn cấp.'
        }
      });

      return NextResponse.json({ success: true, updatedSession, fallbackMsg });
    }

    // Other actions require Admin privileges
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    let chatSession = null;

    if (action === 'CLAIM') {
      chatSession = await prisma.chatSession.update({
        where: { id: sessionId },
        data: { status: 'HUMAN' }
      });

      await prisma.chatMessage.create({
        data: {
          sessionId,
          senderType: 'STAFF',
          content: `⚡ *Nhân viên ${isAdmin.user.name} đã kết nối trực tiếp để hỗ trợ bạn!*`
        }
      });
    } 
    else if (action === 'CLOSE') {
      chatSession = await prisma.chatSession.update({
        where: { id: sessionId },
        data: { status: 'AI' }
      });

      await prisma.chatMessage.create({
        data: {
          sessionId,
          senderType: 'AI',
          content: '🤖 *Nhân viên hỗ trợ đã rời phòng chat. VORTEX AI sẽ tiếp tục hỗ trợ bạn.*'
        }
      });
    } 
    else if (action === 'SEND') {
      if (!content) {
        return NextResponse.json({ message: 'Content required to send' }, { status: 400 });
      }

      chatSession = await prisma.chatSession.update({
        where: { id: sessionId },
        data: { status: 'HUMAN' }
      });

      await prisma.chatMessage.create({
        data: {
          sessionId,
          senderType: 'STAFF',
          content
        }
      });

      // Notify User if they are logged in
      if (chatSession.userId) {
        const { createUserNotification } = await import('@/lib/notification');
        await createUserNotification(
          chatSession.userId,
          '💬 Hỗ trợ trực tuyến',
          'Nhân viên VORTEX vừa phản hồi tin nhắn của bạn.',
          'SUPPORT_REPLY'
        );
      }
    }

    return NextResponse.json({ success: true, chatSession });

  } catch (error) {
    console.error('Admin Chat POST Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ message: 'Missing sessionId' }, { status: 400 });
    }

    await prisma.chatSession.delete({
      where: { id: sessionId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin Chat DELETE Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
