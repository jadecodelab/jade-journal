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

app.listen(PORT, () => {
  console.log(`Jade Journal API running on http://localhost:${PORT}`)
})
