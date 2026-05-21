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

export {
  SIMULATION_TAGS,
  TAG_LABELS,
  type SimulationTag,
} from "@/lib/simulation-tags";

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
  sim_schedule_note?: string | null;
  price_note?: string | null;
  sim_price_single?: string | null;
  sim_price_double?: string | null;
  sim_price_relay?: string | null;
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
  simScheduleNote: string | null;
  priceNote: string | null;
  simPriceSingle: string | null;
  simPriceDouble: string | null;
  simPriceRelay: string | null;
  dropInAvailable: boolean;
  links: VenueLinks;
  distanceKm?: number;
};
