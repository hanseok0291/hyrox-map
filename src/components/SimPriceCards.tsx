"use client";

import Link from "next/link";
import {
  SIM_DIVISIONS,
  SIM_DIVISION_LABELS,
  hasAnySimPrice,
  simPricesFromFields,
  type SimPriceFields,
} from "@/lib/sim-prices";

export function SimPriceCards({
  prices,
  variant = "dark",
  showReportCta = true,
  reportHref = "/report?topic=prices",
}: {
  prices: SimPriceFields;
  variant?: "dark" | "light";
  showReportCta?: boolean;
  reportHref?: string;
}) {
  const sim = simPricesFromFields(prices);
  const any = hasAnySimPrice(sim);
  const isDark = variant === "dark";

  return (
    <section
      className={
        isDark
          ? "rounded-2xl border border-white/10 bg-white/5 p-4"
          : "rounded-xl border border-zinc-200 bg-zinc-50 p-4"
      }
    >
      <div className="flex items-center justify-between gap-2">
        <h2
          className={`text-sm font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}
        >
          드랍인 시뮬 비용
        </h2>
        <div className="flex items-center gap-1.5">
          {!any && (
            <span
              className={`rounded-md px-2 py-0.5 text-[11px] ${
                isDark
                  ? "bg-hyrox-yellow/20 text-hyrox-yellow"
                  : "bg-hyrox-yellow/15 text-hyrox-black"
              }`}
            >
              제보 필요
            </span>
          )}
          {showReportCta && (
            <Link
              href={reportHref}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                isDark
                  ? "bg-hyrox-yellow text-hyrox-black hover:bg-hyrox-yellow-hover"
                  : "bg-hyrox-yellow text-hyrox-black hover:bg-hyrox-yellow-hover"
              }`}
            >
              제보
            </Link>
          )}
        </div>
      </div>
      <p
        className={`mt-1 text-xs ${isDark ? "text-white/45" : "text-zinc-500"}`}
      >
        확인된 가격만 표시 · 변경 시 제보 환영
      </p>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {SIM_DIVISIONS.map((division) => {
          const value = sim[division];
          return (
            <div
              key={division}
              className={`rounded-xl border px-2 py-3 text-center ${
                isDark
                  ? value
                    ? "border-white/15 bg-white/8"
                    : "border-dashed border-white/15 bg-transparent"
                  : value
                    ? "border-zinc-200 bg-white"
                    : "border-dashed border-zinc-200 bg-white/50"
              }`}
            >
              <p
                className={`text-[11px] font-medium ${
                  isDark ? "text-white/55" : "text-zinc-500"
                }`}
              >
                {SIM_DIVISION_LABELS[division]}
              </p>
              <p
                className={`mt-1 text-sm font-semibold leading-tight ${
                  value
                    ? isDark
                      ? "text-white"
                      : "text-zinc-900"
                    : isDark
                      ? "text-white/35"
                      : "text-zinc-400"
                }`}
              >
                {value ?? "—"}
              </p>
            </div>
          );
        })}
      </div>

    </section>
  );
}
