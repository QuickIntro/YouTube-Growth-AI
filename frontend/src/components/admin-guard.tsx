"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await apiClient.adminOverview();
        if (mounted) setOk(true);
      } catch (e: any) {
        if (mounted) setOk(false);
        router.replace('/');
      }
    })();
    return () => {
      mounted = false;
    };
  }, [router]);

  if (ok === null) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-slate-400">Checking admin access…</div>
    );
  }
  if (!ok) return null;
  return <>{children}</>;
}
