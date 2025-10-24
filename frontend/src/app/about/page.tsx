import type { Metadata } from 'next';
import { LandingHeader } from '@/components/landing-header';

export const metadata: Metadata = {
  title: 'About Growth AI — Your Smart YouTube Growth Partner',
  description:
    'Growth AI is a free, smart YouTube optimization and analytics partner. Analyze channel data, find trending keywords, and optimize titles, tags, and descriptions to grow faster.',
  keywords: [
    'About Growth AI',
    'YouTube Growth AI',
    'YouTube SEO tools',
    'YouTube analytics',
    'AI for YouTube',
    'YouTube optimization',
  ],
  openGraph: {
    title: 'About Growth AI — Your Smart YouTube Growth Partner',
    description:
      'Welcome to Growth AI, the ultimate YouTube optimization and analytics tool designed to help creators grow faster — smarter.',
    type: 'article',
  },
};

export default function AboutPage() {
  return (
    <>
      <LandingHeader />
      <main className="max-w-5xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">About Growth AI — Your Smart YouTube Growth Partner</h1>
        <p className="text-muted-foreground">
          Welcome to <strong>Growth AI</strong>, the ultimate YouTube optimization and analytics tool designed to help creators grow faster — smarter! 🚀
        </p>
        <p className="text-muted-foreground mt-2">
          We help YouTubers, brands, and marketers analyze channel data, discover trending keywords, and optimize videos for maximum visibility.
        </p>
      </header>

      <section className="space-y-3 mb-10">
        <h2 className="text-2xl font-semibold">Our Mission</h2>
        <p className="text-muted-foreground">
          At Growth AI, our mission is simple — <strong>Empower every creator with AI‑powered insights to grow their YouTube channel organically</strong>.
        </p>
        <p className="text-muted-foreground">
          We believe in transparency, creativity, and smart data. Whether you’re a new YouTuber or an experienced creator, Growth AI provides tools to:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Analyze your YouTube performance</li>
          <li>Find viral video ideas</li>
          <li>Improve titles, tags, and descriptions</li>
          <li>Track audience engagement</li>
          <li>Get real‑time SEO reports</li>
        </ul>
      </section>

      <section className="space-y-3 mb-10">
        <h2 className="text-2xl font-semibold">Why Choose Growth AI</h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>✅ 100% Free to use</li>
          <li>✅ Safe & secure with Google OAuth</li>
          <li>✅ Accurate YouTube analytics powered by official APIs</li>
          <li>✅ Continuous improvement through machine learning</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Join thousands of creators</h2>
        <p className="text-muted-foreground">
          Join thousands of creators using Growth AI to level up their YouTube game! Your growth starts here. 🌟
        </p>
      </section>
      </main>
    </>
  );
}
