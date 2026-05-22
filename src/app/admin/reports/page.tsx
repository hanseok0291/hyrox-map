"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

type ReportRow = {
  id: string;
  name: string;
  address: string;
  status: string;
  moderatorNote: string | null;
  createdAt: string;
};

const QUEUE_TABS = [
  { id: "pending", label: "대기" },
  { id: "done", label: "처리 완료" },
  { id: "all", label: "전체" },
] as const;

const STATUS_LABELS: Record<string, string> = {
  submitted: "접수",
  in_review: "검토 중",
  needs_info: "보완 요청",
  approved: "승인",
  rejected: "반려",
};

export default function AdminReportsPage() {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-zinc-500">불러오는 중…</p>}>
      <AdminReportsContent />
    </Suspense>
  );
}

function AdminReportsContent() {
  const searchParams = useSearchParams();
  const queue =
    (searchParams.get("queue") as (typeof QUEUE_TABS)[number]["id"]) || "pending";
  const approvedVenue = searchParams.get("approved");

  const [reports, setReports] = useState<ReportRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/admin/reports?queue=${queue}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => setReports(data.reports ?? []))
      .catch(() => {
        setError("로그인이 필요합니다.");
        window.location.href = "/admin/login";
      })
      .finally(() => setLoading(false));
  }, [queue]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) return <p className="p-8">{error}</p>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">제보 큐</h1>
        <div className="flex gap-3 text-sm">
          <Link href="/admin" className="text-zinc-500 hover:text-zinc-800">
            Admin 홈
          </Link>
          <Link href="/admin/login" className="text-zinc-500 hover:text-zinc-800">
            로그인
          </Link>
        </div>
      </div>

      {approvedVenue && (
        <p className="mt-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-900">
          승인했습니다.{" "}
          <Link href={`/venues/${approvedVenue}`} className="font-medium underline">
            시설 페이지 보기
          </Link>
        </p>
      )}

      <div className="mt-4 flex gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-1">
        {QUEUE_TABS.map((tab) => (
          <Link
            key={tab.id}
            href={`/admin/reports?queue=${tab.id}`}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              queue === tab.id
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-zinc-500">불러오는 중…</p>
      ) : (
        <ul className="mt-4 divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white">
          {reports.map((r) => (
            <li key={r.id} className="p-4">
              <Link
                href={`/admin/reports/${r.id}`}
                className="block hover:bg-zinc-50"
              >
                <div className="flex justify-between gap-2">
                  <span className="font-medium">{r.name}</span>
                  <span className="shrink-0 text-xs text-zinc-500">
                    {STATUS_LABELS[r.status] ?? r.status}
                  </span>
                </div>
                <p className="text-sm text-zinc-600">{r.address}</p>
                {r.moderatorNote && (
                  <p className="mt-1 text-xs text-amber-700">{r.moderatorNote}</p>
                )}
              </Link>
            </li>
          ))}
          {!reports.length && (
            <li className="p-8 text-center text-sm text-zinc-500">
              {queue === "pending"
                ? "대기 중인 제보가 없습니다."
                : "목록이 비어 있습니다."}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

