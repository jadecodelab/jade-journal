import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { entriesRouter } from './routes/entries.js'
import { searchRouter } from './routes/search.js'
import { timelineRouter } from './routes/timeline.js'
import { dashboardRouter } from './routes/dashboard.js'
import { reflectionsRouter } from './routes/reflections.js'
import { aiRouter } from './routes/ai.js'
import { authRouter } from './routes/auth.js'

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(cors({ origin: 'http://localhost:5173' }))
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
    ollamaUrl: process.env.OLLAMA_URL ?? 'http://localhost:11434',
  })
})

app.listen(PORT, () => {
  const keySet = !!process.env.OPENAI_API_KEY
  console.log(`Jade Journal API running on http://localhost:${PORT}`)
  console.log(`OpenAI key loaded: ${keySet}`)
})
