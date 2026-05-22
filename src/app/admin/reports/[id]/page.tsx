"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AdminReportDiff } from "@/components/AdminReportDiff";
import { SimPriceCards } from "@/components/SimPriceCards";
import {
  buildReportVenueDiff,
  type ReportSnapshot,
  type VenueSnapshot,
} from "@/lib/report-diff";
import { REPORT_TOPIC_LABELS } from "@/lib/report-topics";
import { TAG_LABELS } from "@/lib/types";

type ReportDetail = ReportSnapshot & {
  id: string;
  experienceNote: string;
  status: string;
  evidenceUrls: string[];
  reportKind: string;
  targetVenueSlug: string | null;
  reportTopics: string[];
  moderatorNote: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  submitted: "접수",
  in_review: "검토 중",
  needs_info: "보완 요청",
  approved: "승인",
  rejected: "반려",
};

export default function AdminReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [targetVenue, setTargetVenue] = useState<VenueSnapshot | null>(null);
  const [note, setNote] = useState("");
  const [trustLevel, setTrustLevel] = useState<"verified" | "community">(
    "community"
  );

  useEffect(() => {
    fetch(`/api/admin/reports/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setReport(data.report);
        setTargetVenue(data.targetVenue ?? null);
      })
      .catch(() => {
        window.location.href = "/admin/login";
      });
  }, [id]);

  const diffs = useMemo(() => {
    if (!report || !targetVenue) return [];
    return buildReportVenueDiff(targetVenue, report);
  }, [report, targetVenue]);

  const isUpdate =
    report?.reportKind === "update" && targetVenue && report.targetVenueSlug;

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
    const params = new URLSearchParams({ queue: "pending" });
    if (action === "approve" && data.venueSlug) {
      params.set("approved", data.venueSlug);
    }
    router.push(`/admin/reports?${params}`);
  };

  const isClosed =
    report?.status === "approved" || report?.status === "rejected";

  if (!report) return <p className="p-8">로딩…</p>;

  return (
    <div className="mx-auto min-w-0 max-w-2xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          href="/admin/reports"
          className="text-sm font-medium text-zinc-900 underline"
        >
          ← 제보 목록
        </Link>
        <Link href="/admin" className="text-sm text-zinc-500 hover:text-zinc-800">
          Admin 홈
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-md px-2 py-0.5 text-xs font-medium ${
            report.reportKind === "update"
              ? "bg-amber-100 text-amber-900"
              : "bg-blue-100 text-blue-900"
          }`}
        >
          {report.reportKind === "update" ? "정보 수정 제보" : "신규 시설 제보"}
        </span>
        <span className="text-xs text-zinc-500">
          {STATUS_LABELS[report.status] ?? report.status}
        </span>
        {isUpdate && (
          <Link
            href={`/admin/venues/${report.targetVenueSlug}`}
            className="text-xs text-zinc-700 underline"
          >
            시설 직접 수정
          </Link>
        )}
      </div>

      {report.reportKind === "update" && !targetVenue && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          기존 시설({report.targetVenueSlug})을 DB에서 찾을 수 없습니다. 제보
          원문과 증빙만 참고하세요.
        </p>
      )}

      {isUpdate && targetVenue ? (
        <AdminReportDiff
          diffs={diffs}
          reportTopics={report.reportTopics}
          targetVenueName={targetVenue.name}
          targetVenueSlug={report.targetVenueSlug!}
        />
      ) : !isUpdate ? (
        <>
          <h1 className="mt-4 text-xl font-bold">{report.name}</h1>
          <p className="text-sm text-zinc-600">{report.address}</p>
          <p className="mt-1 text-xs text-zinc-500">
            좌표: {report.lat.toFixed(6)}, {report.lng.toFixed(6)}
          </p>
          {report.reportTopics.length > 0 && (
            <p className="mt-2 text-xs text-zinc-500">
              항목:{" "}
              {report.reportTopics
                .map(
                  (t) =>
                    REPORT_TOPIC_LABELS[
                      t as keyof typeof REPORT_TOPIC_LABELS
                    ] ?? t
                )
                .join(", ")}
            </p>
          )}
        </>
      ) : null}

      <section className="mt-6 rounded-lg border border-zinc-200 p-4">
        <h2 className="text-sm font-medium">제보 메모 · 확인 경위</h2>
        <p className="mt-2 text-sm whitespace-pre-wrap leading-relaxed text-zinc-800">
          {report.experienceNote}
        </p>
      </section>

      {!isUpdate && report.tags.length > 0 && (
        <section className="mt-4 rounded-lg border border-zinc-200 p-4">
          <h2 className="text-sm font-medium">시뮬 태그</h2>
          <div className="mt-2 flex flex-wrap gap-1">
            {report.tags.map((t) => (
              <span
                key={t}
                className="rounded bg-zinc-100 px-2 py-0.5 text-xs"
              >
                {TAG_LABELS[t] ?? t}
              </span>
            ))}
          </div>
        </section>
      )}

      {!isUpdate &&
        (report.dropInInfo ||
          report.simPriceSingle ||
          report.simPriceDouble ||
          report.simPriceRelay ||
          report.simScheduleNote ||
          report.outdoorRunNote ||
          report.priceNote) && (
          <section className="mt-4 rounded-lg border border-zinc-200 p-4">
            <h2 className="text-sm font-medium">시설 상세 (제보)</h2>
            {report.dropInInfo && (
              <p className="mt-2 text-sm text-zinc-600">
                <span className="font-medium text-zinc-800">드랍인·시뮬:</span>{" "}
                {report.dropInInfo}
              </p>
            )}
            {report.simScheduleNote && (
              <p className="mt-2 text-sm text-zinc-600">
                <span className="font-medium text-zinc-800">운영·시뮬:</span>{" "}
                {report.simScheduleNote}
              </p>
            )}
            {report.outdoorRunNote && (
              <p className="mt-2 text-sm text-zinc-600">
                <span className="font-medium text-zinc-800">야외 런:</span>{" "}
                {report.outdoorRunNote}
              </p>
            )}
            <div className="mt-3">
              <SimPriceCards
                prices={{
                  simPriceSingle: report.simPriceSingle,
                  simPriceDouble: report.simPriceDouble,
                  simPriceRelay: report.simPriceRelay,
                }}
                variant="light"
                showReportCta={false}
              />
            </div>
            {report.priceNote && (
              <p className="mt-2 text-sm text-zinc-600">
                <span className="font-medium text-zinc-800">기타:</span>{" "}
                {report.priceNote}
              </p>
            )}
          </section>
        )}

      <section className="mt-4 min-w-0 overflow-hidden rounded-lg border border-zinc-200 p-4">
        <h2 className="text-sm font-medium">증빙</h2>
        <ul className="mt-2 space-y-2 text-sm">
          {report.evidenceUrls.map((url) => (
            <li key={url} className="flex min-w-0 gap-2">
              <span className="shrink-0 text-zinc-400" aria-hidden>
                •
              </span>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 flex-1 break-all text-zinc-900 underline decoration-zinc-300 underline-offset-2 hover:text-zinc-700"
              >
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
          onChange={(e) =>
            setTrustLevel(e.target.value as "verified" | "community")
          }
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

      {isClosed ? (
        <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
          이미 처리된 제보입니다 (
          {report.status === "approved" ? "승인" : "반려"}).
          <Link
            href="/admin/reports?queue=done"
            className="ml-2 font-medium text-zinc-900 underline"
          >
            처리 완료 목록
          </Link>
        </div>
      ) : (
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
      )}
    </div>
  );
}
