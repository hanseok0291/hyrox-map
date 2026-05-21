export const VENUE_TYPES = [
  "official_club",
  "crossfit_box",
  "hyrox_center",
  "gym",
  "other",
] as const;

export const TRUST_LEVELS = [
  "official",
  "verified",
  "community",
  "pending",
] as const;

export const SIMULATION_TAGS = [
  "outdoor_run",
  "indoor_run",
  "sled_push_pull",
  "ski_erg",
  "rower",
  "wall_ball",
  "farmers_carry",
  "burpee_broad_jump",
  "full_stations",
] as const;

export const TAG_LABELS: Record<string, string> = {
  outdoor_run: "야외 런",
  indoor_run: "실내 런",
  sled_push_pull: "슬래드",
  ski_erg: "스키에르고",
  rower: "로잉",
  wall_ball: "월볼",
  farmers_carry: "파머스 캐리",
  burpee_broad_jump: "BBJ",
  full_stations: "풀 스테이션",
};

export const VENUE_TYPE_LABELS: Record<string, string> = {
  official_club: "공식 클럽",
  crossfit_box: "크로스핏",
  hyrox_center: "하이록스 센터",
  gym: "피트니스/헬스",
  other: "기타",
};

export const TRUST_LABELS: Record<string, string> = {
  official: "공식 HYROX",
  verified: "검증됨",
  community: "커뮤니티",
  pending: "검수 중",
};

export type VenueLinks = {
  website?: string;
  instagram?: string;
  reservation?: string;
  naver_map?: string;
};

export type SeedVenue = {
  name: string;
  slug: string;
  address: string;
  region: string;
  lat: number;
  lng: number;
  venue_type: string;
  trust_level: string;
  source: string;
  tags: string[];
  outdoor_run_note?: string | null;
  drop_in_info?: string | null;
  price_note?: string | null;
  drop_in_available?: boolean;
  links?: VenueLinks;
  official_club_id?: string | null;
};

export type VenueDTO = {
  id: string;
  name: string;
  slug: string;
  address: string;
  region: string;
  lat: number;
  lng: number;
  venueType: string;
  trustLevel: string;
  source: string;
  tags: string[];
  outdoorRunNote: string | null;
  dropInInfo: string | null;
  priceNote: string | null;
  dropInAvailable: boolean;
  links: VenueLinks;
  distanceKm?: number;
};
