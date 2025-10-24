"use client";

import { useEffect, useMemo, useState } from 'react';
import api, { apiClient } from '@/lib/api';

export default function AdminErrorsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [start, setStart] = useState<string>('');
  const [end, setEnd] = useState<string>('');
  const [route, setRoute] = useState<string>('');
  const [service, setService] = useState<'ai'|'youtube'|'web'|''>('');

  const params = useMemo(() => {
    const p: any = {};
    if (start) p.start = start;
    if (end) p.end = end;
    if (route) p.route = route;
    if (service) p.service = service;
    return p;
  }, [start, end, route, service]);

  useEffect(() => {
    (async () => {
      const data = await apiClient.adminErrors(200, params);
      setRows(data || []);
    })();
  }, [params]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Recent Errors</h1>
      <Filters start={start} end={end} route={route} service={service} onStart={setStart} onEnd={setEnd} onRoute={setRoute} onService={setService} />
      <div className="overflow-auto rounded border border-slate-800">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900/60 text-slate-300">
            <tr>
              <th className="text-left p-2">Time</th>
              <th className="text-left p-2">Service</th>
              <th className="text-left p-2">Route</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Email</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-slate-800">
                <td className="p-2 text-slate-400">{new Date(r.created_at).toLocaleString()}</td>
                <td className="p-2">{r.service}</td>
                <td className="p-2 break-all">{r.route}</td>
                <td className="p-2">{r.status}</td>
                <td className="p-2 text-slate-400">{r.user_email || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <button
          className="px-3 py-2 rounded bg-slate-800 hover:bg-slate-700"
          onClick={async () => {
            const url = '/api/admin/errors.csv';
            const { data } = await api.get(url, { params, responseType: 'blob' });
            const blobUrl = URL.createObjectURL(new Blob([data], { type: 'text/csv' }));
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = 'errors.csv';
            a.click();
            URL.revokeObjectURL(blobUrl);
          }}
        >
          Export Errors CSV
        </button>
      </div>
    </div>
  );
}

function Filters({ start, end, route, service, onStart, onEnd, onRoute, onService }: {
  start: string; end: string; route: string; service: ''|'ai'|'youtube'|'web';
  onStart: (v: string) => void; onEnd: (v: string) => void; onRoute: (v: string) => void; onService: (v: ''|'ai'|'youtube'|'web') => void;
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
      <div>
        <div className="text-xs text-slate-400">Service</div>
        <select value={service} onChange={(e) => onService(e.target.value as any)} className="bg-slate-900 border border-slate-800 rounded px-2 py-1">
          <option value="">All</option>
          <option value="ai">AI</option>
          <option value="youtube">YouTube</option>
          <option value="web">Web</option>
        </select>
      </div>
    </div>
  );
}
