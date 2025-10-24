"use client";

import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="w-full sticky top-0 z-50 border-b border-white/5 bg-black/30 backdrop-blur supports-[backdrop-filter]:bg-black/20">
      <div className="mx-auto max-w-7xl px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-md flex items-center justify-center text-white font-bold text-sm">YG</div>
          <div className="font-semibold">YouTube Growth AI</div>
        </Link>
        <nav className="hidden md:flex items-center gap-5">
          <Link href="/" className="text-slate-300 hover:text-white">Home</Link>
          <Link href="/extension" className="text-slate-300 hover:text-white">Extension</Link>
          <Link href="/about" className="text-slate-300 hover:text-white">About</Link>
          <Link href="/contact" className="text-slate-300 hover:text-white">Contact</Link>
          <Link href="/auth/signin" className="px-3 py-1.5 rounded-md bg-slate-800 text-slate-100 hover:bg-slate-700">Sign in</Link>
        </nav>
      </div>
    </header>
  );
}
