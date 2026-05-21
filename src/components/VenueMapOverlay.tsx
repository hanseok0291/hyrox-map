"use client";

import Link from "next/link";
import type { VenueDTO } from "@/lib/types";
import { TAG_LABELS, TRUST_LABELS } from "@/lib/types";

export function VenueMapOverlay({
  venue,
  onClose,
}: {
  venue: VenueDTO;
  onClose: () => void;
}) {
  const distance =
    venue.distanceKm != null
      ? venue.distanceKm < 1
        ? `${Math.round(venue.distanceKm * 1000)}m`
        : `${venue.distanceKm.toFixed(1)}km`
      : null;

  return (
    <div className="pointer-events-auto absolute bottom-[calc(5.75rem+env(safe-area-inset-bottom))] left-3 right-3 z-20 rounded-xl border border-zinc-200 bg-white p-4 shadow-lg lg:bottom-3 lg:z-10 lg:max-w-sm lg:left-auto lg:right-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-zinc-900">{venue.name}</h3>
          <p className="mt-0.5 text-sm text-zinc-600">{venue.region}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
          aria-label="닫기"
        >
          ✕
        </button>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1">
        {distance && (
          <span className="text-sm font-medium text-zinc-900">{distance}</span>
        )}
        <span className="rounded bg-zinc-900 px-2 py-0.5 text-xs font-medium text-white">
          {TRUST_LABELS[venue.trustLevel] ?? venue.trustLevel}
        </span>
        {venue.dropInAvailable && (
          <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700">
            드랍인
          </span>
        )}
      </div>

      {venue.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {venue.tags.slice(0, 5).map((t) => (
            <span
              key={t}
              className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600"
            >
              {TAG_LABELS[t] ?? t}
            </span>
          ))}
        </div>
      )}

      {venue.dropInInfo && (
        <p className="mt-2 line-clamp-2 text-xs text-zinc-600">
          {venue.dropInInfo}
        </p>
      )}

      <Link
        href={`/venues/${venue.slug}`}
        className="mt-3 block w-full rounded-lg bg-zinc-900 py-2.5 text-center text-sm font-medium text-white hover:bg-zinc-800"
      >
        상세 보기
      </Link>
    </div>
  );
}
