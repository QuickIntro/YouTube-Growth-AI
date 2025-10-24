"use client";

import Link from "next/link";

export function LandingHeader() {
  return (
    <header className="w-full py-4 sticky top-0 z-50 border-b border-white/5 bg-black/30 backdrop-blur supports-[backdrop-filter]:bg-black/20">
      <div className="mx-auto max-w-7xl px-6 flex items-center justify-between relative" role="navigation" aria-label="Primary">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-md flex items-center justify-center text-white font-bold">YG</div>
          <div>
            <div className="font-semibold">YouTube Growth AI</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
          <Link href="/#features" className="text-black hover:text-white hover:font-semibold">Features</Link>
          <Link href="/#how" className="text-black hover:text-white hover:font-semibold">How it works</Link>
          <Link href="/#tools" className="text-black hover:text-white hover:font-semibold">Popular tools</Link>
          <Link href="/#testimonials" className="text-black hover:text-white hover:font-semibold">Testimonials</Link>
          <Link href="/#integrations" className="text-black hover:text-white hover:font-semibold">Integrations</Link>
          <Link href="/#faq" className="text-black hover:text-white hover:font-semibold">FAQ</Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/extension"
            className="px-4 py-2 rounded-md bg-slate-800 text-slate-100 hover:bg-slate-700"
          >
            Extension
          </Link>
          <Link href="/auth/signin" className="px-4 py-2 rounded-md bg-slate-800 text-slate-100 hover:bg-slate-700">
            Sign in with Google
          </Link>
        </div>

        <button className="md:hidden p-2 rounded-md bg-slate-800">☰</button>
      </div>
    </header>
  );
}
