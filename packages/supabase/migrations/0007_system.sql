-- ============================================================
-- 0007_system.sql  —  system schema + seed basics
-- ============================================================

-- ── app_config ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.app_config (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  config_key   TEXT NOT NULL UNIQUE,
  config_value JSONB NOT NULL,
  updated_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ── feature_flags ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flag_key     TEXT NOT NULL UNIQUE,
  description  TEXT,
  is_enabled   BOOLEAN DEFAULT FALSE,
  rules        JSONB DEFAULT '{}'::JSONB,
  updated_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ── RLS ─────────────────────────────────────────────────────
ALTER TABLE public.app_config    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Both tables: public read, service role write
CREATE POLICY "app_config_select_all"    ON public.app_config FOR SELECT USING (true);
CREATE POLICY "feature_flags_select_all" ON public.feature_flags FOR SELECT USING (true);

-- ── Seed: default feature flags ──────────────────────────────
INSERT INTO public.feature_flags (flag_key, description, is_enabled) VALUES
  ('realtime_chat',         'Enable Supabase Realtime for activity chat',   TRUE),
  ('activity_waitlist',     'Enable waitlist when activity is full',        TRUE),
  ('user_reviews',          'Enable post-activity user reviews',            FALSE),
  ('push_notifications',    'Enable FCM/APNs push notifications',           FALSE),
  ('payments',              'Enable Stripe/Razorpay payments',              FALSE),
  ('analytics',             'Enable PostHog analytics tracking',            FALSE),
  ('venue_bookings',        'Enable venue booking flow',                    FALSE),
  ('social_followers',      'Enable follow/follower social graph',          FALSE)
ON CONFLICT (flag_key) DO NOTHING;

-- ── Seed: default app config ─────────────────────────────────
INSERT INTO public.app_config (config_key, config_value) VALUES
  ('app_version',       '"1.0.0"'),
  ('default_city',      '"Chennai"'),
  ('default_radius_km', '60'),
  ('max_activity_spots', '50'),
  ('otp_expiry_minutes', '10')
ON CONFLICT (config_key) DO NOTHING;

-- ── Nearby activities function (PostGIS) ─────────────────────
CREATE OR REPLACE FUNCTION public.nearby_activities(
  lat          FLOAT,
  lng          FLOAT,
  radius_km    FLOAT DEFAULT 60,
  category_id  UUID  DEFAULT NULL,
  limit_count  INT   DEFAULT 50,
  offset_count INT   DEFAULT 0
)
RETURNS TABLE (
  id               UUID,
  title            TEXT,
  description      TEXT,
  status           TEXT,
  start_time       TIMESTAMPTZ,
  end_time         TIMESTAMPTZ,
  max_participants INT,
  creator_id       UUID,
  category_id      UUID,
  location_id      UUID,
  distance_km      FLOAT,
  participant_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.title,
    a.description,
    a.status,
    a.start_time,
    a.end_time,
    a.max_participants,
    a.creator_id,
    a.category_id,
    a.location_id,
    ROUND(
      (ST_Distance(
        al.location::GEOGRAPHY,
        ST_SetSRID(ST_MakePoint(lng, lat), 4326)::GEOGRAPHY
      ) / 1000.0)::NUMERIC, 2
    )::FLOAT AS distance_km,
    (SELECT COUNT(*) FROM public.activity_participants ap
     WHERE ap.activity_id = a.id AND ap.status = 'active') AS participant_count
  FROM public.activities a
  JOIN public.activity_locations al ON al.id = a.location_id
  WHERE
    a.is_public = TRUE
    AND a.status IN ('upcoming', 'ongoing')
    AND a.start_time > NOW()
    AND ST_DWithin(
      al.location::GEOGRAPHY,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::GEOGRAPHY,
      radius_km * 1000
    )
    AND (category_id IS NULL OR a.category_id = category_id)
  ORDER BY distance_km ASC, a.start_time ASC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

