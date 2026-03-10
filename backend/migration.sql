-- CiteKit Full Migration Script
-- Run this in Supabase Dashboard → SQL Editor

-- PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROJECTS
CREATE TABLE IF NOT EXISTS public.projects (
    project_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- REFERENCE (papers)
CREATE TABLE IF NOT EXISTS public.reference (
    doi TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    abstract TEXT,
    year INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AUTHORS
CREATE TABLE IF NOT EXISTS public.authors (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL
);

-- REFERENCE AUTHORS (many-to-many)
CREATE TABLE IF NOT EXISTS public.reference_authors (
    doi TEXT NOT NULL REFERENCES public.reference(doi) ON DELETE CASCADE,
    author_id BIGINT NOT NULL REFERENCES public.authors(id) ON DELETE CASCADE,
    position INT,
    PRIMARY KEY (doi, author_id)
);

-- REFERENCE METRICS
CREATE TABLE IF NOT EXISTS public.reference_metrics (
    doi TEXT PRIMARY KEY REFERENCES public.reference(doi) ON DELETE CASCADE,
    times_cited INT,
    recent_citations INT,
    relative_citation_ratio FLOAT,
    field_citation_ratio FLOAT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROJECT REFERENCE (many-to-many)
CREATE TABLE IF NOT EXISTS public.project_reference (
    project_id UUID NOT NULL REFERENCES public.projects(project_id) ON DELETE CASCADE,
    doi TEXT NOT NULL REFERENCES public.reference(doi) ON DELETE CASCADE,
    add_time TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (project_id, doi)
);

-- CHAT
CREATE TABLE IF NOT EXISTS public.chat (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES public.projects(project_id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    search_terms TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CHAT RESULTS
CREATE TABLE IF NOT EXISTS public.chat_results (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    chat_id BIGINT NOT NULL REFERENCES public.chat(id) ON DELETE CASCADE,
    doi TEXT NOT NULL REFERENCES public.reference(doi),
    score DOUBLE PRECISION,
    critic_reasoning TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
