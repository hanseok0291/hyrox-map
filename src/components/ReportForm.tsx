"use client";

import { useState } from "react";
import { SIMULATION_TAGS, TAG_LABELS, VENUE_TYPES, VENUE_TYPE_LABELS } from "@/lib/types";

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };

export function ReportForm() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState(DEFAULT_CENTER.lat);
  const [lng, setLng] = useState(DEFAULT_CENTER.lng);
  const [venueType, setVenueType] = useState<string>(VENUE_TYPES[1]);
  const [experienceNote, setExperienceNote] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [dropInInfo, setDropInInfo] = useState("");
  const [reporterContact, setReporterContact] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [reportId, setReportId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!consent) {
      setError("개인정보 수집에 동의해 주세요.");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          address,
          lat,
          lng,
          venueType,
          experienceNote,
          tags,
          evidenceUrls: [evidenceUrl],
          dropInInfo: dropInInfo || undefined,
          reporterContact: reporterContact || undefined,
          consent: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "제보 실패");
      setReportId(data.id);
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "제보 실패");
    }
  };

  if (status === "done" && reportId) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <p className="font-medium text-green-800">제보가 접수되었습니다</p>
        <p className="mt-2 text-sm text-green-700">
          제보 ID: <code className="rounded bg-white px-1">{reportId}</code>
        </p>
        <p className="mt-2 text-sm text-zinc-600">
          검수 후 3~5영업일 내 지도에 반영됩니다.
        </p>
        <a href="/" className="mt-4 inline-block text-sm text-orange-600 underline">
          지도로 돌아가기
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-lg space-y-4">
      <div>
        <label className="text-sm font-medium">시설명 *</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-medium">주소 *</label>
        <input
          required
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-zinc-500">위도</label>
          <input
            type="number"
            step="any"
            value={lat}
            onChange={(e) => setLat(parseFloat(e.target.value))}
            className="w-full rounded-lg border border-zinc-300 px-2 py-1 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-500">경도</label>
          <input
            type="number"
            step="any"
            value={lng}
            onChange={(e) => setLng(parseFloat(e.target.value))}
            className="w-full rounded-lg border border-zinc-300 px-2 py-1 text-sm"
          />
        </div>
      </div>
      <p className="text-xs text-zinc-500">
        MVP: 주소 검색·지도 핀은 추후 연동. 네이버/카카오맵에서 좌표를 복사해 넣을 수 있습니다.
      </p>
      <div>
        <label className="text-sm font-medium">시설 유형 *</label>
        <select
          value={venueType}
          onChange={(e) => setVenueType(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        >
          {VENUE_TYPES.map((t) => (
            <option key={t} value={t}>
              {VENUE_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium">체험 내용 *</label>
        <textarea
          required
          minLength={20}
          rows={4}
          value={experienceNote}
          onChange={(e) => setExperienceNote(e.target.value)}
          placeholder="예: 야외 1km 런 후 실내에서 슬래드·로잉 스테이션 가능"
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-medium">가능한 환경 *</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {SIMULATION_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`rounded-full px-3 py-1 text-xs ${
                tags.includes(tag)
                  ? "bg-orange-500 text-white"
                  : "bg-zinc-100 text-zinc-700"
              }`}
            >
              {TAG_LABELS[tag]}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">증빙 URL *</label>
        <input
          required
          type="url"
          value={evidenceUrl}
          onChange={(e) => setEvidenceUrl(e.target.value)}
          placeholder="https://..."
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-sm text-zinc-600">드랍인·시뮬 정보 (선택)</label>
        <input
          value={dropInInfo}
          onChange={(e) => setDropInInfo(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-sm text-zinc-600">연락처 (선택, 검수 알림)</label>
        <input
          type="email"
          value={reporterContact}
          onChange={(e) => setReporterContact(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1"
        />
        <span>제보 처리를 위한 최소 개인정보 수집에 동의합니다.</span>
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-lg bg-orange-500 py-3 font-medium text-white hover:bg-orange-600 disabled:opacity-50"
      >
        {status === "loading" ? "제출 중…" : "제보 제출"}
      </button>
    </form>
  );
}
