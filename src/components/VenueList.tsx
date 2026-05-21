"use client";

import { useEffect } from "react";
import type { VenueDTO } from "@/lib/types";
import { VenueCard } from "./VenueCard";

export function VenueList({
  venues,
  loading,
  selectedId,
  variant = "default",
  onVenueSelect,
}: {
  venues: VenueDTO[];
  loading?: boolean;
  selectedId?: string | null;
  variant?: "default" | "sidebar";
  onVenueSelect?: (venue: VenueDTO) => void;
}) {
  const isSidebar = variant === "sidebar";

  useEffect(() => {
    if (!selectedId || loading) return;
    const el = document.getElementById(`venue-card-${selectedId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedId, loading]);

  if (loading) {
    return (
      <div className={`flex flex-col gap-2 ${isSidebar ? "px-3 pb-3" : "gap-3 p-4"}`}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`rounded-xl ${
              isSidebar ? "h-16 bg-white/10" : "h-24 bg-zinc-100"
            }`}
          />
        ))}
      </div>
    );
  }

  if (!venues.length) {
    return (
      <p
        className={`text-center text-sm ${
          isSidebar ? "px-4 py-8 text-white/50" : "p-6 text-zinc-500"
        }`}
      >
        조건에 맞는 시설이 없습니다.{" "}
        <a
          href="/report"
          className={isSidebar ? "text-white/80 underline" : "text-zinc-900 underline"}
        >
          제보
        </a>
        해 주세요.
      </p>
    );
  }

  return (
    <div
      className={
        isSidebar
          ? "flex flex-col gap-0.5 px-1 pb-3"
          : "flex flex-col gap-3 overflow-y-auto p-4"
      }
    >
      {venues.map((v) => (
        <VenueCard
          key={v.id}
          venue={v}
          selected={v.id === selectedId}
          variant={variant}
          onSelect={onVenueSelect}
        />
      ))}
    </div>
  );
}
