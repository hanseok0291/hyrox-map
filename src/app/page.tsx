"use client";

import { useCallback, useEffect, useState } from "react";
import { FilterSheet, type VenueFilters } from "@/components/FilterSheet";
import { MapView } from "@/components/MapView";
import { VenueList } from "@/components/VenueList";
import type { VenueDTO } from "@/lib/types";

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };

export default function HomePage() {
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [venues, setVenues] = useState<VenueDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVenue, setSelectedVenue] = useState<VenueDTO | null>(null);
  const [filters, setFilters] = useState<VenueFilters>({
    q: "",
    venueType: "",
    tags: [],
    dropInOnly: false,
  });

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }, []);

  const fetchVenues = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      lat: String(center.lat),
      lng: String(center.lng),
    });
    if (filters.q) params.set("q", filters.q);
    if (filters.venueType) params.set("venueType", filters.venueType);
    if (filters.tags.length) params.set("tags", filters.tags.join(","));
    if (filters.dropInOnly) params.set("dropIn", "1");

    const res = await fetch(`/api/venues?${params}`);
    const data = await res.json();
    setVenues(data.venues ?? []);
    setLoading(false);
  }, [center, filters]);

  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col lg:h-[calc(100vh-4rem)] lg:flex-row">
      <div className="lg:w-[58%]">
        <FilterSheet filters={filters} onChange={setFilters} />
        <div className="h-[40vh] lg:h-[calc(100%-12rem)]">
          <MapView
            venues={venues}
            center={center}
            selectedId={selectedVenue?.id ?? null}
            onSelect={setSelectedVenue}
          />
        </div>
        <div className="border-t border-zinc-200 bg-white px-4 py-2 lg:hidden">
          <button
            type="button"
            onClick={() => {
              navigator.geolocation?.getCurrentPosition((p) =>
                setCenter({
                  lat: p.coords.latitude,
                  lng: p.coords.longitude,
                })
              );
            }}
            className="text-sm text-orange-600"
          >
            내 위치로
          </button>
        </div>
      </div>
      <aside className="border-t border-zinc-200 lg:w-[42%] lg:border-l lg:border-t-0">
        <h2 className="border-b border-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700">
          근처 시설 {loading ? "…" : `(${venues.length})`}
        </h2>
        <div className="max-h-[50vh] overflow-y-auto lg:max-h-none lg:flex-1">
          <VenueList venues={venues} loading={loading} />
        </div>
      </aside>
    </div>
  );
}
