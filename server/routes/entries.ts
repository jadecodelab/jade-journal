import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
export const entriesRouter = Router()

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

entriesRouter.get('/', async (_req, res) => {
  try {
    const entries = await prisma.entry.findMany({
      orderBy: { entryDate: 'desc' },
      include: { tags: { include: { tag: true } } },
    })
    res.json(entries.map(normalizeEntry))
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch entries' })
  }
})

entriesRouter.post('/', async (req, res) => {
  try {
    const { title, entryDate, rawContent, mood, confidence, tags } = req.body as {
      title?: string
      entryDate?: string
      rawContent?: string
      mood?: string
      confidence?: string
      tags?: string[]
    }

    const entry = await prisma.entry.create({
      data: {
        title: title ?? '',
        entryDate: entryDate ? new Date(entryDate) : new Date(),
        rawContent: rawContent ?? '',
        mood: mood ?? null,
        confidence: confidence ?? null,
        wordCount: countWords(rawContent ?? ''),
      },
    })

    if (tags?.length) {
      for (const name of tags) {
        const tag = await prisma.tag.upsert({
          where: { name },
          create: { name },
          update: {},
        })
        await prisma.entryTag.upsert({
          where: { entryId_tagId: { entryId: entry.id, tagId: tag.id } },
          create: { entryId: entry.id, tagId: tag.id },
          update: {},
        })
      }
    }

    const full = await prisma.entry.findUnique({
      where: { id: entry.id },
      include: { tags: { include: { tag: true } } },
    })
    res.status(201).json(normalizeEntry(full!))
  } catch (e) {
    res.status(500).json({ error: 'Failed to create entry' })
  }
})

entriesRouter.get('/:id', async (req, res) => {
  try {
    const entry = await prisma.entry.findUnique({
      where: { id: req.params.id },
      include: { tags: { include: { tag: true } }, insights: true },
    })
    if (!entry) { res.status(404).json({ error: 'Not found' }); return }
    res.json(normalizeEntry(entry))
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch entry' })
  }
})

entriesRouter.patch('/:id', async (req, res) => {
  try {
    const { title, rawContent, mood, confidence, tags } = req.body as {
      title?: string
      rawContent?: string
      mood?: string
      confidence?: string
      tags?: string[]
    }

    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title
    if (rawContent !== undefined) {
      updateData.rawContent = rawContent
      updateData.wordCount = countWords(rawContent)
    }
    if (mood !== undefined) updateData.mood = mood
    if (confidence !== undefined) updateData.confidence = confidence

    await prisma.entry.update({ where: { id: req.params.id }, data: updateData })

    if (tags !== undefined) {
      await prisma.entryTag.deleteMany({ where: { entryId: req.params.id } })
      for (const name of tags) {
        const tag = await prisma.tag.upsert({
          where: { name },
          create: { name },
          update: {},
        })
        await prisma.entryTag.create({ data: { entryId: req.params.id, tagId: tag.id } })
      }
    }

    const full = await prisma.entry.findUnique({
      where: { id: req.params.id },
      include: { tags: { include: { tag: true } }, insights: true },
    })
    res.json(normalizeEntry(full!))
  } catch (e) {
    res.status(500).json({ error: 'Failed to update entry' })
  }
})

entriesRouter.delete('/:id', async (req, res) => {
  try {
    await prisma.entry.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete entry' })
  }
})

function normalizeEntry(entry: Record<string, unknown> & { tags?: { tag: { name: string } }[], insights?: unknown }) {
  const { tags, ...rest } = entry
  return {
    ...rest,
    tags: tags?.map((et) => et.tag.name) ?? [],
  }
}
