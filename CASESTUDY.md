# Jade Journal

_A private journaling app built for long-term reflection with AI assistance._

---

# Overview

I built Jade Journal because I wanted a journal to document my journey and make it easy to reflect over time. This app is built for my personal use and designed to be something I can keep using for years.

I didn't want AI to write for me or turn journaling into chatting with AI. Instead, I wanted it to stay in the background—helping me organize my thoughts, improve grammar when I ask, notice patterns over time, and make reflection easier without changing what I wrote.

I also wanted the app to be fast, private, and enjoyable enough that opening it every day feels natural. Over time, it grew into a full-stack application with AI-assisted reflection, local and cloud AI support, and an installable app experience through a Progressive Web App.

---

# Features

## Personal Journaling

- Clean distraction-free editor
- Autosave while typing
- Calendar timeline
- Search entries
- Mood and confidence tracking
- Writing streaks and dashboard statistics

## AI Assistant

The AI never writes journal entries for me. Every feature is optional and only runs when I choose to use it.

### Improve Writing

Corrects grammar, punctuation, and clarity while preserving my writing style and voice. The prompt specifically tells the model not to rewrite my personality or make the writing sound like AI.

### Organize

Turns messy thoughts into four simple sections:

- What Happened
- How I Felt
- What I Learned
- Next Steps

without changing the meaning of what I wrote.

### Extract Insights

Finds recurring wins, challenges, lessons, goals, and suggests tags from my journal entry.

### Reflect

Creates monthly and yearly reflections by looking across multiple entries, highlighting recurring themes, mood trends, and personal growth instead of just summarizing individual days.

---

# Privacy

This is a personal journal, so privacy was important from the beginning.

The app includes a session password lock so someone else opening the app can't immediately read my journal. It can also use a local Ollama model instead of sending journal entries to an external API.

---

# Engineering Decisions

## AI designed to assist, not replace

One design decision I cared about was making AI feel like an assistant instead of an author.

Nothing happens automatically.

Every AI feature is triggered by a button press, and the **Improve Writing** feature only fixes grammar and clarity while keeping the original voice. The goal isn't to make entries sound better—it's to make them easier to read while still sounding like me.

---

## One AI layer, multiple providers

I built a single AI abstraction that works with either:

- Ollama (local model)
- OpenAI

Switching providers only requires changing an environment variable.

If AI isn't available or no API key is configured, every feature falls back to deterministic logic so the app continues working instead of showing an error.

---

## Installable like a real app

I wanted this to feel like an actual journal instead of another website.

The app includes:

- Custom app icon
- Web manifest
- Standalone display mode
- Apple and Chrome metadata

It can be installed on desktop or mobile and launches from the home screen like a native application.

---

## Dashboard Analytics

The dashboard summarizes my writing over time using server-side aggregation instead of third-party analytics.

It tracks:

- Writing streaks
- Mood distribution
- Confidence trends
- Word count
- Frequently used tags

---

# Challenges

## Entries saving under the wrong date

I discovered that using `toISOString()` saved dates in UTC, so users in different time zones could see entries appear on the wrong day. I fixed it by using the user's local date when saving and displaying entries, ensuring they always appear on the correct calendar day.

---

## Deleting an entry left users on a dead page

After deleting an entry, users remained on a page that no longer existed because the client didn't properly handle HTTP `204 No Content` responses. I fixed the response handling and redirected users back to the homepage after a successful delete.

---

## Database misconfiguration risked silent data loss

The project had migrated from SQLite to PostgreSQL, but a stale local `.env` file still referenced SQLite. I corrected the database configuration, ran the Prisma migrations, and verified data persisted correctly with Neon PostgreSQL.

---

## Page layout inconsistency

Some pages randomly appeared narrower because the app shell used `mx-auto` without `w-full`, causing it to shrink to the width of its content. I fixed the layout so every page consistently fills the viewport, regardless of its content.

---

# Tech Stack

| Layer               | Technology                                                                              |
| ------------------- | --------------------------------------------------------------------------------------- |
| **Frontend**        | React 18, TypeScript, Vite 6, React Router 7                                            |
| **Styling**         | Tailwind CSS, shadcn/ui (Radix UI primitives), class-variance-authority, tailwind-merge |
| **Icons**           | Lucide React                                                                            |
| **Backend**         | Node.js, Express 4                                                                      |
| **Database**        | PostgreSQL via Prisma ORM 6                                                             |
| **AI**              | OpenAI SDK, OpenAI API, Ollama (via OpenAI-compatible endpoint)                         |
| **Dates**           | date-fns                                                                                |
| **Package Manager** | pnpm                                                                                    |
| **Deployment**      | Docker, Railway, Neon PostgreSQL                                                        |

---

# What I Learned

I learned how to design AI around real user problems. This project also gave me experience building a full-stack application, integrating multiple AI providers behind a single abstraction, debugging time zone issues, deploying with PostgreSQL, and polishing an application through many rounds of testing and iteration.

I also learned how to work effectively with AI throughout the development process. I used ChatGPT to brainstorm ideas, explore different approaches, and think through product decisions. Claude Code helped with planning, architecture, implementation, and debugging. The biggest lesson was learning how to ask better questions, evaluate AI suggestions critically, and make informed engineering and product decisions. Those judgment calls ultimately shaped the final product.
