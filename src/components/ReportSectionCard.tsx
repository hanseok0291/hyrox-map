"use client";

import Link from "next/link";
import { buildReportUrl } from "@/lib/report-url";
import type { ReportTopic } from "@/lib/report-topics";

export function ReportSectionCard({
  venueSlug,
  topic,
  title,
  badge,
  children,
  emptyText,
}: {
  venueSlug: string;
  topic: ReportTopic;
  title: string;
  badge?: string;
  children?: React.ReactNode;
  emptyText?: string;
}) {
  const hasContent = Boolean(children);
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-sm font-semibold">{title}</h2>
        <div className="flex shrink-0 items-center gap-1.5">
          {badge && (
            <span className="rounded-md bg-hyrox-yellow/20 px-2 py-0.5 text-[11px] text-hyrox-yellow">
              {badge}
            </span>
          )}
          <Link
            href={buildReportUrl(venueSlug, topic)}
            className="rounded-lg bg-hyrox-yellow px-3 py-1.5 text-xs font-bold text-hyrox-black hover:bg-hyrox-yellow-hover"
          >
            제보
          </Link>
        </div>
      </div>
      {hasContent ? (
        <div className="mt-3">{children}</div>
      ) : (
        emptyText && (
          <p className="mt-2 text-xs text-white/50">{emptyText}</p>
        )
      )}
    </section>
  );
}
