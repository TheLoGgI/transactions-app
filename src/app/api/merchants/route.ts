import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  const merchants = await prisma.merchant.findMany({
    select: {
      id: true,
      name: true,
      merchantId: true,
      city: true,
      country: true,
      categoryCode: true,
      _count: {
        select: { transactions: true },
      },
    },
    orderBy: { name: 'asc' },
  })

  return new Response(JSON.stringify(merchants), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
