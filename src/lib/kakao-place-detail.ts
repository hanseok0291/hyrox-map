/** 카카오맵 장소 상세 (place.map.kakao.com/{id}) → WGS84 좌표 */

export type KakaoPlaceDetail = {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
};

export function parseKakaoPlaceId(input: string): string | null {
  const trimmed = input.trim();
  const fromUrl = trimmed.match(/place\.map\.kakao\.com\/(\d+)/i);
  if (fromUrl) return fromUrl[1];
  if (/^\d+$/.test(trimmed)) return trimmed;
  return null;
}

export async function fetchKakaoPlaceDetail(
  placeId: string
): Promise<KakaoPlaceDetail | null> {
  const res = await fetch(
    `https://place-api.map.kakao.com/places/panel3/${placeId}`,
    {
      headers: {
        Accept: "application/json",
        Origin: "https://place.map.kakao.com",
        Referer: "https://place.map.kakao.com/",
        Pf: "web",
      },
      next: { revalidate: 86400 },
    }
  );

  if (!res.ok) return null;

  const data = (await res.json()) as {
    summary?: {
      name?: string;
      point?: { lat?: number; lon?: number };
      address?: { disp?: string };
      display_info?: { display_name1?: string };
    };
  };

  const summary = data.summary;
  if (!summary) return null;

  const lat = summary.point?.lat;
  const lng = summary.point?.lon;
  if (lat == null || lng == null) return null;

  return {
    placeId,
    name:
      summary.display_info?.display_name1?.trim() ||
      summary.name?.trim() ||
      "",
    address: summary.address?.disp?.trim() || "",
    lat,
    lng,
  };
}
