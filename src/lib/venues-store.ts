import { readFileSync } from "fs";
import { join } from "path";
import type { Venue } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { SeedVenue, VenueDTO } from "@/lib/types";
import { toVenueDTO } from "@/lib/venue";

function seedToVenue(row: SeedVenue, index: number): Venue {
  const now = new Date();
  return {
    id: `seed-${row.slug}`,
    name: row.name,
    slug: row.slug,
    address: row.address,
    region: row.region,
    lat: row.lat,
    lng: row.lng,
    venueType: row.venue_type,
    trustLevel: row.trust_level,
    source: row.source,
    tags: JSON.stringify(row.tags),
    outdoorRunNote: row.outdoor_run_note ?? null,
    dropInInfo: row.drop_in_info ?? null,
    simScheduleNote: row.sim_schedule_note ?? null,
    priceNote: row.price_note ?? null,
    simPriceSingle: row.sim_price_single ?? null,
    simPriceDouble: row.sim_price_double ?? null,
    simPriceRelay: row.sim_price_relay ?? null,
    dropInAvailable: row.drop_in_available ?? false,
    links: JSON.stringify(row.links ?? {}),
    officialClubId: row.official_club_id ?? null,
    experienceNote: null,
    publishedAt: now,
    flagged: false,
    createdAt: now,
    updatedAt: now,
  };
}

let seedVenuesCache: Venue[] | null = null;

function loadSeedVenues(): Venue[] {
  if (seedVenuesCache) return seedVenuesCache;
  const path = join(process.cwd(), "data", "seed-venues.json");
  const rows = JSON.parse(readFileSync(path, "utf-8")) as SeedVenue[];
  seedVenuesCache = rows.map(seedToVenue);
  return seedVenuesCache;
}

let publishedVenuesCache: Venue[] | null = null;

/** 시드 JSON 변경 후 dev 서버 재시작 또는 호출로 캐시 초기화 */
export function clearVenuesCache() {
  seedVenuesCache = null;
  publishedVenuesCache = null;
}

export async function listPublishedVenues(): Promise<Venue[]> {
  if (publishedVenuesCache) return publishedVenuesCache;

  try {
    const venues = await prisma.venue.findMany({
      where: { publishedAt: { not: null }, flagged: false },
    });
    if (venues.length > 0) {
      publishedVenuesCache = venues;
      return venues;
    }
  } catch {
    // SQLite/Postgres unavailable (e.g. Vercel without DATABASE_URL)
  }

  const seed = loadSeedVenues();
  publishedVenuesCache = seed;
  return seed;
}

export async function getVenueBySlug(slug: string): Promise<Venue | null> {
  try {
    const venue = await prisma.venue.findUnique({ where: { slug } });
    if (venue?.publishedAt && !venue.flagged) return venue;
  } catch {
    // fallback below
  }
  return loadSeedVenues().find((v) => v.slug === slug) ?? null;
}

export function venuesToDtos(
  venues: Venue[],
  userLat?: number,
  userLng?: number
): VenueDTO[] {
  return venues.map((v) => toVenueDTO(v, userLat, userLng));
}
