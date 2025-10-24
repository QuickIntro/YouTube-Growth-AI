import type { Metadata } from 'next';
import { Inter, Noto_Sans_Bengali } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { AppShell } from '@/components/app-shell';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const notoSansBengali = Noto_Sans_Bengali({
  subsets: ['bengali'],
  variable: '--font-noto-sans-bengali',
});

export const metadata: Metadata = {
  title: 'YouTube Growth AI — Free AI Tools for YouTube SEO & Channel Growth',
  description: 'Free AI tools for YouTube creators: keyword research, titles, descriptions, thumbnail analysis, and channel analytics. Grow views, CTR, and watch time with one‑click optimizations.',
  keywords: ['YouTube SEO', 'YouTube growth', 'YouTube keywords', 'titles', 'descriptions', 'thumbnail analysis', 'CTR', 'watch time', 'AI tools for YouTube', 'free'],
  authors: [{ name: 'YouTube Growth AI Team' }],
  openGraph: {
    title: 'YouTube Growth AI — Free AI Tools for YouTube SEO & Channel Growth',
    description: 'Keyword research, AI titles & descriptions, thumbnail analyzer, and channel analytics — free for creators.',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'YouTube Growth AI preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YouTube Growth AI — Free AI Tools for YouTube SEO & Channel Growth',
    description: 'Grow faster with AI: keywords, titles, descriptions, thumbnails, analytics.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${inter.variable} ${notoSansBengali.variable} font-sans antialiased`}
      >
        <Providers>
          <AppShell>
            {children}
          </AppShell>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e293b',
                color: '#f1f5f9',
                border: '1px solid #334155',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
