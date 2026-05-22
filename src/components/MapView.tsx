"use client";

import dynamic from "next/dynamic";
import type { VenueDTO } from "@/lib/types";
import { isKakaoMapEnabled } from "@/lib/kakao-map";
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
 * 카카오맵: NEXT_PUBLIC_KAKAO_MAP_KEY + DISABLE_MAP 미설정 시.
 * 로컬 느리면 .env.local에 NEXT_PUBLIC_DISABLE_MAP=1 (선택).
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
  if (!isKakaoMapEnabled()) {
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
