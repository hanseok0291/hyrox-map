import { NextRequest, NextResponse } from "next/server";
import {
  fetchKakaoPlaceDetail,
  parseKakaoPlaceId,
} from "@/lib/kakao-place-detail";

/** 카카오맵 장소 URL/ID → 위·경도 (Admin·제보 폼용) */
export async function GET(request: NextRequest) {
  const raw =
    request.nextUrl.searchParams.get("placeId") ??
    request.nextUrl.searchParams.get("url") ??
    "";
  const placeId = parseKakaoPlaceId(raw);
  if (!placeId) {
    return NextResponse.json(
      { error: "placeId 또는 place.map.kakao.com URL이 필요합니다." },
      { status: 400 }
    );
  }

  try {
    const place = await fetchKakaoPlaceDetail(placeId);
    if (!place) {
      return NextResponse.json({ error: "장소를 찾지 못했습니다." }, { status: 404 });
    }
    return NextResponse.json({ place });
  } catch {
    return NextResponse.json({ error: "카카오 장소 조회 실패" }, { status: 502 });
  }
}
