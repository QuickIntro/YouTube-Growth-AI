"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { apiClient } from "@/lib/api";
import toast from "react-hot-toast";
import { CalendarClock, X } from "lucide-react";

export function ScheduleModal({ open, onClose, videoId }: { open: boolean; onClose: () => void; videoId: string }) {
  const { data: session } = useSession();
  const [publishAt, setPublishAt] = useState("");
  const [privacy, setPrivacy] = useState<"private"|"public"|"unlisted">("private");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const hasWrite = ((session as any)?.scopes || []).some((s: string) => s.endsWith("youtube"));

  const requestWriteScope = async () => {
    await signIn("google", {
      prompt: "consent",
      access_type: "offline",
      scope: [
        "openid",
        "email",
        "profile",
        "https://www.googleapis.com/auth/youtube.readonly",
        "https://www.googleapis.com/auth/yt-analytics.readonly",
        "https://www.googleapis.com/auth/youtube",
      ].join(" "),
      redirect: true,
      callbackUrl: "/dashboard",
    } as any);
  };

  const onSubmit = async () => {
    if (!videoId) { toast.error("Missing videoId"); return; }
    if (!hasWrite) { toast.error("Grant youtube (write) scope first"); return; }
    try {
      setSubmitting(true);
      await apiClient.youtubeUpdate({
        videoId,
        privacyStatus: privacy,
        publishAt: publishAt ? new Date(publishAt).toISOString() : undefined,
      });
      toast.success("Scheduled/updated");
      onClose();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-background rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-semibold flex items-center gap-2"><CalendarClock className="w-4 h-4"/> Schedule/Update</div>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded"><X className="w-4 h-4"/></button>
        </div>

        {!hasWrite && (
          <div className="mb-3 p-3 border border-yellow-600/50 bg-yellow-900/20 rounded text-sm">
            This action requires the <b>youtube</b> scope. Grant permission to continue.
            <div className="mt-2">
              <button onClick={requestWriteScope} className="px-3 py-2 rounded bg-primary text-primary-foreground">Grant youtube (write)</button>
            </div>
          </div>
        )}

        <div className="grid gap-3">
          <input type="datetime-local" value={publishAt} onChange={e=>setPublishAt(e.target.value)} className="px-3 py-2 rounded bg-background border border-border" />
          <select value={privacy} onChange={e=>setPrivacy(e.target.value as any)} className="px-3 py-2 rounded bg-background border border-border">
            <option value="private">Private</option>
            <option value="unlisted">Unlisted</option>
            <option value="public">Public</option>
          </select>
          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-3 py-2 rounded bg-muted">Cancel</button>
            <button onClick={onSubmit} disabled={submitting || !hasWrite} className="px-3 py-2 rounded bg-primary text-primary-foreground disabled:opacity-50">{submitting?"Saving…":"Save"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
