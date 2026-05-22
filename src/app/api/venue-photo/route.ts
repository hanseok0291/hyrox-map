import { NextRequest, NextResponse } from "next/server";
import {
  PHOTO_PROXY_VERSION,
  resolveKakaoPlacePhotoUrl,
  venuePhotoProxyUrl,
} from "@/lib/kakao-place-photo";
import { getVenueBySlug } from "@/lib/venues-store";

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug")?.trim();
  if (!slug) {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }

  const venue = await getVenueBySlug(slug);
  if (!venue) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const photoUrl = await resolveKakaoPlacePhotoUrl({
    slug: venue.slug,
    name: venue.name,
    lat: venue.lat,
    lng: venue.lng,
    address: venue.address,
    region: venue.region,
  });

  return NextResponse.json(
    {
      photoUrl,
      proxyUrl: photoUrl ? venuePhotoProxyUrl(slug) : null,
      photoVersion: PHOTO_PROXY_VERSION,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    }
  );
}
