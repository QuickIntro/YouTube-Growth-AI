import type { Metadata } from 'next';
import { LandingHeader } from '@/components/landing-header';

export const metadata: Metadata = {
  title: 'Contact — YouTube Growth AI',
  description:
    'Contact YouTube Growth AI. Ask questions, report issues, or suggest features for our free AI tools for YouTube creators.',
  keywords: ['Contact', 'Support', 'YouTube Growth AI', 'YouTube tools'],
  openGraph: {
    title: 'Contact — YouTube Growth AI',
    description:
      'Reach out to the YouTube Growth AI team. We value your feedback and suggestions.',
    type: 'article',
  },
};

export default function ContactPage() {
  return (
    <>
      <LandingHeader />
      <main className="max-w-5xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Contact</h1>
        <p className="text-muted-foreground">
          We love hearing from creators. Send us your questions, ideas, or bug reports.
        </p>
      </header>

      <section className="space-y-4 mb-10">
        <h2 className="text-2xl font-semibold">Email</h2>
        <p className="text-muted-foreground">
          Email us at <a href="mailto:support@youtubegrowth.ai" className="text-primary underline">support@youtubegrowth.ai</a> and we’ll reply within 2 business days.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Feature requests</h2>
        <p className="text-muted-foreground">
          Have an idea that would help your workflow? Open an issue on our GitHub repository or email us directly.
        </p>
      </section>
      </main>
    </>
  );
}
