"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ReportRow = {
  id: string;
  name: string;
  address: string;
  status: string;
  moderatorNote: string | null;
  createdAt: string;
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/reports")
      .then(async (res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => setReports(data.reports ?? []))
      .catch(() => {
        setError("로그인이 필요합니다.");
        window.location.href = "/admin/login";
      });
  }, []);

  if (error) return <p className="p-8">{error}</p>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">제보 큐</h1>
        <Link href="/admin" className="text-sm text-zinc-500">
          Admin 홈
        </Link>
      </div>
      <ul className="mt-6 divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white">
        {reports.map((r) => (
          <li key={r.id} className="p-4">
            <Link href={`/admin/reports/${r.id}`} className="block hover:bg-zinc-50">
              <div className="flex justify-between">
                <span className="font-medium">{r.name}</span>
                <span className="text-xs text-zinc-500">{r.status}</span>
              </div>
              <p className="text-sm text-zinc-600">{r.address}</p>
              {r.moderatorNote && (
                <p className="mt-1 text-xs text-amber-700">{r.moderatorNote}</p>
              )}
            </Link>
          </li>
        ))}
        {!reports.length && (
          <li className="p-8 text-center text-sm text-zinc-500">제보 없음</li>
        )}
      </ul>
    </div>
  );
}
