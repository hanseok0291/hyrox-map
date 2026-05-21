"use client";

import Link from "next/link";
import { useState } from "react";
import { ReportSectionCard } from "@/components/ReportSectionCard";
import { SimPriceCards } from "@/components/SimPriceCards";
import { buildReportUrl } from "@/lib/report-url";
import type { VenueDTO } from "@/lib/types";
import {
  TAG_LABELS,
  TRUST_LABELS,
  VENUE_TYPE_LABELS,
} from "@/lib/types";

function formatDistance(km: number | undefined) {
  if (km == null) return null;
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
}

function trustBadgeClass(level: string) {
  switch (level) {
    case "official":
      return "bg-hyrox-yellow text-hyrox-black";
    case "verified":
      return "bg-emerald-600/90 text-white";
    default:
      return "bg-white/20 text-white/90";
  }
}

export function VenueDetailPanel({
  venue,
  onClose,
  onBackToList,
}: {
  venue: VenueDTO;
  onClose: () => void;
  onBackToList: () => void;
}) {
  const [tab, setTab] = useState<"home" | "info">("home");
  const [copied, setCopied] = useState(false);
  const distance = formatDistance(venue.distanceKm);
  const kakaoDirections = `https://map.kakao.com/link/map/${encodeURIComponent(venue.name)},${venue.lat},${venue.lng}`;
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/venues/${venue.slug}`
      : `/venues/${venue.slug}`;

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(venue.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const shareVenue = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: venue.name,
          text: `${venue.name} · 하이록스 맵`,
          url: shareUrl,
        });
        return;
      } catch {
        /* fall through */
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("링크를 복사했습니다.");
    } catch {
      /* ignore */
    }
  };

  return (
    <aside className="pointer-events-none absolute inset-y-0 left-0 z-40 flex w-full max-w-[400px] flex-col p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-3 lg:p-5">
      <div className="map-panel-surface pointer-events-auto flex h-full max-h-[calc(100dvh-2rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] flex-col overflow-hidden rounded-2xl text-white shadow-2xl lg:max-h-[calc(100dvh-2.5rem)]">
      {/* Top bar */}
      <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3">
        <button
          type="button"
          onClick={onBackToList}
          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-white/80 hover:bg-white/10"
        >
          <span aria-hidden>‹</span>
          목록으로
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-2 py-1.5 text-sm text-white/60 hover:bg-white/10"
          aria-label="패널 닫기"
        >
          ≫
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* Hero */}
        <div className="relative mx-4 mt-3 aspect-[16/10] overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-900">
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            <span className="text-4xl font-bold text-white/25">
              {venue.name.charAt(0)}
            </span>
            <span className="mt-2 text-xs text-white/50">
              {VENUE_TYPE_LABELS[venue.venueType] ?? venue.venueType}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
            aria-label="닫기"
          >
            ✕
          </button>
          <div className="absolute bottom-2 left-2 flex flex-wrap gap-1.5">
            <span
              className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${trustBadgeClass(venue.trustLevel)}`}
            >
              {TRUST_LABELS[venue.trustLevel] ?? venue.trustLevel}
            </span>
            {venue.source === "community" && (
              <span className="rounded-md bg-white/15 px-2 py-0.5 text-[11px] text-white/80">
                제보됨
              </span>
            )}
            {distance && (
              <span className="rounded-md bg-black/40 px-2 py-0.5 text-[11px] font-medium text-white">
                {distance}
              </span>
            )}
          </div>
        </div>

        {/* Title block */}
        <div className="px-4 pt-4">
          <h1 className="text-2xl font-bold leading-tight">{venue.name}</h1>

          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={buildReportUrl(venue.slug)}
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10"
            >
              정보 수정 제보
            </Link>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-hyrox-yellow/50 bg-hyrox-yellow/15 px-3 py-1 text-xs font-medium text-hyrox-yellow">
              {VENUE_TYPE_LABELS[venue.venueType] ?? venue.venueType}
            </span>
            {venue.dropInAvailable && (
              <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/80">
                드랍인 가능
              </span>
            )}
          </div>

          <div className="mt-3 flex items-start gap-2 text-sm text-white/75">
            <span className="shrink-0 text-white/40" aria-hidden>
              📍
            </span>
            <p className="min-w-0 flex-1 leading-snug">{venue.address}</p>
            <button
              type="button"
              onClick={copyAddress}
              className="shrink-0 rounded-md border border-white/20 px-2 py-1 text-xs hover:bg-white/10"
            >
              {copied ? "복사됨" : "복사"}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 grid grid-cols-3 gap-2 px-4">
          <a
            href={kakaoDirections}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 rounded-xl border border-white/15 bg-white/5 py-3 text-xs hover:bg-white/10"
          >
            <span className="text-lg" aria-hidden>
              ↗
            </span>
            길찾기
          </a>
          <button
            type="button"
            onClick={shareVenue}
            className="flex flex-col items-center gap-1 rounded-xl border border-white/15 bg-white/5 py-3 text-xs hover:bg-white/10"
          >
            <span className="text-lg" aria-hidden>
              ⎘
            </span>
            공유
          </button>
          <Link
            href={`/venues/${venue.slug}`}
            className="flex flex-col items-center gap-1 rounded-xl border border-white/15 bg-white/5 py-3 text-xs hover:bg-white/10"
          >
            <span className="text-lg" aria-hidden>
              ↗
            </span>
            전체 페이지
          </Link>
        </div>

        {/* Tabs */}
        <div className="mt-5 flex gap-1 border-b border-white/10 px-4">
          {(
            [
              ["home", "홈"],
              ["info", "시설 정보"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`border-b-2 px-3 pb-2.5 text-sm font-medium transition ${
                tab === id
                  ? "border-hyrox-yellow text-hyrox-yellow"
                  : "border-transparent text-white/50 hover:text-white/80"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="space-y-3 px-4 py-4 pb-8">
          {tab === "home" && (
            <>
              <ReportSectionCard
                venueSlug={venue.slug}
                topic="simulation"
                title="시뮬레이션 가능 여부"
                badge={
                  venue.tags.length > 0 ? "태그 확인" : "제보 필요"
                }
                emptyText="장비·스테이션 태그가 아직 없습니다."
              >
                {venue.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {venue.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/85"
                      >
                        {TAG_LABELS[t] ?? t}
                      </span>
                    ))}
                  </div>
                )}
                {venue.outdoorRunNote && (
                  <p className="mt-2 text-sm text-white/75">
                    야외 런: {venue.outdoorRunNote}
                  </p>
                )}
              </ReportSectionCard>

              <SimPriceCards
                prices={{
                  simPriceSingle: venue.simPriceSingle,
                  simPriceDouble: venue.simPriceDouble,
                  simPriceRelay: venue.simPriceRelay,
                }}
                variant="dark"
                reportHref={buildReportUrl(venue.slug, "prices")}
              />

              <ReportSectionCard
                venueSlug={venue.slug}
                topic="dropin"
                title="드랍인 · 시뮬 안내"
                badge={venue.dropInInfo ? undefined : "제보 필요"}
                emptyText="드랍인·시뮬 참여 방법을 알려주세요."
              >
                {venue.dropInInfo && (
                  <p className="text-sm leading-relaxed text-white/75">
                    {venue.dropInInfo}
                  </p>
                )}
              </ReportSectionCard>

              <ReportSectionCard
                venueSlug={venue.slug}
                topic="links"
                title="인스타 · 네이버 예약"
                badge={
                  venue.links.instagram || venue.links.reservation
                    ? undefined
                    : "제보 필요"
                }
                emptyText="시뮬 안내는 인스타·네이버 예약으로 하는 경우가 많습니다."
              >
                <div className="flex flex-col gap-2 text-sm">
                  {venue.links.instagram && (
                    <a
                      href={
                        venue.links.instagram.startsWith("http")
                          ? venue.links.instagram
                          : `https://instagram.com/${venue.links.instagram.replace(/^@/, "")}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-hyrox-yellow underline hover:text-hyrox-yellow-hover"
                    >
                      인스타그램
                    </a>
                  )}
                  {venue.links.reservation && (
                    <a
                      href={venue.links.reservation}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-hyrox-yellow underline hover:text-hyrox-yellow-hover"
                    >
                      네이버 예약
                    </a>
                  )}
                </div>
              </ReportSectionCard>

              <ReportSectionCard
                venueSlug={venue.slug}
                topic="hours"
                title="운영 · 시뮬 시간"
                badge={venue.simScheduleNote ? undefined : "제보 필요"}
                emptyText="요일·시간대를 제보해 주세요."
              >
                {venue.simScheduleNote && (
                  <p className="text-sm leading-relaxed text-white/75 whitespace-pre-wrap">
                    {venue.simScheduleNote}
                  </p>
                )}
              </ReportSectionCard>

              {venue.priceNote && (
                <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <h2 className="text-sm font-semibold">기타 요금 참고</h2>
                  <p className="mt-2 text-sm leading-relaxed text-white/75">
                    {venue.priceNote}
                  </p>
                </section>
              )}
            </>
          )}

          {tab === "info" && (
            <>
              <section className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/75">
                <p>
                  <span className="text-white/45">지역</span> {venue.region}
                </p>
                <p className="mt-2">
                  <span className="text-white/45">출처</span>{" "}
                  {venue.source === "official"
                    ? "HYROX 공식"
                    : venue.source === "seed"
                      ? "시드 데이터"
                      : "커뮤니티 제보"}
                </p>
              </section>

              {(venue.links.website ||
                venue.links.instagram ||
                venue.links.reservation ||
                venue.links.naver_map) && (
                <section className="flex flex-wrap gap-2">
                  {venue.links.website && (
                    <a
                      href={venue.links.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-white/15 px-3 py-2 text-xs hover:bg-white/10"
                    >
                      홈페이지
                    </a>
                  )}
                  {venue.links.instagram && (
                    <a
                      href={venue.links.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-white/15 px-3 py-2 text-xs hover:bg-white/10"
                    >
                      인스타
                    </a>
                  )}
                  {venue.links.reservation && (
                    <a
                      href={venue.links.reservation}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-hyrox-yellow px-3 py-2 text-xs font-bold text-hyrox-black hover:bg-hyrox-yellow-hover"
                    >
                      예약
                    </a>
                  )}
                  {venue.links.naver_map && (
                    <a
                      href={venue.links.naver_map}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-white/15 px-3 py-2 text-xs hover:bg-white/10"
                    >
                      네이버 지도
                    </a>
                  )}
                </section>
              )}

              <Link
                href={buildReportUrl(venue.slug)}
                className="block rounded-2xl border border-dashed border-white/20 py-4 text-center text-sm text-white/60 hover:border-white/35 hover:text-white/80"
              >
                정보 수정·추가 제보하기
              </Link>
            </>
          )}
        </div>
      </div>
      </div>
    </aside>
  );
}
