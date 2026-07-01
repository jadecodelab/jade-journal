import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { entriesRouter } from './routes/entries.js'
import { searchRouter } from './routes/search.js'
import { timelineRouter } from './routes/timeline.js'
import { dashboardRouter } from './routes/dashboard.js'
import { reflectionsRouter } from './routes/reflections.js'
import { aiRouter } from './routes/ai.js'
import { authRouter } from './routes/auth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isProd = process.env.NODE_ENV === 'production'

const app = express()
const PORT = process.env.PORT ?? 3001

if (!isProd) {
  app.use(cors({ origin: 'http://localhost:5173' }))
}
app.use(express.json())

app.use('/api/auth', authRouter)
app.use('/api/entries', entriesRouter)
app.use('/api/search', searchRouter)
app.use('/api/timeline', timelineRouter)
app.use('/api/dashboard', dashboardRouter)
app.use('/api/reflections', reflectionsRouter)
app.use('/api/entries', aiRouter)

app.get('/api/settings/ai', (_req, res) => {
  const provider = process.env.AI_PROVIDER ?? 'openai'
  res.json({
    provider,
    model: provider === 'ollama'
      ? (process.env.OLLAMA_MODEL ?? 'llama3.2')
      : (process.env.OPENAI_MODEL ?? 'gpt-4o'),
    keySet: provider === 'ollama' ? true : !!process.env.OPENAI_API_KEY,
  })
})

// Serve built frontend in production
if (isProd) {
  const distPath = path.join(__dirname, '../dist')
  app.use(express.static(distPath))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Jade Journal running on http://localhost:${PORT} [${isProd ? 'production' : 'development'}]`)
})
