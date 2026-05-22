import Link from "next/link";

export default function AdminHomePage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-xl font-bold">Admin</h1>
      <ul className="mt-6 space-y-2">
        <li>
          <Link href="/admin/reports" className="text-zinc-900 underline">
            제보 큐
          </Link>
        </li>
        <li>
          <span className="text-sm text-zinc-600">
            시설 정보 직접 수정 (상호·주소·좌표):{" "}
            <code className="text-xs">/admin/venues/시설-slug</code>
          </span>
        </li>
      </ul>
      <p className="mt-8 text-xs text-zinc-500">
        API 호출 시 Authorization: Bearer ADMIN_SECRET 또는 로그인 쿠키
        admin_token 필요.
      </p>
    </div>
  );
}
