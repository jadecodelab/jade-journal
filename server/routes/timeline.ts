import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
export const timelineRouter = Router()

timelineRouter.get('/', async (req, res) => {
  try {
    const { year, month } = req.query as { year?: string; month?: string }

    if (!year || !month) {
      res.status(400).json({ error: 'year and month are required' })
      return
    }

    const y = parseInt(year)
    const m = parseInt(month) - 1
    const start = new Date(y, m, 1)
    const end = new Date(y, m + 1, 0, 23, 59, 59)

    const entries = await prisma.entry.findMany({
      where: { entryDate: { gte: start, lte: end } },
      select: { id: true, title: true, entryDate: true, mood: true, wordCount: true },
      orderBy: { entryDate: 'asc' },
    })

    res.json(entries)
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch timeline' })
  }
})

timelineRouter.get('/on-this-day', async (req, res) => {
  try {
    const { month, day } = req.query as { month?: string; day?: string }

    if (!month || !day) {
      res.status(400).json({ error: 'month and day are required' })
      return
    }

    const m = parseInt(month)
    const d = parseInt(day)
    const currentYear = new Date().getFullYear()

    const allEntries = await prisma.entry.findMany({
      where: {
        entryDate: {
          lt: new Date(currentYear, m - 1, d),
        },
      },
      include: { tags: { include: { tag: true } } },
    })

    const onThisDay = allEntries.filter((e) => {
      const date = new Date(e.entryDate)
      return date.getMonth() + 1 === m && date.getDate() === d
    })

    res.json(onThisDay.map((e) => ({
      ...e,
      tags: e.tags.map((et) => et.tag.name),
      yearsAgo: currentYear - new Date(e.entryDate).getFullYear(),
    })))
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch on-this-day entries' })
  }
})
