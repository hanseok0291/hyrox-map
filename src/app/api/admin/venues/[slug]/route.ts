import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { clearVenuesCache } from "@/lib/venues-store";

const patchSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  lat: z.number().min(33).max(39).optional(),
  lng: z.number().min(124).max(132).optional(),
  address: z.string().min(5).max(300).optional(),
});

function regionFromAddress(address: string): string {
  const part = address.trim().split(/\s+/)[0];
  return part || "미분류";
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const venue = await prisma.venue.findUnique({ where: { slug } });
  if (!venue) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    venue: {
      slug: venue.slug,
      name: venue.name,
      address: venue.address,
      lat: venue.lat,
      lng: venue.lng,
    },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const existing = await prisma.venue.findUnique({ where: { slug } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data = parsed.data;
  if (
    data.name == null &&
    data.lat == null &&
    data.lng == null &&
    data.address == null
  ) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const venue = await prisma.venue.update({
    where: { id: existing.id },
    data: {
      ...(data.name != null ? { name: data.name } : {}),
      ...(data.lat != null ? { lat: data.lat } : {}),
      ...(data.lng != null ? { lng: data.lng } : {}),
      ...(data.address != null
        ? { address: data.address, region: regionFromAddress(data.address) }
        : {}),
    },
  });

  clearVenuesCache();

  return NextResponse.json({
    ok: true,
    venue: {
      slug: venue.slug,
      name: venue.name,
      lat: venue.lat,
      lng: venue.lng,
      address: venue.address,
    },
  });
}
