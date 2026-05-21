import { ReportForm } from "@/components/ReportForm";

export default function ReportPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-zinc-900">시설 제보하기</h1>
      <p className="mt-2 text-sm text-zinc-600">
        방문해 보신 체육관·박스 정보를 알려주세요. 운영자 검수 후 지도에
        반영됩니다 (보통 3~5영업일).
      </p>
      <div className="mt-8">
        <ReportForm />
      </div>
    </div>
  );
}
