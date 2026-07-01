import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const twoDaysAgo = new Date(today)
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

  const entry1 = await prisma.entry.create({
    data: {
      title: 'A fresh start',
      entryDate: today,
      rawContent:
        "Today I decided to start journaling properly. I've been meaning to do this for a while. I want to track my growth, reflect on challenges, and celebrate small wins. Feeling optimistic about what's ahead.",
      mood: '😊 Happy',
      confidence: 'High',
      wordCount: 40,
    },
  })

  const entry2 = await prisma.entry.create({
    data: {
      title: 'Late night thoughts',
      entryDate: yesterday,
      rawContent:
        "Couldn't sleep tonight. My mind keeps racing about the project deadline. I know I can handle it, but the pressure is real. I need to break it into smaller tasks and stop looking at the whole mountain at once.",
      mood: '😰 Anxious',
      confidence: 'Low',
      wordCount: 42,
    },
  })

  await prisma.entry.create({
    data: {
      title: 'Good progress',
      entryDate: twoDaysAgo,
      rawContent:
        "Had a really productive day. Finished the feature I was stuck on for three days. Took a walk in the evening and felt genuinely calm for the first time this week. Small wins matter.",
      mood: '😌 Calm',
      confidence: 'High',
      wordCount: 36,
    },
  })

  const tagPersonalGrowth = await prisma.tag.create({ data: { name: 'Personal Growth' } })
  const tagHealth = await prisma.tag.create({ data: { name: 'Health' } })
  const tagProgramming = await prisma.tag.create({ data: { name: 'Programming' } })

  await prisma.entryTag.createMany({
    data: [
      { entryId: entry1.id, tagId: tagPersonalGrowth.id },
      { entryId: entry2.id, tagId: tagHealth.id },
      { entryId: entry2.id, tagId: tagProgramming.id },
    ],
  })

  console.log('Seed complete.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
