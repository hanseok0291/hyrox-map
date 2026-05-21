import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div>
          <Link href="/" className="text-lg font-bold text-zinc-900">
            하이록스 맵
          </Link>
          <p className="text-xs text-zinc-500">
            비공식 커뮤니티 지도 · HYROX와 무관
          </p>
        </div>
        <Link
          href="/report"
          className="rounded-lg bg-hyrox-yellow px-4 py-2 text-sm font-bold text-hyrox-black hover:bg-hyrox-yellow-hover"
        >
          시설 제보
        </Link>
      </div>
    </header>
  );
}
