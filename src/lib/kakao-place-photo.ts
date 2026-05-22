import { haversineKm } from "@/lib/venue";

const KAKAO_KEYWORD_URL =
  "https://dapi.kakao.com/v2/local/search/keyword.json";
const KAKAO_PLACE_PANEL_URL = "https://place-api.map.kakao.com/places/panel3";

const PREFERRED_PHOTO_TYPES = new Set([
  "INDOOR",
  "OUTDOOR",
  "VENDOR",
  "MYSTORE",
  "PHOTO",
]);

type KakaoKeywordDoc = {
  id: string;
  place_name: string;
  x: string;
  y: string;
};

type KakaoPlacePhoto = {
  url?: string;
  type?: string;
  blog_link_url?: string;
  title?: string;
};

export type VenuePhoto = {
  url: string;
  referer: string;
};

type KakaomapReviewPhoto = {
  url?: string;
  type?: string;
  ui_type?: string;
};

type PlacePhotoCounts = {
  kakaomap_review?: number;
  indoor?: number;
  outdoor?: number;
};

type PlacePanelData = {
  photos?: {
    counts?: PlacePhotoCounts;
    photos?: KakaoPlacePhoto[];
  };
  kakaomap_review?: {
    photos?: KakaomapReviewPhoto[];
    reviews?: { photos?: KakaomapReviewPhoto[] }[];
  };
  summary?: { road_view?: { url?: string } };
};

const KAKAO_PLACE_REFERER = "https://place.map.kakao.com/";

/** 프록시 URL 버전 — 사진 선택 로직 바뀔 때 올려서 브라우저 캐시 무효화 */
export const PHOTO_PROXY_VERSION = "3";

type PhotoCacheEntry = { photo: VenuePhoto | null; at: number };

const photoCache = new Map<string, PhotoCacheEntry>();
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function getKakaoRestApiKey(): string | undefined {
  const key =
    process.env.KAKAO_REST_API_KEY?.trim() ||
    process.env.KAKAO_LOCAL_REST_API_KEY?.trim();
  return key || undefined;
}

function cacheKey(slug: string, name: string, lat: number, lng: number) {
  return `${slug}:${name}:${lat.toFixed(4)},${lng.toFixed(4)}`;
}

function getCached(key: string): VenuePhoto | null | undefined {
  const hit = photoCache.get(key);
  if (!hit) return undefined;
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    photoCache.delete(key);
    return undefined;
  }
  return hit.photo;
}

function setCached(key: string, photo: VenuePhoto | null) {
  photoCache.set(key, { photo, at: Date.now() });
}

function normalizePlaceName(s: string): string {
  return s.toLowerCase().replace(/\s+/g, "");
}

function normalizePhotoUrl(url: string): string {
  if (url.startsWith("http://")) return `https://${url.slice(7)}`;
  return url;
}

function isKakaoHostedPlacePhoto(url: string): boolean {
  if (!url || url.includes("map_roadview")) return false;
  if (url.includes("kakaomap_mobile/android/ico_")) return false;
  if (url.includes("localimg/place/") && url.endsWith(".svg")) return false;
  if (url.includes("daumcdn.net/local/kakaomapPhoto/")) return true;
  if (url.includes("map.kakaocdn.net") && !url.includes("map_roadview")) {
    return true;
  }
  return false;
}

function isUsablePlacePhotoEntry(photo: KakaoPlacePhoto | KakaomapReviewPhoto): boolean {
  const type = (photo.type ?? "").toUpperCase();
  if (type === "BLOG") return false;
  const url = photo.url?.trim();
  if (!url) return false;
  return isKakaoHostedPlacePhoto(normalizePhotoUrl(url));
}

async function kakaoKeywordSearch(
  query: string,
  lat: number,
  lng: number,
  restKey: string
): Promise<KakaoKeywordDoc[]> {
  const params = new URLSearchParams({
    query,
    x: String(lng),
    y: String(lat),
    radius: "3000",
    size: "15",
    sort: "distance",
  });

  const res = await fetch(`${KAKAO_KEYWORD_URL}?${params}`, {
    headers: { Authorization: `KakaoAK ${restKey}` },
    next: { revalidate: 86400 },
  });

  if (!res.ok) return [];
  const data = (await res.json()) as { documents?: KakaoKeywordDoc[] };
  return data.documents ?? [];
}

function placeNameScore(placeName: string, query: string): number {
  const pn = normalizePlaceName(placeName);
  const q = normalizePlaceName(query);
  if (!q || !pn) return 0;
  if (pn === q) return 100;
  if (pn.includes(q) || q.includes(pn)) return 50;
  return 0;
}

function pickBestPlace(
  docs: KakaoKeywordDoc[],
  query: string,
  lat: number,
  lng: number
): KakaoKeywordDoc | null {
  if (!docs.length) return null;

  const scored = docs
    .map((doc) => {
      const docLat = parseFloat(doc.y);
      const docLng = parseFloat(doc.x);
      const km = haversineKm(lat, lng, docLat, docLng);
      const pinMatch =
        Math.abs(docLat - lat) < 0.00015 && Math.abs(docLng - lng) < 0.00015
          ? 200
          : 0;
      return {
        doc,
        km,
        nameScore: placeNameScore(doc.place_name, query) + pinMatch,
      };
    })
    .filter((x) => x.km <= 3 || x.nameScore >= 50);

  if (!scored.length) return null;

  scored.sort((a, b) => {
    if (b.nameScore !== a.nameScore) return b.nameScore - a.nameScore;
    return a.km - b.km;
  });

  return scored[0].doc;
}

