import type { Metadata } from 'next';
import { LandingHeader } from '@/components/landing-header';

export const metadata: Metadata = {
  title: 'Terms of Service — Growth AI',
  description:
    'By using Growth AI, you agree to these Terms of Service and our Privacy Policy. Learn about acceptable use, account requirements, disclaimers, termination, and limitations of liability.',
  keywords: [
    'Terms of Service',
    'Growth AI terms',
    'Acceptable use',
    'YouTube API policy',
    'Liability',
  ],
  openGraph: {
    title: 'Terms of Service — Growth AI',
    description:
      'Acceptance, access and usage, account rules, disclaimers, termination policy, limitations of liability, and contact details for Growth AI.',
    type: 'article',
  },
};

export default function TermsPage() {
  return (
    <>
      <LandingHeader />
      <main className="max-w-5xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">📜 Terms of Service</h1>
      </header>

      <section className="space-y-3 mb-8">
        <h2 className="text-2xl font-semibold">1. Acceptance</h2>
        <p className="text-muted-foreground">
          By using Growth AI, you agree to these Terms of Service and our Privacy Policy. If you disagree, you must stop using the platform immediately.
        </p>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-2xl font-semibold">2. Access and Usage</h2>
        <p className="text-muted-foreground">You are granted a personal, non‑transferable, and limited license to use Growth AI. You must not:</p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Misuse the API access</li>
          <li>Attempt to reverse‑engineer or resell the platform</li>
          <li>Upload harmful content or spam</li>
        </ul>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-2xl font-semibold">3. Account</h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>You must log in using your Google account.</li>
          <li>You are responsible for maintaining your account security.</li>
        </ul>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-2xl font-semibold">4. Disclaimer</h2>
        <p className="text-muted-foreground">Growth AI provides analytical and AI‑based suggestions. We do not guarantee exact growth or monetization results. Use the tool at your own discretion.</p>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-2xl font-semibold">5. Termination</h2>
        <p className="text-muted-foreground">We reserve the right to suspend any account violating our terms or Google API policies.</p>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-2xl font-semibold">6. Limitation of Liability</h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>API interruptions or Google service outages</li>
          <li>Loss of data caused by third‑party issues</li>
          <li>Incorrect analytics or prediction errors</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">7. Contact</h2>
        <p className="text-muted-foreground">
          For any questions, please email us at
          {' '}<a href="mailto:support@growthai.app" className="text-primary underline">support@growthai.app</a>
          {' '}or visit{' '}<a href="https://growthai.app" target="_blank" rel="noopener noreferrer" className="text-primary underline">https://growthai.app</a>.
        </p>
      </section>
      </main>
    </>
  );
}
