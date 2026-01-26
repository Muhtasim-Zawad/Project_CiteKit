# CiteKit Backend - Authentication API

FastAPI backend with Supabase authentication, Google Sign-in, and user profile management.

## Features

- Email/Password authentication
- User profile management (name, age, photo)
- JWT token-based authentication
- Profile photo upload to Supabase Storage

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Environment configuration
│   ├── auth/
│   │   ├── __init__.py
│   │   ├── router.py        # Auth endpoints
│   │   └── dependencies.py  # JWT verification
│   ├── users/
│   │   ├── __init__.py
│   │   └── router.py        # User profile endpoints
│   ├── db/
│   │   ├── __init__.py
│   │   └── supabase.py      # Supabase client
│   └── schemas/
│       └── __init__.py      # Pydantic models
├── requirements.txt
├── .env.example
└── README.md
```

## Setup Instructions

### 1. Install Dependencies

```bash
# Create virtual environment (if not exists)
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_JWT_SECRET=your_supabase_jwt_secret
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
```

### 3. Run the Server

```bash
uvicorn app.main:app --reload --port 8000
```

API documentation available at: http://localhost:8000/docs

---

## Supabase Configuration (IMPORTANT)

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" and sign in
3. Click "New Project"
4. Fill in project details and click "Create new project"
5. Wait for the project to be set up

### Step 2: Get Your Credentials

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy the following values to your `.env` file:
   - **Project URL** → `SUPABASE_URL`
   - **anon public key** → `SUPABASE_KEY`
   - **JWT Secret** (under JWT Settings) → `SUPABASE_JWT_SECRET`

### Step 3: Create the Profiles Table

1. Go to **SQL Editor** in your Supabase dashboard
2. Run the following SQL:

```sql
-- Create profiles table linked to auth.users
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INTEGER NOT NULL DEFAULT 0,
    photo_url TEXT,
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

### Step 4: Create Storage Bucket for Avatars

1. Go to **Storage** in your Supabase dashboard
2. Click "New Bucket"
3. Enter bucket name: `avatars`
4. Check "Public bucket" (to allow public access to profile photos)
5. Click "Create bucket"

6. Set up policies for the `avatars` bucket using **one of these methods**:

**Method A: Using Supabase UI (Recommended)**
1. Go to **Storage** → Click on `avatars` bucket → **Policies** tab
2. Click "New Policy" for each policy:

   **Policy 1 - SELECT (Public Read):**
   - Policy name: `Public read access for avatars`
   - Allowed operation: `SELECT`
   - Target roles: Leave empty (applies to all)
   - USING expression: `true`

   **Policy 2 - INSERT (Upload own avatar):**
   - Policy name: `Users can upload own avatar`
   - Allowed operation: `INSERT`
   - Target roles: `authenticated`
   - WITH CHECK expression: `(storage.foldername(name))[1] = auth.uid()::text`

   **Policy 3 - UPDATE (Update own avatar):**
   - Policy name: `Users can update own avatar`
   - Allowed operation: `UPDATE`
   - Target roles: `authenticated`
   - USING expression: `(storage.foldername(name))[1] = auth.uid()::text`

   **Policy 4 - DELETE (Delete own avatar):**
   - Policy name: `Users can delete own avatar`
   - Allowed operation: `DELETE`
   - Target roles: `authenticated`
   - USING expression: `(storage.foldername(name))[1] = auth.uid()::text`

**Method B: Using SQL Editor**
Run each policy separately (not all at once):

```sql
-- Run this FIRST
CREATE POLICY "Public read access for avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
```

```sql
-- Run this SECOND
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
```

```sql
-- Run this THIRD
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
```

```sql
-- Run this FOURTH
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
```

### Step 5: Configure Email Settings (Optional)

1. Go to **Authentication** → **Email Templates**
2. Customize the confirmation email template if desired
3. For production, go to **Settings** → **Auth** → **SMTP Settings** and configure your email provider

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Register with email/password + profile |
| POST | `/auth/login` | Login with email/password |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Logout user |
| POST | `/auth/reset-password` | Send password reset email |

### User Profile

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/me` | Get current user profile |
| PUT | `/users/me` | Update current user profile |
| POST | `/users/me/photo` | Upload profile photo |
| DELETE | `/users/me/photo` | Delete profile photo |
| DELETE | `/users/me` | Delete user account |

---

## Usage Examples

### Sign Up

```bash
curl -X POST "http://localhost:8000/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123",
    "name": "John Doe",
    "age": 25,
    "photo_url": null
  }'
```

### Login

```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

### Get Profile (Authenticated)

```bash
curl -X GET "http://localhost:8000/users/me" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Update Profile (Authenticated)

```bash
curl -X PUT "http://localhost:8000/users/me" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "age": 26
  }'
```

### Upload Profile Photo (Authenticated)

```bash
curl -X POST "http://localhost:8000/users/me/photo" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/photo.jpg"
```

---

## Frontend Integration

### Token Storage

Store the access token securely (e.g., in httpOnly cookies or secure localStorage).

Include it in requests:
```javascript
fetch('/users/me', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

---

## Troubleshooting

### Common Issues

1. **"Invalid JWT" error**: Make sure `SUPABASE_JWT_SECRET` is correct
2. **Profile not created**: Ensure RLS policies are set correctly
3. **Photo upload fails**: Check storage bucket policies and ensure bucket is public

### Debug Mode

Run with debug logging:
```bash
uvicorn app.main:app --reload --log-level debug
```
