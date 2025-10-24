import type { Metadata } from 'next';
import { LandingHeader } from '@/components/landing-header';

export const metadata: Metadata = {
  title: 'Legal Disclaimer — Growth AI',
  description:
    'Legal notice and ownership statement for Growth AI. Independent SaaS; not affiliated with YouTube or Google. Data via official APIs in compliance with policies.',
  keywords: [
    'Legal Disclaimer',
    'Growth AI legal',
    'YouTube Data API',
    'YouTube Analytics API',
    'Ownership',
  ],
  openGraph: {
    title: 'Legal Disclaimer — Growth AI',
    description:
      'Growth AI is an independent SaaS and is not affiliated with YouTube or Google. Data shown is fetched via official APIs in compliance with policies.',
    type: 'article',
  },
};

export default function DisclaimerPage() {
  return (
    <>
      <LandingHeader />
      <main className="max-w-5xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">⚖️ Legal Disclaimer</h1>
      </header>

      <section className="space-y-3 mb-8">
        <h2 className="text-2xl font-semibold">Legal Notice</h2>
        <p className="text-muted-foreground">
          Growth AI is an independent SaaS platform and is not affiliated, associated, or endorsed by YouTube, Google LLC, or any of its subsidiaries.
        </p>
        <p className="text-muted-foreground">
          All data shown within Growth AI is fetched using official YouTube Data API and YouTube Analytics API with full compliance to Google’s developer policies.
        </p>
        <p className="text-muted-foreground">
          Users retain all rights to their YouTube content, and no data is stored or shared without user consent.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Ownership</h2>
        <p className="text-muted-foreground">
          All platform code, design, and algorithms are owned and copyrighted © by Growth AI Technologies.
        </p>
        <p className="text-muted-foreground">
          Any unauthorized copying or resale of our platform or data is strictly prohibited.
        </p>
      </section>
      </main>
    </>
  );
}
