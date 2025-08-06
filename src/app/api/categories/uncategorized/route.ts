import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function GET(request: Request) {
    const uncategorized = await prisma.transaction.findMany({
      where: {
        subcategory: {
          category: null
        }
      },
      include: {
        merchant: true,
        subcategory: true
      },
     take: 20
    })

  return new Response(JSON.stringify(uncategorized), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

interface updateCategoriesBody {
  transactionId: string,
  categoryId: number
}

export async function PUT(request: Request) {
  const body = await request.json() as updateCategoriesBody;

  const uncategorizedSubcategori = await prisma.transaction.findFirstOrThrow({
    where: {
      id: body.transactionId
    },
    select: {
      subcategoryId: true
    }
  })

  if (uncategorizedSubcategori.subcategoryId === null) {
    return new Response(JSON.stringify({ error: "SubcategoryId is null" }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const res = await prisma.subCategories.update({
    where: {
      id: uncategorizedSubcategori.subcategoryId,
    },
    data: {
      categoryId: body.categoryId
    }
  })

  return new Response(JSON.stringify("OK"), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}