import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface MergeBody {
  keepId: number
  mergeIds: number[]
}

export async function POST(request: Request) {
  const body = await request.json() as MergeBody
  const { keepId, mergeIds } = body

  if (!keepId || !Array.isArray(mergeIds) || mergeIds.length === 0) {
    return new Response('Invalid body: keepId and mergeIds are required', {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (mergeIds.includes(keepId)) {
    return new Response('keepId must not appear in mergeIds', {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { count } = await prisma.transaction.updateMany({
    where: { subcategoryId: { in: mergeIds } },
    data: { subcategoryId: keepId },
  })

  await prisma.subCategories.deleteMany({
    where: { id: { in: mergeIds } },
  })

  return new Response(
    JSON.stringify({ movedTransactions: count, deletedSubcategories: mergeIds.length }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    },
  )
}
