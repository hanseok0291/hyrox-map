/** 약 5m 이상 좌표 차이 */
export const COORD_EPSILON = 0.00005;

export function coordinatesChanged(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
  epsilon = COORD_EPSILON
): boolean {
  return (
    Math.abs(aLat - bLat) > epsilon || Math.abs(aLng - bLng) > epsilon
  );
}

export function parseReportTopics(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

export function kakaoMapPlaceLink(name: string, lat: number, lng: number): string {
  return `https://map.kakao.com/link/map/${encodeURIComponent(name)},${lat},${lng}`;
}

export function naverMapSearchLink(query: string): string {
  return `https://map.naver.com/v5/search/${encodeURIComponent(query)}`;
}
