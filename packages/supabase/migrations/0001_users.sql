-- ============================================================
-- 0001_users.sql  —  users schema (MVP tables)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── profiles ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      TEXT UNIQUE,
  display_name  TEXT,
  avatar_url    TEXT,
  bio           TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ── profile_private ─────────────────────────────────────────
-- RLS: owner only
CREATE TABLE IF NOT EXISTS public.profile_private (
  id                  UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name           TEXT,
  email               TEXT,
  phone               TEXT,
  dob                 DATE,
  gender              TEXT,
  emergency_contact   TEXT,
  address             TEXT,
  id_proof_url        TEXT,
  updated_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ── user_preferences ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id                    UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  timezone              TEXT DEFAULT 'Asia/Kolkata',
  language              TEXT DEFAULT 'en',
  privacy_level         TEXT DEFAULT 'public' CHECK (privacy_level IN ('public','friends','private')),
  notification_settings JSONB DEFAULT '{}'::JSONB,
  updated_at            TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ── user_devices (stub — push notifications wired later) ────
CREATE TABLE IF NOT EXISTS public.user_devices (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  device_token TEXT NOT NULL,
  platform     TEXT NOT NULL CHECK (platform IN ('ios','android')),
  device_id    TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  is_active    BOOLEAN DEFAULT TRUE,
  UNIQUE (device_token)
);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_user_devices_user_id ON public.user_devices(user_id);

-- ── updated_at trigger function ─────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER profile_private_updated_at
  BEFORE UPDATE ON public.profile_private
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── Auto-create profile on new auth user ────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Row Level Security ───────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_private ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;

-- profiles: anyone can read, only owner can update
CREATE POLICY "profiles_select_all"   ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_owner" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_owner" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- profile_private: owner only
CREATE POLICY "profile_private_owner" ON public.profile_private
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- user_preferences: owner only
CREATE POLICY "user_preferences_owner" ON public.user_preferences
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- user_devices: owner only
CREATE POLICY "user_devices_owner" ON public.user_devices
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

