import Link from "next/link";
import type { VenueDTO } from "@/lib/types";
import { TAG_LABELS, TRUST_LABELS } from "@/lib/types";

export function VenueCard({
  venue,
  selected,
}: {
  venue: VenueDTO;
  selected?: boolean;
}) {
  return (
    <Link
      href={`/venues/${venue.slug}`}
      id={`venue-card-${venue.id}`}
      className={`block rounded-lg border bg-white p-4 shadow-sm transition ${
        selected
          ? "border-orange-500 ring-2 ring-orange-200"
          : "border-zinc-200 hover:border-orange-400"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-zinc-900">{venue.name}</h3>
        {venue.distanceKm != null && (
          <span className="shrink-0 text-sm text-zinc-500">
            {venue.distanceKm < 1
              ? `${Math.round(venue.distanceKm * 1000)}m`
              : `${venue.distanceKm.toFixed(1)}km`}
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-zinc-600">{venue.region}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        <span className="rounded bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800">
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
