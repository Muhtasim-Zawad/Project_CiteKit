-- Migration: Add thread table between projects and chat
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Create the thread table
CREATE TABLE IF NOT EXISTS public.thread (
    thread_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(project_id) ON DELETE CASCADE,
    title TEXT,
    summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add thread_id column to chat (nullable for backward compat with existing rows)
ALTER TABLE public.chat
    ADD COLUMN IF NOT EXISTS thread_id UUID REFERENCES public.thread(thread_id) ON DELETE CASCADE;

-- 3. Remove summary from projects (threads own summaries now)
ALTER TABLE public.projects DROP COLUMN IF EXISTS summary;

-- 4. RLS for thread
ALTER TABLE public.thread ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated insert on thread"
  ON public.thread FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated select on thread"
  ON public.thread FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated update on thread"
  ON public.thread FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated delete on thread"
  ON public.thread FOR DELETE TO authenticated USING (true);
