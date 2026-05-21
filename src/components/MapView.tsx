"use client";

import dynamic from "next/dynamic";
import type { VenueDTO } from "@/lib/types";
import { getKakaoMapKey } from "@/lib/kakao-map";
import { MapPlaceholder } from "./MapPlaceholder";

const KakaoMap = dynamic(
  () => import("./KakaoMap").then((m) => m.KakaoMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-zinc-50 text-sm text-zinc-500">
        지도 불러오는 중…
      </div>
    ),
  }
);

/**
 * Kakao key가 있으면 KakaoMap, 없으면 Placeholder(안내 + 하단 칩).
 */
export function MapView({
  venues,
  center,
  onSelect,
  selectedId,
}: {
  venues: VenueDTO[];
  center: { lat: number; lng: number };
  onSelect?: (venue: VenueDTO) => void;
  selectedId?: string | null;
}) {
  const hasKey = Boolean(getKakaoMapKey());

  if (!hasKey) {
    return (
      <MapPlaceholder venues={venues} center={center} onSelect={onSelect} />
    );
  }

  return (
    <KakaoMap
      venues={venues}
      center={center}
      onSelect={onSelect}
      selectedId={selectedId}
    />
  );
}
