export const authConfig = {
  pages: {
    signIn: '/login',
  },
  providers: [], // Cấu hình providers ở auth.js để tránh issue với Edge runtime
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnProtected = nextUrl.pathname.startsWith('/checkout') || nextUrl.pathname.startsWith('/account');
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');
      const isOnShipper = nextUrl.pathname.startsWith('/shipper');
      const isOnAuth = nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/register');

      if (isOnAdmin) {
        if (isLoggedIn && auth.user?.role === 'ADMIN') return true;
        if (isLoggedIn) return Response.redirect(new URL('/', nextUrl)); // Không có quyền
        return false; // Chưa đăng nhập
      }
      
      if (isOnShipper) {
        if (isLoggedIn && (auth.user?.role === 'SHIPPER' || auth.user?.role === 'ADMIN')) return true;
        if (isLoggedIn) return Response.redirect(new URL('/', nextUrl)); // Không có quyền
        return false; // Chưa đăng nhập
      }

      if (isOnProtected) {
        if (isLoggedIn) return true;
        return false; // Chuyển hướng về login
      } else if (isLoggedIn && isOnAuth) {
        return Response.redirect(new URL('/', nextUrl)); // Đã login mà vào trang auth -> về trang chủ
      }
      return true;
    },
    async session({ session, token }) {
      if (token?.sub) {
        session.user.id = token.sub;
      }
      if (token?.role) {
        session.user.role = token.role;
      }
      if (token?.avatar) {
        session.user.avatar = token.avatar;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.avatar = user.avatar;
      }
      return token;
    }
  },
};
