/** 상세 패널·제보 폼에서 쓰는 항목 키 */
export const REPORT_TOPICS = [
  "simulation",
  "dropin",
  "hours",
  "prices",
  "links",
  "location",
] as const;

export type ReportTopic = (typeof REPORT_TOPICS)[number];

export const REPORT_TOPIC_LABELS: Record<ReportTopic, string> = {
  simulation: "시뮬레이션 가능 여부",
  dropin: "드랍인 · 시뮬 안내",
  hours: "운영 · 시뮬 시간",
  prices: "드랍인 시뮬 비용",
  links: "인스타 · 네이버 예약",
  location: "상호 · 주소 · 지도",
};

export const REPORT_TOPIC_HINTS: Record<ReportTopic, string> = {
  simulation: "가능한 스테이션·야외 런 등을 알려주세요.",
  dropin: "드랍인 방법, 시뮬 클래스 일정 등을 적어주세요.",
  hours: "요일·시간대(예: 토 10:00 시뮬)를 알려주세요.",
  prices: "싱글·더블·릴레이 드랍인 비용을 알려주세요.",
  links: "인스타그램, 네이버 예약 링크를 넣어주세요.",
  location:
    "상호명·주소·위도·경도가 바뀐 경우 모두 수정해 주세요. 증빙에 네이버/카카오 지도 링크를 꼭 포함해 주세요.",
};

export function isReportTopic(value: string | null): value is ReportTopic {
  return REPORT_TOPICS.includes(value as ReportTopic);
}
