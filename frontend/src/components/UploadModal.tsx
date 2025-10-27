"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { apiClient } from "@/lib/api";
import toast from "react-hot-toast";
import { Upload, X } from "lucide-react";

export function UploadModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: session } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string>("");
  const [privacy, setPrivacy] = useState<"private"|"public"|"unlisted">("private");
  const [publishAt, setPublishAt] = useState<string>("");
  const [madeForKids, setMadeForKids] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const hasUploadScope = ((session as any)?.scopes || []).some((s: string) => s.endsWith("youtube.upload") || s.endsWith("youtube"));

  const requestUploadScope = async () => {
    await signIn("google", {
      prompt: "consent",
      access_type: "offline",
      scope: [
        "openid",
        "email",
        "profile",
        "https://www.googleapis.com/auth/youtube.readonly",
        "https://www.googleapis.com/auth/yt-analytics.readonly",
        "https://www.googleapis.com/auth/youtube.upload",
      ].join(" "),
      redirect: true,
      callbackUrl: "/dashboard",
    } as any);
  };

  const onSubmit = async () => {
    if (!file) { toast.error("Select a video file"); return; }
    if (!hasUploadScope) { toast.error("Grant youtube.upload scope first"); return; }
    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", title);
      fd.append("description", description);
      if (tags.trim()) fd.append("tags", JSON.stringify(tags.split(",").map(t => t.trim()).filter(Boolean)));
      fd.append("privacyStatus", privacy);
      if (publishAt) fd.append("publishAt", new Date(publishAt).toISOString());
      fd.append("madeForKids", String(madeForKids));
      const res = await apiClient.youtubeUpload(fd);
      toast.success("Uploaded: " + (res?.id || "success"));
      onClose();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Upload failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-background rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-semibold flex items-center gap-2"><Upload className="w-4 h-4"/> Upload Video</div>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded"><X className="w-4 h-4"/></button>
        </div>

        {!hasUploadScope && (
          <div className="mb-3 p-3 border border-yellow-600/50 bg-yellow-900/20 rounded text-sm">
            This action requires the <b>youtube.upload</b> scope. Grant permission to continue.
            <div className="mt-2">
              <button onClick={requestUploadScope} className="px-3 py-2 rounded bg-primary text-primary-foreground">Grant youtube.upload</button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3">
          <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="block w-full text-sm" />
          <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} className="w-full px-3 py-2 rounded bg-background border border-border" />
          <textarea placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} className="w-full px-3 py-2 rounded bg-background border border-border" />
          <input placeholder="Tags (comma separated)" value={tags} onChange={e=>setTags(e.target.value)} className="w-full px-3 py-2 rounded bg-background border border-border" />

          <div className="grid grid-cols-2 gap-3">
            <select value={privacy} onChange={e=>setPrivacy(e.target.value as any)} className="px-3 py-2 rounded bg-background border border-border">
              <option value="private">Private</option>
              <option value="unlisted">Unlisted</option>
              <option value="public">Public</option>
            </select>
            <input type="datetime-local" value={publishAt} onChange={e=>setPublishAt(e.target.value)} className="px-3 py-2 rounded bg-background border border-border" />
          </div>

          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={madeForKids} onChange={e=>setMadeForKids(e.target.checked)} />
            Made for kids
          </label>

          <div className="flex justify-end gap-2 mt-2">
            <button onClick={onClose} className="px-3 py-2 rounded bg-muted">Cancel</button>
            <button onClick={onSubmit} disabled={submitting || !hasUploadScope} className="px-3 py-2 rounded bg-primary text-primary-foreground disabled:opacity-50">{submitting?"Uploading…":"Upload"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
