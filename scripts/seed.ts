import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

type SeedRow = {
  name: string;
  slug: string;
  address: string;
  region: string;
  lat: number;
  lng: number;
  venue_type: string;
  trust_level: string;
  source: string;
  tags: string[];
  outdoor_run_note?: string | null;
  drop_in_info?: string | null;
  price_note?: string | null;
  drop_in_available?: boolean;
  links?: Record<string, string>;
  official_club_id?: string | null;
};

async function main() {
  const path = join(process.cwd(), "data", "seed-venues.json");
  const rows = JSON.parse(readFileSync(path, "utf-8")) as SeedRow[];

  let created = 0;
  let skipped = 0;

  for (const row of rows) {
    const existing = await prisma.venue.findUnique({ where: { slug: row.slug } });
    if (existing) {
      skipped++;
      continue;
    }

    await prisma.venue.create({
      data: {
        name: row.name,
        slug: row.slug,
        address: row.address,
        region: row.region,
        lat: row.lat,
        lng: row.lng,
        venueType: row.venue_type as never,
        trustLevel: row.trust_level as never,
        source: row.source as never,
        tags: JSON.stringify(row.tags),
        outdoorRunNote: row.outdoor_run_note ?? null,
        dropInInfo: row.drop_in_info ?? null,
        priceNote: row.price_note ?? null,
        dropInAvailable: row.drop_in_available ?? false,
        links: JSON.stringify(row.links ?? {}),
        officialClubId: row.official_club_id ?? null,
        publishedAt: new Date(),
      },
    });
    created++;
  }

  console.log(`Seed complete: ${created} created, ${skipped} skipped`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
