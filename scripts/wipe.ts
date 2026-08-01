import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const delEntries = await prisma.entry.deleteMany()
  const delTags = await prisma.tag.deleteMany()
  const delReflections = await prisma.reflection.deleteMany()
  console.log(`deleted entries: ${delEntries.count}`)
  console.log(`deleted tags: ${delTags.count}`)
  console.log(`deleted reflections: ${delReflections.count}`)
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
