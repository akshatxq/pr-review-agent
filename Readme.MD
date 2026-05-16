# PR Review Agent

**Live Demo:** [pr-review-agent-delta.vercel.app](https://pr-review-agent-delta.vercel.app)

An autonomous multi-agent system that reviews GitHub Pull Requests automatically. When a PR is opened, three specialized AI agents analyze the code diff in parallel — code quality, security, and dependencies — then post a structured review comment directly on the PR within seconds.

## Screenshots

![Dashboard](assets/dashboard.png)

![Detail View](assets/detail.png)

## How It Works

```
GitHub PR opened or updated
          │
          ▼
 Webhook received by Express server
 (HMAC-SHA256 signature verified)
          │
          ▼
 Fetch PR diff via GitHub API (Octokit)
          │
    ┌─────┴──────┬──────────────┐
    ▼            ▼              ▼
Code Quality  Security     Dependency
   Agent       Agent         Agent
  (parallel)  (parallel)   (parallel)
    │            │              │
    └─────┬──────┴──────────────┘
          ▼
    Summarizer Agent
    (fan-in node — waits for all 3)
          │
          ▼
 Post structured comment on GitHub PR
          │
          ▼
 Save full run to Supabase (PostgreSQL)
          │
          ▼
 React dashboard updated
```

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Agent Orchestration | LangGraph.js | Explicit state graph with fan-in parallel execution |
| LLM Framework | LangChain.js | Agent abstractions and Groq integration |
| AI Model | Llama 3.3 70B (Groq) | Free tier, fast inference, strong code understanding |
| Backend | Node.js + Express.js | Lightweight, non-blocking, webhook-friendly |
| Webhook Integration | GitHub Webhooks + Octokit | Official GitHub SDK for PR events and comments |
| Database | Supabase (PostgreSQL) | Managed PostgreSQL with JS client, free tier |
| Frontend | React.js + Vite | Fast dev setup, component-based dashboard |
| Backend Deployment | Render | Free tier web service, easy GitHub integration |
| Frontend Deployment | Vercel | Optimized for React/Vite, free tier |

## Agent Architecture

| Agent | Focus | Temperature |
|-------|-------|-------------|
| `code_quality_agent` | Naming, function length, complexity, dead code, error handling | 0.2 |
| `security_agent` | Hardcoded secrets, SQL injection, unvalidated inputs, unsafe eval | 0.1 |
| `dependency_agent` | New packages, version bumps, risky ranges, dev/prod misplacement | 0.2 |
| `summarizer_agent` | Collects all 3 outputs, formats markdown comment, posts to GitHub | 0.3 |

All three analysis agents run **in parallel** using LangGraph's fan-in pattern. Execution time is bounded by the slowest agent — not the sum of all three.

## Database Schema

```
repos
├── id (uuid PK)
├── github_repo_id (bigint, unique)
├── repo_full_name (text)
├── owner (text)
└── created_at (timestamptz)

pr_reviews
├── id (uuid PK)
├── repo_id (uuid FK → repos.id)
├── pr_number (integer)
├── pr_title (text)
├── pr_author (text)
├── pr_url (text)
├── status (text: pending/completed/failed)
├── comment_posted (boolean)
├── github_comment_id (bigint)
├── created_at (timestamptz)
└── completed_at (timestamptz)

agent_runs
├── id (uuid PK)
├── review_id (uuid FK → pr_reviews.id)
├── agent_name (text)
├── input_tokens (integer)
├── output_tokens (integer)
├── execution_time_ms (integer)
├── output (text)
├── status (text: success/failed)
├── error_message (text)
└── created_at (timestamptz)
```

## Project Structure

```
pr-review-agent/
├── backend/
│   ├── src/
│   │   ├── agents/
│   │   │   ├── codeQualityAgent.js     # Code quality analysis agent
│   │   │   ├── securityAgent.js        # Security vulnerability agent
│   │   │   ├── dependencyAgent.js      # Dependency scan agent
│   │   │   └── summarizerAgent.js      # Fan-in summarizer agent
│   │   ├── graph/
│   │   │   └── reviewGraph.js          # LangGraph state graph definition
│   │   ├── middleware/
│   │   │   ├── validateWebhook.js      # HMAC-SHA256 signature verification
│   │   │   └── errorHandler.js         # Global error handler
│   │   ├── routes/
│   │   │   ├── webhook.js              # POST /webhook/github
│   │   │   └── reviews.js              # GET /reviews, /reviews/:id
│   │   ├── services/
│   │   │   ├── githubService.js        # Octokit: fetch diff, post comment
│   │   │   ├── supabaseService.js      # All DB queries
│   │   │   └── groqService.js          # Groq LLM client factory
│   │   ├── utils/
│   │   │   ├── formatComment.js        # PR comment markdown formatter
│   │   │   └── logger.js               # Timestamped console logger
│   │   ├── app.js                      # Express app setup
│   │   └── server.js                   # Entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ReviewCard.jsx          # Clickable PR review card
│   │   │   ├── AgentLogPanel.jsx       # Expandable agent output panel
│   │   │   └── StatusBadge.jsx         # Color-coded status pill
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx           # Main page with stats + review list
│   │   │   └── ReviewDetail.jsx        # Single review + all agent logs
│   │   ├── services/
│   │   │   └── api.js                  # Axios instance + API calls
│   │   ├── App.jsx                     # Router setup
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
├── assets/
│   ├── dashboard.png
│   └── detail.png
└── README.md
```

## NPM Packages

### Backend

| Package | Version | Purpose |
|---------|---------|---------|
| `express` | latest | HTTP server and routing |
| `@langchain/langgraph` | latest | Agent graph orchestration |
| `langchain` | latest | LLM abstractions and agent tools |
| `@langchain/groq` | latest | Groq LLM provider for LangChain |
| `@octokit/rest` | latest | GitHub REST API client |
| `@supabase/supabase-js` | latest | Supabase database client |
| `cors` | latest | Cross-origin request handling |

### Frontend

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | latest | UI library |
| `react-dom` | latest | React DOM renderer |
| `react-router-dom` | latest | Client-side routing |
| `axios` | latest | HTTP client for API calls |
| `vite` | latest | Build tool and dev server |

## Local Setup

### Prerequisites

- Node.js v20+
- GitHub account
- Supabase account — [supabase.com](https://supabase.com) (free)
- Groq API key — [console.groq.com](https://console.groq.com) (free, no card)
- GitHub Personal Access Token — classic, `repo` scope only

### 1. Clone the repo

```bash
git clone https://github.com/akshatxq/pr-review-agent.git
cd pr-review-agent
```

### 2. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3. Set up Supabase tables

Run in your Supabase SQL Editor:

```sql
create table repos (
  id uuid primary key default gen_random_uuid(),
  github_repo_id bigint unique not null,
  repo_full_name text not null,
  owner text not null,
  created_at timestamptz default now()
);

create table pr_reviews (
  id uuid primary key default gen_random_uuid(),
  repo_id uuid references repos(id),
  pr_number integer not null,
  pr_title text,
  pr_author text,
  pr_url text,
  status text default 'pending',
  comment_posted boolean default false,
  github_comment_id bigint,
  created_at timestamptz default now(),
  completed_at timestamptz
);

create table agent_runs (
  id uuid primary key default gen_random_uuid(),
  review_id uuid references pr_reviews(id),
  agent_name text,
  input_tokens integer,
  output_tokens integer,
  execution_time_ms integer,
  output text,
  status text,
  error_message text,
  created_at timestamptz default now()
);
```

### 4. Configure environment variables

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

`backend/.env`:
```
GROQ_API_KEY=your_groq_api_key
GITHUB_WEBHOOK_SECRET=your_webhook_secret
GITHUB_TOKEN=your_github_pat
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

`frontend/.env`:
```
VITE_API_BASE_URL=http://localhost:3000
```

### 5. Set up local webhook tunnel

```bash
npm install -g smee-client
smee --url https://smee.io/your-channel --target http://localhost:3000/webhook/github
```

Register the smee URL as a webhook on your GitHub repo:
- Settings → Webhooks → Add webhook
- Payload URL: your smee URL
- Content type: `application/json`
- Secret: same as `GITHUB_WEBHOOK_SECRET`
- Events: Pull requests only

### 6. Run locally

```bash
# Terminal 1 — backend
cd backend && npm run dev

# Terminal 2 — smee tunnel
smee --url https://smee.io/your-channel --target http://localhost:3000/webhook/github

# Terminal 3 — frontend
cd frontend && npm run dev
```

Dashboard: [http://localhost:5173](http://localhost:5173)

Open a PR on your connected repo — the agent pipeline fires automatically.

## Deployed URLs

| Service | URL |
|---------|-----|
| Frontend | [pr-review-agent-delta.vercel.app](https://pr-review-agent-delta.vercel.app) |
| Backend | [pr-review-agent-b27q.onrender.com](https://pr-review-agent-b27q.onrender.com) |
| Health check | [pr-review-agent-b27q.onrender.com/health](https://pr-review-agent-b27q.onrender.com/health) |

## Deployment

### Backend — Render

1. New Web Service → connect `pr-review-agent` repo
2. Root Directory: `backend`
3. Build Command: `npm install`
4. Start Command: `node src/server.js`
5. Add all env vars in the Environment tab
6. Free tier — note: server sleeps after 15min inactivity, first request takes ~30s to wake

### Frontend — Vercel

1. New Project → connect `pr-review-agent` repo
2. Root Directory: `frontend`
3. Add `VITE_API_BASE_URL` pointing to your Render URL
4. Auto-deploys on every push to main

## Key Design Decisions

**Why LangGraph over plain Promise.all?**
`Promise.all` runs things in parallel but has no state management. LangGraph gives you an explicit state graph where each node reads from and writes to a shared state object via reducers. This makes the pipeline observable, debuggable, and easy to extend — adding a new agent is one new node, not a refactor of the orchestration logic.

**Why respond to GitHub before running agents?**
GitHub webhooks expect a 200 response within 10 seconds or they mark the delivery as failed and retry. LLM agents take 5-15 seconds combined. The correct pattern is: respond immediately, then process async. This is a real production concern most tutorials skip.

**Why HMAC-SHA256 with timingSafeEqual?**
Regular string comparison (`===`) short-circuits the moment it finds a mismatch. An attacker can time thousands of requests and figure out the secret byte by byte. `crypto.timingSafeEqual` always takes constant time regardless of where the mismatch is — making timing attacks impossible.

**Why Supabase over raw PostgreSQL?**
Supabase is PostgreSQL under the hood — all standard SQL, foreign keys, joins, and aggregations work as expected. It adds a managed connection pool, JS client, and dashboard that reduce boilerplate. The choice lets focus stay on the agent logic which is the core of the project.

**Why 3 separate agents instead of one big prompt?**
One monolithic prompt trying to check code quality + security + dependencies loses focus and produces generic output. Separate agents have focused system prompts, run in parallel cutting latency by ~60%, and are independently debuggable. When security agent fails you know exactly where to look.

**Why Llama 3.3 70B on Groq?**
Groq's free tier is extremely generous (no credit card, high rate limits) and their LPU hardware makes inference significantly faster than standard GPU inference. Llama 3.3 70B has strong code understanding. For a webhook-triggered pipeline, latency matters — a slow model means delayed PR comments.

## License

MIT