import { PrismaClient } from '@prisma/client'
import { writeFileSync } from 'fs'

const prisma = new PrismaClient()

async function main() {
  const [entries, tags, reflections] = await Promise.all([
    prisma.entry.findMany({ include: { tags: { include: { tag: true } }, insights: true } }),
    prisma.tag.findMany(),
    prisma.reflection.findMany(),
  ])

  const outFile = process.argv[2]
  if (!outFile) {
    throw new Error('Usage: tsx scripts/backup.ts <output-file.json>')
  }

  writeFileSync(outFile, JSON.stringify({ entries, tags, reflections }, null, 2))
  console.log(`Wrote ${outFile}`)
  console.log(`entries: ${entries.length}`)
  console.log(`tags: ${tags.length}`)
  console.log(`reflections: ${reflections.length}`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
