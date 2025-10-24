"use client";

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';

export default function AdminUsersPage() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const data = await apiClient.adminTopUsers();
      setRows(data || []);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Top Users (30d)</h1>
      <div className="overflow-auto rounded border border-slate-800">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900/60 text-slate-300">
            <tr>
              <th className="text-left p-2">Email</th>
              <th className="text-left p-2">Total Calls</th>
              <th className="text-left p-2">AI Calls</th>
              <th className="text-left p-2">YouTube Calls</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-slate-800">
                <td className="p-2 text-slate-300">{r.email}</td>
                <td className="p-2">{r.total_calls}</td>
                <td className="p-2">{r.ai_calls}</td>
                <td className="p-2">{r.yt_calls}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
