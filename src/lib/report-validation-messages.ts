import type { ZodError } from "zod";

const FIELD_LABELS: Record<string, string> = {
  experienceNote: "제보 내용",
  evidenceUrls: "증빙 URL",
  tags: "시뮬레이션 태그",
  name: "시설명",
  address: "주소",
  targetVenueSlug: "대상 시설",
};

export function formatReportValidationError(error: ZodError): string {
  const lines: string[] = [];

  for (const issue of error.issues) {
    const field = issue.path[0];
    const label =
      typeof field === "string" ? (FIELD_LABELS[field] ?? field) : "입력값";
    lines.push(`· ${label}: ${issue.message}`);
  }

  return lines.length > 0
    ? lines.join("\n")
    : "입력 내용을 확인해 주세요.";
}
