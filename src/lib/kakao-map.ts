const KAKAO_SCRIPT_ID = "kakao-map-sdk";

/**
 * Load Kakao Maps JavaScript SDK once (autoload=false → manual kakao.maps.load).
 * @see https://apis.map.kakao.com/web/guide/
 */
export function loadKakaoMapSdk(appKey: string): Promise<NonNullable<Window["kakao"]>> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Kakao Map SDK runs in browser only"));
  }

  if (window.kakao?.maps) {
    return new Promise((resolve) => {
      window.kakao!.maps.load(() => resolve(window.kakao!));
    });
  }

  return new Promise((resolve, reject) => {
    const existing = document.getElementById(KAKAO_SCRIPT_ID);
    if (existing) {
      existing.addEventListener("load", () => {
        window.kakao?.maps.load(() => resolve(window.kakao!));
      });
      return;
    }

    const script = document.createElement("script");
    script.id = KAKAO_SCRIPT_ID;
    script.async = true;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(appKey)}&autoload=false`;
    script.onload = () => {
      if (!window.kakao?.maps) {
        reject(new Error("Kakao maps failed to initialize"));
        return;
      }
      window.kakao.maps.load(() => resolve(window.kakao!));
    };
    script.onerror = () =>
      reject(
        new Error(
          "Kakao Map script failed. Check NEXT_PUBLIC_KAKAO_MAP_KEY and platform domain."
        )
      );
    document.head.appendChild(script);
  });
}

export function getKakaoMapKey(): string | undefined {
  const key = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY?.trim();
  return key || undefined;
}

/** 로컬 개발 시 GPU·카카오 쿼터 절약용. Vercel에는 설정하지 않음. */
export function isKakaoMapDisabledByEnv(): boolean {
  const v = process.env.NEXT_PUBLIC_DISABLE_MAP?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

/** 키가 있고 DISABLE_MAP이 아니면 카카오맵 사용 */
export function isKakaoMapEnabled(): boolean {
  return Boolean(getKakaoMapKey()) && !isKakaoMapDisabledByEnv();
}
