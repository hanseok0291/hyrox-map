import Link from "next/link";
import { notFound } from "next/navigation";
import { getVenueBySlug } from "@/lib/venues-store";
import { TAG_LABELS, TRUST_LABELS, VENUE_TYPE_LABELS } from "@/lib/types";
import { parseLinks, toVenueDTO } from "@/lib/venue";

export default async function VenueDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const venue = await getVenueBySlug(slug);

  if (!venue?.publishedAt || venue.flagged) notFound();

  const v = toVenueDTO(venue);
  const links = parseLinks(venue.links);

  return (
    <div className="mx-auto max-w-2xl bg-white px-4 py-8">
      <Link
        href="/"
        className="text-sm font-medium text-zinc-900 hover:underline"
      >
        ← 지도
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-zinc-900">{v.name}</h1>
      <p className="mt-1 text-zinc-600">{v.region}</p>
      <p className="text-sm text-zinc-500">{v.address}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded bg-zinc-900 px-2 py-1 text-sm font-medium text-white">
          {TRUST_LABELS[v.trustLevel]}
        </span>
        <span className="rounded bg-zinc-100 px-2 py-1 text-sm text-zinc-700">
          {VENUE_TYPE_LABELS[v.venueType]}
        </span>
        {v.dropInAvailable && (
          <span className="rounded bg-zinc-100 px-2 py-1 text-sm text-zinc-700">
            드랍인
          </span>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {v.tags.map((t) => (
          <span
            key={t}
            className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700"
          >
            {TAG_LABELS[t] ?? t}
          </span>
        ))}
      </div>

      {v.outdoorRunNote && (
        <section className="mt-6">
          <h2 className="text-sm font-medium text-zinc-800">야외 런</h2>
          <p className="mt-1 text-sm text-zinc-600">{v.outdoorRunNote}</p>
        </section>
      )}
      {v.dropInInfo && (
        <section className="mt-4">
          <h2 className="text-sm font-medium text-zinc-800">드랍인·시뮬</h2>
          <p className="mt-1 text-sm text-zinc-600">{v.dropInInfo}</p>
        </section>
      )}
      {v.priceNote && (
        <section className="mt-4">
          <h2 className="text-sm font-medium text-zinc-800">가격 (참고)</h2>
          <p className="mt-1 text-sm text-zinc-600">{v.priceNote}</p>
        </section>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        {links.website && (
          <a
            href={links.website}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 hover:bg-zinc-50"
          >
            홈페이지
          </a>
        )}
        {links.reservation && (
          <a
            href={links.reservation}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            예약
          </a>
        )}
        <a
          href={`https://map.kakao.com/link/map/${encodeURIComponent(v.name)},${v.lat},${v.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 hover:bg-zinc-50"
        >
          카카오맵
        </a>
      </div>

      <p className="mt-8 text-xs text-zinc-500">
        정보가 다르면{" "}
        <Link
          href="/report"
          className="font-medium text-zinc-900 underline hover:text-zinc-700"
        >
          수정 제보
        </Link>
        해 주세요.
      </p>
    </div>
  );
}
