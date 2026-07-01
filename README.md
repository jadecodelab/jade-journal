# Jade Journal

A local-first, privacy-focused personal journal with AI reflection. Everything stays on your machine. AI is only called when you explicitly press a button.

## Features

- **Journal Editor** — distraction-free writing with autosave, word count, mood picker, and confidence level
- **AI Assistant** — Improve Writing, Organize, and Extract Insights (requires OpenAI API key)
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
| Database | SQLite via Prisma ORM |
| AI | OpenAI API (gpt-4o, configurable) |
| Package manager | pnpm |
| Container | Docker |

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm (`npm install -g pnpm`)

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
APP_PASSWORD=your-password-here       # Password to open the journal
OPENAI_API_KEY=sk-...                 # Optional — leave blank for fallback AI
OPENAI_MODEL=gpt-4o                   # Optional — change to any OpenAI model
PORT=3001
DATABASE_URL="file:./dev.db"
```

### 3. Initialize the database

```bash
pnpm prisma:migrate
pnpm prisma:seed          # Optional: add sample entries
```

### 4. Run

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Running with Docker

```bash
cp .env.example .env
# Fill in .env, then:
docker compose up --build
```

The journal will be available at [http://localhost:3001](http://localhost:3001). Your database is stored in a named Docker volume (`jade-data`) so it persists across restarts.

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
│   └── services/           # ai.ts (OpenAI + fallback logic)
├── prisma/
│   ├── schema.prisma       # SQLite data model
│   └── seed.ts             # Sample data
├── .env.example
├── docker-compose.yml
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

- All data is stored locally in SQLite (`prisma/dev.db`)
- No analytics, no telemetry, no tracking
- OpenAI is only called when you press an AI button
- The app works fully offline with fallback AI responses when no API key is set

## AI Fallback

If `OPENAI_API_KEY` is not set, all AI features return deterministic fallback responses clearly marked in the UI. The app is fully usable without an API key.
