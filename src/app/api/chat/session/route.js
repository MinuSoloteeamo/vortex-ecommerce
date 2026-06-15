import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(req) {
  try {
    const session = await auth();
    const { sessionId } = await req.json();

    let chatSession = null;

    if (sessionId) {
      chatSession = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }
          }
        }
      });

      // SECURITY & PRIVACY CHECK: Ensure strict account separation
      // Prevent User B from seeing User A's chat history after logging out/in
      if (chatSession) {
        const currentUserId = session?.user?.id || null;
        const chatOwnerId = chatSession.userId;
        
        // If chat is owned by someone else, or if it's a guest chat but we are now logged in
        if (chatOwnerId !== currentUserId) {
          chatSession = null; // Invalidate and force a new clean session
        }
      }
    }

    // If no existing session found or was invalidated due to security check, create a new one
    if (!chatSession) {
      chatSession = await prisma.chatSession.create({
        data: {
          userId: session?.user?.id || null,
          guestName: session?.user?.name || 'Guest ' + Math.floor(1000 + Math.random() * 9000),
          status: 'AI'
        },
        include: {
          messages: true
        }
      });
    }

    return NextResponse.json(chatSession);
  } catch (error) {
    console.error('Chat Session API Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
