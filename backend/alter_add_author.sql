-- Add 'author' column to the reference table (run in Supabase SQL Editor)
ALTER TABLE public.reference ADD COLUMN IF NOT EXISTS author TEXT;
