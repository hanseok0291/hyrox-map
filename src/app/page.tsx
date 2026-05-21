"use client";

import { useCallback, useEffect, useState } from "react";
import type { VenueFilters } from "@/components/FilterSheet";
import { MapSidebar } from "@/components/MapSidebar";
import { MapView } from "@/components/MapView";
import { VenueMapOverlay } from "@/components/VenueMapOverlay";
import type { VenueDTO } from "@/lib/types";

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };

export default function HomePage() {
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [venues, setVenues] = useState<VenueDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVenue, setSelectedVenue] = useState<VenueDTO | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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

  const handleMyLocation = () => {
    navigator.geolocation?.getCurrentPosition((p) =>
      setCenter({
        lat: p.coords.latitude,
        lng: p.coords.longitude,
      })
    );
  };

  return (
    <div className="relative h-dvh w-full">
      {/* Full-screen map */}
      <div className="absolute inset-0">
        <MapView
          venues={venues}
          center={center}
          selectedId={selectedVenue?.id ?? null}
          onSelect={setSelectedVenue}
        />
      </div>

      {/* Floating sidebar (PC) / top panel area (mobile uses full width sidebar overlay) */}
      <MapSidebar
        filters={filters}
        onFiltersChange={setFilters}
        venues={venues}
        loading={loading}
        selectedId={selectedVenue?.id ?? null}
        onVenueSelect={setSelectedVenue}
        onMyLocation={handleMyLocation}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Mobile-only bottom card when marker selected */}
      {selectedVenue && (
        <div className="lg:hidden">
          <VenueMapOverlay
            venue={selectedVenue}
            onClose={() => setSelectedVenue(null)}
          />
        </div>
      )}
    </div>
  );
}
