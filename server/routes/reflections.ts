import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { generateMonthlyReflection, generateYearlyReflection } from '../services/ai.js'

const prisma = new PrismaClient()
export const reflectionsRouter = Router()

reflectionsRouter.post('/monthly', async (req, res) => {
  try {
    const { year, month } = req.body as { year: number; month: number }
    const start = new Date(year, month - 1, 1)
    const end = new Date(year, month, 0, 23, 59, 59)

    const entries = await prisma.entry.findMany({
      where: { entryDate: { gte: start, lte: end } },
      orderBy: { entryDate: 'asc' },
    })

    if (!entries.length) {
      res.status(400).json({ error: 'No entries found for this month' })
      return
    }

    const period = `${start.toLocaleString('default', { month: 'long' })} ${year}`
    const result = await generateMonthlyReflection(entries, period)

    const reflection = await prisma.reflection.upsert({
      where: {
        id: (await prisma.reflection.findFirst({
          where: { kind: 'monthly', periodStart: start },
          select: { id: true },
        }))?.id ?? 'new',
      },
      create: {
        kind: 'monthly',
        periodStart: start,
        periodEnd: end,
        content: JSON.stringify(result),
        model: result.model,
        isFallback: result.isFallback,
      },
      update: {
        content: JSON.stringify(result),
        model: result.model,
        isFallback: result.isFallback,
      },
    })

    res.json({ ...result, id: reflection.id })
  } catch {
    res.status(500).json({ error: 'Failed to generate monthly reflection' })
  }
})

reflectionsRouter.post('/yearly', async (req, res) => {
  try {
    const { year } = req.body as { year: number }
    const start = new Date(year, 0, 1)
    const end = new Date(year, 11, 31, 23, 59, 59)

    const entries = await prisma.entry.findMany({
      where: { entryDate: { gte: start, lte: end } },
      orderBy: { entryDate: 'asc' },
    })

    if (!entries.length) {
      res.status(400).json({ error: 'No entries found for this year' })
      return
    }

    const result = await generateYearlyReflection(entries, year)

    const reflection = await prisma.reflection.upsert({
      where: {
        id: (await prisma.reflection.findFirst({
          where: { kind: 'yearly', periodStart: start },
          select: { id: true },
        }))?.id ?? 'new',
      },
      create: {
        kind: 'yearly',
        periodStart: start,
        periodEnd: end,
        content: JSON.stringify(result),
        model: result.model,
        isFallback: result.isFallback,
      },
      update: {
        content: JSON.stringify(result),
        model: result.model,
        isFallback: result.isFallback,
      },
    })

    res.json({ ...result, id: reflection.id })
  } catch {
    res.status(500).json({ error: 'Failed to generate yearly reflection' })
  }
})

reflectionsRouter.get('/', async (_req, res) => {
  try {
    const reflections = await prisma.reflection.findMany({
      orderBy: { periodStart: 'desc' },
    })
    res.json(reflections)
  } catch {
    res.status(500).json({ error: 'Failed to fetch reflections' })
  }
})
