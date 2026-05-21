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
  const venuesByIdRef = useRef<Map<string, VenueDTO>>(new Map());
  const onSelectRef = useRef(onSelect);
  const venuesKeyRef = useRef("");
  const selectedIdRef = useRef<string | null>(null);
  const centerAppliedRef = useRef("");
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  onSelectRef.current = onSelect;

  const venuesKey = venues.map((v) => v.id).join(",");

  useEffect(() => {
    venuesByIdRef.current = new Map(venues.map((v) => [v.id, v]));
  }, [venuesKey, venues]);

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
        centerAppliedRef.current = `${center.lat},${center.lng}`;
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
    const key = `${center.lat.toFixed(5)},${center.lng.toFixed(5)}`;
    if (centerAppliedRef.current === key) return;
    centerAppliedRef.current = key;
    const latlng = new window.kakao.maps.LatLng(center.lat, center.lng);
    mapRef.current.setCenter(latlng);
  }, [center.lat, center.lng, ready]);

  useEffect(() => {
    if (!ready || !mapRef.current || !window.kakao?.maps) return;
    if (venuesKeyRef.current === venuesKey) return;
    venuesKeyRef.current = venuesKey;

    const kakao = window.kakao;
    const map = mapRef.current;

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
      });
      markersRef.current.push(marker);
    });

    if (venues.length === 1) {
      map!.setCenter(new kakao.maps.LatLng(venues[0].lat, venues[0].lng));
    }
  }, [venuesKey, ready, venues]);

  useEffect(() => {
    if (!ready || !mapRef.current || !window.kakao?.maps) return;
    if (selectedIdRef.current === selectedId) return;
    selectedIdRef.current = selectedId ?? null;

    if (!selectedId) return;

    const venue = venuesByIdRef.current.get(selectedId);
    if (!venue) return;

    const kakao = window.kakao;
    const map = mapRef.current;
    map.setCenter(new kakao.maps.LatLng(venue.lat, venue.lng));
    map.setLevel(4);
  }, [selectedId, ready, venuesKey, venues]);

  return (
    <div className="kakao-map-host relative h-full min-h-0 w-full">
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
