import type { VenueDTO } from "@/lib/types";

/** 거리·정렬만 바뀐 경우 React/지도 전체 갱신을 건너뜁니다. */
export function venuesListSignature(venues: VenueDTO[]): string {
  return venues
    .map((v) => `${v.id}:${v.distanceKm?.toFixed(2) ?? "na"}`)
    .join("|");
}
