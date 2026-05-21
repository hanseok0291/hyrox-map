import { z } from "zod";
import { SIMULATION_TAGS, VENUE_TYPES } from "./types";

export const reportSchema = z.object({
  name: z.string().min(2).max(120),
  address: z.string().min(5).max(300),
  lat: z.number().min(33).max(39),
  lng: z.number().min(124).max(132),
  venueType: z.enum(VENUE_TYPES),
  experienceNote: z.string().min(20).max(2000),
  tags: z.array(z.enum(SIMULATION_TAGS)).min(1),
  evidenceUrls: z.array(z.string().url()).min(1).max(5),
  dropInInfo: z.string().max(500).optional(),
  priceNote: z.string().max(200).optional(),
  reporterContact: z.string().max(120).optional(),
  website: z.string().url().optional().or(z.literal("")),
  instagram: z.string().max(200).optional(),
  consent: z.literal(true),
});

export type ReportInput = z.infer<typeof reportSchema>;
