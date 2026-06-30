-- ============================================================
-- 0002_activities.sql  —  activities schema (MVP tables)
-- ============================================================

-- Enable PostGIS for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- ── activity_categories ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.activity_categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  icon        TEXT,
  parent_id   UUID REFERENCES public.activity_categories(id),
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ── activity_tags ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.activity_tags (
  id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name     TEXT NOT NULL UNIQUE,
  tag_type TEXT DEFAULT 'general'
);

-- ── activities ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.activities (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  description      TEXT,
  category_id      UUID REFERENCES public.activity_categories(id),
  location_id      UUID,  -- FK to activity_locations added after that table is created
  start_time       TIMESTAMPTZ NOT NULL,
  end_time         TIMESTAMPTZ,
  max_participants INT DEFAULT 10,
  is_public        BOOLEAN DEFAULT TRUE,
  status           TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming','ongoing','completed','cancelled')),
  created_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ── activity_locations (PostGIS) ────────────────────────────
CREATE TABLE IF NOT EXISTS public.activity_locations (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name      TEXT,
  address   TEXT,
  city_id   UUID,
  location  GEOGRAPHY(POINT, 4326) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add FK from activities to activity_locations
ALTER TABLE public.activities
  ADD CONSTRAINT fk_activities_location
  FOREIGN KEY (location_id) REFERENCES public.activity_locations(id);

-- ── activity_media ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.activity_media (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id  UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  media_url    TEXT NOT NULL,
  media_type   TEXT DEFAULT 'image' CHECK (media_type IN ('image','video')),
  caption      TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ── activity_participants ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.activity_participants (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role        TEXT DEFAULT 'participant' CHECK (role IN ('host','co-host','participant')),
  joined_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  status      TEXT DEFAULT 'active' CHECK (status IN ('active','left','removed')),
  UNIQUE (activity_id, user_id)
);

-- ── activity_waitlist ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.activity_waitlist (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  notified_at TIMESTAMPTZ,
  UNIQUE (activity_id, user_id)
);

-- ── saved_activities ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.saved_activities (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  saved_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (user_id, activity_id)
);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_activities_creator       ON public.activities(creator_id);
CREATE INDEX IF NOT EXISTS idx_activities_status        ON public.activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_start_time    ON public.activities(start_time);
CREATE INDEX IF NOT EXISTS idx_activities_category      ON public.activities(category_id);
CREATE INDEX IF NOT EXISTS idx_activity_loc_geography   ON public.activity_locations USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_participants_activity    ON public.activity_participants(activity_id);
CREATE INDEX IF NOT EXISTS idx_participants_user        ON public.activity_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_user               ON public.saved_activities(user_id);

-- ── updated_at trigger ──────────────────────────────────────
CREATE TRIGGER activities_updated_at
  BEFORE UPDATE ON public.activities
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── RLS ─────────────────────────────────────────────────────
ALTER TABLE public.activities           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_locations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_media       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_waitlist    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_activities     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_tags        ENABLE ROW LEVEL SECURITY;

-- activities: public ones visible to all; private ones only to participants
CREATE POLICY "activities_select_public" ON public.activities
  FOR SELECT USING (is_public = TRUE OR creator_id = auth.uid());

CREATE POLICY "activities_insert_auth" ON public.activities
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "activities_update_creator" ON public.activities
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "activities_delete_creator" ON public.activities
  FOR DELETE USING (auth.uid() = creator_id);

-- activity_locations: public read
CREATE POLICY "locations_select_all" ON public.activity_locations FOR SELECT USING (true);
CREATE POLICY "locations_insert_auth" ON public.activity_locations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- categories: public read
CREATE POLICY "categories_select_all" ON public.activity_categories FOR SELECT USING (true);

-- media: public read
CREATE POLICY "activity_media_select_all" ON public.activity_media FOR SELECT USING (true);
CREATE POLICY "activity_media_insert_creator" ON public.activity_media
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT creator_id FROM public.activities WHERE id = activity_id)
  );

-- participants: visible to participants of that activity
CREATE POLICY "participants_select" ON public.activity_participants
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.activity_participants ap2
            WHERE ap2.activity_id = activity_id AND ap2.user_id = auth.uid())
  );

CREATE POLICY "participants_insert_self" ON public.activity_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "participants_delete_self" ON public.activity_participants
  FOR DELETE USING (auth.uid() = user_id);

-- waitlist: owner only
CREATE POLICY "waitlist_owner" ON public.activity_waitlist
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- saved: owner only
CREATE POLICY "saved_owner" ON public.saved_activities
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- tags: public read
CREATE POLICY "tags_select_all" ON public.activity_tags FOR SELECT USING (true);

