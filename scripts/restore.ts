import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'

const prisma = new PrismaClient()

async function main() {
  const file = process.argv[2]
  if (!file) {
    throw new Error('Usage: tsx scripts/restore.ts <backup.json>')
  }
  const data = JSON.parse(readFileSync(file, 'utf8'))

  const tagResult = await prisma.tag.createMany({
    data: data.tags.map((t: any) => ({ id: t.id, name: t.name })),
    skipDuplicates: true,
  })

  const entryResult = await prisma.entry.createMany({
    data: data.entries.map((e: any) => ({
      id: e.id,
      title: e.title,
      entryDate: e.entryDate,
      rawContent: e.rawContent,
      mood: e.mood,
      confidence: e.confidence,
      wordCount: e.wordCount,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    })),
    skipDuplicates: true,
  })

  const entryTags = data.entries.flatMap((e: any) =>
    e.tags.map((et: any) => ({ entryId: et.entryId, tagId: et.tagId }))
  )
  const entryTagResult = await prisma.entryTag.createMany({
    data: entryTags,
    skipDuplicates: true,
  })

  const insights = data.entries
    .filter((e: any) => e.insights)
    .map((e: any) => ({
      id: e.insights.id,
      entryId: e.insights.entryId,
      wins: e.insights.wins,
      challenges: e.insights.challenges,
      lessons: e.insights.lessons,
      goals: e.insights.goals,
      suggestedTags: e.insights.suggestedTags,
      model: e.insights.model,
      isFallback: e.insights.isFallback,
      createdAt: e.insights.createdAt,
    }))
  const insightResult = await prisma.insight.createMany({
    data: insights,
    skipDuplicates: true,
  })

  const reflectionResult = await prisma.reflection.createMany({
    data: data.reflections.map((r: any) => ({
      id: r.id,
      kind: r.kind,
      periodStart: r.periodStart,
      periodEnd: r.periodEnd,
      content: r.content,
      model: r.model,
      isFallback: r.isFallback,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    })),
    skipDuplicates: true,
  })

  console.log(`tags inserted: ${tagResult.count}`)
  console.log(`entries inserted: ${entryResult.count}`)
  console.log(`entryTags inserted: ${entryTagResult.count}`)
  console.log(`insights inserted: ${insightResult.count}`)
  console.log(`reflections inserted: ${reflectionResult.count}`)
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
