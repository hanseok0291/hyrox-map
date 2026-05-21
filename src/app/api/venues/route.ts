import { NextRequest, NextResponse } from "next/server";
import { listPublishedVenues, venuesToDtos } from "@/lib/venues-store";
import { venueMatchesAllFilterTags } from "@/lib/simulation-tags";
import { parseTags } from "@/lib/venue";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const tags = searchParams.get("tags")?.split(",").filter(Boolean);
  const venueType = searchParams.get("venueType");
  const trustLevel = searchParams.get("trustLevel");
  const dropInOnly = searchParams.get("dropIn") === "1";
  const q = searchParams.get("q")?.trim();

  const userLat = lat ? parseFloat(lat) : undefined;
  const userLng = lng ? parseFloat(lng) : undefined;

  let venues = await listPublishedVenues();

  if (venueType) venues = venues.filter((v) => v.venueType === venueType);
  if (trustLevel) venues = venues.filter((v) => v.trustLevel === trustLevel);
  if (dropInOnly) venues = venues.filter((v) => v.dropInAvailable);
  if (q) {
    const lower = q.toLowerCase();
    venues = venues.filter(
      (v) =>
        v.name.toLowerCase().includes(lower) ||
        v.region.toLowerCase().includes(lower) ||
        v.address.toLowerCase().includes(lower)
    );
  }

  if (tags?.length) {
    venues = venues.filter((v) => {
      const vt = parseTags(v.tags);
      return venueMatchesAllFilterTags(vt, tags);
    });
  }

  let dtos = venuesToDtos(venues, userLat, userLng);

  if (userLat != null && userLng != null) {
    dtos.sort((a, b) => (a.distanceKm ?? 99) - (b.distanceKm ?? 99));
  }

  return NextResponse.json({ venues: dtos });
}
