"use client";

import { useEffect, useRef, useState } from "react";
import type { VenueDTO } from "@/lib/types";
import { TAG_LABELS, TRUST_LABELS } from "@/lib/types";
import { getKakaoMapKey, loadKakaoMapSdk } from "@/lib/kakao-map";

function buildInfoWindowContent(venue: VenueDTO): string {
  const distance =
    venue.distanceKm != null
      ? venue.distanceKm < 1
        ? `${Math.round(venue.distanceKm * 1000)}m`
        : `${venue.distanceKm.toFixed(1)}km`
      : "";
  const tags = venue.tags
    .slice(0, 3)
    .map((t) => TAG_LABELS[t] ?? t)
    .join(" · ");
  const trust = TRUST_LABELS[venue.trustLevel] ?? venue.trustLevel;
  const dropIn = venue.dropInAvailable ? " · 드랍인" : "";

  return `
    <div style="padding:8px 4px;min-width:160px;max-width:220px;font-family:sans-serif;">
      <div style="font-weight:600;font-size:14px;color:#18181b;margin-bottom:4px;">${escapeHtml(venue.name)}</div>
      <div style="font-size:12px;color:#52525b;margin-bottom:6px;">${escapeHtml(venue.region)}</div>
      <div style="font-size:11px;color:#ea580c;margin-bottom:6px;">${distance ? distance + " · " : ""}${escapeHtml(trust)}${dropIn}</div>
      ${tags ? `<div style="font-size:11px;color:#71717a;margin-bottom:8px;">${escapeHtml(tags)}</div>` : ""}
      <a href="/venues/${venue.slug}" style="display:block;text-align:center;background:#f97316;color:#fff;padding:8px;border-radius:8px;font-size:12px;font-weight:600;text-decoration:none;">상세 보기</a>
    </div>
  `;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function KakaoMap({
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
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const markersRef = useRef<kakao.maps.Marker[]>([]);
  const infoWindowRef = useRef<kakao.maps.InfoWindow | null>(null);
  const onSelectRef = useRef(onSelect);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  onSelectRef.current = onSelect;

  useEffect(() => {
    const appKey = getKakaoMapKey();
    if (!appKey || !containerRef.current) return;

    let cancelled = false;

    loadKakaoMapSdk(appKey)
      .then((kakao) => {
        if (cancelled || !containerRef.current) return;
        const mapCenter = new kakao.maps.LatLng(center.lat, center.lng);
        const map = new kakao.maps.Map(containerRef.current, {
          center: mapCenter,
          level: 5,
        });
        mapRef.current = map;
        infoWindowRef.current = new kakao.maps.InfoWindow({ removable: true });
        setReady(true);
        setError(null);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "지도 로드 실패");
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- init once
  }, []);

  useEffect(() => {
    if (!ready || !mapRef.current || !window.kakao?.maps) return;
    const latlng = new window.kakao.maps.LatLng(center.lat, center.lng);
    mapRef.current.setCenter(latlng);
  }, [center.lat, center.lng, ready]);

  useEffect(() => {
    if (!ready || !mapRef.current || !window.kakao?.maps) return;

    const kakao = window.kakao;
    const map = mapRef.current;
    const infoWindow = infoWindowRef.current;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    venues.forEach((venue) => {
      const position = new kakao.maps.LatLng(venue.lat, venue.lng);
      const marker = new kakao.maps.Marker({
        map: map!,
        position,
        title: venue.name,
        clickable: true,
      });
      kakao.maps.event.addListener(marker, "click", () => {
        onSelectRef.current?.(venue);
        if (infoWindow) {
          infoWindow.setContent(buildInfoWindowContent(venue));
          infoWindow.open(map!, marker);
        }
      });
      markersRef.current.push(marker);
    });

    if (venues.length === 1) {
      map!.setCenter(new kakao.maps.LatLng(venues[0].lat, venues[0].lng));
    }
  }, [venues, ready]);

  useEffect(() => {
    if (!ready || !selectedId || !mapRef.current || !window.kakao?.maps) return;
    const venue = venues.find((v) => v.id === selectedId);
    if (!venue) return;

    const kakao = window.kakao;
    const map = mapRef.current;
    const idx = venues.findIndex((v) => v.id === selectedId);
    const marker = markersRef.current[idx];

    map.setCenter(new kakao.maps.LatLng(venue.lat, venue.lng));
    map.setLevel(4);

    if (infoWindowRef.current && marker) {
      infoWindowRef.current.setContent(buildInfoWindowContent(venue));
      infoWindowRef.current.open(map, marker);
    }
  }, [selectedId, venues, ready]);

  return (
    <div className="relative h-full min-h-[280px] w-full">
      <div ref={containerRef} className="h-full w-full" />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-100/90 p-4 text-center text-sm text-red-700">
          {error}
          <br />
          <span className="mt-2 text-xs text-zinc-600">
            docs/KAKAO_MAP.md 참고
          </span>
        </div>
      )}
      {!ready && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-50 text-sm text-zinc-500">
          지도 불러오는 중…
        </div>
      )}
    </div>
  );
}
