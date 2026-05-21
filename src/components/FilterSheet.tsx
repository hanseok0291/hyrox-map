"use client";

import {
  SIMULATION_TAGS,
  TAG_LABELS,
  VENUE_TYPES,
  VENUE_TYPE_LABELS,
} from "@/lib/types";

export type VenueFilters = {
  q: string;
  venueType: string;
  tags: string[];
  dropInOnly: boolean;
};

const QUICK_FILTERS: {
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

export function FilterSheet({
  filters,
  onChange,
  variant = "default",
}: {
  filters: VenueFilters;
  onChange: (f: VenueFilters) => void;
  variant?: "default" | "sidebar";
}) {
  const isSidebar = variant === "sidebar";

  const toggleTag = (tag: string) => {
    const tags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    onChange({ ...filters, tags });
  };

  if (isSidebar) {
    return (
      <div className="space-y-3 px-4 pt-3">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
            ⌕
          </span>
          <input
            type="search"
            placeholder="시설명·지역 검색"
            value={filters.q}
            onChange={(e) => onChange({ ...filters, q: e.target.value })}
            className="w-full rounded-xl border border-white/10 bg-black/25 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-white/40 focus:border-orange-400/50 focus:outline-none"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {QUICK_FILTERS.map((qf) => (
            <button
              key={qf.id}
              type="button"
              onClick={() => onChange(qf.apply(filters))}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                qf.isActive(filters)
                  ? "bg-orange-500 text-white"
                  : "bg-white/10 text-white/80 hover:bg-white/15"
              }`}
            >
              {qf.label}
            </button>
          ))}
        </div>

        <details className="group text-xs text-white/60">
          <summary className="cursor-pointer list-none py-1 hover:text-white/80 [&::-webkit-details-marker]:hidden">
            + 상세 필터
          </summary>
          <div className="mt-2 space-y-2 border-t border-white/10 pt-2">
            <select
              value={filters.venueType}
              onChange={(e) =>
                onChange({ ...filters, venueType: e.target.value })
              }
              className="w-full rounded-lg border border-white/10 bg-black/25 px-2 py-1.5 text-sm text-white"
            >
              <option value="">시설 유형 전체</option>
              {VENUE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {VENUE_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
            <div className="flex flex-wrap gap-1.5">
              {SIMULATION_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full px-2.5 py-1 text-[11px] ${
                    filters.tags.includes(tag)
                      ? "bg-orange-500/90 text-white"
                      : "bg-white/10 text-white/75"
                  }`}
                >
                  {TAG_LABELS[tag]}
                </button>
              ))}
            </div>
          </div>
        </details>
      </div>
    );
  }

  return (
    <div className="space-y-4 border-b border-zinc-200 bg-white p-4">
      <input
        type="search"
        placeholder="시설명·지역·역 검색"
        value={filters.q}
        onChange={(e) => onChange({ ...filters, q: e.target.value })}
        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
      />
      <div>
        <label className="text-xs font-medium text-zinc-500">시설 유형</label>
        <select
          value={filters.venueType}
          onChange={(e) => onChange({ ...filters, venueType: e.target.value })}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        >
          <option value="">전체</option>
          {VENUE_TYPES.map((t) => (
            <option key={t} value={t}>
              {VENUE_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap gap-2">
        {SIMULATION_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => toggleTag(tag)}
            className={`rounded-full px-3 py-1 text-xs ${
              filters.tags.includes(tag)
                ? "bg-orange-500 text-white"
                : "bg-zinc-100 text-zinc-700"
            }`}
          >
            {TAG_LABELS[tag]}
          </button>
        ))}
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={filters.dropInOnly}
          onChange={(e) =>
            onChange({ ...filters, dropInOnly: e.target.checked })
          }
        />
        드랍인 가능만
      </label>
    </div>
  );
}