async function searchPlaces(
  queries: string[],
  lat: number,
  lng: number,
  restKey: string
): Promise<KakaoKeywordDoc[]> {
  const seen = new Set<string>();
  const all: KakaoKeywordDoc[] = [];

  for (const query of queries) {
    const q = query.trim();
    if (!q) continue;
    const docs = await kakaoKeywordSearch(q, lat, lng, restKey);
    for (const doc of docs) {
      if (!seen.has(doc.id)) {
        seen.add(doc.id);
        all.push(doc);
      }
    }
  }

  return all;
}

async function fetchPlacePanel(placeId: string): Promise<PlacePanelData | null> {
  const res = await fetch(`${KAKAO_PLACE_PANEL_URL}/${placeId}`, {
    headers: {
      Accept: "application/json",
      Origin: "https://place.map.kakao.com",
      Referer: "https://place.map.kakao.com/",
      Pf: "web",
    },
    next: { revalidate: 86400 },
  });

  if (!res.ok) return null;
  return (await res.json()) as PlacePanelData;
}

/**
 * 카카오맵에 실내·외부 사진은 있는데 API 배열에는 BLOG만 있는 경우
 * (위크로스핏 강남 등). 네이버 블로그 Referer로만 이미지를 받을 수 있음.
 */
function pickBlogFallbackPhoto(panel: PlacePanelData): VenuePhoto | null {
  const counts = panel.photos?.counts;
  if (!counts) return null;

  const reviewCount = counts.kakaomap_review ?? 0;
  const galleryCount = (counts.indoor ?? 0) + (counts.outdoor ?? 0);
  if (reviewCount > 0 || galleryCount === 0) return null;

  const blog = (panel.photos?.photos ?? []).find(
    (p) => (p.type ?? "").toUpperCase() === "BLOG" && p.url?.trim()
  );
  if (!blog?.url) return null;

  const referer =
    blog.blog_link_url?.trim() ||
    "https://blog.naver.com/";

  return {
    url: normalizePhotoUrl(blog.url),
    referer,
  };
}

/** 카카오맵 리뷰·매장 CDN 우선, 없으면 조건부 BLOG fallback */
function pickPlacePhoto(panel: PlacePanelData): VenuePhoto | null {
  const candidates: KakaoPlacePhoto[] = [];

  for (const p of panel.photos?.photos ?? []) {
    const type = (p.type ?? "").toUpperCase();
    if (type === "BLOG") continue;
    if (PREFERRED_PHOTO_TYPES.has(type) || isUsablePlacePhotoEntry(p)) {
      candidates.push(p);
    }
  }

  for (const p of panel.kakaomap_review?.photos ?? []) {
    candidates.push(p);
  }

  for (const review of panel.kakaomap_review?.reviews ?? []) {
    for (const p of review.photos ?? []) {
      candidates.push(p);
    }
  }

  for (const p of candidates) {
    if (!isUsablePlacePhotoEntry(p)) continue;
    return {
      url: normalizePhotoUrl(p.url!),
      referer: KAKAO_PLACE_REFERER,
    };
  }

  return pickBlogFallbackPhoto(panel);
}

/** 카카오맵 장소 검색 → 장소 사진 URL + 프록시용 Referer */
export async function resolveVenuePhoto(input: {
  slug: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  region?: string;
}): Promise<VenuePhoto | null> {
  const key = cacheKey(input.slug, input.name, input.lat, input.lng);
  const cached = getCached(key);
  if (cached !== undefined) return cached;

  const restKey = getKakaoRestApiKey();
  if (!restKey) {
    setCached(key, null);
    return null;
  }

  try {
    const queries = [
      input.name,
      input.region ? `${input.name} ${input.region}` : "",
    ].filter(Boolean);

    const docs = await searchPlaces(queries, input.lat, input.lng, restKey);
    const place = pickBestPlace(docs, input.name, input.lat, input.lng);
    if (!place?.id) {
      setCached(key, null);
      return null;
    }

    const panel = await fetchPlacePanel(place.id);
    const photo = panel ? pickPlacePhoto(panel) : null;
    setCached(key, photo);
    return photo;
  } catch {
    setCached(key, null);
    return null;
  }
}

/** @deprecated resolveVenuePhoto 사용 */
export async function resolveKakaoPlacePhotoUrl(input: {
  slug: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  region?: string;
}): Promise<string | null> {
  const photo = await resolveVenuePhoto(input);
  return photo?.url ?? null;
}

/** 브라우저 핫링크 차단 우회용 — img src에 사용 */
export function venuePhotoProxyUrl(slug: string): string {
  return `/api/venue-photo/proxy?slug=${encodeURIComponent(slug)}&v=${PHOTO_PROXY_VERSION}`;
}
