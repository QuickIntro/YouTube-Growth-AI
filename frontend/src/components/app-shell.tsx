"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "./site-footer";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  // Hide global header/footer on app sections
  const hideChrome = (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/analytics") ||
    pathname.startsWith("/thumbnail") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/tools") ||
    pathname.startsWith("/admin")
  );

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">{children}</main>
      {!hideChrome && <SiteFooter />}
    </div>
  );
}
