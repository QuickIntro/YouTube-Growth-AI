"use client";

import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard-layout';

export default function AnalysisIndexPage() {
  const items = [
    { name: 'Title Analysis', href: '/analysis/title', desc: 'Analyze and score your video titles' },
    { name: 'Description Analysis', href: '/analysis/description', desc: 'Analyze descriptions for SEO best practices' },
    { name: 'Tag Analysis', href: '/analysis/tags', desc: 'Evaluate tag coverage and get suggestions' },
    { name: 'Thumbnail Analysis', href: '/analysis/thumbnail', desc: 'Vision-based analysis of your thumbnail' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analysis Tools</h1>
          <p className="text-slate-400">Deep-dive analysis for titles, descriptions, tags, and thumbnails</p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {items.map((it) => (
            <Link key={it.href} href={it.href} className="rounded-lg border border-border p-4 hover:bg-muted transition-colors">
              <div className="text-lg font-semibold">{it.name}</div>
              <div className="text-sm text-muted-foreground">{it.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
