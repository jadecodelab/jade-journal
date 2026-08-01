import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'

const prisma = new PrismaClient()

async function main() {
  const file = process.argv[2]
  const backup = JSON.parse(readFileSync(file, 'utf8'))
  const sample = [backup.entries[0], backup.entries[Math.floor(backup.entries.length / 2)], backup.entries[backup.entries.length - 1]]

  for (const expected of sample) {
    const actual = await prisma.entry.findUnique({
      where: { id: expected.id },
      include: { tags: { include: { tag: true } } },
    })
    const expectedTagNames = expected.tags.map((t: any) => t.tag.name).sort()
    const actualTagNames = actual?.tags.map((t) => t.tag.name).sort() ?? []
    const tagsMatch = JSON.stringify(expectedTagNames) === JSON.stringify(actualTagNames)
    const contentMatch = actual?.rawContent === expected.rawContent

    console.log(`entry ${expected.id} — "${expected.title}"`)
    console.log(`  content match: ${contentMatch}`)
    console.log(`  expected tags: [${expectedTagNames.join(', ')}]`)
    console.log(`  actual tags:   [${actualTagNames.join(', ')}]`)
    console.log(`  tags match: ${tagsMatch}`)
  }
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
