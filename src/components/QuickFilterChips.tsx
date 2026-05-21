"use client";

import type { VenueFilters } from "@/components/FilterSheet";

export const QUICK_FILTERS: {
  id: string;
  label: string;
  apply: (f: VenueFilters) => VenueFilters;
  isActive: (f: VenueFilters) => boolean;
}[] = [
  {
    id: "all",
    label: "전체",
    apply: (f) => ({ ...f, venueType: "", tags: [], dropInOnly: false }),
    isActive: (f) =>
      !f.venueType && f.tags.length === 0 && !f.dropInOnly && !f.q,
  },
  {
    id: "dropin",
    label: "드랍인",
    apply: (f) => ({ ...f, dropInOnly: true }),
    isActive: (f) => f.dropInOnly,
  },
  {
    id: "outdoor_run",
    label: "야외런",
    apply: (f) => ({
      ...f,
      tags: f.tags.includes("outdoor_run")
        ? f.tags
        : [...f.tags, "outdoor_run"],
    }),
    isActive: (f) => f.tags.includes("outdoor_run"),
  },
  {
    id: "sled",
    label: "슬래드",
    apply: (f) => ({
      ...f,
      tags: f.tags.includes("sled_push_pull")
        ? f.tags
        : [...f.tags, "sled_push_pull"],
    }),
    isActive: (f) => f.tags.includes("sled_push_pull"),
  },
  {
    id: "official",
    label: "공식",
    apply: (f) => ({ ...f, venueType: "official_club" }),
    isActive: (f) => f.venueType === "official_club",
  },
];

export function QuickFilterChips({
  filters,
  onChange,
  className = "",
}: {
  filters: VenueFilters;
  onChange: (f: VenueFilters) => void;
  className?: string;
}) {
  return (
    <div
      className={`flex gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
    >
      {QUICK_FILTERS.map((qf) => (
        <button
          key={qf.id}
          type="button"
          onClick={() => onChange(qf.apply(filters))}
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
            qf.isActive(filters)
              ? "bg-orange-500 text-white"
              : "bg-white/15 text-white/90 hover:bg-white/20"
          }`}
        >
          {qf.label}
        </button>
      ))}
    </div>
  );
}
