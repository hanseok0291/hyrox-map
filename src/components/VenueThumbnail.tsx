"use client";

import { useVenuePhoto } from "@/hooks/useVenuePhoto";

export function VenueThumbnail({
  slug,
  name,
  className = "h-14 w-14 shrink-0 rounded-xl object-cover",
}: {
  slug: string;
  name: string;
  className?: string;
}) {
  const { photoUrl, showImage, onImageError } = useVenuePhoto(slug);

  if (showImage && photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- 외부 CDN(카카오) 썸네일
      <img
        src={photoUrl}
        alt=""
        className={className}
        loading="lazy"
        decoding="async"
        onError={onImageError}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br from-zinc-700 to-zinc-900 text-lg font-bold text-white/90 ${className}`}
      aria-hidden
    >
      {name.charAt(0)}
    </div>
  );
}
