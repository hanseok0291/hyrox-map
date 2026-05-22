import { NextRequest, NextResponse } from "next/server";
import {
  DEFAULT_VENUE_RADIUS_KM,
  MAX_VENUE_RADIUS_KM,
} from "@/lib/map-radius";
import { venueMatchesAllFilterTags } from "@/lib/simulation-tags";
import { haversineKm, parseTags } from "@/lib/venue";
import { listPublishedVenues, venuesToDtos } from "@/lib/venues-store";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const radiusParam = searchParams.get("radiusKm");
  const tags = searchParams.get("tags")?.split(",").filter(Boolean);
  const venueType = searchParams.get("venueType");
  const trustLevel = searchParams.get("trustLevel");
  const dropInOnly = searchParams.get("dropIn") === "1";
  const q = searchParams.get("q")?.trim();

  const userLat = lat ? parseFloat(lat) : undefined;
  const userLng = lng ? parseFloat(lng) : undefined;

  let radiusKm = radiusParam
    ? parseFloat(radiusParam)
    : DEFAULT_VENUE_RADIUS_KM;
  if (!Number.isFinite(radiusKm) || radiusKm <= 0) {
    radiusKm = DEFAULT_VENUE_RADIUS_KM;
  }
  radiusKm = Math.min(radiusKm, MAX_VENUE_RADIUS_KM);

  let venues = await listPublishedVenues();

  if (venueType) venues = venues.filter((v) => v.venueType === venueType);
  if (trustLevel) venues = venues.filter((v) => v.trustLevel === trustLevel);
  if (dropInOnly) venues = venues.filter((v) => v.dropInAvailable);

  const matchesQuery = (v: (typeof venues)[0], lower: string) =>
    v.name.toLowerCase().includes(lower) ||
    v.region.toLowerCase().includes(lower) ||
    v.address.toLowerCase().includes(lower);

  if (q) {
    const lower = q.toLowerCase();
    venues = venues.filter((v) => matchesQuery(v, lower));
  }

  if (userLat != null && userLng != null) {
    const withDistance = venues.map((v) => ({
      venue: v,
      distanceKm: haversineKm(userLat, userLng, v.lat, v.lng),
    }));

    if (q) {
      // 검색어 일치 시설은 좌표 오류가 있어도 목록에 표시 (거리순 정렬)
      venues = withDistance
        .sort((a, b) => a.distanceKm - b.distanceKm)
        .map((x) => x.venue);
    } else {
      venues = withDistance
        .filter((x) => x.distanceKm <= radiusKm)
        .sort((a, b) => a.distanceKm - b.distanceKm)
        .map((x) => x.venue);
    }
  }

  if (tags?.length) {
    venues = venues.filter((v) => {
      const vt = parseTags(v.tags);
      return venueMatchesAllFilterTags(vt, tags);
    });
  }

  const dtos = venuesToDtos(venues, userLat, userLng);

  return NextResponse.json({
    venues: dtos,
    meta: {
      radiusKm,
      center:
        userLat != null && userLng != null
          ? { lat: userLat, lng: userLng }
          : null,
      count: dtos.length,
    },
  });
}
