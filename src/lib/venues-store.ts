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
    priceNote: row.price_note ?? null,
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

function loadSeedVenues(): Venue[] {
  const path = join(process.cwd(), "data", "seed-venues.json");
  const rows = JSON.parse(readFileSync(path, "utf-8")) as SeedVenue[];
  return rows.map(seedToVenue);
}

export async function listPublishedVenues(): Promise<Venue[]> {
  try {
    const venues = await prisma.venue.findMany({
      where: { publishedAt: { not: null }, flagged: false },
    });
    if (venues.length > 0) return venues;
  } catch {
    // SQLite/Postgres unavailable (e.g. Vercel without DATABASE_URL)
  }
  return loadSeedVenues();
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
