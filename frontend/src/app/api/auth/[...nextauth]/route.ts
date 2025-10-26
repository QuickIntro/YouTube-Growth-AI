import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import axios from 'axios';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'development-secret';
if (!process.env.NEXTAUTH_SECRET && process.env.NODE_ENV === 'production') {
  // eslint-disable-next-line no-console
  console.warn('[NextAuth] NEXTAUTH_SECRET is not set. Using an insecure default. Set NEXTAUTH_SECRET in production.');
}

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            'openid',
            'email',
            'profile',
            'https://www.googleapis.com/auth/youtube.readonly',
            'https://www.googleapis.com/auth/yt-analytics.readonly',
          ].join(' '),
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],
  debug: process.env.NODE_ENV !== 'production',
  logger: {
    error(code, metadata) {
      console.error('[next-auth][error]', code, metadata);
    },
    warn(code) {
      console.warn('[next-auth][warn]', code);
    },
    debug(code, metadata) {
      console.debug('[next-auth][debug]', code, metadata);
    },
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
        
        // Save user to backend
        try {
          const { data } = await axios.post(`${BACKEND_URL}/api/auth/google`, {
            email: profile?.email,
            name: profile?.name,
            picture: (profile as any)?.picture,
            accessToken: account.access_token,
            refreshToken: account.refresh_token,
            googleId: (profile as any)?.sub,
          });
          // Persist backend JWT into our NextAuth token for client API calls
          if (data?.access_token) {
            (token as any).backendToken = data.access_token;
            // Fetch user profile to extract role and persist to token
            try {
              const me = await axios.get(`${BACKEND_URL}/api/auth/me`, {
                headers: { Authorization: `Bearer ${data.access_token}` },
              });
              if (me?.data?.role) {
                (token as any).role = me.data.role;
              }
            } catch {}
          }
        } catch (error) {
          console.error('Error saving user to backend:', error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      (session as any).backendToken = (token as any).backendToken as string | undefined;
      if ((token as any).role) {
        (session.user as any).role = (token as any).role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
