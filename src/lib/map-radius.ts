/** 지도·목록 API 기본 조회 반경 (km) */
export const DEFAULT_VENUE_RADIUS_KM = 15;

/** 검색어(q) 있을 때 넓히는 반경 */
export const SEARCH_VENUE_RADIUS_KM = 40;

export const MAX_VENUE_RADIUS_KM = 50;

export function radiusKmForRequest(hasTextQuery: boolean): number {
  return hasTextQuery ? SEARCH_VENUE_RADIUS_KM : DEFAULT_VENUE_RADIUS_KM;
}
