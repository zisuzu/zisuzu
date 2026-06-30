-- ============================================================
-- 0004_social.sql  —  social schema
-- ============================================================

-- ── followers ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.followers (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (follower_id, following_id),
  CHECK (follower_id <> following_id)
);

-- ── user_reviews ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_reviews (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reviewer_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewed_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_id  UUID REFERENCES public.activities(id) ON DELETE SET NULL,
  rating       SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment      TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (reviewer_id, reviewed_id, activity_id)
);

-- ── notifications ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  body       TEXT,
  type       TEXT NOT NULL,  -- join_request | new_message | activity_update | review | system
  data       JSONB DEFAULT '{}'::JSONB,
  is_read    BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_followers_follower   ON public.followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_followers_following  ON public.followers(following_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user   ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed     ON public.user_reviews(reviewed_id);

-- ── RLS ─────────────────────────────────────────────────────
ALTER TABLE public.followers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reviews   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications  ENABLE ROW LEVEL SECURITY;

-- followers: anyone can see
CREATE POLICY "followers_select_all" ON public.followers FOR SELECT USING (true);
CREATE POLICY "followers_insert_self" ON public.followers
  FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "followers_delete_self" ON public.followers
  FOR DELETE USING (auth.uid() = follower_id);

-- reviews: public read, owner write
CREATE POLICY "reviews_select_all" ON public.user_reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_self" ON public.user_reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- notifications: owner only
CREATE POLICY "notifications_owner" ON public.notifications
  USING (auth.uid() = user_id);

