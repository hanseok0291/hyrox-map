/** 상세 패널·제보 폼에서 쓰는 항목 키 */
export const REPORT_TOPICS = [
  "simulation",
  "dropin",
  "hours",
  "prices",
  "links",
] as const;

export type ReportTopic = (typeof REPORT_TOPICS)[number];

export const REPORT_TOPIC_LABELS: Record<ReportTopic, string> = {
  simulation: "시뮬레이션 가능 여부",
  dropin: "드랍인 · 시뮬 안내",
  hours: "운영 · 시뮬 시간",
  prices: "드랍인 시뮬 비용",
  links: "인스타 · 네이버 예약",
};

export const REPORT_TOPIC_HINTS: Record<ReportTopic, string> = {
  simulation: "가능한 스테이션·야외 런 등을 알려주세요.",
  dropin: "드랍인 방법, 시뮬 클래스 일정 등을 적어주세요.",
  hours: "요일·시간대(예: 토 10:00 시뮬)를 알려주세요.",
  prices: "싱글·더블·릴레이 드랍인 비용을 알려주세요.",
  links: "인스타그램, 네이버 예약 링크를 넣어주세요.",
};

export function isReportTopic(value: string | null): value is ReportTopic {
  return REPORT_TOPICS.includes(value as ReportTopic);
}
