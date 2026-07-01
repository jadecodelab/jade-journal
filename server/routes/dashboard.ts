import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
export const dashboardRouter = Router()

dashboardRouter.get('/', async (_req, res) => {
  try {
    const entries = await prisma.entry.findMany({
      orderBy: { entryDate: 'asc' },
      include: { tags: { include: { tag: true } } },
    })

    const totalEntries = entries.length
    const totalWords = entries.reduce((sum, e) => sum + e.wordCount, 0)

    // Streak calculation
    const { currentStreak, longestStreak } = calculateStreaks(entries.map((e) => e.entryDate))

    // Mood distribution
    const moodCounts: Record<string, number> = {}
    for (const e of entries) {
      if (e.mood) moodCounts[e.mood] = (moodCounts[e.mood] ?? 0) + 1
    }

    // Confidence distribution
    const confidenceCounts: Record<string, number> = {}
    for (const e of entries) {
      if (e.confidence) confidenceCounts[e.confidence] = (confidenceCounts[e.confidence] ?? 0) + 1
    }

    // Tag frequency
    const tagCounts: Record<string, number> = {}
    for (const e of entries) {
      for (const et of e.tags) {
        tagCounts[et.tag.name] = (tagCounts[et.tag.name] ?? 0) + 1
      }
    }
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }))

    // Monthly word counts for chart (last 6 months)
    const monthlyWords = buildMonthlyWords(entries)

    res.json({
      totalEntries,
      totalWords,
      currentStreak,
      longestStreak,
      moodDistribution: moodCounts,
      confidenceDistribution: confidenceCounts,
      topTags,
      monthlyWords,
    })
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch dashboard' })
  }
})

function calculateStreaks(dates: Date[]): { currentStreak: number; longestStreak: number } {
  if (!dates.length) return { currentStreak: 0, longestStreak: 0 }

  const unique = [...new Set(dates.map((d) => toDateString(d)))].sort()
  const today = toDateString(new Date())
  const yesterday = toDateString(new Date(Date.now() - 86400000))

  let longestStreak = 1
  let currentRun = 1

  for (let i = 1; i < unique.length; i++) {
    const prev = new Date(unique[i - 1])
    const curr = new Date(unique[i])
    const diff = (curr.getTime() - prev.getTime()) / 86400000
    if (diff === 1) {
      currentRun++
      if (currentRun > longestStreak) longestStreak = currentRun
    } else {
      currentRun = 1
    }
  }

  const lastEntry = unique[unique.length - 1]
  let currentStreak = 0
  if (lastEntry === today || lastEntry === yesterday) {
    currentStreak = 1
    for (let i = unique.length - 2; i >= 0; i--) {
      const curr = new Date(unique[i + 1])
      const prev = new Date(unique[i])
      if ((curr.getTime() - prev.getTime()) / 86400000 === 1) {
        currentStreak++
      } else {
        break
      }
    }
  }

  return { currentStreak, longestStreak }
}

function toDateString(d: Date) {
  return d.toISOString().slice(0, 10)
}

function buildMonthlyWords(entries: { entryDate: Date; wordCount: number }[]) {
  const now = new Date()
  const result: { month: string; words: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const label = d.toLocaleString('default', { month: 'short', year: '2-digit' })
    const words = entries
      .filter((e) => {
        const ed = new Date(e.entryDate)
        return ed.getFullYear() === d.getFullYear() && ed.getMonth() === d.getMonth()
      })
      .reduce((s, e) => s + e.wordCount, 0)
    result.push({ month: label, words })
  }
  return result
}
