import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { authConfig } from './auth.config';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'mock-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock-client-secret',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mật khẩu", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) return null;

        const passwordsMatch = await bcrypt.compare(credentials.password, user.password);

        if (passwordsMatch) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar
          };
        }

        return null;
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  events: {
    async signIn({ user }) {
      if (!user?.id) return;
      try {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { id: true, name: true, vipTier: true, points: true }
        });
        if (dbUser) {
          const { createUserNotification } = await import('@/lib/notification');
          await createUserNotification(
            dbUser.id,
            `🚀 Chào mừng ${dbUser.name} quay lại VORTEX!`,
            `Bạn đang là Hạng ${dbUser.vipTier} với ${dbUser.points} điểm V-Points. Hãy tích cực mua sắm để nhận thêm nhiều ưu đãi.`,
            'WELCOME',
            '/account/vip'
          );
        }
      } catch (err) {
        console.error('Error creating welcome back notification:', err);
      }
    }
  }
});
