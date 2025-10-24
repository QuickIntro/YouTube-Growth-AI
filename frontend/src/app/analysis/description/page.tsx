"use client";

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { apiClient } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DescriptionAnalysisPage() {
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState<'bn'|'en'>('bn');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  const fetchHistory = async () => {
    const rows = await apiClient.listDescriptionAnalyses({ limit: 50 });
    setHistory(rows || []);
  };

  useEffect(() => { fetchHistory(); }, []);

  const onAnalyze = async () => {
    if (!description) { toast.error('Enter a description'); return; }
    setLoading(true);
    try {
      const res = await apiClient.analyzeDescriptionText({ description, language });
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
          <h1 className="text-2xl font-bold">Description Analysis</h1>
          <p className="text-slate-400">Analyze and score your video descriptions</p>
        </div>
        <div className="glass p-4 rounded-lg space-y-4">
          <textarea value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Paste description" rows={6} className="w-full px-3 py-2 bg-background border border-border rounded" />
          <select value={language} onChange={(e)=>setLanguage(e.target.value as any)} className="px-3 py-2 bg-background border border-border rounded w-full md:w-auto">
            <option value="bn">Bangla</option>
            <option value="en">English</option>
          </select>
          <button onClick={onAnalyze} disabled={loading} className="px-4 py-2 bg-primary text-primary-foreground rounded">
            {loading ? (<span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/>Analyzing</span>) : 'Analyze'}
          </button>
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
                  <th className="p-2 text-left">Excerpt</th>
                </tr>
              </thead>
              <tbody>
                {history.map((r)=> (
                  <tr key={r.id} className="border-t border-border">
                    <td className="p-2">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="p-2">{r.score ?? '-'}</td>
                    <td className="p-2 break-all">{String(r.input?.description || '').slice(0, 80)}...</td>
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
