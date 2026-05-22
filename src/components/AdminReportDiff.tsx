"use client";

import type { ReportFieldDiff } from "@/lib/report-diff";
import { REPORT_TOPIC_LABELS, type ReportTopic } from "@/lib/report-topics";

export function AdminReportDiff({
  diffs,
  reportTopics,
  targetVenueName,
  targetVenueSlug,
}: {
  diffs: ReportFieldDiff[];
  reportTopics: string[];
  targetVenueName: string;
  targetVenueSlug: string;
}) {
  return (
    <section className="mt-6 rounded-xl border-2 border-amber-200 bg-amber-50/80 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-zinc-900">변경 내용</h2>
          <p className="mt-1 text-sm text-zinc-600">
            대상:{" "}
            <span className="font-medium text-zinc-900">{targetVenueName}</span>
            <span className="text-zinc-400"> · {targetVenueSlug}</span>
          </p>
        </div>
        <span className="rounded-full bg-amber-200 px-3 py-1 text-sm font-semibold text-amber-950">
          {diffs.length}건 변경
        </span>
      </div>

      {reportTopics.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {reportTopics.map((t) => (
            <span
              key={t}
              className="rounded-md bg-white px-2 py-0.5 text-xs font-medium text-zinc-700 ring-1 ring-amber-200"
            >
              {REPORT_TOPIC_LABELS[t as ReportTopic] ?? t}
            </span>
          ))}
        </div>
      )}

      {diffs.length === 0 ? (
        <p className="mt-4 rounded-lg border border-amber-100 bg-white p-3 text-sm text-zinc-600">
          등록된 시설 정보와 다른 항목이 없습니다. 제보 메모·증빙만 확인한 뒤
          승인 여부를 결정하세요.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {diffs.map((d) => (
            <li
              key={d.key}
              className="overflow-hidden rounded-lg border border-amber-100 bg-white"
            >
              <div className="border-b border-amber-50 bg-amber-100/50 px-3 py-1.5 text-xs font-semibold text-amber-950">
                {d.label}
              </div>
              <div className="grid gap-0 sm:grid-cols-2">
                <div className="border-b border-zinc-100 px-3 py-2.5 sm:border-b-0 sm:border-r">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">
                    기존
                  </p>
                  <p className="mt-0.5 text-sm leading-relaxed text-zinc-500 line-through decoration-zinc-300">
                    {d.before}
                  </p>
                </div>
                <div className="bg-emerald-50/60 px-3 py-2.5">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-emerald-700">
                    제보 (승인 시 반영)
                  </p>
                  <p className="mt-0.5 text-sm font-medium leading-relaxed text-zinc-900">
                    {d.after}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
