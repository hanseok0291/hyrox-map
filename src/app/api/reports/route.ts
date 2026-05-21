import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { haversineKm } from "@/lib/venue";
import { reportSchema } from "@/lib/validation";

const DUPLICATE_RADIUS_KM = 0.05;

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const tagsJson = JSON.stringify(data.tags ?? []);

  if (data.reportKind === "update" && data.targetVenueSlug) {
    const exists = await prisma.venue.findUnique({
      where: { slug: data.targetVenueSlug },
    });
    if (!exists) {
      return NextResponse.json(
        { error: "대상 시설을 찾을 수 없습니다." },
        { status: 404 }
      );
    }
  }

  let duplicateNote: string | null = null;
  if (data.reportKind === "new") {
    const published = await prisma.venue.findMany({
      where: { publishedAt: { not: null } },
      select: { lat: true, lng: true },
    });
    const duplicate = published.some(
      (v) => haversineKm(v.lat, v.lng, data.lat, data.lng) < DUPLICATE_RADIUS_KM
    );
    if (duplicate) duplicateNote = "AUTO: possible duplicate within 50m";
  }

  const report = await prisma.report.create({
    data: {
      reportKind: data.reportKind,
      targetVenueSlug: data.targetVenueSlug ?? null,
      reportTopics: data.reportTopics?.length
        ? JSON.stringify(data.reportTopics)
        : null,
      name: data.name,
      address: data.address,
      region: data.address.split(" ").slice(0, 2).join(" ") || null,
      lat: data.lat,
      lng: data.lng,
      venueType: data.venueType,
      experienceNote: data.experienceNote,
      tags: tagsJson,
      evidenceUrls: JSON.stringify(data.evidenceUrls),
      dropInInfo: data.dropInInfo ?? null,
      simScheduleNote: data.simScheduleNote ?? null,
      outdoorRunNote: data.outdoorRunNote ?? null,
      priceNote: data.priceNote ?? null,
      simPriceSingle: data.simPriceSingle ?? null,
      simPriceDouble: data.simPriceDouble ?? null,
      simPriceRelay: data.simPriceRelay ?? null,
      reporterContact: data.reporterContact ?? null,
      website: data.website || null,
      instagram: data.instagram ?? null,
      naverReservation: data.naverReservation ?? null,
      status: "submitted",
      moderatorNote: duplicateNote,
    },
  });

  return NextResponse.json(
    { id: report.id, message: "제보가 접수되었습니다. 검수 후 반영됩니다." },
    { status: 201 }
  );
}
