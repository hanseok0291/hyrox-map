/** HYROX 시뮬 스테이션·장비 태그 (제보·필터·표시) */
export const SIMULATION_TAGS = [
  "outdoor_run",
  "indoor_run",
  "sled_push",
  "sled_pull",
  "ski_erg",
  "rower",
  "wall_ball",
  "farmers_carry",
  "burpee_broad_jump",
  "sandbag_lunge",
  "full_stations",
] as const;

export type SimulationTag = (typeof SIMULATION_TAGS)[number];

/** 예전 시드·제보에 남아 있을 수 있는 통합 슬래드 태그 */
export const LEGACY_SIMULATION_TAGS = ["sled_push_pull"] as const;

export const TAG_LABELS: Record<string, string> = {
  outdoor_run: "야외 런",
  indoor_run: "실내 런",
  sled_push: "슬레드 푸시",
  sled_pull: "슬레드 풀",
  sled_push_pull: "슬레드 (푸시·풀)",
  ski_erg: "스키에르고",
  rower: "로잉",
  wall_ball: "월볼",
  farmers_carry: "파머스 캐리",
  burpee_broad_jump: "BBJ",
  sandbag_lunge: "샌드백 런지",
  full_stations: "풀 스테이션",
  olympic_lifting: "역도",
};

/** 필터·퀵칩: 슬레드 계열 아무거나 */
export const SLED_TAG_IDS = [
  "sled_push",
  "sled_pull",
  "sled_push_pull",
] as const;

export function isSledTag(tag: string): boolean {
  return (SLED_TAG_IDS as readonly string[]).includes(tag);
}

/** 필터 태그가 venue에 매칭되는지 (레거시 sled_push_pull 호환) */
export function venueTagsInclude(
  venueTags: string[],
  filterTag: string
): boolean {
  if (filterTag === "sled_push") {
    return venueTags.some((t) => t === "sled_push" || t === "sled_push_pull");
  }
  if (filterTag === "sled_pull") {
    return venueTags.some((t) => t === "sled_pull" || t === "sled_push_pull");
  }
  return venueTags.includes(filterTag);
}

export function venueMatchesAllFilterTags(
  venueTags: string[],
  filterTags: string[]
): boolean {
  return filterTags.every((t) => venueTagsInclude(venueTags, t));
}

export function venueHasAnySled(venueTags: string[]): boolean {
  return venueTags.some(isSledTag);
}

/** 제보·DB에 남을 수 있는 태그 (레거시·시드 포함) */
export function isReportableTag(tag: string): boolean {
  return (
    (SIMULATION_TAGS as readonly string[]).includes(tag) ||
    (LEGACY_SIMULATION_TAGS as readonly string[]).includes(tag) ||
    tag === "olympic_lifting"
  );
}

export function sanitizeReportTags(tags: string[] | undefined): string[] {
  if (!tags?.length) return [];
  return tags.filter(isReportableTag);
}
