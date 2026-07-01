# Jade Journal

A privacy-focused personal journal with AI reflection, deployable to the cloud or run locally.

**Live app:** [https://jade-journal-production.up.railway.app](https://jade-journal-production.up.railway.app)

## Features

- **Journal Editor** — distraction-free writing with autosave, word count, mood picker, and confidence level
- **AI Assistant** — Improve Writing, Organize, and Extract Insights (Ollama or OpenAI)
- **Search** — filter by keyword, mood, confidence, and tags
- **Timeline** — calendar view with per-day entry access
- **Reflect** — AI-generated monthly and yearly reflections
- **On This Day** — surface memories from prior years
- **Dashboard** — streak, word count, mood trends, and top tags
- **Password gate** — session-level password for privacy
- **Mobile-ready** — responsive design with bottom tab navigation

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend | Node.js, Express |
| Database | PostgreSQL via Prisma ORM |
| AI | Ollama (local, free) or OpenAI API (cloud) |
| Package manager | pnpm |
| Container | Docker |
| Hosting | Railway |

## Getting Started (Local)

### Prerequisites

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- PostgreSQL (local install, Docker, or a free cloud instance e.g. [Neon](https://neon.tech))

### 1. Clone and install

```bash
git clone https://github.com/jadecodelab/jade-journal.git
cd jade-journal
pnpm install --ignore-scripts
pnpm exec prisma generate
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
APP_PASSWORD=your-password-here
DATABASE_URL="postgresql://user:password@localhost:5432/jade_journal"

# AI — choose one:
AI_PROVIDER=ollama          # free, local (https://ollama.com)
OLLAMA_MODEL=llama3.2
OLLAMA_URL=http://localhost:11434

# AI_PROVIDER=openai        # paid, cloud
# OPENAI_API_KEY=sk-...
# OPENAI_MODEL=gpt-4o
```

### 3. Initialize the database

```bash
pnpm exec prisma migrate deploy
```

### 4. Run

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Deploy to Railway

1. Fork this repo and create a [Railway](https://railway.app) project from it
2. Add a **PostgreSQL** database service (Railway → New → Database → PostgreSQL)
3. In your app service **Variables**, add:
   - `DATABASE_URL` = `${{Postgres.DATABASE_URL}}`
   - `APP_PASSWORD` = your journal password
   - `NODE_ENV` = `production`
   - `AI_PROVIDER` = `openai` (and `OPENAI_API_KEY`) or `ollama` (requires a self-hosted Ollama instance)
4. Railway builds via the Dockerfile and runs `prisma migrate deploy` on startup

## Project Structure

```
jade-journal/
├── src/                    # React frontend
│   ├── components/
│   │   ├── ui/             # Base UI components (Button, Card, Badge…)
│   │   └── layout/         # AuthGate, BottomNav, ToastContainer
│   ├── pages/              # Route-level views
│   ├── hooks/              # useToast
│   ├── lib/                # api.ts, utils.ts
│   └── types/              # Shared TypeScript types
├── server/                 # Express API
│   ├── routes/             # entries, search, timeline, dashboard, reflections, ai, auth
│   └── services/           # ai.ts (Ollama + OpenAI + fallback logic)
├── prisma/
│   ├── schema.prisma       # PostgreSQL data model
│   └── seed.ts             # Sample data
├── .env.example
├── railway.toml
└── Dockerfile
```

## API Routes

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/verify` | Verify session password |
| GET | `/api/entries` | List all entries |
| POST | `/api/entries` | Create entry |
| GET | `/api/entries/:id` | Get single entry |
| PATCH | `/api/entries/:id` | Update entry |
| DELETE | `/api/entries/:id` | Delete entry |
| GET | `/api/search` | Search with filters |
| GET | `/api/timeline` | Entries for a month |
| GET | `/api/timeline/on-this-day` | Entries on this calendar day from past years |
| GET | `/api/dashboard` | Stats and charts data |
| POST | `/api/entries/:id/ai/improve` | AI writing improvement |
| POST | `/api/entries/:id/ai/organize` | AI organization |
| POST | `/api/entries/:id/ai/insights` | AI insight extraction |
| POST | `/api/reflections/monthly` | Generate monthly reflection |
| POST | `/api/reflections/yearly` | Generate yearly reflection |

## Privacy

- No analytics, no telemetry, no tracking
- AI is only called when you explicitly press an AI button
- The app works fully without AI (fallback responses clearly marked in the UI)
