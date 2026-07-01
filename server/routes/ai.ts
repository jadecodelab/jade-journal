import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { improveWriting, organizeEntry, extractInsights } from '../services/ai.js'

const prisma = new PrismaClient()
export const aiRouter = Router()

aiRouter.post('/:id/ai/improve', async (req, res) => {
  try {
    const entry = await prisma.entry.findUnique({ where: { id: req.params.id } })
    if (!entry) { res.status(404).json({ error: 'Not found' }); return }
    const result = await improveWriting(entry.rawContent)
    res.json(result)
  } catch {
    res.status(500).json({ error: 'AI request failed' })
  }
})

aiRouter.post('/:id/ai/organize', async (req, res) => {
  try {
    const entry = await prisma.entry.findUnique({ where: { id: req.params.id } })
    if (!entry) { res.status(404).json({ error: 'Not found' }); return }
    const result = await organizeEntry(entry.rawContent)
    res.json(result)
  } catch {
    res.status(500).json({ error: 'AI request failed' })
  }
})

aiRouter.post('/:id/ai/insights', async (req, res) => {
  try {
    const entry = await prisma.entry.findUnique({ where: { id: req.params.id } })
    if (!entry) { res.status(404).json({ error: 'Not found' }); return }

    const result = await extractInsights(entry.rawContent)

    await prisma.insight.upsert({
      where: { entryId: entry.id },
      create: {
        entryId: entry.id,
        wins: JSON.stringify(result.wins),
        challenges: JSON.stringify(result.challenges),
        lessons: JSON.stringify(result.lessons),
        goals: JSON.stringify(result.goals),
        suggestedTags: JSON.stringify(result.suggestedTags),
        model: result.model,
        isFallback: result.isFallback,
      },
      update: {
        wins: JSON.stringify(result.wins),
        challenges: JSON.stringify(result.challenges),
        lessons: JSON.stringify(result.lessons),
        goals: JSON.stringify(result.goals),
        suggestedTags: JSON.stringify(result.suggestedTags),
        model: result.model,
        isFallback: result.isFallback,
      },
    })

    res.json(result)
  } catch {
    res.status(500).json({ error: 'AI request failed' })
  }
})
