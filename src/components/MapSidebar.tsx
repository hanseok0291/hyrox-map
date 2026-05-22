"use client";

import Link from "next/link";
import { FilterSheet, type VenueFilters } from "@/components/FilterSheet";
import { VenueList } from "@/components/VenueList";
import type { VenueDTO } from "@/lib/types";

export function MapSidebar({
  filters,
  onFiltersChange,
  venues,
  loading,
  selectedId,
  onVenueSelect,
  onMyLocation,
  radiusKm,
  collapsed,
  onCollapsedChange,
}: {
  filters: VenueFilters;
  onFiltersChange: (f: VenueFilters) => void;
  venues: VenueDTO[];
  loading: boolean;
  selectedId: string | null;
  onVenueSelect: (venue: VenueDTO) => void;
  onMyLocation: () => void;
  radiusKm: number;
  collapsed: boolean;
  onCollapsedChange: (v: boolean) => void;
}) {
  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => onCollapsedChange(false)}
        className="map-panel-surface absolute left-4 top-4 z-30 hidden h-11 w-11 items-center justify-center rounded-full text-white shadow-lg hover:bg-hyrox-black lg:flex"
        aria-label="패널 열기"
      >
        →
      </button>
    );
  }

  return (
    <aside className="pointer-events-none absolute inset-y-0 left-0 z-30 hidden max-w-[400px] flex-col p-5 lg:flex">
      <div className="map-panel-surface pointer-events-auto flex h-full max-h-[calc(100dvh-2.5rem)] flex-col overflow-hidden rounded-2xl text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 border-b border-white/10 px-4 pb-3 pt-4">
          <div>
            <Link href="/" className="text-xl font-bold tracking-tight">
              하이록스 맵
            </Link>
            <p className="mt-0.5 text-[11px] text-white/55">
              비공식 커뮤니티 · HYROX와 무관
            </p>
          </div>
          <button
            type="button"
            onClick={() => onCollapsedChange(true)}
            className="hidden shrink-0 rounded-lg px-2 py-1 text-sm text-white/70 hover:bg-white/10 lg:inline"
            aria-label="패널 접기"
          >
            ≪
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <FilterSheet
            variant="sidebar"
            filters={filters}
            onChange={onFiltersChange}
          />

          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-xs font-medium text-white/70">
              {loading
                ? "불러오는 중…"
                : `반경 ${radiusKm}km · ${venues.length}곳`}
            </span>
            <button
              type="button"
              onClick={onMyLocation}
              className="text-xs text-white/80 hover:text-white"
            >
              내 위치
            </button>
          </div>

          <VenueList
            variant="sidebar"
            venues={venues}
            loading={loading}
            selectedId={selectedId}
            onVenueSelect={onVenueSelect}
          />
        </div>

        <div className="shrink-0 border-t border-white/10 p-4">
          <Link
            href="/report"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-hyrox-yellow py-3.5 text-sm font-bold text-hyrox-black shadow-lg hover:bg-hyrox-yellow-hover"
          >
            <span className="text-lg leading-none">+</span>
            시설 제보하기
          </Link>
        </div>
      </div>
    </aside>
  );
}
