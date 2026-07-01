import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
export const searchRouter = Router()

searchRouter.get('/', async (req, res) => {
  try {
    const { q, tag, mood, confidence, from, to } = req.query as Record<string, string>

    const entries = await prisma.entry.findMany({
      where: {
        AND: [
          q ? {
            OR: [
              { title: { contains: q } },
              { rawContent: { contains: q } },
            ],
          } : {},
          tag ? { tags: { some: { tag: { name: { equals: tag } } } } } : {},
          mood ? { mood: { contains: mood } } : {},
          confidence ? { confidence } : {},
          from ? { entryDate: { gte: new Date(from) } } : {},
          to ? { entryDate: { lte: new Date(to) } } : {},
        ],
      },
      orderBy: { entryDate: 'desc' },
      include: { tags: { include: { tag: true } } },
    })

    res.json(entries.map((e) => ({
      ...e,
      tags: e.tags.map((et) => et.tag.name),
    })))
  } catch (e) {
    res.status(500).json({ error: 'Search failed' })
  }
})
