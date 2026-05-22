"use client";

import {
  getKakaoMapKey,
  isKakaoMapDisabledByEnv,
} from "@/lib/kakao-map";
import type { VenueDTO } from "@/lib/types";

/**
 * 카카오맵 미사용 시 플레이스홀더 (키 없음 · 로컬 DISABLE_MAP).
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
  const disabled = isKakaoMapDisabledByEnv();
  const hasKey = Boolean(getKakaoMapKey());

  return (
    <div className="relative h-full min-h-0 w-full bg-zinc-100">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
        {disabled ? (
          <>
            <p className="text-sm font-medium text-zinc-700">
              지도 끔 (로컬 개발 모드)
            </p>
            <p className="max-w-xs text-xs text-zinc-500">
              `.env.local`의 `NEXT_PUBLIC_DISABLE_MAP=1` 때문에 카카오맵을
              불러오지 않습니다. 목록·상세는 그대로 테스트할 수 있습니다.
            </p>
            <p className="text-[11px] text-zinc-400">
              배포(Vercel)에는 이 변수를 넣지 않으면 지도가 켜집니다.
            </p>
          </>
        ) : !hasKey ? (
          <>
            <p className="text-sm font-medium text-zinc-700">
              카카오맵 키가 없습니다
            </p>
            <p className="max-w-sm text-xs text-zinc-500">
              `.env` 또는 `.env.local`에{" "}
              <code className="text-zinc-700">NEXT_PUBLIC_KAKAO_MAP_KEY</code>에
              카카오 <strong>JavaScript 키</strong>를 넣어 주세요. (
              <code>KAKAO_REST_API_KEY</code>와는 다른 키입니다.) 빈 문자열{" "}
              <code>&quot;&quot;</code> 이면 동작하지 않습니다.
            </p>
            <p className="text-[11px] text-zinc-400">
              developers.kakao.com → 앱 → 앱 키 · Web 플랫폼에
              http://localhost:3000 등록
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
