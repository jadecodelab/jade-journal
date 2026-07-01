Jade Reflection Full V1 Implementation Plan
Summary
Build a greenfield local-first journal app in the current workspace using React, TypeScript, Vite, Tailwind, shadcn-style components, Express, Prisma, SQLite, and the OpenAI Node SDK. The first screen will be the usable journal home, not a marketing page.
Use pnpm.cmd as the package manager. The app will run locally with a Vite frontend and Express API, store all journal data in SQLite, and call OpenAI only when the user explicitly presses an AI action.
Key Changes
Scaffold a single repo with src/ for the React app, server/ for Express services/routes, and prisma/ for SQLite schema and migrations.
Add core UI views: Home, Journal Editor, Search, Timeline calendar, Reflection, Dashboard, and entry reader/detail panels.
Implement local persistence with Prisma models for entries, tags, entry insights, and cached monthly/yearly reflections.
Add privacy-first AI endpoints:POST /api/entries/:id/ai/improve
POST /api/entries/:id/ai/organize
POST /api/entries/:id/ai/insights
POST /api/reflections/monthly
POST /api/reflections/yearly

Use OpenAI Responses API through the Node SDK, with OPENAI_API_KEY and configurable OPENAI_MODEL; default model will be gpt-5.5 based on current official OpenAI docs.
Add deterministic fallback AI responses when no API key is configured or a request fails, clearly marked in the UI.
Add Docker support with a local SQLite volume, plus README setup instructions.
Public Interfaces
Entry fields: id, title, entryDate, rawContent, mood, confidence, wordCount, createdAt, updatedAt.
Tags are normalized and searchable through an entry/tag join table.
Insights store wins, challenges, lessons, goals, and suggested tags as structured JSON.
Reflection records store monthly or yearly kind, period bounds, generated content JSON/text, model, fallback flag, and timestamps.
Main API routes:GET/POST /api/entries
GET/PATCH/DELETE /api/entries/:id
GET /api/search
GET /api/timeline?year=&month=
GET /api/on-this-day?month=&day=
GET /api/dashboard
GET /api/settings/ai

Test Plan
Verify Prisma migration, seed/sample data, and SQLite local persistence.
Backend tests for entry CRUD, autosave update behavior, search filters, tag persistence, dashboard stats, timeline grouping, and AI fallback behavior.
Frontend tests for word count, autosave state, AI button disabled/loading/error states, search filters, and reflection rendering.
Run pnpm.cmd test, pnpm.cmd build, and pnpm.cmd prisma migrate dev --name init.
Start the dev server and visually verify the main flows in browser: create entry, autosave, run AI action, search, timeline click, dashboard, monthly/yearly reflection.

Assumptions
Single-user local app with password for privacy.
No analytics, no tracking, and no automatic OpenAI calls.
AI results are shown in review panels; improved/organized writing can be applied manually rather than silently replacing the journal.
Light mode ships first; dark mode remains future work.
Database encryption, voice, images, export, mobile, habit tracking, and chat-with-past-journals remain future features.
OpenAI integration follows the official Responses API guidance and API reference: text generation guide and Responses create reference.
