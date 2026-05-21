"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { VenueFilters } from "@/components/FilterSheet";
import { MapMobileChrome } from "@/components/MapMobileChrome";
import { MapSidebar } from "@/components/MapSidebar";
import { MapView } from "@/components/MapView";
import { VenueListSheet } from "@/components/VenueListSheet";
import { VenueDetailPanel } from "@/components/VenueDetailPanel";
import {
  useDebouncedFilterKey,
  useDebouncedValue,
} from "@/hooks/useDebouncedValue";
import { venuesListSignature } from "@/lib/venue-list-signature";
import type { VenueDTO } from "@/lib/types";

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };

function filtersKey(f: VenueFilters) {
  return `${f.q}|${f.venueType}|${f.tags.join(",")}|${f.dropInOnly}`;
}

export default function HomePage() {
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [venues, setVenues] = useState<VenueDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVenue, setSelectedVenue] = useState<VenueDTO | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [listSheetOpen, setListSheetOpen] = useState(false);
  const [listSheetTab, setListSheetTab] = useState<"list" | "filter">("list");
  const [filters, setFilters] = useState<VenueFilters>({
    q: "",
    venueType: "",
    tags: [],
    dropInOnly: false,
  });

  const debouncedFilterKey = useDebouncedFilterKey(filtersKey(filters));
  const debouncedLat = useDebouncedValue(center.lat, 400);
  const debouncedLng = useDebouncedValue(center.lng, 400);

  const geoRequested = useRef(false);
  const venuesSigRef = useRef("");

  useEffect(() => {
    if (!navigator.geolocation || geoRequested.current) return;
    geoRequested.current = true;
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 120_000 }
    );
  }, []);

  const fetchKey = `${debouncedLat},${debouncedLng},${debouncedFilterKey}`;

  useEffect(() => {
    let cancelled = false;
    const isFirstLoad = venuesSigRef.current === "";

    if (isFirstLoad) setLoading(true);

    const params = new URLSearchParams({
      lat: String(debouncedLat),
      lng: String(debouncedLng),
    });
    const parsed = debouncedFilterKey.split("|");
    const [q, venueType, tagsCsv, dropInOnly] = parsed;
    if (q) params.set("q", q);
    if (venueType) params.set("venueType", venueType);
    if (tagsCsv) params.set("tags", tagsCsv);
    if (dropInOnly === "true") params.set("dropIn", "1");

    fetch(`/api/venues?${params}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const next: VenueDTO[] = data.venues ?? [];
        const sig = venuesListSignature(next);
        if (sig !== venuesSigRef.current) {
          venuesSigRef.current = sig;
          setVenues(next);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fetchKey]);

  const handleMyLocation = useCallback(() => {
    navigator.geolocation?.getCurrentPosition((p) =>
      setCenter({
        lat: p.coords.latitude,
        lng: p.coords.longitude,
      })
    );
  }, []);

  const openList = () => {
    setListSheetTab("list");
    setListSheetOpen(true);
  };

  const openFilter = () => {
    setListSheetTab("filter");
    setListSheetOpen(true);
  };

  const listLoading = loading && venues.length === 0;

  return (
    <div className="relative h-dvh w-full">
      <div className="absolute inset-0 isolate">
        <MapView
          venues={venues}
          center={center}
          selectedId={selectedVenue?.id ?? null}
          onSelect={setSelectedVenue}
        />
      </div>

      {!selectedVenue && (
        <MapSidebar
          filters={filters}
          onFiltersChange={setFilters}
          venues={venues}
          loading={listLoading}
          selectedId={null}
          onVenueSelect={setSelectedVenue}
          onMyLocation={handleMyLocation}
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />
      )}

      {!selectedVenue && (
        <MapMobileChrome
          filters={filters}
          onFiltersChange={setFilters}
          venueCount={venues.length}
          loading={listLoading}
          onOpenList={openList}
          onOpenFilter={openFilter}
          onMyLocation={handleMyLocation}
        />
      )}

      <VenueListSheet
        open={listSheetOpen}
        onClose={() => setListSheetOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
        venues={venues}
        loading={listLoading}
        selectedId={selectedVenue?.id ?? null}
        onVenueSelect={setSelectedVenue}
        initialTab={listSheetTab}
      />

      {selectedVenue && (
        <VenueDetailPanel
          venue={selectedVenue}
          onClose={() => setSelectedVenue(null)}
          onBackToList={() => setSelectedVenue(null)}
        />
      )}
    </div>
  );
}
