import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function DELETE(req) {
  try {
    const session = await auth();
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    // Verify chat session belongs to current user
    const chatSession = await prisma.chatSession.findUnique({
      where: { id: sessionId }
    });

    if (!chatSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const currentUserId = session?.user?.id || null;
    if (chatSession.userId !== currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete all messages in this session
    await prisma.chatMessage.deleteMany({
      where: { sessionId }
    });

    // Reset session status back to AI
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { status: 'AI' }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Clear chat error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
