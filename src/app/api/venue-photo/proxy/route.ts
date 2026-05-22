import { NextRequest, NextResponse } from "next/server";
import { resolveVenuePhoto } from "@/lib/kakao-place-photo";
import { getVenueBySlug } from "@/lib/venues-store";

/** 카카오 장소 사진 — 서버 프록시 (네이버 블로그 등 핫링크 차단 우회) */
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug")?.trim();
  if (!slug) {
    return new NextResponse(null, { status: 400 });
  }

  const venue = await getVenueBySlug(slug);
  if (!venue) {
    return new NextResponse(null, { status: 404 });
  }

  const photo = await resolveVenuePhoto({
    slug: venue.slug,
    name: venue.name,
    lat: venue.lat,
    lng: venue.lng,
    address: venue.address,
    region: venue.region,
  });

  if (!photo?.url) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const upstream = await fetch(photo.url, {
      headers: {
        Referer: photo.referer,
        "User-Agent": "Mozilla/5.0 (compatible; hyrox-map/1.0)",
      },
      next: { revalidate: 86400 },
    });

    if (!upstream.ok) {
      return new NextResponse(null, { status: 502 });
    }

    const contentType =
      upstream.headers.get("content-type") ?? "image/jpeg";
    const body = await upstream.arrayBuffer();

    return new NextResponse(body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
