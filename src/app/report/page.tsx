import { Suspense } from "react";
import { ReportForm } from "@/components/ReportForm";

export default function ReportPage() {
  return (
    <div className="mx-auto max-w-2xl bg-white px-4 py-8">
      <h1 className="text-2xl font-bold text-zinc-900">시설 제보하기</h1>
      <p className="mt-2 text-sm text-zinc-600">
        새 시설 등록·기존 시설 정보 수정(시뮬 가능 여부, 드랍인 안내, 시간,
        비용, 인스타·네이버 예약)을 받습니다. 검수 후 반영됩니다.
      </p>
      <div className="mt-8">
        <Suspense fallback={<p className="text-sm text-zinc-500">로딩…</p>}>
          <ReportForm />
        </Suspense>
      </div>
    </div>
  );
}
