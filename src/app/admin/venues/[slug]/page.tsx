"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LocationFields } from "@/components/LocationFields";

export default function AdminVenueLocationPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState(37.5665);
  const [lng, setLng] = useState(126.978);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/venues/${slug}`)
      .then(async (res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        const v = data.venue;
        setName(v.name);
        setAddress(v.address);
        setLat(v.lat);
        setLng(v.lng);
      })
      .catch(() => {
        window.location.href = "/admin/login";
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const save = async () => {
    setSaving(true);
    const res = await fetch(`/api/admin/venues/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, lat, lng, address }),
    });
    setSaving(false);
    if (!res.ok) {
      alert("저장 실패 (DB에 시설이 있는지 확인하세요)");
      return;
    }
    alert("저장했습니다. 지도를 새로고침하면 반영됩니다.");
    router.push("/");
  };

  if (loading) return <p className="p-8">로딩…</p>;

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <Link href="/admin" className="text-sm text-zinc-600">
        ← Admin
      </Link>
      <h1 className="mt-4 text-xl font-bold">시설 정보 수정</h1>
      <p className="text-xs text-zinc-500">slug: {slug} (URL은 그대로 유지)</p>

      <div className="mt-6 rounded-lg border border-zinc-200 p-4">
        <LocationFields
          name={name}
          address={address}
          lat={lat}
          lng={lng}
          showNameField
          onNameChange={setName}
          onAddressChange={setAddress}
          onLatChange={setLat}
          onLngChange={setLng}
        />
      </div>

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="mt-6 w-full rounded-lg bg-hyrox-yellow py-2.5 font-bold text-hyrox-black hover:bg-hyrox-yellow-hover disabled:opacity-60"
      >
        {saving ? "저장 중…" : "저장"}
      </button>
      <p className="mt-3 text-xs text-zinc-500">
        DB에 등록된 시설만 수정됩니다. 시드만 쓰는 배포 환경에서는 제보 승인으로
        반영하거나 로컬에서 db:seed 후 수정하세요.
      </p>
    </div>
  );
}
