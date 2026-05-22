import Link from "next/link";
import { hasAnySimPrice, simPricesFromFields } from "@/lib/sim-prices";
import type { VenueDTO } from "@/lib/types";
import { TAG_LABELS, TRUST_LABELS } from "@/lib/types";
import { VenueThumbnail } from "./VenueThumbnail";

function formatDistance(km: number | undefined) {
  if (km == null) return null;
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
}

export function VenueCard({
  venue,
  selected,
  variant = "default",
  onSelect,
}: {
  venue: VenueDTO;
  selected?: boolean;
  variant?: "default" | "sidebar";
  onSelect?: (venue: VenueDTO) => void;
}) {
  const distance = formatDistance(venue.distanceKm);
  const simPrices = simPricesFromFields(venue);
  const priceHint =
    simPrices.single ??
    simPrices.double ??
    simPrices.relay ??
    null;

  if (variant === "sidebar") {
    return (
      <div
        id={`venue-card-${venue.id}`}
        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition ${
          selected ? "bg-white/15 ring-1 ring-white/50" : "hover:bg-white/8"
        }`}
      >
        <button
          type="button"
          onClick={() => onSelect?.(venue)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <VenueThumbnail slug={venue.slug} name={venue.name} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {venue.name}
            </p>
            <p className="mt-0.5 truncate text-xs text-white/55">
              {venue.region}
              {distance ? ` · ${distance}` : ""}
              {hasAnySimPrice(simPrices) && priceHint
                ? ` · 시뮬 ${priceHint}`
                : ""}
            </p>
            <div className="mt-1 flex flex-wrap gap-1">
              <span className="rounded bg-hyrox-yellow px-1.5 py-0.5 text-[10px] font-medium text-hyrox-black">
                {TRUST_LABELS[venue.trustLevel] ?? venue.trustLevel}
              </span>
              {venue.tags.slice(0, 2).map((t) => (
                <span
                  key={t}
                  className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/70"
                >
                  {TAG_LABELS[t] ?? t}
                </span>
              ))}
            </div>
          </div>
        </button>
        <button
          type="button"
          onClick={() => onSelect?.(venue)}
          className="shrink-0 rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white"
          aria-label="상세 패널"
        >
          ›
        </button>
      </div>
    );
  }

  return (
    <Link
      href={`/venues/${venue.slug}`}
      id={`venue-card-${venue.id}`}
      className={`block rounded-lg border bg-white p-4 shadow-sm transition ${
        selected
          ? "border-hyrox-yellow ring-2 ring-hyrox-yellow/40"
          : "border-zinc-200 hover:border-zinc-400"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-zinc-900">{venue.name}</h3>
        {distance && (
          <span className="shrink-0 text-sm text-zinc-500">{distance}</span>
        )}
      </div>
      <p className="mt-1 text-sm text-zinc-600">{venue.region}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        <span className="rounded bg-hyrox-yellow px-2 py-0.5 text-xs font-medium text-hyrox-black">
          {TRUST_LABELS[venue.trustLevel] ?? venue.trustLevel}
        </span>
        {venue.dropInAvailable && (
          <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700">
            드랍인
          </span>
        )}
        {venue.tags.slice(0, 3).map((t) => (
          <span
            key={t}
            className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600"
          >
            {TAG_LABELS[t] ?? t}
          </span>
        ))}
      </div>
    </Link>
  );
}
