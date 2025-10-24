"use client";

import { useEffect, useMemo, useState } from 'react';
import api, { apiClient } from '@/lib/api';
import { Line } from 'react-chartjs-2';
import '@/components/charts';

export default function AdminOverviewPage() {
  const [overview, setOverview] = useState<any>(null);
  const [ai, setAi] = useState<any[]>([]);
  const [yt, setYt] = useState<any[]>([]);
  const [latAI, setLatAI] = useState<any>(null);
  const [latYT, setLatYT] = useState<any>(null);
  const [start, setStart] = useState<string>('');
  const [end, setEnd] = useState<string>('');
  const [route, setRoute] = useState<string>('');

  const params = useMemo(() => {
    const p: any = {};
    if (start) p.start = start;
    if (end) p.end = end;
    if (route) p.route = route;
    return p;
  }, [start, end, route]);

  useEffect(() => {
    (async () => {
      const [ov, a, y, la, ly] = await Promise.all([
        apiClient.adminOverview(params),
        apiClient.adminAIUsage(params),
        apiClient.adminYTUsage(params),
        apiClient.adminLatency({ service: 'ai', ...params }),
        apiClient.adminLatency({ service: 'youtube', ...params }),
      ]);
      setOverview(ov);
      setAi(a);
      setYt(y);
      setLatAI(la);
      setLatYT(ly);
    })();
  }, [params]);

  const aiData = {
    labels: ai.map((d) => d.day),
    datasets: [
      { label: '2xx', data: ai.map((d) => d.ok_2xx || 0), borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.2)', fill: true },
      { label: '4xx', data: ai.map((d) => d.err_4xx || 0), borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.2)', fill: true },
      { label: '5xx', data: ai.map((d) => d.err_5xx || 0), borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.2)', fill: true },
      { label: '429', data: ai.map((d) => d.err_429 || 0), borderColor: '#a855f7', backgroundColor: 'rgba(168,85,247,0.2)', fill: true },
    ],
  };

  const ytData = {
    labels: yt.map((d) => d.day),
    datasets: [
      { label: '2xx', data: yt.map((d) => d.ok_2xx || 0), borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.2)', fill: true },
      { label: '4xx', data: yt.map((d) => d.err_4xx || 0), borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.2)', fill: true },
      { label: '5xx', data: yt.map((d) => d.err_5xx || 0), borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.2)', fill: true },
      { label: '429', data: yt.map((d) => d.err_429 || 0), borderColor: '#a855f7', backgroundColor: 'rgba(168,85,247,0.2)', fill: true },
    ],
  };

  return (
    <div className="space-y-8">
      <Filters start={start} end={end} route={route} onStart={setStart} onEnd={setEnd} onRoute={setRoute} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="Active Users (30d)" value={overview?.active_users_like ?? '—'} />
        <KpiCard title="AI Calls (30d)" value={overview?.ai_calls ?? '—'} />
        <KpiCard title="YouTube Calls (30d)" value={overview?.yt_calls ?? '—'} />
        <KpiCard title="429s (30d)" value={overview?.err_429 ?? '—'} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="AI p95 latency (ms)" value={latAI?.overall?.p95 ?? '—'} />
        <KpiCard title="AI avg latency (ms)" value={latAI?.overall?.avg ?? '—'} />
        <KpiCard title="YT p95 latency (ms)" value={latYT?.overall?.p95 ?? '—'} />
        <KpiCard title="YT avg latency (ms)" value={latYT?.overall?.avg ?? '—'} />
      </div>

      <section className="grid md:grid-cols-2 gap-6">
        <div className="rounded border border-slate-800 p-4 bg-slate-900/40">
          <h3 className="font-semibold mb-2">AI Usage (last 30d)</h3>
          <div className="h-64">
            <Line data={aiData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="rounded border border-slate-800 p-4 bg-slate-900/40">
          <h3 className="font-semibold mb-2">YouTube Usage (last 30d)</h3>
          <div className="h-64">
            <Line data={ytData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </section>
      <div className="flex gap-3">
        <button
          className="px-3 py-2 rounded bg-slate-800 hover:bg-slate-700"
          onClick={async () => {
            const url = '/api/admin/usage.csv';
            const { data } = await api.get(url, { params: { service: 'ai', ...params }, responseType: 'blob' });
            const blobUrl = URL.createObjectURL(new Blob([data], { type: 'text/csv' }));
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = 'ai-usage.csv';
            a.click();
            URL.revokeObjectURL(blobUrl);
          }}
        >
          Export AI Usage CSV
        </button>
        <button
          className="px-3 py-2 rounded bg-slate-800 hover:bg-slate-700"
          onClick={async () => {
            const url = '/api/admin/usage.csv';
            const { data } = await api.get(url, { params: { service: 'youtube', ...params }, responseType: 'blob' });
            const blobUrl = URL.createObjectURL(new Blob([data], { type: 'text/csv' }));
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = 'youtube-usage.csv';
            a.click();
            URL.revokeObjectURL(blobUrl);
          }}
        >
          Export YouTube Usage CSV
        </button>
      </div>
    </div>
  );
}

function KpiCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded border border-slate-800 p-4 bg-slate-900/40">
      <div className="text-xs text-slate-400">{title}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}

function Filters({ start, end, route, onStart, onEnd, onRoute }: {
  start: string; end: string; route: string;
  onStart: (v: string) => void; onEnd: (v: string) => void; onRoute: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div>
        <div className="text-xs text-slate-400">Start</div>
        <input type="date" value={start} onChange={(e) => onStart(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-2 py-1" />
      </div>
      <div>
        <div className="text-xs text-slate-400">End</div>
        <input type="date" value={end} onChange={(e) => onEnd(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-2 py-1" />
      </div>
      <div className="flex-1 min-w-[220px]">
        <div className="text-xs text-slate-400">Route contains</div>
        <input placeholder="/ai or /youtube" value={route} onChange={(e) => onRoute(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1" />
      </div>
    </div>
  );
}
