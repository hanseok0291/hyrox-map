import type { ReportTopic } from "@/lib/report-topics";

export function buildReportUrl(
  venueSlug: string,
  topic?: ReportTopic
): string {
  const params = new URLSearchParams({ venue: venueSlug });
  if (topic) params.set("topic", topic);
  return `/report?${params.toString()}`;
}
