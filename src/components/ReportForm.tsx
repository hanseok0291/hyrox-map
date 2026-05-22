"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LocationFields } from "@/components/LocationFields";
import { buildReportUrl } from "@/lib/report-url";
import { coordinatesChanged } from "@/lib/venue-location";
import {
  REPORT_TOPIC_HINTS,
  REPORT_TOPIC_LABELS,
  type ReportTopic,
  isReportTopic,
} from "@/lib/report-topics";
import { parseJsonResponse } from "@/lib/parse-json-response";
import { SIM_DIVISION_LABELS, SIM_DIVISIONS } from "@/lib/sim-prices";
import {
  SIMULATION_TAGS,
  TAG_LABELS,
  VENUE_TYPES,
  VENUE_TYPE_LABELS,
  type VenueDTO,
} from "@/lib/types";

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };

export function ReportForm() {
  const searchParams = useSearchParams();
  const venueSlug = searchParams.get("venue");
  const topicParam = searchParams.get("topic");
  const focusTopic = isReportTopic(topicParam) ? topicParam : null;

  const [isUpdate, setIsUpdate] = useState(Boolean(venueSlug));
  const [targetVenue, setTargetVenue] = useState<VenueDTO | null>(null);
  const [loadingVenue, setLoadingVenue] = useState(Boolean(venueSlug));

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState(DEFAULT_CENTER.lat);
  const [lng, setLng] = useState(DEFAULT_CENTER.lng);
  const [venueType, setVenueType] = useState<string>(VENUE_TYPES[1]);
  const [experienceNote, setExperienceNote] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [dropInInfo, setDropInInfo] = useState("");
  const [simScheduleNote, setSimScheduleNote] = useState("");
  const [outdoorRunNote, setOutdoorRunNote] = useState("");
  const [instagram, setInstagram] = useState("");
  const [naverReservation, setNaverReservation] = useState("");
  const [website, setWebsite] = useState("");
  const [simPriceSingle, setSimPriceSingle] = useState("");
  const [simPriceDouble, setSimPriceDouble] = useState("");
  const [simPriceRelay, setSimPriceRelay] = useState("");
  const [priceNote, setPriceNote] = useState("");
  const [reporterContact, setReporterContact] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
  const [reportId, setReportId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const scrolledRef = useRef(false);

  useEffect(() => {
    if (!venueSlug) return;
    setLoadingVenue(true);
    fetch(`/api/venues/${venueSlug}`)
      .then((r) => r.json())
      .then((data) => {
        const v = data.venue as VenueDTO | undefined;
        if (!v) return;
        setTargetVenue(v);
        setIsUpdate(true);
        setName(v.name);
        setAddress(v.address);
        setLat(v.lat);
        setLng(v.lng);
        setVenueType(v.venueType);
        setTags(v.tags);
        setDropInInfo(v.dropInInfo ?? "");
        setSimScheduleNote(v.simScheduleNote ?? "");
        setOutdoorRunNote(v.outdoorRunNote ?? "");
        setInstagram(v.links.instagram ?? "");
        setNaverReservation(v.links.reservation ?? "");
        setWebsite(v.links.website ?? "");
        setSimPriceSingle(v.simPriceSingle ?? "");
        setSimPriceDouble(v.simPriceDouble ?? "");
        setSimPriceRelay(v.simPriceRelay ?? "");
        setPriceNote(v.priceNote ?? "");
        if (focusTopic) {
          setExperienceNote(REPORT_TOPIC_HINTS[focusTopic]);
        }
      })
      .finally(() => setLoadingVenue(false));
  }, [venueSlug, focusTopic]);

  useEffect(() => {
    if (!focusTopic || scrolledRef.current || loadingVenue) return;
    scrolledRef.current = true;
    const el = document.getElementById(`section-${focusTopic}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [focusTopic, loadingVenue]);

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
    if (!evidenceUrl.trim()) {
      setError("증빙 URL을 입력해 주세요.");
      return;
    }
    const noteLen = experienceNote.trim().length;
    const minNote = isUpdate ? 10 : 20;
    if (noteLen < minNote) {
      setError(
        isUpdate
          ? "「제보 내용 · 확인 경위」를 10자 이상 적어 주세요. (어디서 확인했는지)"
          : "「제보 내용 · 확인 경위」를 20자 이상 적어 주세요."
      );
      return;
    }
    const reportTopics: ReportTopic[] = [];
    if (focusTopic) reportTopics.push(focusTopic);
    if (
      isUpdate &&
      targetVenue &&
      (focusTopic === "location" ||
        coordinatesChanged(targetVenue.lat, targetVenue.lng, lat, lng) ||
        address.trim() !== targetVenue.address.trim() ||
        name.trim() !== targetVenue.name.trim())
    ) {
      if (!reportTopics.includes("location")) reportTopics.push("location");
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportKind: isUpdate ? "update" : "new",
          targetVenueSlug: isUpdate ? venueSlug ?? undefined : undefined,
          reportTopics: reportTopics.length ? reportTopics : undefined,
          name,
          address,
          lat,
          lng,
          venueType,
          experienceNote,
          tags: tags.length ? tags : undefined,
          evidenceUrls: [evidenceUrl],
          dropInInfo: dropInInfo.trim() || undefined,
          simScheduleNote: simScheduleNote.trim() || undefined,
          outdoorRunNote: outdoorRunNote.trim() || undefined,
          instagram: instagram.trim() || undefined,
          naverReservation: naverReservation.trim() || undefined,
          website: website.trim() || undefined,
          simPriceSingle: simPriceSingle.trim() || undefined,
          simPriceDouble: simPriceDouble.trim() || undefined,
          simPriceRelay: simPriceRelay.trim() || undefined,
          priceNote: priceNote.trim() || undefined,
          reporterContact: reporterContact || undefined,
          consent: true,
        }),
      });
      const data = await parseJsonResponse<{
        id?: string;
        error?: string;
      }>(res);
      if (!res.ok) {
        const msg = data.error ?? "제보 실패";
        throw new Error(
          typeof msg === "string" && msg.includes("·") ? msg : msg
        );
      }
      setReportId(data.id ?? null);
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
        <a
          href="/"
          className="mt-4 inline-block text-sm font-medium text-zinc-900 underline"
        >
          지도로 돌아가기
        </a>
      </div>
    );
  }

  if (loadingVenue) {
    return <p className="text-sm text-zinc-500">시설 정보 불러오는 중…</p>;
  }

  const sectionClass = (topic: ReportTopic) =>
    `scroll-mt-24 rounded-xl border p-4 ${
      focusTopic === topic
        ? "border-hyrox-yellow bg-hyrox-yellow/10"
        : "border-zinc-200 bg-zinc-50"
    }`;

  return (
    <form onSubmit={submit} className="mx-auto max-w-lg space-y-5">
      {isUpdate && targetVenue && (
        <div className="rounded-lg border border-hyrox-yellow/40 bg-hyrox-yellow/10 px-4 py-3 text-sm">
          <p className="font-semibold text-zinc-900">
            「{targetVenue.name}」 정보 수정 제보
          </p>
          {focusTopic && (
            <p className="mt-1 text-zinc-600">
              항목: {REPORT_TOPIC_LABELS[focusTopic]}
            </p>
          )}
          <p className="mt-1 text-xs text-zinc-500">
            바꾸려는 항목만 수정해도 됩니다. 증빙 URL은 필수입니다.
          </p>
        </div>
      )}

      {!isUpdate && (
        <>
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
        </>
      )}

      {isUpdate && targetVenue && (
        <section
          id="section-location"
          className={sectionClass("location")}
        >
          <h2 className="text-sm font-semibold text-zinc-900">
            {REPORT_TOPIC_LABELS.location}
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            {REPORT_TOPIC_HINTS.location}
          </p>
          <div className="mt-3">
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
        </section>
      )}

      <section id="section-simulation" className={sectionClass("simulation")}>
        <h2 className="text-sm font-semibold text-zinc-900">
          {REPORT_TOPIC_LABELS.simulation}
          {!isUpdate && " *"}
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          {REPORT_TOPIC_HINTS.simulation}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {SIMULATION_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`rounded-full px-3 py-1 text-xs ${
                tags.includes(tag)
                  ? "bg-hyrox-yellow text-hyrox-black"
                  : "bg-white text-zinc-700 ring-1 ring-zinc-200"
              }`}
            >
              {TAG_LABELS[tag]}
            </button>
          ))}
        </div>
        <div className="mt-3">
          <label className="text-xs text-zinc-600">야외 런 메모 (선택)</label>
          <input
            value={outdoorRunNote}
            onChange={(e) => setOutdoorRunNote(e.target.value)}
            placeholder="예: 인근 한강 1km 왕복"
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
          />
        </div>
      </section>

      <section id="section-dropin" className={sectionClass("dropin")}>
        <h2 className="text-sm font-semibold text-zinc-900">
          {REPORT_TOPIC_LABELS.dropin}
        </h2>
        <p className="mt-1 text-xs text-zinc-500">{REPORT_TOPIC_HINTS.dropin}</p>
        <textarea
          value={dropInInfo}
          onChange={(e) => setDropInInfo(e.target.value)}
          rows={3}
          placeholder="예: 토요일 오전 시뮬 클래스, 인스타 DM 예약"
          className="mt-3 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
        />
      </section>

      <section id="section-links" className={sectionClass("links")}>
        <h2 className="text-sm font-semibold text-zinc-900">
          {REPORT_TOPIC_LABELS.links}
        </h2>
        <p className="mt-1 text-xs text-zinc-500">{REPORT_TOPIC_HINTS.links}</p>
        <div className="mt-3 space-y-2">
          <div>
            <label className="text-xs font-medium text-zinc-600">
              인스타그램
            </label>
            <input
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="@boxname 또는 https://instagram.com/..."
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600">
              네이버 예약
            </label>
            <input
              value={naverReservation}
              onChange={(e) => setNaverReservation(e.target.value)}
              placeholder="https://booking.naver.com/..."
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500">홈페이지 (선택)</label>
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://"
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
            />
          </div>
        </div>
      </section>

      <section id="section-hours" className={sectionClass("hours")}>
        <h2 className="text-sm font-semibold text-zinc-900">
          {REPORT_TOPIC_LABELS.hours}
        </h2>
        <p className="mt-1 text-xs text-zinc-500">{REPORT_TOPIC_HINTS.hours}</p>
        <textarea
          value={simScheduleNote}
          onChange={(e) => setSimScheduleNote(e.target.value)}
          rows={2}
          placeholder="예: 매주 토 10:00 / 일 14:00 시뮬 오픈"
          className="mt-3 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
        />
      </section>

      <section id="section-prices" className={sectionClass("prices")}>
        <h2 className="text-sm font-semibold text-zinc-900">
          {REPORT_TOPIC_LABELS.prices}
        </h2>
        <p className="mt-1 text-xs text-zinc-500">{REPORT_TOPIC_HINTS.prices}</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {SIM_DIVISIONS.map((division) => {
            const value =
              division === "single"
                ? simPriceSingle
                : division === "double"
                  ? simPriceDouble
                  : simPriceRelay;
            const setValue =
              division === "single"
                ? setSimPriceSingle
                : division === "double"
                  ? setSimPriceDouble
                  : setSimPriceRelay;
            return (
              <div key={division}>
                <label className="text-xs font-medium text-zinc-600">
                  {SIM_DIVISION_LABELS[division]}
                </label>
                <input
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="예: 3만원"
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                />
              </div>
            );
          })}
        </div>
        <div className="mt-3">
          <label className="text-xs text-zinc-500">기타 요금 참고</label>
          <input
            value={priceNote}
            onChange={(e) => setPriceNote(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
          />
        </div>
      </section>

      <div>
        <label className="text-sm font-medium">
          제보 내용 · 확인 경위 *
        </label>
        <textarea
          required
          minLength={isUpdate ? 10 : 20}
          rows={4}
          value={experienceNote}
          onChange={(e) => setExperienceNote(e.target.value)}
          placeholder={
            isUpdate
              ? "어떻게 확인했는지, 무엇이 맞/틀렸는지 적어주세요."
              : "방문·인스타·예약 페이지 등 확인 내용"
          }
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="text-sm font-medium">증빙 URL *</label>
        <input
          required
          type="url"
          value={evidenceUrl}
          onChange={(e) => setEvidenceUrl(e.target.value)}
          placeholder="인스타 게시물, 네이버 예약, 블로그 등"
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="text-sm text-zinc-600">연락처 (선택)</label>
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
      {error && (
        <p className="whitespace-pre-line text-sm text-red-600">{error}</p>
      )}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-lg bg-hyrox-yellow py-3 font-bold text-hyrox-black hover:bg-hyrox-yellow-hover disabled:opacity-50"
      >
        {status === "loading" ? "제출 중…" : "제보 제출"}
      </button>

      {isUpdate && venueSlug && (
        <p className="text-center text-xs text-zinc-500">
          <a href={buildReportUrl(venueSlug)} className="underline">
            다른 항목도 함께 제보하기
          </a>
        </p>
      )}
    </form>
  );
}
