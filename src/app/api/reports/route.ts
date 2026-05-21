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

  const published = await prisma.venue.findMany({
    where: { publishedAt: { not: null } },
    select: { lat: true, lng: true, name: true },
  });

  const duplicate = published.some(
    (v) => haversineKm(v.lat, v.lng, data.lat, data.lng) < DUPLICATE_RADIUS_KM
  );

  const report = await prisma.report.create({
    data: {
      name: data.name,
      address: data.address,
      lat: data.lat,
      lng: data.lng,
      venueType: data.venueType,
      experienceNote: data.experienceNote,
      tags: JSON.stringify(data.tags),
      evidenceUrls: JSON.stringify(data.evidenceUrls),
      dropInInfo: data.dropInInfo ?? null,
      priceNote: data.priceNote ?? null,
      reporterContact: data.reporterContact ?? null,
      website: data.website || null,
      instagram: data.instagram ?? null,
      status: duplicate ? "submitted" : "submitted",
      moderatorNote: duplicate ? "AUTO: possible duplicate within 50m" : null,
    },
  });

  return NextResponse.json(
    { id: report.id, message: "제보가 접수되었습니다. 검수 후 반영됩니다." },
    { status: 201 }
  );
}
