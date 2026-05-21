"use client";

import Link from "next/link";
import type { VenueFilters } from "@/components/FilterSheet";
import { QuickFilterChips } from "@/components/QuickFilterChips";

export function MapMobileChrome({
  filters,
  onFiltersChange,
  venueCount,
  loading,
  onOpenList,
  onOpenFilter,
  onMyLocation,
}: {
  filters: VenueFilters;
  onFiltersChange: (f: VenueFilters) => void;
  venueCount: number;
  loading: boolean;
  onOpenList: () => void;
  onOpenFilter: () => void;
  onMyLocation: () => void;
}) {
  return (
    <>
      {/* Top floating stack */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex flex-col gap-2 p-3 pt-[max(0.75rem,env(safe-area-inset-top))] lg:hidden">
        <div className="pointer-events-auto rounded-2xl bg-[#2a2a2a]/88 px-3 py-2.5 shadow-lg backdrop-blur-md">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/45">
              ⌕
            </span>
            <input
              type="search"
              placeholder="시설·지역 검색"
              value={filters.q}
              onChange={(e) =>
                onFiltersChange({ ...filters, q: e.target.value })
              }
              className="w-full rounded-full border-0 bg-white/10 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-white/45 focus:bg-white/15 focus:outline-none focus:ring-1 focus:ring-white/30"
            />
          </div>
        </div>

        <div className="pointer-events-auto rounded-2xl bg-[#2a2a2a]/88 px-3 py-2.5 shadow-lg backdrop-blur-md">
          <p className="mb-2 text-[11px] font-medium text-white/55">
            {loading ? "불러오는 중…" : `근처 시뮬 가능 시설 ${venueCount}곳`}
          </p>
          <QuickFilterChips filters={filters} onChange={onFiltersChange} />
        </div>
      </div>

      {/* My location — bottom right */}
      <button
        type="button"
        onClick={onMyLocation}
        className="absolute bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-3 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white text-zinc-800 shadow-lg lg:hidden"
        aria-label="내 위치"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5"
          aria-hidden
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
        </svg>
      </button>

      {/* Bottom nav pill */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
        <nav className="pointer-events-auto flex w-full max-w-sm items-center gap-1 rounded-full bg-[#2a2a2a]/92 px-2 py-2 shadow-xl backdrop-blur-md">
          <button
            type="button"
            onClick={onOpenList}
            className="flex flex-1 flex-col items-center gap-0.5 rounded-full py-2 text-[11px] font-medium text-white/90 hover:bg-white/10"
          >
            <span className="text-base" aria-hidden>
              ☰
            </span>
            목록
            {!loading && (
              <span className="text-[10px] text-white/70">{venueCount}</span>
            )}
          </button>

          <Link
            href="/report"
            className="flex flex-[1.4] items-center justify-center gap-1 rounded-full bg-zinc-900 px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-zinc-800"
          >
            <span className="text-lg leading-none">+</span>
            제보
          </Link>

          <button
            type="button"
            onClick={onOpenFilter}
            className="flex flex-1 flex-col items-center gap-0.5 rounded-full py-2 text-[11px] font-medium text-white/90 hover:bg-white/10"
          >
            <span className="text-base" aria-hidden>
              🏋
            </span>
            필터
          </button>
        </nav>
      </div>
    </>
  );
}
