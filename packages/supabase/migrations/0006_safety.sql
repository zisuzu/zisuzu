-- ============================================================
-- 0006_safety.sql  —  safety schema
-- ============================================================

-- ── reports ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reports (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type     TEXT NOT NULL CHECK (target_type IN ('user','activity')),
  target_id       UUID NOT NULL,
  reason          TEXT NOT NULL CHECK (reason IN ('spam','inappropriate','fake','safety','harassment','other')),
  description     TEXT,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending','reviewed','dismissed','actioned')),
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  reviewed_at     TIMESTAMPTZ,
  UNIQUE (reporter_id, target_type, target_id)
);

-- ── blocks ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.blocks (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (blocker_id, blocked_user_id),
  CHECK (blocker_id <> blocked_user_id)
);

-- ── moderation_cases (admin workflow) ────────────────────────
CREATE TABLE IF NOT EXISTS public.moderation_cases (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type        TEXT NOT NULL CHECK (type IN ('report','ban_request','content_removal')),
  target_id   UUID NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('user','activity','message')),
  reported_id UUID REFERENCES public.reports(id),
  status      TEXT DEFAULT 'open' CHECK (status IN ('open','in_review','resolved','dismissed')),
  assigned_to UUID REFERENCES public.profiles(id),
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  resolved_at TIMESTAMPTZ,
  resolution  TEXT
);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_reports_reporter     ON public.reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_status       ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_blocks_blocker       ON public.blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocks_blocked       ON public.blocks(blocked_user_id);
CREATE INDEX IF NOT EXISTS idx_mod_cases_status     ON public.moderation_cases(status);

-- ── RLS ─────────────────────────────────────────────────────
ALTER TABLE public.reports           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_cases  ENABLE ROW LEVEL SECURITY;

-- reports: reporter can submit + read own; admin reads all (via service role)
CREATE POLICY "reports_owner" ON public.reports
  USING (auth.uid() = reporter_id) WITH CHECK (auth.uid() = reporter_id);

-- blocks: blocker only
CREATE POLICY "blocks_owner" ON public.blocks
  USING (auth.uid() = blocker_id) WITH CHECK (auth.uid() = blocker_id);

-- moderation_cases: service role only (admin app)
-- No user-level policy — admin uses service role key

