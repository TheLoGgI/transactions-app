import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface MergeBody {
  keepId: string
  mergeIds: string[]
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

  // Reassign all transactions from the merchants being merged to the kept merchant
  const { count } = await prisma.transaction.updateMany({
    where: { merchantId: { in: mergeIds } },
    data: { merchantId: keepId },
  })

  // Delete the now-empty merchants
  await prisma.merchant.deleteMany({
    where: { id: { in: mergeIds } },
  })

  return new Response(
    JSON.stringify({ movedTransactions: count, deletedMerchants: mergeIds.length }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    },
  )
}
