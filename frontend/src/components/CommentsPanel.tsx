"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { MessageSquare, Send, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";

export function CommentsPanel({ videoId }: { videoId: string }) {
  const { data: session } = useSession();
  const qc = useQueryClient();
  const [replyMap, setReplyMap] = useState<Record<string, string>>({});

  const scopes = ((session as any)?.scopes || []) as string[];
  const hasWrite = scopes.some((s) => s.endsWith("youtube"));

  const { data, isLoading, error } = useQuery({
    queryKey: ["yt-comments", videoId],
    queryFn: () => apiClient.youtubeComments(videoId, 20),
    enabled: !!videoId,
  });

  const replyMutation = useMutation({
    mutationFn: ({ parentId, text }: { parentId: string; text: string }) => apiClient.youtubeReply(parentId, text),
    onSuccess: () => {
      toast.success("Replied");
      qc.invalidateQueries({ queryKey: ["yt-comments", videoId] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || e?.message || "Reply failed"),
  });

  const moderateMutation = useMutation({
    mutationFn: ({ commentId, action }: { commentId: string; action: string }) => apiClient.youtubeModerate(commentId, action),
    onSuccess: () => {
      toast.success("Updated comment");
      qc.invalidateQueries({ queryKey: ["yt-comments", videoId] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || e?.message || "Action failed"),
  });

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

  return (
    <div className="glass p-4 rounded-xl">
      <div className="flex items-center gap-2 mb-3"><MessageSquare className="w-4 h-4"/> <h3 className="text-lg font-semibold">Comments</h3></div>
      {!hasWrite && (
        <div className="mb-3 p-3 border border-yellow-600/50 bg-yellow-900/20 rounded text-sm flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 mt-0.5"/>
          <div>
            Reply and moderation require the <b>youtube</b> scope.
            <div className="mt-2"><button onClick={requestWriteScope} className="px-3 py-1.5 rounded bg-primary text-primary-foreground">Grant youtube (write)</button></div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading comments…</div>
      ) : error ? (
        <div className="text-sm text-destructive">Failed to load comments</div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-auto pr-1">
          {(data?.items || []).map((thread: any) => {
            const top = thread.snippet?.topLevelComment;
            const commentId = top?.id;
            const text = top?.snippet?.textDisplay || top?.snippet?.textOriginal;
            const parentId = thread.id;
            return (
              <div key={thread.id} className="p-3 rounded border border-border">
                <div className="text-sm"><span className="font-medium">{top?.snippet?.authorDisplayName}</span> · {new Date(top?.snippet?.publishedAt || top?.snippet?.updatedAt || Date.now()).toLocaleString()}</div>
                <div className="mt-1 text-sm whitespace-pre-wrap">{text}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button disabled={!hasWrite} onClick={() => moderateMutation.mutate({ commentId, action: 'approve' })} className="px-2 py-1 text-xs rounded bg-muted disabled:opacity-50">Approve</button>
                  <button disabled={!hasWrite} onClick={() => moderateMutation.mutate({ commentId, action: 'reject' })} className="px-2 py-1 text-xs rounded bg-muted disabled:opacity-50">Reject</button>
                  <button disabled={!hasWrite} onClick={() => moderateMutation.mutate({ commentId, action: 'spam' })} className="px-2 py-1 text-xs rounded bg-muted disabled:opacity-50">Mark spam</button>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    placeholder="Reply…"
                    value={replyMap[parentId] || ''}
                    onChange={(e) => setReplyMap((m) => ({ ...m, [parentId]: e.target.value }))}
                    className="flex-1 px-2 py-1 rounded bg-background border border-border text-sm"
                  />
                  <button disabled={!hasWrite} onClick={() => replyMutation.mutate({ parentId, text: replyMap[parentId] || '' })} className="px-2 py-1 text-xs rounded bg-primary text-primary-foreground disabled:opacity-50 flex items-center gap-1"><Send className="w-3 h-3"/> Reply</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
