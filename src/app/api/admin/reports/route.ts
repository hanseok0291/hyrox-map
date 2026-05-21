import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { parseTags } from "@/lib/venue";

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const status = request.nextUrl.searchParams.get("status");

  const reports = await prisma.report.findMany({
    where: status ? { status: status as never } : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({
    reports: reports.map((r) => ({
      id: r.id,
      name: r.name,
      address: r.address,
      status: r.status,
      venueType: r.venueType,
      tags: parseTags(r.tags),
      moderatorNote: r.moderatorNote,
      createdAt: r.createdAt,
    })),
  });
}
