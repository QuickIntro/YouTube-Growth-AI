"use client";

import { useEffect, useMemo, useState } from 'react';
import api, { apiClient } from '@/lib/api';
import { Line } from 'react-chartjs-2';
import '@/components/charts';

export default function AdminYTUsagePage() {
  const [rows, setRows] = useState<any[]>([]);
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
      const data = await apiClient.adminYTUsage(params);
      setRows(data || []);
    })();
  }, [params]);

  const data = {
    labels: rows.map((d) => d.day),
    datasets: [
      { label: '2xx', data: rows.map((d) => d.ok_2xx || 0), borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.2)', fill: true },
      { label: '4xx', data: rows.map((d) => d.err_4xx || 0), borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.2)', fill: true },
      { label: '5xx', data: rows.map((d) => d.err_5xx || 0), borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.2)', fill: true },
      { label: '429', data: rows.map((d) => d.err_429 || 0), borderColor: '#a855f7', backgroundColor: 'rgba(168,85,247,0.2)', fill: true },
    ],
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">YouTube Usage</h1>
      <Filters start={start} end={end} route={route} onStart={setStart} onEnd={setEnd} onRoute={setRoute} />
      <div className="rounded border border-slate-800 p-4 bg-slate-900/40">
        <div className="h-96">
          <Line data={data} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>
      <div>
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
        <input placeholder="/youtube" value={route} onChange={(e) => onRoute(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1" />
      </div>
    </div>
  );
}
