"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { ListMusic, Plus, Trash2, ArrowUp, ArrowDown, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";

export function PlaylistsPanel({ selectedVideoId }: { selectedVideoId?: string }) {
  const { data: session } = useSession();
  const qc = useQueryClient();
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);

  const scopes = ((session as any)?.scopes || []) as string[];
  const hasWrite = scopes.some((s) => s.endsWith("youtube"));

  const playlists = useQuery({
    queryKey: ["yt-playlists"],
    queryFn: () => apiClient.youtubePlaylists(),
  });

  const items = useQuery({
    queryKey: ["yt-playlist-items", selectedPlaylist],
    queryFn: () => apiClient.youtubePlaylistItems(selectedPlaylist!, 50),
    enabled: !!selectedPlaylist,
  });

  const addMutation = useMutation({
    mutationFn: ({ playlistId, videoId }: { playlistId: string; videoId: string }) => apiClient.youtubePlaylistAdd(playlistId, videoId),
    onSuccess: () => {
      toast.success("Added to playlist");
      qc.invalidateQueries({ queryKey: ["yt-playlist-items", selectedPlaylist] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || e?.message || "Add failed"),
  });

  const removeMutation = useMutation({
    mutationFn: (playlistItemId: string) => apiClient.youtubePlaylistRemove(playlistItemId),
    onSuccess: () => {
      toast.success("Removed from playlist");
      qc.invalidateQueries({ queryKey: ["yt-playlist-items", selectedPlaylist] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || e?.message || "Remove failed"),
  });

  const reorderMutation = useMutation({
    mutationFn: ({ playlistItemId, position }: { playlistItemId: string; position: number }) => apiClient.youtubePlaylistReorder(playlistItemId, position),
    onSuccess: () => {
      toast.success("Reordered");
      qc.invalidateQueries({ queryKey: ["yt-playlist-items", selectedPlaylist] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || e?.message || "Reorder failed"),
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

  useEffect(() => {
    if (!selectedPlaylist && playlists.data?.length) {
      setSelectedPlaylist(playlists.data[0].id);
    }
  }, [playlists.data, selectedPlaylist]);

  return (
    <div className="glass p-4 rounded-xl">
      <div className="flex items-center gap-2 mb-3"><ListMusic className="w-4 h-4"/> <h3 className="text-lg font-semibold">Playlists</h3></div>

      {!hasWrite && (
        <div className="mb-3 p-3 border border-yellow-600/50 bg-yellow-900/20 rounded text-sm flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 mt-0.5"/>
          <div>
            Playlist edits require the <b>youtube</b> scope.
            <div className="mt-2"><button onClick={requestWriteScope} className="px-3 py-1.5 rounded bg-primary text-primary-foreground">Grant youtube (write)</button></div>
          </div>
        </div>
      )}

      <div className="grid gap-3">
        <select value={selectedPlaylist || ''} onChange={(e)=>setSelectedPlaylist(e.target.value)} className="px-2 py-1 rounded bg-background border border-border">
          {(playlists.data || []).map((p: any) => (
            <option key={p.id} value={p.id}>{p.snippet?.title}</option>
          ))}
        </select>

        {selectedPlaylist && (
          <div className="space-y-2 max-h-96 overflow-auto pr-1">
            {(items.data?.items || []).map((it: any, idx: number) => (
              <div key={it.id} className="flex items-center justify-between p-2 rounded border border-border">
                <div className="flex items-center gap-2 min-w-0">
                  <img src={it.snippet?.thumbnails?.default?.url || it.snippet?.thumbnails?.medium?.url} className="w-14 h-8 object-cover rounded"/>
                  <div className="truncate text-sm">{it.snippet?.title}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button disabled={!hasWrite || idx === 0} onClick={() => reorderMutation.mutate({ playlistItemId: it.id, position: Math.max(0, (it.snippet?.position || idx) - 1) })} className="p-1 rounded bg-muted disabled:opacity-50"><ArrowUp className="w-4 h-4"/></button>
                  <button disabled={!hasWrite} onClick={() => reorderMutation.mutate({ playlistItemId: it.id, position: (it.snippet?.position || idx) + 1 })} className="p-1 rounded bg-muted disabled:opacity-50"><ArrowDown className="w-4 h-4"/></button>
                  <button disabled={!hasWrite} onClick={() => removeMutation.mutate(it.id)} className="p-1 rounded bg-muted disabled:opacity-50"><Trash2 className="w-4 h-4"/></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!!selectedVideoId && !!selectedPlaylist && (
          <button disabled={!hasWrite} onClick={() => addMutation.mutate({ playlistId: selectedPlaylist!, videoId: selectedVideoId })} className="px-3 py-2 rounded bg-primary text-primary-foreground disabled:opacity-50 flex items-center gap-2"><Plus className="w-4 h-4"/> Add selected video</button>
        )}
      </div>
    </div>
  );
}
