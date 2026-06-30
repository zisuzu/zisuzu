-- ============================================================
-- 0005_discovery.sql  —  discovery schema
-- ============================================================

-- ── cities ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cities (
  id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name     TEXT NOT NULL,
  state    TEXT,
  country  TEXT DEFAULT 'India',
  location GEOGRAPHY(POINT, 4326),
  is_active BOOLEAN DEFAULT TRUE
);

-- ── regions ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.regions (
  id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id  UUID NOT NULL REFERENCES public.cities(id),
  name     TEXT NOT NULL,
  boundary GEOGRAPHY(POLYGON, 4326)
);

-- ── popular_places ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.popular_places (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id          UUID NOT NULL REFERENCES public.cities(id),
  name             TEXT NOT NULL,
  location         GEOGRAPHY(POINT, 4326),
  place_type       TEXT,
  popularity_score FLOAT DEFAULT 0.0
);

-- ── search_history ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.search_history (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  query      TEXT NOT NULL,
  filters    JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_cities_location         ON public.cities USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_popular_places_location ON public.popular_places USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_search_history_user     ON public.search_history(user_id);

-- ── RLS ─────────────────────────────────────────────────────
ALTER TABLE public.cities          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.popular_places  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cities_select_all"         ON public.cities FOR SELECT USING (true);
CREATE POLICY "regions_select_all"        ON public.regions FOR SELECT USING (true);
CREATE POLICY "popular_places_select_all" ON public.popular_places FOR SELECT USING (true);
CREATE POLICY "search_history_owner"      ON public.search_history
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

