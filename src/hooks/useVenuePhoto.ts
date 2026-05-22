"use client";

import { useEffect, useState } from "react";
import { venuePhotoProxyUrl } from "@/lib/kakao-place-photo";

export function useVenuePhoto(slug: string) {
  const [failed, setFailed] = useState(false);
  const [hasPhoto, setHasPhoto] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    setHasPhoto(null);
    setFailed(false);

    fetch(`/api/venue-photo?slug=${encodeURIComponent(slug)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { photoUrl?: string | null } | null) => {
        if (!cancelled) setHasPhoto(!!data?.photoUrl);
      })
      .catch(() => {
        if (!cancelled) setHasPhoto(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const photoUrl = hasPhoto ? venuePhotoProxyUrl(slug) : undefined;
  const showImage = hasPhoto === true && !failed;

  return {
    photoUrl,
    showImage,
    loading: hasPhoto === null,
    onImageError: () => setFailed(true),
    onImageLoad: () => setFailed(false),
  };
}
