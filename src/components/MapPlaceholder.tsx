"use client";

import type { VenueDTO } from "@/lib/types";

/**
 * Kakao Map SDK placeholder until NEXT_PUBLIC_KAKAO_MAP_KEY is set.
 * Set key in .env.local — see README.
 */
export function MapPlaceholder({
  venues,
  center,
  onSelect,
}: {
  venues: VenueDTO[];
  center: { lat: number; lng: number };
  onSelect?: (venue: VenueDTO) => void;
}) {
  const hasKey = Boolean(process.env.NEXT_PUBLIC_KAKAO_MAP_KEY);

  return (
    <div className="relative h-full min-h-0 w-full bg-zinc-100">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
        {!hasKey ? (
          <>
            <p className="text-sm font-medium text-zinc-700">지도 영역</p>
            <p className="max-w-xs text-xs text-zinc-500">
              `.env.local`에 `NEXT_PUBLIC_KAKAO_MAP_KEY`를 설정하면 카카오맵이
              표시됩니다. 현재는 목록·핀 좌표만 사용합니다.
            </p>
          </>
        ) : (
          <p className="text-sm text-zinc-600">카카오맵 로딩…</p>
        )}
        <p className="text-xs text-zinc-400">
          중심: {center.lat.toFixed(4)}, {center.lng.toFixed(4)} ·{" "}
          {venues.length}곳
        </p>
      </div>
      <div className="absolute bottom-2 left-2 right-2 flex gap-1 overflow-x-auto">
        {venues.slice(0, 8).map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => onSelect?.(v)}
            className="shrink-0 rounded-full bg-hyrox-yellow px-2 py-1 text-xs font-medium text-hyrox-black shadow"
            title={v.name}
          >
            {v.name.slice(0, 8)}
          </button>
        ))}
      </div>
    </div>
  );
}
