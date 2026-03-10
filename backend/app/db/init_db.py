from app.db.supabase import get_supabase

# All tables that should exist (in dependency order)
REQUIRED_TABLES = [
    "profiles",
    "projects",
    "thread",
    "reference",
    "authors",
    "reference_authors",
    "reference_metrics",
    "project_reference",
    "chat",
    "chat_results",
]


def check_tables() -> None:
    """Check which required tables exist via Supabase REST API."""
    supabase = get_supabase()
    missing = []
    for table in REQUIRED_TABLES:
        try:
            supabase.table(table).select("*", count="exact").limit(0).execute()
            print(f"  [OK] Table '{table}' exists.")
        except Exception:
            missing.append(table)
            print(f"  [MISSING] Table '{table}' not found.")

    if missing:
        print(f"\n  Missing tables: {missing}")
        print("  Run migration.sql in Supabase Dashboard > SQL Editor to create them.")
    else:
        print("All required tables found.")
