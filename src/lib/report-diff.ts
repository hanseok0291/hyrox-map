import { coordinatesChanged } from "@/lib/venue-location";
import { TAG_LABELS } from "@/lib/types";

export type VenueSnapshot = {
  name: string;
  address: string;
  region: string;
  lat: number;
  lng: number;
  tags: string[];
  dropInInfo: string | null;
  simScheduleNote: string | null;
  outdoorRunNote: string | null;
  priceNote: string | null;
  simPriceSingle: string | null;
  simPriceDouble: string | null;
  simPriceRelay: string | null;
  links: {
    website?: string;
    instagram?: string;
    reservation?: string;
  };
};

export type ReportSnapshot = VenueSnapshot & {
  experienceNote: string;
};

export type ReportFieldDiff = {
  key: string;
  label: string;
  before: string;
  after: string;
};

function norm(s: string | null | undefined): string {
  return s?.trim() ?? "";
}

function textChanged(
  before: string | null | undefined,
  after: string | null | undefined
): boolean {
  const a = norm(after);
  if (!a) return false;
  return a !== norm(before);
}

function formatTags(tags: string[]): string {
  if (!tags.length) return "(없음)";
  return tags.map((t) => TAG_LABELS[t] ?? t).join(", ");
}

function tagSetsEqual(a: string[], b: string[]): boolean {
  const sa = new Set(a);
  const sb = new Set(b);
  if (sa.size !== sb.size) return false;
  for (const t of sa) if (!sb.has(t)) return false;
  return true;
}

function formatCoords(lat: number, lng: number): string {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

function pushText(
  diffs: ReportFieldDiff[],
  key: string,
  label: string,
  before: string | null | undefined,
  after: string | null | undefined
) {
  if (!textChanged(before, after)) return;
  diffs.push({
    key,
    label,
    before: norm(before) || "(없음)",
    after: norm(after),
  });
}

/** 수정 제보 vs 기존 시설 비교 */
export function buildReportVenueDiff(
  venue: VenueSnapshot,
  report: ReportSnapshot
): ReportFieldDiff[] {
  const diffs: ReportFieldDiff[] = [];

  pushText(diffs, "name", "상호명", venue.name, report.name);
  pushText(diffs, "address", "주소", venue.address, report.address);

  if (
    coordinatesChanged(venue.lat, venue.lng, report.lat, report.lng) ||
    textChanged(venue.address, report.address)
  ) {
    if (
      coordinatesChanged(venue.lat, venue.lng, report.lat, report.lng)
    ) {
      diffs.push({
        key: "coords",
        label: "지도 좌표",
        before: formatCoords(venue.lat, venue.lng),
        after: formatCoords(report.lat, report.lng),
      });
    }
  }

  if (!tagSetsEqual(venue.tags, report.tags) && report.tags.length > 0) {
    diffs.push({
      key: "tags",
      label: "시뮬 태그",
      before: formatTags(venue.tags),
      after: formatTags(report.tags),
    });
  }

  pushText(diffs, "dropInInfo", "드랍인·시뮬 안내", venue.dropInInfo, report.dropInInfo);
  pushText(
    diffs,
    "simScheduleNote",
    "운영·시뮬 시간",
    venue.simScheduleNote,
    report.simScheduleNote
  );
  pushText(
    diffs,
    "outdoorRunNote",
    "야외 런",
    venue.outdoorRunNote,
    report.outdoorRunNote
  );
  pushText(diffs, "priceNote", "기타 요금", venue.priceNote, report.priceNote);
  pushText(
    diffs,
    "simPriceSingle",
    "싱글 드랍인",
    venue.simPriceSingle,
    report.simPriceSingle
  );
  pushText(
    diffs,
    "simPriceDouble",
    "더블 드랍인",
    venue.simPriceDouble,
    report.simPriceDouble
  );
  pushText(
    diffs,
    "simPriceRelay",
    "릴레이 드랍인",
    venue.simPriceRelay,
    report.simPriceRelay
  );
  pushText(
    diffs,
    "instagram",
    "인스타그램",
    venue.links.instagram,
    report.links.instagram
  );
  pushText(
    diffs,
    "website",
    "웹사이트",
    venue.links.website,
    report.links.website
  );
  pushText(
    diffs,
    "reservation",
    "네이버 예약",
    venue.links.reservation,
    report.links.reservation
  );

  return diffs;
}
