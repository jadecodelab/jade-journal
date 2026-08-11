# Jade Journal

A privacy-focused personal journal with AI reflection, deployable to the cloud or run locally.

**Live app:** [https://jade-journal.onrender.com](https://jade-journal.onrender.com)

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

| Layer           | Technology                                          |
| --------------- | --------------------------------------------------- |
| Frontend        | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend         | Node.js, Express                                    |
| Database        | PostgreSQL via Prisma ORM (Neon)                    |
| AI              | Ollama (local, free) or OpenAI API (cloud)          |
| Package manager | pnpm                                                |
| Container       | Docker                                              |
| Hosting         | Render                                              |

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

| Method | Route                          | Description                                  |
| ------ | ------------------------------ | -------------------------------------------- |
| POST   | `/api/auth/verify`             | Verify session password                      |
| GET    | `/api/entries`                 | List all entries                             |
| POST   | `/api/entries`                 | Create entry                                 |
| GET    | `/api/entries/:id`             | Get single entry                             |
| PATCH  | `/api/entries/:id`             | Update entry                                 |
| DELETE | `/api/entries/:id`             | Delete entry                                 |
| GET    | `/api/search`                  | Search with filters                          |
| GET    | `/api/timeline`                | Entries for a month                          |
| GET    | `/api/timeline/on-this-day`    | Entries on this calendar day from past years |
| GET    | `/api/dashboard`               | Stats and charts data                        |
| POST   | `/api/entries/:id/ai/improve`  | AI writing improvement                       |
| POST   | `/api/entries/:id/ai/organize` | AI organization                              |
| POST   | `/api/entries/:id/ai/insights` | AI insight extraction                        |
| POST   | `/api/reflections/monthly`     | Generate monthly reflection                  |
| POST   | `/api/reflections/yearly`      | Generate yearly reflection                   |

## Privacy

- No analytics, no telemetry, no tracking
- AI is only called when you explicitly press an AI button
- The app works fully without AI (fallback responses clearly marked in the UI)
