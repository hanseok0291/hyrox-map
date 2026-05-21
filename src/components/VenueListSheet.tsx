"use client";

import { useEffect } from "react";
import type { VenueFilters } from "@/components/FilterSheet";
import { FilterSheet } from "@/components/FilterSheet";
import { VenueList } from "@/components/VenueList";
import type { VenueDTO } from "@/lib/types";

export function VenueListSheet({
  open,
  onClose,
  filters,
  onFiltersChange,
  venues,
  loading,
  selectedId,
  onVenueSelect,
  initialTab = "list",
}: {
  open: boolean;
  onClose: () => void;
  filters: VenueFilters;
  onFiltersChange: (f: VenueFilters) => void;
  venues: VenueDTO[];
  loading: boolean;
  selectedId: string | null;
  onVenueSelect: (venue: VenueDTO) => void;
  initialTab?: "list" | "filter";
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-black/45"
        aria-label="닫기"
        onClick={onClose}
      />
      <div className="absolute inset-x-0 bottom-0 flex max-h-[min(85dvh,720px)] flex-col rounded-t-2xl bg-[#3d2c24] text-white shadow-2xl">
        <div className="flex shrink-0 justify-center py-3">
          <div className="h-1 w-10 rounded-full bg-white/25" />
        </div>

        <div className="flex items-center justify-between border-b border-white/10 px-4 pb-3">
          <h2 className="text-lg font-bold">
            {initialTab === "filter" ? "필터" : "근처 시설"}
            {!loading && initialTab === "list" && (
              <span className="ml-1 text-sm font-normal text-white/50">
                {venues.length}
              </span>
            )}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-white/60 hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {initialTab === "filter" && (
            <div className="border-b border-white/10 pb-2">
              <FilterSheet
                variant="sidebar"
                filters={filters}
                onChange={onFiltersChange}
              />
            </div>
          )}
          <VenueList
            variant="sidebar"
            venues={venues}
            loading={loading}
            selectedId={selectedId}
            onVenueSelect={(v) => {
              onVenueSelect(v);
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
}
