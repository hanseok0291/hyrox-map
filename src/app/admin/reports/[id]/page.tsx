"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TAG_LABELS } from "@/lib/types";

type ReportDetail = {
  id: string;
  name: string;
  address: string;
  experienceNote: string;
  status: string;
  tags: string[];
  evidenceUrls: string[];
  moderatorNote: string | null;
};

export default function AdminReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [note, setNote] = useState("");
  const [trustLevel, setTrustLevel] = useState<"verified" | "community">("community");

  useEffect(() => {
    fetch(`/api/admin/reports/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => setReport(data.report))
      .catch(() => {
        window.location.href = "/admin/login";
      });
  }, [id]);

  const act = async (action: string) => {
    const res = await fetch(`/api/admin/reports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        trustLevel: action === "approve" ? trustLevel : undefined,
        moderatorNote: note || undefined,
      }),
    });
    if (!res.ok) return alert("실패");
    const data = await res.json();
    if (data.venueSlug) router.push(`/venues/${data.venueSlug}`);
    else router.push("/admin/reports");
  };

  if (!report) return <p className="p-8">로딩…</p>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/admin/reports" className="text-sm text-orange-600">
        ← 큐
      </Link>
      <h1 className="mt-4 text-xl font-bold">{report.name}</h1>
      <p className="text-sm text-zinc-600">{report.address}</p>
      <p className="mt-2 text-xs text-zinc-500">상태: {report.status}</p>

      <section className="mt-6 rounded-lg border border-zinc-200 p-4">
        <h2 className="text-sm font-medium">체험 내용</h2>
        <p className="mt-2 text-sm whitespace-pre-wrap">{report.experienceNote}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {report.tags.map((t) => (
            <span key={t} className="rounded bg-zinc-100 px-2 py-0.5 text-xs">
              {TAG_LABELS[t] ?? t}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-4">
        <h2 className="text-sm font-medium">증빙</h2>
        <ul className="mt-2 list-inside list-disc text-sm text-orange-600">
          {report.evidenceUrls.map((url) => (
            <li key={url}>
              <a href={url} target="_blank" rel="noopener noreferrer">
                {url}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-6">
        <label className="text-sm">승인 시 trust_level</label>
        <select
          value={trustLevel}
          onChange={(e) => setTrustLevel(e.target.value as "verified" | "community")}
          className="ml-2 rounded border px-2 py-1 text-sm"
        >
          <option value="verified">verified</option>
          <option value="community">community</option>
        </select>
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="운영자 메모"
        className="mt-4 w-full rounded-lg border border-zinc-300 p-2 text-sm"
        rows={2}
      />

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => act("approve")}
          className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white"
        >
          승인
        </button>
        <button
          type="button"
          onClick={() => act("needs_info")}
          className="rounded-lg border px-4 py-2 text-sm"
        >
          보완 요청
        </button>
        <button
          type="button"
          onClick={() => act("reject")}
          className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-700"
        >
          반려
        </button>
      </div>
    </div>
  );
}
