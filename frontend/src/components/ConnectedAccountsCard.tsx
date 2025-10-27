"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import toast from "react-hot-toast";
import { ShieldCheck, LogOut, Link as LinkIcon, PlusCircle, RefreshCcw } from "lucide-react";
import { apiClient } from "@/lib/api";

const BASE_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/yt-analytics.readonly",
];

function uniqueScopes(...groups: string[][]) {
  const set = new Set<string>();
  groups.flat().forEach((s) => set.add(s));
  return Array.from(set);
}

async function requestScopes(newScopes: string[], callbackUrl: string = "/settings") {
  const scopes = uniqueScopes(BASE_SCOPES, newScopes);
  const scopeParam = scopes.join(" ");
  // Trigger Google OAuth with additional scopes; include_granted_scopes is set in provider
  await signIn("google", {
    callbackUrl,
    prompt: "consent",
    access_type: "offline",
    scope: scopeParam,
    // Ensure redirect to Google (NextAuth will forward extra params)
    redirect: true,
  } as any);
}

export function ConnectedAccountsCard() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState<string | null>(null);

  const scopes = ((session as any)?.scopes as string[]) || [];
  const hasUpload = scopes.includes("https://www.googleapis.com/auth/youtube.upload");
  const hasWrite = scopes.includes("https://www.googleapis.com/auth/youtube");

  const handleRequestUpload = async () => {
    try {
      setLoading("upload");
      await requestScopes(["https://www.googleapis.com/auth/youtube.upload"]);
    } catch (e) {
      toast.error("Failed to start authorization");
    } finally {
      setLoading(null);
    }
  };

  const handleRequestWrite = async () => {
    try {
      setLoading("write");
      await requestScopes(["https://www.googleapis.com/auth/youtube"]);
    } catch (e) {
      toast.error("Failed to start authorization");
    } finally {
      setLoading(null);
    }
  };

  const handleDisconnect = async () => {
    try {
      setLoading("disconnect");
      await signOut({ callbackUrl: "/" });
    } finally {
      setLoading(null);
    }
  };

  const handleRevoke = async () => {
    try {
      setLoading("revoke");
      await apiClient.authRevoke();
      toast.success("Access revoked");
      await signOut({ callbackUrl: "/" });
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Failed to revoke");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="glass p-6 rounded-xl space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Connected Accounts</h2>
        <ShieldCheck className="w-5 h-5 text-primary" />
      </div>

      {status === "authenticated" ? (
        <>
          <div className="flex items-center gap-3">
            <img
              src={(session?.user as any)?.image || "/default-avatar.png"}
              alt="Google"
              className="w-10 h-10 rounded-full"
            />
            <div>
              <div className="font-medium">{session?.user?.name}</div>
              <div className="text-sm text-muted-foreground">{session?.user?.email}</div>
            </div>
          </div>

          <div>
            <div className="text-sm font-medium mb-2">Granted scopes</div>
            <div className="flex flex-wrap gap-2">
              {(scopes.length ? scopes : BASE_SCOPES).map((s) => (
                <span key={s} className="px-2 py-1 text-xs rounded bg-background border border-border">
                  {s.replace("https://www.googleapis.com/auth/", "")}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleRequestUpload}
              disabled={loading !== null || hasUpload}
              className="px-3 py-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50 flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              {hasUpload ? "Upload scope granted" : loading === "upload" ? "Requesting…" : "Grant youtube.upload"}
            </button>

            <button
              onClick={handleRequestWrite}
              disabled={loading !== null || hasWrite}
              className="px-3 py-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50 flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              {hasWrite ? "Write scope granted" : loading === "write" ? "Requesting…" : "Grant youtube (write)"}
            </button>

            <button
              onClick={handleDisconnect}
              disabled={loading !== null}
              className="px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Disconnect Google
            </button>

            <a
              href="https://myaccount.google.com/permissions"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 rounded-lg bg-background border border-border hover:border-primary flex items-center gap-2"
            >
              <RefreshCcw className="w-4 h-4" /> Manage in Google
            </a>

            <button
              onClick={handleRevoke}
              disabled={loading !== null}
              className="px-3 py-2 rounded-lg bg-destructive text-destructive-foreground hover:opacity-90"
            >
              Revoke Access
            </button>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-3">
          <LinkIcon className="w-4 h-4" />
          <div className="text-sm">Sign in to connect your Google account and manage YouTube permissions.</div>
        </div>
      )}
    </div>
  );
}
