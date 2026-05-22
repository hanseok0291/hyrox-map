import type { Report, Venue } from "@prisma/client";
import {
  coordinatesChanged,
  parseReportTopics,
} from "@/lib/venue-location";
import { parseLinks } from "@/lib/venue";

/** 검수 승인 시 기존 시설에 제보 내용 병합 (빈 값은 건너뜀) */
export function mergeReportIntoVenue(
  venue: Venue,
  report: Report
): Partial<Venue> & { links: string } {
  const links = parseLinks(venue.links);
  if (report.instagram?.trim()) links.instagram = report.instagram.trim();
  if (report.naverReservation?.trim())
    links.reservation = report.naverReservation.trim();
  if (report.website?.trim()) links.website = report.website.trim();

  const tags = report.tags?.trim();
  const hasTags = tags && tags !== "[]" && tags !== "null";

  const topics = parseReportTopics(report.reportTopics);
  const nameChanged =
    report.name.trim() !== "" && report.name.trim() !== venue.name.trim();
  const addressChanged =
    report.address.trim() !== "" &&
    report.address.trim() !== venue.address.trim();
  const coordsChanged = coordinatesChanged(
    venue.lat,
    venue.lng,
    report.lat,
    report.lng
  );
  const mergePlace =
    topics.includes("location") ||
    nameChanged ||
    addressChanged ||
    coordsChanged;

  const regionFromAddress = (address: string) => {
    const part = address.trim().split(/\s+/)[0];
    return part || venue.region;
  };

  return {
    ...(mergePlace
      ? {
          lat: report.lat,
          lng: report.lng,
          ...(nameChanged ? { name: report.name.trim() } : {}),
          ...(addressChanged
            ? {
                address: report.address.trim(),
                region: regionFromAddress(report.address),
              }
            : {}),
        }
      : {}),
    ...(hasTags ? { tags } : {}),
    ...(report.dropInInfo?.trim()
      ? { dropInInfo: report.dropInInfo.trim(), dropInAvailable: true }
      : {}),
    ...(report.simScheduleNote?.trim()
      ? { simScheduleNote: report.simScheduleNote.trim() }
      : {}),
    ...(report.outdoorRunNote?.trim()
      ? { outdoorRunNote: report.outdoorRunNote.trim() }
      : {}),
    ...(report.priceNote?.trim() ? { priceNote: report.priceNote.trim() } : {}),
    ...(report.simPriceSingle?.trim()
      ? { simPriceSingle: report.simPriceSingle.trim() }
      : {}),
    ...(report.simPriceDouble?.trim()
      ? { simPriceDouble: report.simPriceDouble.trim() }
      : {}),
    ...(report.simPriceRelay?.trim()
      ? { simPriceRelay: report.simPriceRelay.trim() }
      : {}),
    links: JSON.stringify(links),
  };
}
