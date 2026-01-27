# CiteKit Backend

A modular FastAPI backend with Supabase integration. Currently includes authentication module with more modules to be added.

## Current Modules

- ✅ **Authentication** - Email/Password signup, login, JWT tokens
- 🔜 More modules coming soon...

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Environment configuration
│   ├── auth/                # 🔐 Authentication Module
│   │   ├── __init__.py
│   │   ├── router.py        # Auth endpoints (signup, login, etc.)
│   │   └── dependencies.py  # JWT verification
│   ├── users/               # 👤 User Profile Module
│   │   ├── __init__.py
│   │   └── router.py        # User profile endpoints
│   ├── db/
│   │   ├── __init__.py
│   │   └── supabase.py      # Supabase client
│   └── schemas/
│       └── __init__.py      # Pydantic models
├── requirements.txt
├── .env
├── supabase_setup.md        # Database setup instructions
└── README.md
```

## Quick Start

### 1. Install Dependencies

```bash
# Create virtual environment
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

Create a `.env` file with your Supabase credentials:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_JWT_SECRET=your_supabase_jwt_secret
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
```

**Where to find these values:**
- Go to your Supabase project → **Settings** → **API**
- `SUPABASE_URL` = Project URL
- `SUPABASE_KEY` = anon public key
- `SUPABASE_JWT_SECRET` = JWT Secret (under JWT Settings)

### 3. Database Setup

See `supabase_setup.md` for complete database setup instructions.

### 4. Run the Server

```bash
uvicorn app.main:app --reload --port 8000
```

- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

---

## Authentication Module

### Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/signup` | Register new user | No |
| POST | `/auth/login` | Login with email/password | No |
| POST | `/auth/refresh` | Refresh access token | No |
| POST | `/auth/logout` | Logout user | No |
| POST | `/auth/reset-password` | Send password reset email | No |
| POST | `/auth/resend-confirmation` | Resend email confirmation | No |

### User Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users/me` | Get current user profile | Yes |
| PUT | `/users/me` | Update user profile | Yes |
| DELETE | `/users/me` | Delete user account | Yes |

### Usage Examples

**Sign Up:**
```bash
curl -X POST "http://localhost:8000/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123",
    "name": "John Doe"
  }'
```

**Login:**
```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

**Get Profile (Authenticated):**
```bash
curl -X GET "http://localhost:8000/users/me" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Update Profile (Authenticated):**
```bash
curl -X PUT "http://localhost:8000/users/me" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane Doe"}'
```

---

## Adding New Modules

To add a new module (e.g., `citations`):

1. Create folder: `app/citations/`
2. Add `__init__.py` and `router.py`
3. Register router in `app/main.py`:
   ```python
   from app.citations.router import router as citations_router
   app.include_router(citations_router)
   ```

---

## Frontend Integration

Include the access token in authenticated requests:

```javascript
const response = await fetch('http://localhost:8000/users/me', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Invalid JWT" error | Check `SUPABASE_JWT_SECRET` is correct |
| "Email not confirmed" | Disable email confirmation in Supabase for testing |
| Profile not found | Ensure database trigger is set up (see `supabase_setup.md`) |
