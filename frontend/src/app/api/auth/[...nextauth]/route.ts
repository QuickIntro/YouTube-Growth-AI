import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import axios from 'axios';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'development-secret';
if (!process.env.NEXTAUTH_SECRET && process.env.NODE_ENV === 'production') {
  // eslint-disable-next-line no-console
  console.warn('[NextAuth] NEXTAUTH_SECRET is not set. Using an insecure default. Set NEXTAUTH_SECRET in production.');
}

async function refreshGoogleAccessToken(token: any) {
  try {
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: 'refresh_token',
      refresh_token: token.refreshToken,
    });

    const { data } = await axios.post(
      'https://oauth2.googleapis.com/token',
      params,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    return {
      ...token,
      accessToken: data.access_token,
      expiresAt: Math.floor(Date.now() / 1000) + (data.expires_in ?? 3600),
      // Google may return updated scopes string on refresh
      scope: data.scope ?? token.scope,
      // Only update refreshToken if Google returns a new one
      refreshToken: data.refresh_token ?? token.refreshToken,
      error: undefined,
    };
  } catch (error) {
    console.error('Failed to refresh Google access token', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
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
          include_granted_scopes: 'true',
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
      // Initial sign-in or scope upgrade
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token ?? token.refreshToken;
        token.expiresAt = account.expires_at ?? Math.floor(Date.now() / 1000) + 3600;
        token.scope = (account as any).scope ?? token.scope; // space-separated

        // Save user to backend (optional sync already present)
        try {
          const { data } = await axios.post(`${BACKEND_URL}/api/auth/google`, {
            email: profile?.email,
            name: profile?.name,
            picture: (profile as any)?.picture,
            accessToken: account.access_token,
            refreshToken: account.refresh_token,
            googleId: (profile as any)?.sub,
          });
          if (data?.access_token) {
            (token as any).backendToken = data.access_token;
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
        return token;
      }

      // Return previous token if access token is still valid (60s buffer)
      if (token.expiresAt && (Date.now() / 1000) < (token.expiresAt as number - 60)) {
        return token;
      }

      // Refresh the access token if we have a refresh token
      if (token.refreshToken) {
        return await refreshGoogleAccessToken(token);
      }

      // No refresh token available; return token as-is
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      (session as any).backendToken = (token as any).backendToken as string | undefined;
      if ((token as any).role) {
        (session.user as any).role = (token as any).role;
      }
      // Expose granted scopes as array for UI
      (session as any).scopes = typeof (token as any).scope === 'string'
        ? ((token as any).scope as string).split(' ')
        : [];
      // Surface refresh errors if any
      if ((token as any).error) {
        (session as any).error = (token as any).error;
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
