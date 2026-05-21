"use client";

import { useEffect, useRef, useState } from "react";
import type { VenueDTO } from "@/lib/types";
import { getKakaoMapKey, loadKakaoMapSdk } from "@/lib/kakao-map";

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
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // Initialize map once
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- init once per mount
  }, []);

  // Pan center when user location / filter changes center
  useEffect(() => {
    if (!ready || !mapRef.current || !window.kakao?.maps) return;
    const latlng = new window.kakao.maps.LatLng(center.lat, center.lng);
    mapRef.current.setCenter(latlng);
  }, [center.lat, center.lng, ready]);

  // Sync markers with venues
  useEffect(() => {
    if (!ready || !mapRef.current || !window.kakao?.maps) return;

    const kakao = window.kakao;
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    venues.forEach((venue) => {
      const position = new kakao.maps.LatLng(venue.lat, venue.lng);
      const marker = new kakao.maps.Marker({
        map: mapRef.current!,
        position,
        title: venue.name,
        clickable: true,
      });
      kakao.maps.event.addListener(marker, "click", () => {
        onSelect?.(venue);
      });
      markersRef.current.push(marker);
    });

    if (venues.length === 1) {
      mapRef.current.setCenter(
        new kakao.maps.LatLng(venues[0].lat, venues[0].lng)
      );
    }
  }, [venues, ready, onSelect]);

  // Highlight selected venue
  useEffect(() => {
    if (!ready || !selectedId || !mapRef.current || !window.kakao?.maps) return;
    const venue = venues.find((v) => v.id === selectedId);
    if (!venue) return;
    mapRef.current.setCenter(
      new window.kakao.maps.LatLng(venue.lat, venue.lng)
    );
    mapRef.current.setLevel(4);
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
