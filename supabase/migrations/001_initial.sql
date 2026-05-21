-- Hyrox Map — Supabase Postgres schema (production)
-- Sync with prisma/schema.prisma enums

CREATE TYPE venue_type AS ENUM (
  'official_club', 'crossfit_box', 'hyrox_center', 'gym', 'other'
);

CREATE TYPE trust_level AS ENUM (
  'official', 'verified', 'community', 'pending'
);

CREATE TYPE venue_source AS ENUM (
  'official', 'curated', 'community_report'
);

CREATE TYPE report_status AS ENUM (
  'submitted', 'in_review', 'needs_info', 'approved', 'rejected'
);

CREATE TABLE venues (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  address TEXT NOT NULL,
  region TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  venue_type venue_type NOT NULL,
  trust_level trust_level NOT NULL,
  source venue_source NOT NULL,
  tags JSONB NOT NULL DEFAULT '[]',
  outdoor_run_note TEXT,
  drop_in_info TEXT,
  price_note TEXT,
  drop_in_available BOOLEAN NOT NULL DEFAULT FALSE,
  links JSONB NOT NULL DEFAULT '{}',
  official_club_id TEXT,
  experience_note TEXT,
  published_at TIMESTAMPTZ,
  flagged BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX venues_lat_lng_idx ON venues (lat, lng);
CREATE INDEX venues_region_idx ON venues (region);
CREATE INDEX venues_published_at_idx ON venues (published_at);

CREATE TABLE reports (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  region TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  venue_type venue_type NOT NULL,
  experience_note TEXT NOT NULL,
  tags JSONB NOT NULL DEFAULT '[]',
  evidence_urls JSONB NOT NULL DEFAULT '[]',
  drop_in_info TEXT,
  price_note TEXT,
  reporter_contact TEXT,
  website TEXT,
  instagram TEXT,
  status report_status NOT NULL DEFAULT 'submitted',
  moderator_note TEXT,
  reporter_message TEXT,
  reviewed_at TIMESTAMPTZ,
  merged_into_venue_id TEXT REFERENCES venues(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX reports_status_idx ON reports (status);

-- RLS (enable in Supabase dashboard)
-- ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
-- Public read: published venues only
-- CREATE POLICY venues_public_read ON venues FOR SELECT USING (published_at IS NOT NULL AND NOT flagged);
