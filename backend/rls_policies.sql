-- RLS policies for chat-related tables
-- Run in Supabase SQL Editor

-- ============ chat ============
ALTER TABLE public.chat ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated insert on chat"
  ON public.chat FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated select on chat"
  ON public.chat FOR SELECT
  TO authenticated
  USING (true);

-- ============ chat_results ============
ALTER TABLE public.chat_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated insert on chat_results"
  ON public.chat_results FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated select on chat_results"
  ON public.chat_results FOR SELECT
  TO authenticated
  USING (true);

-- ============ reference ============
ALTER TABLE public.reference ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated insert on reference"
  ON public.reference FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated select on reference"
  ON public.reference FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated update on reference"
  ON public.reference FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============ reference_metrics ============
ALTER TABLE public.reference_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated insert on reference_metrics"
  ON public.reference_metrics FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated select on reference_metrics"
  ON public.reference_metrics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated update on reference_metrics"
  ON public.reference_metrics FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============ project_reference ============
ALTER TABLE public.project_reference ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated insert on project_reference"
  ON public.project_reference FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated select on project_reference"
  ON public.project_reference FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated delete on project_reference"
  ON public.project_reference FOR DELETE
  TO authenticated
  USING (true);
