import type { Venue } from "@prisma/client";
import type { VenueDTO, VenueLinks } from "./types";

export function parseTags(tags: string): string[] {
  try {
    const parsed = JSON.parse(tags) as unknown;
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

export function parseLinks(links: string): VenueLinks {
  try {
    return JSON.parse(links) as VenueLinks;
  } catch {
    return {};
  }
}

export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function toVenueDTO(
  venue: Venue,
  userLat?: number,
  userLng?: number
): VenueDTO {
  const dto: VenueDTO = {
    id: venue.id,
    name: venue.name,
    slug: venue.slug,
    address: venue.address,
    region: venue.region,
    lat: venue.lat,
    lng: venue.lng,
    venueType: venue.venueType,
    trustLevel: venue.trustLevel,
    source: venue.source,
    tags: parseTags(venue.tags),
    outdoorRunNote: venue.outdoorRunNote,
    dropInInfo: venue.dropInInfo,
    simScheduleNote: venue.simScheduleNote,
    priceNote: venue.priceNote,
    simPriceSingle: venue.simPriceSingle,
    simPriceDouble: venue.simPriceDouble,
    simPriceRelay: venue.simPriceRelay,
    dropInAvailable: venue.dropInAvailable,
    links: parseLinks(venue.links),
  };
  if (userLat != null && userLng != null) {
    dto.distanceKm = haversineKm(userLat, userLng, venue.lat, venue.lng);
  }
  return dto;
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s가-힣-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}
