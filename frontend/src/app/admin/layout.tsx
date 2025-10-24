"use client";

import Link from 'next/link';
import { AdminGuard } from '@/components/admin-guard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <aside className="sticky top-0 z-40 bg-slate-900/70 backdrop-blur border-b border-slate-800">
          <div className="mx-auto max-w-7xl px-6 h-14 flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-md flex items-center justify-center text-white font-bold text-sm">YG</div>
              <span className="font-semibold">Admin</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm text-slate-300">
              <Link href="/admin" className="hover:text-white">Overview</Link>
              <Link href="/admin/usage/ai" className="hover:text-white">AI Usage</Link>
              <Link href="/admin/usage/youtube" className="hover:text-white">YouTube Usage</Link>
              <Link href="/admin/errors" className="hover:text-white">Errors</Link>
              <Link href="/admin/users" className="hover:text-white">Users</Link>
            </nav>
          </div>
        </aside>
        <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
      </div>
    </AdminGuard>
  );
}
