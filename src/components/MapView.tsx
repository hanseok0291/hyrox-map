"use client";

import type { VenueDTO } from "@/lib/types";
import { getKakaoMapKey } from "@/lib/kakao-map";
import { KakaoMap } from "./KakaoMap";
import { MapPlaceholder } from "./MapPlaceholder";

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
