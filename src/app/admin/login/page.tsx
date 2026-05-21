"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    document.cookie = `admin_token=${encodeURIComponent(token)}; path=/; max-age=86400; SameSite=Strict`;
    const res = await fetch("/api/admin/reports", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      setError("인증 실패. ADMIN_SECRET을 확인하세요.");
      return;
    }
    router.push("/admin/reports");
  };

  return (
    <div className="mx-auto max-w-sm px-4 py-12">
      <h1 className="text-xl font-bold">Admin 로그인</h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="ADMIN_SECRET"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-lg bg-zinc-900 py-2 text-white"
        >
          로그인
        </button>
      </form>
    </div>
  );
}
