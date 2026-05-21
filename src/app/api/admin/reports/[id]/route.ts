import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { parseTags, slugify } from "@/lib/venue";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    report: {
      ...report,
      tags: parseTags(report.tags),
      evidenceUrls: JSON.parse(report.evidenceUrls) as string[],
    },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as {
    action: "approve" | "reject" | "needs_info" | "in_review";
    trustLevel?: "verified" | "community";
    moderatorNote?: string;
    reporterMessage?: string;
  };

  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (body.action === "in_review") {
    await prisma.report.update({
      where: { id },
      data: { status: "in_review", moderatorNote: body.moderatorNote },
    });
    return NextResponse.json({ ok: true });
  }

  if (body.action === "needs_info" || body.action === "reject") {
    await prisma.report.update({
      where: { id },
      data: {
        status: body.action === "reject" ? "rejected" : "needs_info",
        moderatorNote: body.moderatorNote,
        reporterMessage: body.reporterMessage,
        reviewedAt: new Date(),
      },
    });
    return NextResponse.json({ ok: true });
  }

  if (body.action === "approve") {
    const tags = parseTags(report.tags);
    const baseSlug = slugify(report.name);
    let slug = baseSlug;
    let n = 1;
    while (await prisma.venue.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${n++}`;
    }

    const venue = await prisma.venue.create({
      data: {
        name: report.name,
        slug,
        address: report.address,
        region: report.region ?? report.address.split(" ")[0] ?? "미분류",
        lat: report.lat,
        lng: report.lng,
        venueType: report.venueType,
        trustLevel: (body.trustLevel ?? "community") as never,
        source: "community_report",
        tags: report.tags,
        outdoorRunNote: null,
        dropInInfo: report.dropInInfo,
        priceNote: report.priceNote,
        dropInAvailable: Boolean(report.dropInInfo),
        links: JSON.stringify({
          website: report.website ?? "",
          instagram: report.instagram ?? "",
        }),
        experienceNote: report.experienceNote,
        publishedAt: new Date(),
      },
    });

    await prisma.report.update({
      where: { id },
      data: {
        status: "approved",
        mergedIntoVenueId: venue.id,
        moderatorNote: body.moderatorNote,
        reviewedAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true, venueSlug: venue.slug });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
