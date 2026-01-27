# Supabase Setup - Simplified Schema (Email, Password, Name only)

## Step 1: Drop Old Tables (if they exist)
Run this in your Supabase SQL Editor first:

```sql
-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop existing table (this will delete all profile data!)
DROP TABLE IF EXISTS public.profiles;
```

## Step 2: Create New Simplified Profiles Table

```sql
-- Create profiles table linked to auth.users (simplified - only name)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- Users can insert their own profile (during signup)
CREATE POLICY "Users can insert own profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "Users can delete own profile"
    ON public.profiles
    FOR DELETE
    USING (auth.uid() = id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_profiles_id ON public.profiles(id);
```

## Step 3: Create Trigger to Auto-Create Profile on User Signup

```sql
-- Drop existing trigger first (important!)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', 'User')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Step 4: Disable Email Confirmation (For Testing Only!)

Go to **Supabase Dashboard → Authentication → Providers → Email** and:
- Turn OFF "Confirm email" (for testing purposes)

⚠️ **Note:** Enable email confirmation back when going to production!

---

## Summary of Changes Made to Backend

1. **Schemas (`app/schemas/__init__.py`):**
   - `UserSignUp`: Only requires `email`, `password`, `name`
   - `UserProfileUpdate`: Only allows updating `name`
   - `UserProfileResponse`: Only returns `id`, `email`, `name`, `created_at`, `updated_at`

2. **Auth Router (`app/auth/router.py`):**
   - Signup only sends `name` in user metadata
   - Login/refresh responses only include `name` (no age/photo)

3. **Users Router (`app/users/router.py`):**
   - Removed photo upload/delete endpoints
   - Profile update only handles `name`

4. **Test HTML (`test.html`):**
   - Removed age and photo fields from signup form
   - Removed photo upload section
   - Simplified profile display

---

## Testing

1. Start the server:
   ```
   python -m uvicorn app.main:app --reload --port 8000
   ```

2. Open browser to: `http://localhost:8000/test`

3. Test signup with email, password, and name

4. API docs available at: `http://localhost:8000/docs`
