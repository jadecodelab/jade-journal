import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const entries = await prisma.entry.findMany({ include: { tags: { include: { tag: true } }, insights: true } })
  const tags = await prisma.tag.findMany()
  console.log(JSON.stringify({ entries, tags }, null, 2))
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
