"use client";

import { useEffect } from 'react';
import { LandingHeader } from '@/components/landing-header';

export default function ExtensionPage() {
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const urls = {
      chrome: process.env.NEXT_PUBLIC_EXTENSION_URL_CHROME,
      edge: process.env.NEXT_PUBLIC_EXTENSION_URL_EDGE,
      firefox: process.env.NEXT_PUBLIC_EXTENSION_URL_FIREFOX,
      opera: process.env.NEXT_PUBLIC_EXTENSION_URL_OPERA,
    } as const;

    let target = urls.chrome || '/';
    if (ua.includes('edg/')) target = urls.edge || urls.chrome || '/';
    else if (ua.includes('firefox')) target = urls.firefox || urls.chrome || '/';
    else if (ua.includes('opr/') || ua.includes('opera')) target = urls.opera || urls.chrome || '/';

    // Fallback safety to home if no envs configured
    if (!target) target = '/';
    window.location.replace(target);
  }, []);

  return (
    <>
      <LandingHeader />
      <main className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold">Redirecting to your browser's extension store…</h1>
        <p className="mt-2 text-muted-foreground">If nothing happens, please check your pop‑up blocker or go back to Home.</p>
      </main>
    </>
  );
}
