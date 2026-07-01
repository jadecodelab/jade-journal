import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
export const searchRouter = Router()

const MONTHS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
]
const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

// entryDate is stored at UTC midnight (created from a plain "YYYY-MM-DD" string), so
// read its parts with the UTC getters — local getters could shift the day depending
// on the server's timezone.
function dateSearchText(entryDate: Date): string {
  const y = entryDate.getUTCFullYear()
  const m = entryDate.getUTCMonth()
  const d = entryDate.getUTCDate()
  const monthName = MONTHS[m]
  const weekdayName = WEEKDAYS[entryDate.getUTCDay()]
  const iso = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

  return [iso, `${monthName} ${d}, ${y}`, `${monthName} ${y}`, `${monthName} ${d}`, weekdayName, `${m + 1}/${d}/${y}`]
    .join(' ')
    .toLowerCase()
}

searchRouter.get('/', async (req, res) => {
  try {
    const { q, tag, mood, confidence, from, to } = req.query as Record<string, string>

    const entries = await prisma.entry.findMany({
      where: {
        AND: [
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

    const qLower = q?.trim().toLowerCase()
    const matched = qLower
      ? entries.filter((e) =>
          e.title.toLowerCase().includes(qLower) ||
          e.rawContent.toLowerCase().includes(qLower) ||
          dateSearchText(e.entryDate).includes(qLower)
        )
      : entries

    res.json(matched.map((e) => ({
      ...e,
      tags: e.tags.map((et) => et.tag.name),
    })))
  } catch (e) {
    res.status(500).json({ error: 'Search failed' })
  }
})
