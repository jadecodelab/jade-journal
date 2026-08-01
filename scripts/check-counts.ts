import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function count(name: string, fn: () => Promise<number>) {
  try {
    const n = await fn()
    console.log(`${name}: ${n}`)
  } catch (e: any) {
    if (e.code === 'P2021' || /does not exist/i.test(e.message)) {
      console.log(`${name}: <table does not exist yet>`)
    } else {
      throw e
    }
  }
}

async function main() {
  await count('entries', () => prisma.entry.count())
  await count('tags', () => prisma.tag.count())
  await count('entryTags', () => prisma.entryTag.count())
  await count('insights', () => prisma.insight.count())
  await count('reflections', () => prisma.reflection.count())
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
