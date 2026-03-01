# CiteKit - Citation Management Tool

## Quick Start

### Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate  # Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Environment Variables** (Create `backend/.env`)
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   SUPABASE_JWT_SECRET=your_supabase_jwt_secret
   GROQ_API_KEY=your_groq_api_key
   APP_URL=http://localhost:8000
   FRONTEND_URL=http://localhost:5173
   ```

3. **Run Server**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   API Docs: http://localhost:8000/docs

---

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Variables** (Create `frontend/.env.local`)
   ```env
   VITE_API_URL=http://localhost:8000
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```
   Access: http://localhost:5173

---

## Environment Variables Reference

| Variable | Backend | Frontend | Description |
|----------|---------|----------|-------------|
| `SUPABASE_URL` | ✅ | - | Supabase project URL |
| `SUPABASE_KEY` | ✅ | - | Supabase anon key |
| `SUPABASE_JWT_SECRET` | ✅ | - | Supabase JWT secret |
| `GROQ_API_KEY` | ✅ | - | Groq API key for LLM |
| `VITE_API_URL` | - | ✅ | Backend API endpoint |

**Find credentials**: Supabase Dashboard → Settings → API
