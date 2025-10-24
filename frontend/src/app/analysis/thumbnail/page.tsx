"use client";

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { apiClient } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ThumbnailAnalysisPage() {
  const [imageUrl, setImageUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  const fetchHistory = async () => {
    const rows = await apiClient.listThumbnailAnalyses({ limit: 50 });
    setHistory(rows || []);
  };

  useEffect(() => { fetchHistory(); }, []);

  const onAnalyze = async () => {
    if (!imageUrl) { toast.error('Enter an image URL'); return; }
    setLoading(true);
    try {
      const res = await apiClient.analyzeThumbnailHeuristic({ imageUrl });
      setResult(res);
      toast.success('Analyzed');
      fetchHistory();
    } catch (e) {
      toast.error('Failed');
    } finally { setLoading(false); }
  };

  const onUploadAnalyze = async () => {
    if (!file) { toast.error('Choose an image file'); return; }
    setLoading(true);
    try {
      const res = await apiClient.analyzeThumbnail(file);
      setResult(res);
      toast.success('Analyzed');
      fetchHistory();
    } catch (e) {
      toast.error('Failed');
    } finally { setLoading(false); }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Thumbnail Analysis</h1>
          <p className="text-slate-400">Vision-based analysis and recommendations for your thumbnail</p>
        </div>
        <div className="glass p-4 rounded-lg space-y-4">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Analyze by URL</div>
            <input value={imageUrl} onChange={(e)=>setImageUrl(e.target.value)} placeholder="https://..." className="w-full px-3 py-2 bg-background border border-border rounded" />
            <button onClick={onAnalyze} disabled={loading} className="px-4 py-2 bg-primary text-primary-foreground rounded">
              {loading ? (<span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/>Analyzing</span>) : 'Analyze URL'}
            </button>
          </div>

          <div className="h-px bg-border" />

          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Or upload an image</div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                setFile(f || null);
                setFilePreview(f ? URL.createObjectURL(f) : '');
              }}
              className="w-full"
            />
            {filePreview && (
              <img src={filePreview} alt="preview" className="max-h-40 rounded border border-border" />
            )}
            <button onClick={onUploadAnalyze} disabled={loading} className="px-4 py-2 bg-primary text-primary-foreground rounded">
              {loading ? (<span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/>Analyzing</span>) : 'Analyze Upload'}
            </button>
          </div>

          {result && (
            <div className="text-sm p-3 bg-muted rounded border border-border whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </div>
          )}
        </div>
        <div className="space-y-2">
          <div className="font-semibold">History</div>
          <div className="overflow-auto rounded border border-border">
            <table className="min-w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-2 text-left">When</th>
                  <th className="p-2 text-left">Score</th>
                  <th className="p-2 text-left">Preview</th>
                </tr>
              </thead>
              <tbody>
                {history.map((r)=> (
                  <tr key={r.id} className="border-t border-border">
                    <td className="p-2">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="p-2">{r.overall_score ?? '-'}</td>
                    <td className="p-2">
                      {r.details?.imageUrl ? (
                        <img alt="thumb" src={r.details.imageUrl} className="h-10"/>
                      ) : (
                        <span className="text-xs text-muted-foreground">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
