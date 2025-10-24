import type { Metadata } from 'next';
import { LandingHeader } from '@/components/landing-header';

export const metadata: Metadata = {
  title: 'Privacy Policy — Growth AI',
  description:
    'Your privacy is extremely important to us. Learn how Growth AI collects, uses, and protects your data, including Google OAuth info, YouTube read-only data, cookies, and your rights.',
  keywords: [
    'Privacy Policy',
    'Growth AI privacy',
    'Google OAuth',
    'YouTube analytics data',
    'Cookies',
    'Data deletion',
  ],
  openGraph: {
    title: 'Privacy Policy — Growth AI',
    description:
      'How Growth AI collects, uses, and protects your data. Learn about Google OAuth info, YouTube read-only data, cookies, and your rights.',
    type: 'article',
  },
};

export default function PrivacyPage() {
  return (
    <>
      <LandingHeader />
      <main className="max-w-5xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">🔒 Privacy Policy</h1>
        <p className="text-muted-foreground">
          Your privacy is extremely important to us. This Privacy Policy explains how Growth AI collects, uses, and protects your data when you use our platform.
        </p>
      </header>

      <section className="space-y-3 mb-8">
        <h2 className="text-2xl font-semibold">1. Introduction</h2>
        <p className="text-muted-foreground">
          Your privacy is extremely important to us. This Privacy Policy explains how Growth AI collects, uses, and protects your data when you use our platform.
        </p>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-2xl font-semibold">2. Information We Collect</h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li><strong>Google Account Info</strong>: Name, email, and profile image (via OAuth).</li>
          <li><strong>YouTube Data</strong>: Channel statistics, analytics, and performance data (read‑only).</li>
          <li><strong>Usage Data</strong>: Browser type, IP address, and interactions (for analytics).</li>
        </ul>
        <p className="text-muted-foreground">We never collect passwords or sensitive credentials.</p>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-2xl font-semibold">3. How We Use Your Data</h2>
        <p className="text-muted-foreground">We use your information to:</p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Display personalized YouTube analytics</li>
          <li>Improve platform performance</li>
          <li>Provide AI‑based recommendations</li>
          <li>Secure your account sessions</li>
        </ul>
        <p className="text-muted-foreground">We do not sell or share your personal data with third parties.</p>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-2xl font-semibold">4. Data Security</h2>
        <p className="text-muted-foreground">
          All data is encrypted via HTTPS and stored securely in cloud databases. You can revoke Growth AI’s access at any time from your Google Account Permissions.
        </p>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-2xl font-semibold">5. Cookies</h2>
        <p className="text-muted-foreground">We use cookies for:</p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Authentication sessions</li>
          <li>Analytics tracking</li>
          <li>User preferences</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">6. Your Rights</h2>
        <p className="text-muted-foreground">
          You can request data deletion or account removal by contacting us at
          {' '}<a href="mailto:support@growthai.app" className="text-primary underline">support@growthai.app</a>.
        </p>
      </section>
      </main>
    </>
  );
}
