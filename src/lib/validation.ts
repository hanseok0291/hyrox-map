import { z } from "zod";
import { REPORT_TOPICS } from "./report-topics";
import { SIMULATION_TAGS } from "./simulation-tags";
import { VENUE_TYPES } from "./types";

function hasUpdatePayload(data: {
  tags?: string[];
  dropInInfo?: string;
  simScheduleNote?: string;
  outdoorRunNote?: string;
  priceNote?: string;
  simPriceSingle?: string;
  simPriceDouble?: string;
  simPriceRelay?: string;
  instagram?: string;
  naverReservation?: string;
  website?: string;
}) {
  return Boolean(
    (data.tags && data.tags.length > 0) ||
      data.dropInInfo?.trim() ||
      data.simScheduleNote?.trim() ||
      data.outdoorRunNote?.trim() ||
      data.priceNote?.trim() ||
      data.simPriceSingle?.trim() ||
      data.simPriceDouble?.trim() ||
      data.simPriceRelay?.trim() ||
      data.instagram?.trim() ||
      data.naverReservation?.trim() ||
      data.website?.trim()
  );
}

const reportBodySchema = z.object({
  reportKind: z.enum(["new", "update"]).default("new"),
  targetVenueSlug: z.string().max(80).optional(),
  reportTopics: z.array(z.enum(REPORT_TOPICS)).optional(),
  name: z.string().min(2).max(120),
  address: z.string().min(5).max(300),
  lat: z.number().min(33).max(39),
  lng: z.number().min(124).max(132),
  venueType: z.enum(VENUE_TYPES),
  experienceNote: z.string().min(10).max(2000),
  tags: z.array(z.enum(SIMULATION_TAGS)).optional(),
  evidenceUrls: z.array(z.string().url()).min(1).max(5),
  dropInInfo: z.string().max(500).optional(),
  simScheduleNote: z.string().max(500).optional(),
  outdoorRunNote: z.string().max(500).optional(),
  priceNote: z.string().max(200).optional(),
  simPriceSingle: z.string().max(80).optional(),
  simPriceDouble: z.string().max(80).optional(),
  simPriceRelay: z.string().max(80).optional(),
  reporterContact: z.string().max(120).optional(),
  website: z.string().max(500).optional(),
  instagram: z.string().max(300).optional(),
  naverReservation: z.string().max(500).optional(),
  consent: z.literal(true),
});

export const reportSchema = reportBodySchema.superRefine((data, ctx) => {
  if (data.reportKind === "update") {
    if (!data.targetVenueSlug) {
      ctx.addIssue({
        code: "custom",
        message: "수정 제보 대상 시설이 필요합니다.",
        path: ["targetVenueSlug"],
      });
    }
    if (!hasUpdatePayload(data)) {
      ctx.addIssue({
        code: "custom",
        message: "수정할 항목(태그, 안내, 시간, 가격, 링크 등)을 하나 이상 입력해 주세요.",
      });
    }
    if (data.experienceNote.length < 10) {
      ctx.addIssue({
        code: "custom",
        message: "제보 내용을 10자 이상 입력해 주세요.",
        path: ["experienceNote"],
      });
    }
    return;
  }

  if (!data.tags || data.tags.length < 1) {
    ctx.addIssue({
      code: "custom",
      message: "가능한 환경 태그를 1개 이상 선택해 주세요.",
      path: ["tags"],
    });
  }
  if (data.experienceNote.length < 20) {
    ctx.addIssue({
      code: "custom",
      message: "체험 내용을 20자 이상 입력해 주세요.",
      path: ["experienceNote"],
    });
  }
});

export type ReportInput = z.infer<typeof reportSchema>;
