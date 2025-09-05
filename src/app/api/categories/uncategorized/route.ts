import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function GET() {
  const whereCondition = {
    amount: {
      lt: 0,
    },
    AND: [
      {
        subcategory: {
          category: null,
        },
      },
      {
        category: null,
      },
    ],
  }

  // Get total count and transactions in parallel for better performance
  const [totalCount, uncategorized] = await Promise.all([
    prisma.transaction.count({
      where: whereCondition,
    }),
    prisma.transaction.findMany({
      where: whereCondition,
      include: {
        merchant: true,
        subcategory: true,
        Sender: true,
      },
      take: 20,
    }),
  ])
  console.log('totalCount: ', totalCount)

  // Map the results to alias Sender to sender
  const mappedResults = uncategorized.map((transaction) => ({
    ...transaction,
    sender: transaction.Sender,
    Sender: undefined, // Remove the original Sender field
  }))

  return new Response(
    JSON.stringify({
      transactions: mappedResults,
      totalCount,
      displayedCount: mappedResults.length,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    },
  )
}

interface updateCategoriesBody {
  transactionId: string
  categoryId: number
  updateSubcategory: boolean
}

export async function PUT(request: Request) {
  const { updateSubcategory = true, ...body } =
    (await request.json()) as updateCategoriesBody

  const uncategorizedSubcategori = await prisma.transaction.update({
    where: {
      id: body.transactionId,
    },
    select: {
      subcategoryId: true,
    },
    data: {
      category: {
        connect: {
          id: body.categoryId,
        },
      },
    },
  })

  // Update all transactions with that subcategory, with the categoryId
  await prisma.transaction.updateMany({
    where: {
      subcategoryId: uncategorizedSubcategori.subcategoryId,
    },
    data: {
      categoryId: body.categoryId,
    },
  })

  if (
    uncategorizedSubcategori.subcategoryId !== null &&
    updateSubcategory == true
  ) {
    // console.log('Adding subcategory', uncategorizedSubcategori)
    await prisma.subCategories.updateMany({
      where: {
        id: uncategorizedSubcategori.subcategoryId,
      },
      data: {
        categoryId: body.categoryId,
      },
    })
  }

  return new Response(JSON.stringify('OK'), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
