-- ============================================================
-- 0003_chat.sql  —  chat schema
-- ============================================================

-- ── activity_conversations ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.activity_conversations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id     UUID NOT NULL UNIQUE REFERENCES public.activities(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_message_at TIMESTAMPTZ
);

-- ── activity_messages ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.activity_messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.activity_conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message_type    TEXT DEFAULT 'text' CHECK (message_type IN ('text','image','system')),
  content         TEXT,
  media_url       TEXT,
  reply_to_id     UUID REFERENCES public.activity_messages(id),
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  is_deleted      BOOLEAN DEFAULT FALSE
);

-- ── message_reads ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.message_reads (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES public.activity_messages(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  read_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (message_id, user_id)
);

-- ── message_reactions ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES public.activity_messages(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  emoji      TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (message_id, user_id, emoji)
);

-- ── typing_status ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.typing_status (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.activity_conversations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_typing       BOOLEAN DEFAULT FALSE,
  updated_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (conversation_id, user_id)
);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.activity_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender       ON public.activity_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at   ON public.activity_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reactions_message     ON public.message_reactions(message_id);

-- ── Auto-create conversation when activity is created ────────
CREATE OR REPLACE FUNCTION public.handle_new_activity_conversation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.activity_conversations (activity_id)
  VALUES (NEW.id)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_activity_created_conversation
  AFTER INSERT ON public.activities
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_activity_conversation();

-- ── Update last_message_at on new message ────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.activity_conversations
  SET last_message_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_new_message_update_conversation
  AFTER INSERT ON public.activity_messages
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_message();

-- ── RLS ─────────────────────────────────────────────────────
ALTER TABLE public.activity_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_messages      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reads          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.typing_status          ENABLE ROW LEVEL SECURITY;

-- conversations: only participants of the activity can see
CREATE POLICY "conversations_participants" ON public.activity_conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.activity_participants ap
      WHERE ap.activity_id = activity_id AND ap.user_id = auth.uid() AND ap.status = 'active'
    )
  );

-- messages: only participants can read/write
CREATE POLICY "messages_participants_select" ON public.activity_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.activity_conversations ac
      JOIN public.activity_participants ap ON ap.activity_id = ac.activity_id
      WHERE ac.id = conversation_id AND ap.user_id = auth.uid() AND ap.status = 'active'
    )
  );

CREATE POLICY "messages_participants_insert" ON public.activity_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.activity_conversations ac
      JOIN public.activity_participants ap ON ap.activity_id = ac.activity_id
      WHERE ac.id = conversation_id AND ap.user_id = auth.uid() AND ap.status = 'active'
    )
  );

-- message_reads: own rows
CREATE POLICY "reads_owner" ON public.message_reads
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- reactions: participants
CREATE POLICY "reactions_owner" ON public.message_reactions
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- typing: participants
CREATE POLICY "typing_owner" ON public.typing_status
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

