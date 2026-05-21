import { NextRequest, NextResponse } from "next/server";
import { getVenueBySlug } from "@/lib/venues-store";
import { toVenueDTO } from "@/lib/venue";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const venue = await getVenueBySlug(slug);

  if (!venue) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ venue: toVenueDTO(venue) });
}
