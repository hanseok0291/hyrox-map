"use client";

import { useEffect } from "react";
import type { VenueDTO } from "@/lib/types";
import { VenueCard } from "./VenueCard";

export function VenueList({
  venues,
  loading,
  selectedId,
}: {
  venues: VenueDTO[];
  loading?: boolean;
  selectedId?: string | null;
}) {
  useEffect(() => {
    if (!selectedId || loading) return;
    const el = document.getElementById(`venue-card-${selectedId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedId, loading]);

  if (loading) {
    return (
      <div className="flex flex-col gap-3 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-zinc-100" />
        ))}
      </div>
    );
  }

  if (!venues.length) {
    return (
      <p className="p-6 text-center text-sm text-zinc-500">
        조건에 맞는 시설이 없습니다. 필터를 바꾸거나{" "}
        <a href="/report" className="text-orange-600 underline">
          제보
        </a>
        해 주세요.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3 overflow-y-auto p-4">
      {venues.map((v) => (
        <VenueCard key={v.id} venue={v} selected={v.id === selectedId} />
      ))}
    </div>
  );
}
