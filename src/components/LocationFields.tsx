"use client";

import { useState } from "react";
import {
  kakaoMapPlaceLink,
  naverMapSearchLink,
} from "@/lib/venue-location";

export function LocationFields({
  name,
  address,
  lat,
  lng,
  onNameChange,
  onAddressChange,
  onLatChange,
  onLngChange,
  variant = "light",
  showNameField = false,
}: {
  name: string;
  address: string;
  lat: number;
  lng: number;
  onNameChange?: (v: string) => void;
  onAddressChange: (v: string) => void;
  onLatChange: (v: number) => void;
  onLngChange: (v: number) => void;
  variant?: "light" | "dark";
  /** 수정 제보: 상호명 변경 */
  showNameField?: boolean;
}) {
  const label =
    variant === "dark" ? "text-sm font-semibold text-white" : "text-sm font-medium";
  const hint = variant === "dark" ? "text-xs text-white/50" : "text-xs text-zinc-500";
  const input =
    variant === "dark"
      ? "mt-1 w-full rounded-lg border border-white/15 bg-black/20 px-3 py-2 text-sm text-white"
      : "mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm";
  const inputSm =
    variant === "dark"
      ? "w-full rounded-lg border border-white/15 bg-black/20 px-2 py-1 text-sm text-white"
      : "w-full rounded-lg border border-zinc-300 px-2 py-1 text-sm";
  const link =
    variant === "dark"
      ? "text-hyrox-yellow underline hover:text-hyrox-yellow-hover"
      : "text-zinc-900 underline";
  const btn =
    variant === "dark"
      ? "rounded-lg bg-hyrox-yellow px-3 py-2 text-xs font-bold text-hyrox-black hover:bg-hyrox-yellow-hover disabled:opacity-50"
      : "rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-medium hover:bg-zinc-50 disabled:opacity-50";

  const [placeUrl, setPlaceUrl] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const importFromKakaoPlace = async () => {
    setImportError(null);
    if (!placeUrl.trim()) {
      setImportError("장소 URL 또는 ID를 입력하세요.");
      return;
    }
    setImporting(true);
    try {
      const res = await fetch(
        `/api/kakao-place?url=${encodeURIComponent(placeUrl.trim())}`
      );
      const data = (await res.json()) as {
        place?: { lat: number; lng: number; name: string; address: string };
        error?: string;
      };
      if (!res.ok || !data.place) {
        setImportError(data.error ?? "좌표를 가져오지 못했습니다.");
        return;
      }
      onLatChange(data.place.lat);
      onLngChange(data.place.lng);
      if (data.place.address) onAddressChange(data.place.address);
      if (data.place.name && onNameChange) onNameChange(data.place.name);
      setImportError(null);
    } catch {
      setImportError("네트워크 오류");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-3">
      <p className={hint}>
        상호 변경·이전·합병 등으로 이름·주소·핀 위치가 달라진 경우 모두
        맞춰 주세요. 네이버·카카오 좌표는 서로 다를 수 있어, 카카오맵 기준
        위·경도를 권장합니다.
      </p>
      <p className={`${hint} rounded-md bg-amber-50 px-2 py-1.5 text-amber-900`}>
        <code className="text-[11px]">place.map.kakao.com/숫자</code> 주소를
        붙여 넣으면 카카오 핀 좌표를 자동으로 채웁니다.{" "}
        <code className="text-[11px]">urlX</code>/<code className="text-[11px]">urlY</code>는
        쓰지 마세요. 카카오에 매장 사진이 없으면 하이록스 맵에는 이니셜만
        표시됩니다(거리 로드뷰는 사용하지 않음).
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={placeUrl}
          onChange={(e) => setPlaceUrl(e.target.value)}
          placeholder="https://place.map.kakao.com/129903224"
          className={input}
        />
        <button
          type="button"
          onClick={importFromKakaoPlace}
          disabled={importing}
          className={`${btn} shrink-0`}
        >
          {importing ? "가져오는 중…" : "카카오 핀 좌표 가져오기"}
        </button>
      </div>
      {importError && (
        <p className="text-xs text-red-600">{importError}</p>
      )}
      {showNameField && onNameChange && (
        <div>
          <label className={label}>상호명</label>
          <input
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className={input}
          />
        </div>
      )}
      <div className="flex flex-wrap gap-3 text-xs">
        <a
          href={naverMapSearchLink(`${name} ${address}`)}
          target="_blank"
          rel="noopener noreferrer"
          className={link}
        >
          네이버지도에서 찾기
        </a>
        <a
          href={kakaoMapPlaceLink(name, lat, lng)}
          target="_blank"
          rel="noopener noreferrer"
          className={link}
        >
          카카오맵에서 보기
        </a>
      </div>
      <div>
        <label className={label}>주소</label>
        <input
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          className={input}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={hint}>위도 (lat)</label>
          <input
            type="number"
            step="any"
            value={lat}
            onChange={(e) => onLatChange(parseFloat(e.target.value) || 0)}
            className={inputSm}
          />
        </div>
        <div>
          <label className={hint}>
            경도 (lng) · 서울은 보통 126~127
          </label>
          <input
            type="number"
            step="any"
            value={lng}
            onChange={(e) => onLngChange(parseFloat(e.target.value) || 0)}
            className={inputSm}
          />
        </div>
      </div>
    </div>
  );
}
