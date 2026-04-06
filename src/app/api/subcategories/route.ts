import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  const subcategories = await prisma.subCategories.findMany({
    select: {
      id: true,
      name: true,
      code: true,
      description: true,
      categoryId: true,
      category: {
        select: { id: true, name: true, color: true },
      },
      _count: {
        select: { transactions: true },
      },
    },
    orderBy: { name: 'asc' },
  })

  return new Response(JSON.stringify(subcategories), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
