"use client";

import { SIMULATION_TAGS, TAG_LABELS, VENUE_TYPES, VENUE_TYPE_LABELS } from "@/lib/types";

export type VenueFilters = {
  q: string;
  venueType: string;
  tags: string[];
  dropInOnly: boolean;
};

export function FilterSheet({
  filters,
  onChange,
}: {
  filters: VenueFilters;
  onChange: (f: VenueFilters) => void;
}) {
  const toggleTag = (tag: string) => {
    const tags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    onChange({ ...filters, tags });
  };

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
