import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function GET(request: Request) {
  const uncategorized = await prisma.transaction.findMany({
    where: {
      // NOT: {
      amount: {
        lt: 0,
      },
      AND: [
        {
          subcategory: {
            category: null
          },
        },
        {
          category: null,
        },
      ],
      // }
      // OR: [
      //   {
      //     subcategory: {
      //       category: null,
      //     },
      //   },
      //   {
      //     category: null,
      //   },
      // ],
    },
    include: {
      merchant: true,
      subcategory: true,
      Sender: true,
    },
    take: 20,
  })

  // Map the results to alias Sender to sender
  const mappedResults = uncategorized.map((transaction) => ({
    ...transaction,
    sender: transaction.Sender,
    Sender: undefined, // Remove the original Sender field
  }))

  return new Response(JSON.stringify(mappedResults), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
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

  console.log('updateSubcategory: ', updateSubcategory)
  if (
    uncategorizedSubcategori.subcategoryId !== null &&
    updateSubcategory == true
  ) {
    console.log('Adding subcategory', uncategorizedSubcategori)
    await prisma.subCategories.update({
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
