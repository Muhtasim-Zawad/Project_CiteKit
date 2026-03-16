# 🎯 CiteKit - AI-Powered Research Paper Discovery & Citation Management

> An intelligent research assistant that automatically discovers, ranks, and manages scientific papers through advanced AI agents and citation mapping.

---

## 📚 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Agent Pipeline](#agent-pipeline)
- [Citation Mapping](#citation-mapping)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

**CiteKit** is an intelligent research assistant built with AI agents and LangGraph that helps researchers discover relevant scientific papers, manage citations, and maintain research context across multiple queries.

### What Makes CiteKit Different?

- **AI-Powered Query Expansion**: Automatically expands queries to discover more relevant papers
- **Multi-Agent Pipeline**: Coordinated agents (Librarian, Critic, Cross-Referencer) work together for intelligent paper discovery
- **Persistent Memory**: Thread-based conversation management maintains research context
- **Citation Network Mapping**: Automatically maps paper citations and references
- **Metrics Integration**: Includes citation metrics from Dimensions, OpenAlex, and Semantic Scholar
- **Modular Architecture**: Easy to extend with new agents and features

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🤖 **AI Agents** | LLM-powered agents for intelligent paper discovery |
| 🔍 **Smart Search** | Multi-query expansion with context awareness |
| 📊 **Citation Metrics** | Real-time citation data and impact metrics |
| 💾 **Research Memory** | Thread-based conversation history with auto-summaries |
| 🔗 **Citation Mapping** | Graph-based citation network visualization |
| 🔐 **Secure Auth** | JWT-based authentication with Supabase |
| ⚡ **Real-time Updates** | Live paper streaming and instant results |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                  │
│           (Chat Interface, Paper Display, Graph Viz)        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTP/WebSocket
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   Backend (FastAPI)                          │
│                                                               │
│  ┌─────────────┐  ┌────────────┐  ┌──────────────────┐     │
│  │   Auth      │  │   Chat     │  │  Threads         │     │
│  │  Module     │  │  Module    │  │  (Memory)        │     │
│  └─────────────┘  └─────┬──────┘  └──────────────────┘     │
│                         │                                    │
│                    ┌────▼───────────────────────┐            │
│                    │   Agent Pipeline           │            │
│                    │  (LangGraph Orchestration) │            │
│                    └────┬──────────────────────┬┘            │
│                         │                      │             │
│        ┌────────────────┼──────────────────────┼──────┐     │
│        │                │                      │      │     │
│   ┌────▼────┐     ┌─────▼─────┐     ┌─────────▼──┐  │     │
│   │Librarian│     │Query      │     │Critic      │  │     │
│   │Agent    │     │Expansion  │     │Agent       │  │     │
│   └─────────┘     │Agent      │     └────────────┘  │     │
│                   └───────────┘                      │     │
│                                          ┌──────────┴─┐    │
│                                          │Cross-Ref   │    │
│                                          │Agent       │    │
│                                          └────────────┘    │
│                    ┌────────────────────────────────┐      │
│                    │   External APIs                │      │
│                    │ • OpenAlex                     │      │
│                    │ • Semantic Scholar            │      │
│                    │ • CrossRef                     │      │
│                    │ • Dimensions Metrics           │      │
│                    │ • CORE API                     │      │
│                    └────────────────────────────────┘      │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   Database (Supabase)                        │
│                                                               │
│  • Users & Auth      • Threads & Chat History              │
│  • References        • Citation Networks                     │
│  • Metrics           • Research Summaries                    │
└──────────────────────────────────────────────────────────────┘
```

---

## 🤖 Agent Pipeline

The Agent Pipeline is the intelligent core of CiteKit. It orchestrates multiple specialized AI agents working together to discover and rank relevant research papers.

### 1. Query Expansion Agent

**Purpose**: Expand user queries to discover more relevant papers while maintaining research context.

**How It Works**:
- Takes the user's natural language query
- Considers previous research context (thread summary)
- Generates 4-6 semantically related alternative queries
- Each query expands on the original topic with methods, datasets, and domain-specific terms

**Key Features**:
- **Context-Aware**: Uses previous queries to refine search strategy
- **LLM-Powered**: Uses Groq Llama-3.3-70b for intelligent expansion
- **Deduplication**: Removes duplicate queries automatically
- **Graceful Fallback**: Defaults to original query if expansion fails

**Example**:
```
Input Query: "machine learning for drug discovery"
Previous Context: "I've been researching AI applications in healthcare"

Expanded Queries:
1. Machine learning applications in computational drug discovery workflows
2. Deep learning models for molecular property prediction and screening
3. AI-driven approaches to therapeutic target identification
4. Neural networks for ADMET prediction in drug development
5. Ensemble learning methods in virtual drug screening
```

---

### 2. Librarian Agent (Search & Rank)

**Purpose**: Discover and retrieve relevant papers from academic databases, then rank them by quality.

**How It Works**:

**Phase 1: Search** (Per Expanded Query)
- Extracts key academic search terms from each query using LLM
- Searches OpenAlex with extracted terms (~7 papers per query)
- Collects results from all queries

**Phase 2: Deduplicate & Rank**
- Normalizes DOI identifiers across results
- Counts DOI frequency across all queries
  - Papers appearing in multiple queries rank higher (stronger relevance signal)
  - Frequency counter provides evidence of topical relevance
- Selects top 25 candidates for enrichment

**Phase 3: Enrich** (Parallel Processing)
- Fetches full metadata from CrossRef and Semantic Scholar
- Retrieves author metrics (h-index, publication count)
- Gets citation metrics from Dimensions API
- Downloads full text URLs from CORE API
- Uses local cache for previously fetched papers

**Key Features**:
- **Multi-Source Search**: Queries all expanded variations for comprehensive coverage
- **Intelligent Deduplication**: Frequency-based ranking prioritizes multi-query results
- **Parallel Enrichment**: Concurrently fetches metadata from 5+ APIs
- **Smart Caching**: Stores papers in Supabase to avoid redundant API calls

**Output**: 25 ranked and enriched papers ready for critique

---

### 3. Critic Agent (Evaluation & Scoring)

**Purpose**: Evaluate papers for relevance to the original query and assign quality scores.

**How It Works**:
- Receives 25 candidate papers with full metadata
- Evaluates each paper's relevance to the user's original query
- Assigns a relevance score (0-100) with reasoning
- Combines scores with appearance frequency for final ranking

**Scoring Formula**:
```
Final Score = (Critic Score × 0.7) + (Normalized Frequency × 0.3)
```

- **Critic Score** (70%): LLM-based relevance evaluation
- **Frequency Score** (30%): How many expanded queries matched this paper

**Key Features**:
- **LLM Evaluation**: Uses Groq for nuanced relevance assessment
- **Explainability**: Provides reasoning for each score
- **Hybrid Ranking**: Combines relevance with discovery frequency
- **Top-N Filtering**: Returns top 5 papers to frontend

**Output**: 5 highly relevant, scored papers with reasoning

---

### 4. Cross-Reference Agent (Metadata Enrichment)

**Purpose**: Retrieve detailed metadata and full-text URLs for discovered papers.

**How It Works**:

**CORE API** (Full Text & Download URLs)
- Searches CORE's open access repository
- Returns full text and download URLs when available
- Enables direct paper access

**OpenAlex API** (Author Metrics)
- Fetches author information and publication metrics
- Retrieves h-index and i10-index for authors
- Builds author reputation profile

**Dimensions API** (Citation Metrics)
- Total citation count
- Recent citations (last 2 years)
- Relative Citation Ratio (RCR) - field-adjusted impact
- Field Citation Ratio (FCR) - comparison to similar-age papers

**Semantic Scholar** (Paper Details)
- Alternative paper metadata
- Citation network data
- Reference information

**Key Features**:
- **Parallel API Calls**: Concurrent requests to multiple sources
- **Error Resilience**: Continues if one API fails
- **Smart Caching**: Uses Supabase to avoid redundant API calls
- **Comprehensive Metrics**: Collects data from 4+ sources

**Output**: Fully enriched papers with metadata, metrics, and download URLs

---

## 📊 Citation Mapping

CiteKit automatically maps and visualizes paper citation networks to help you understand research relationships.

### How Citation Mapping Works

#### 1. **Citation Discovery**
- When a paper is selected, CiteKit fetches its citation network
- Retrieves **References** (papers cited BY the selected paper)
- Retrieves **Citations** (papers that cite the selected paper)
- Builds a bidirectional citation graph

#### 2. **Data Sources**
| Source | Data Type | Coverage |
|--------|-----------|----------|
| **Semantic Scholar** | Citation relationships, citation count | High coverage of CS papers |
| **CrossRef** | Reference metadata, DOI links | Comprehensive for published papers |
| **Dimensions** | Citation metrics, impact data | Full interdisciplinary coverage |
| **OpenAlex** | Author metrics, institution data | Open access to all research |

#### 3. **Graph Structure**
```
Selected Paper
    │
    ├─ References (Cited BY)
    │   ├─ [Paper A] → cited by selected paper
    │   ├─ [Paper B] → foundational work
    │   └─ [Paper C] → recent related work
    │
    └─ Citations (Cited BY Others)
        ├─ [Paper X] → cites selected paper
        ├─ [Paper Y] → builds on selected paper
        └─ [Paper Z] → refutes/reviews selected paper
```

#### 4. **Metrics Displayed**
| Metric | Meaning | Source |
|--------|---------|--------|
| **Citation Count** | Total times paper cited | Dimensions |
| **Recent Citations** | Citations in last 2 years | Dimensions |
| **RCR** (Relative Citation Ratio) | Field-adjusted impact (1.0 = field average) | Dimensions |
| **FCR** (Field Citation Ratio) | Impact vs. similar-age papers | Dimensions |
| **H-Index** | Author's productivity & impact metric | OpenAlex |

#### 5. **Interactive Visualization**
Frontend graph visualization includes:
- 🔵 **Node Colors**: Paper relevance or impact level
- 🔗 **Edge Thickness**: Citation strength (count)
- 📍 **Node Size**: Citation count
- 🎯 **Zoom/Pan**: Explore large networks
- ⬆️ **Hover Info**: Paper details on mouse-over
- 🔍 **Search**: Find papers in graph

#### 6. **Storage & Caching**
```
Supabase Database:
├── reference
│   └── (DOI, title, authors, abstract)
├── reference_metrics
│   └── (citation counts, RCR, FCR)
└── research_network
    └── (citation edges between papers)
```

---

## 📂 Project Structure

```
project_citekit/
├── backend/
│   ├── app/
│   │   ├── main.py                    # FastAPI entry point
│   │   ├── config.py                  # Environment configuration
│   │   │
│   │   ├── auth/                      # Authentication module
│   │   │   ├── router.py              # Auth endpoints
│   │   │   └── dependencies.py        # JWT verification
│   │   │
│   │   ├── agent/                     # AI Agent Pipeline
│   │   │   ├── Librarian_agent.py     # Search & rank agent
│   │   │   ├── query_expansion_agent.py
│   │   │   ├── critic_agent.py        # Evaluation & scoring
│   │   │   ├── cross__ref_agent.py    # Metadata enrichment
│   │   │   └── secretary_agent.py     # Research summarization
│   │   │
│   │   ├── chat/                      # Chat & research interface
│   │   │   └── router.py              # Chat endpoints
│   │   │
│   │   ├── threads/                   # Memory management
│   │   │   └── router.py              # Thread CRUD operations
│   │   │
│   │   ├── research_network/          # Citation mapping
│   │   │   └── research_network_agent.py
│   │   │
│   │   ├── services/
│   │   │   └── summary.py             # Thread summarization
│   │   │
│   │   ├── schemas/                   # Pydantic models
│   │   │   ├── chat.py
│   │   │   ├── thread.py
│   │   │   └── ...
│   │   │
│   │   └── db/
│   │       └── supabase.py            # Supabase client
│   │
│   ├── requirements.txt
│   ├── .env.example
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ai/
│   │   │   │   ├── prompt-input.jsx   # Chat interface
│   │   │   │   └── research-graph.jsx # Citation visualization
│   │   │   └── workspace/
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Workspace.jsx
│   │   │   └── Auth.jsx
│   │   │
│   │   └── hooks/
│   │       └── useView.js             # State management
│   │
│   ├── package.json
│   ├── .env.local.example
│   └── README.md
│
└── README.md (this file)
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+** (Backend)
- **Node.js 18+** (Frontend)
- **Supabase Account** (Database)
- **API Keys**: Groq, OpenAlex, Semantic Scholar, Dimensions, CORE

### Quick Start (5 minutes)

#### 1. Backend Setup

```bash
# Clone repository
git clone https://github.com/Muhtasim-Zawad/Project_CiteKit.git
cd Project_CiteKit

# Backend setup
cd backend
python -m venv .venv

# Activate virtual environment
source .venv/bin/activate  # Linux/Mac
# or
.venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt
```

#### 2. Configure Backend Environment

Create `backend/.env`:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_JWT_SECRET=your_supabase_jwt_secret

# AI & LLM Configuration
GROQ_API_KEY=your_groq_api_key

# API Keys for Data Sources
CORE_API_KEY=your_core_api_key                    # Optional
OPENALES_API_KEY=your_openales_key               # Optional

# Server Configuration
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
```

#### 3. Start Backend Server

```bash
uvicorn app.main:app --reload --port 8000
```

✅ Backend running: http://localhost:8000
📚 API Docs: http://localhost:8000/docs

#### 4. Frontend Setup

```bash
cd ../frontend
npm install
```

#### 5. Configure Frontend Environment

Create `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:8000
```

#### 6. Start Frontend Server

```bash
npm run dev
```

✅ Frontend running: http://localhost:5173

---

## ⚙️ Configuration

### Environment Variables Reference

#### Backend Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `SUPABASE_URL` | ✅ | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_KEY` | ✅ | Supabase anonymous key | `eyJhbGc...` |
| `SUPABASE_JWT_SECRET` | ✅ | JWT secret for token verification | `super-secret-key` |
| `GROQ_API_KEY` | ✅ | Groq LLM API key | `gsk_...` |
| `CORE_API_KEY` | ❌ | CORE full-text search API | `https://api.core.ac.uk` |
| `APP_URL` | ✅ | Backend base URL | `http://localhost:8000` |
| `FRONTEND_URL` | ✅ | Frontend URL for CORS | `http://localhost:5173` |

#### Frontend Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_URL` | ✅ | Backend API endpoint | `http://localhost:8000` |

### Getting API Keys

**Supabase**:
1. Go to [supabase.com](https://supabase.com)
2. Create/select project
3. Settings → API → Copy credentials

**Groq**:
1. Visit [console.groq.com](https://console.groq.com)
2. Sign up/login
3. Create API key in account settings

**Semantic Scholar**:
1. Visit [semanticscholar.org/api](https://www.semanticscholar.org/api)
2. No key needed (free API)

**Dimensions**:
1. Visit [dimensions.ai/metricssignup](https://www.dimensions.ai/metricssignup/)
2. Register for free non-commercial access
3. No key needed

**CORE** (Optional):
1. Visit [core.ac.uk/discover](https://core.ac.uk/discover)
2. Request API access
3. Get API key from dashboard

---

## 📡 API Documentation

### Chat Endpoints

#### Create Chat (Trigger Agent Pipeline)

```bash
POST /chat/
```

**Request**:
```json
{
  "thread_id": "uuid-string",
  "query": "machine learning for drug discovery"
}
```

**Response**:
```json
{
  "id": 123,
  "thread_id": "uuid-string",
  "query": "machine learning for drug discovery",
  "search_terms": "machine learning | deep learning | drug discovery",
  "created_at": "2026-03-11T12:00:00Z",
  "results": [
    {
      "doi": "10.1234/example",
      "title": "Paper Title",
      "author": "Author Name",
      "abstract": "...",
      "year": 2023,
      "score": 92,
      "critic_reasoning": "Highly relevant to ML applications in drug discovery",
      "dimensions_metrics": {
        "times_cited": 45,
        "recent_citations": 12,
        "relative_citation_ratio": 1.8
      }
    }
  ]
}
```

#### Get Thread Chats

```bash
GET /chat/{thread_id}
```

Returns full chat history with all results for a thread.

### Thread Endpoints

#### Create Thread

```bash
POST /threads/
```

**Request**:
```json
{
  "project_id": "uuid-string",
  "title": "Drug Discovery Research"
}
```

#### List Project Threads

```bash
GET /threads/project/{project_id}?page=1
```

Returns paginated threads (3 per page).

#### Get Thread Details

```bash
GET /threads/{thread_id}
```

---

## 🧪 Testing the System

### 1. Test Chat & Agent Pipeline

```bash
# Terminal 1: Start backend
cd backend
uvicorn app.main:app --reload

# Terminal 2: Start frontend
cd frontend
npm run dev

# Terminal 3: Test via API
curl -X POST http://localhost:8000/chat/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "thread_id": "your-thread-uuid",
    "query": "transformer models in NLP"
  }'
```

### 2. View Real-time Agent Output

Open http://localhost:8000/docs (Swagger UI) to see:
- Agent pipeline execution
- Search term extraction
- Paper ranking scores
- Error handling

### 3. Test Citation Mapping

1. Open frontend at http://localhost:5173
2. Create a project
3. Search for a paper
4. Click on a paper to view citation network
5. Explore references and citations

---

## 🐛 Troubleshooting

### Backend Issues

| Issue | Solution |
|-------|----------|
| "Invalid JWT" error | Verify `SUPABASE_JWT_SECRET` matches Supabase settings |
| "Groq API error" | Check `GROQ_API_KEY` is valid and has quota |
| "Supabase connection failed" | Verify `SUPABASE_URL` and `SUPABASE_KEY` are correct |
| "CORS error from frontend" | Ensure `FRONTEND_URL` matches frontend origin in env |
| Thread not found | Verify `project_id` exists and user owns it |

### Frontend Issues

| Issue | Solution |
|-------|----------|
| "Cannot GET /api" | Check `VITE_API_URL` points to correct backend |
| Blank chat history | Verify thread exists and user has permission |
| Papers not loading | Check network tab for API errors, verify backend health |

### Agent Pipeline Issues

| Issue | Solution |
|-------|----------|
| No results returned | Query may be too specific; try more general terms |
| Same papers repeated | Normal behavior; indicates strong topical relevance |
| Slow response (>30s) | APIs timing out; check internet connection |
| "Agent pipeline failed" | Check backend logs for specific error |

---

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Areas for Contribution

- 🤖 New AI agents (Secretary, Summarizer, etc.)
- 📊 Additional data sources (arXiv, IEEE Xplore)
- 🎨 UI/UX improvements
- 📚 Documentation enhancements
- 🧪 Unit & integration tests

---

## 📋 Roadmap

- [ ] arXiv API integration
- [ ] IEEE Xplore integration
- [ ] Paper full-text search with chunking
- [ ] Collaborative research projects
- [ ] Paper annotation & highlighting
- [ ] Export to BibTeX/Zotero
- [ ] Research paper PDF mining
- [ ] Multi-language support
- [ ] Mobile app (React Native)

---

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 👥 Team & Contributors

| Role | Contributors |
|------|---------------|
| 🎨 Frontend Lead | [Muhtasim-Zawad](https://github.com/Muhtasim-Zawad) |
| 🤖 AI/Agent Lead | [ironicalcrow](https://github.com/ironicalcrow) |
| 💾 Backend Lead | [MahadiAhmed0](https://github.com/MahadiAhmed0) |

---

## 📞 Support & Contact

- 📧 Email: [project-email]
- 💬 Discord: [discord-link]
- 🐛 Issues: [GitHub Issues](https://github.com/Muhtasim-Zawad/Project_CiteKit/issues)
- 📖 Docs: [GitHub Wiki](https://github.com/Muhtasim-Zawad/Project_CiteKit/wiki)

---

## 🎓 Citation

If you use CiteKit in your research, please cite:

```bibtex
@software{citekit2026,
  title={CiteKit: AI-Powered Research Paper Discovery and Citation Management},
  author={Zawad, Muhtasim and Khan, Arham Ibrahim and Ahmed, Mahadi},
  year={2026},
  url={https://github.com/Muhtasim-Zawad/Project_CiteKit}
}
```

---

## ⭐ Acknowledgments

- [LangGraph](https://langchain.com/langgraph) - Agent orchestration
- [FastAPI](https://fastapi.tiangolo.com/) - Backend framework
- [Supabase](https://supabase.com/) - Database & auth
- [Groq](https://groq.com/) - LLM inference
- [OpenAlex](https://openalex.org/) - Academic metadata
- [Semantic Scholar](https://www.semanticscholar.org/) - Paper discovery

---

**Made with ❤️ by CiteKit Team**
