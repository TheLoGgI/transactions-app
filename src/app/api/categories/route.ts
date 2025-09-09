import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function GET() {
  // For example, fetch data from your DB here
    const categories = await prisma.categories.findMany({
      select: {
        id: true,
        name: true,
        color: true,
      }
    })

  return new Response(JSON.stringify(categories), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}


// export async function PUT(request: Request) {
//   // Parse the request body
//   const body = await request.json() as  { id: number; name: string; color: string };
//   const { id, name, color } = body;

//   // e.g. Update category in your DB
//   const updatedCategory = await prisma.categories.update({
//     where: { id },
//     data: { name, color }
//   });

//   return new Response(JSON.stringify(updatedCategory), {
//     status: 200,
//     headers: { 'Content-Type': 'application/json' }
//   });
// }

export async function POST(request: Request) {
  // Parse the request body
  const body = await request.json() as  { categoryName: string; categoryColor: string, categoryId?: string };
  const { categoryName, categoryColor, categoryId } = body;


  if (categoryId) {
    const checkId = await prisma.categories.findFirstOrThrow({
      where: {
        id: Number(categoryId)
      }
    })

    await prisma.categories.update({
      where: {
        id: Number(categoryId)
      },
      data: {
        color: categoryColor,
        name: categoryName,
      }
    })

  return new Response(JSON.stringify(checkId), {
    status: 201,
    headers: { 'Content-Type': 'application/json' }
  });

  }


  // e.g. Insert new category into your DB
  const newCategory = await prisma.categories.upsert({
    where: { name: categoryName },
    update: { color: categoryColor },
    create: {
      color: categoryColor,
      name: categoryName
    }
  });

  return new Response(JSON.stringify(newCategory), {
    status: 201,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function DELETE(request: Request) {
  try {
    // Parse the request body
    const body = await request.json() as { categoryName: string };

    // Delete the category
    const deletedCategory = await prisma.categories.delete({
      where: { name: body.categoryName },
    });

    console.log('deletedCategory: ', deletedCategory);

    return new Response(JSON.stringify(deletedCategory), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    
    // Handle case where category doesn't exist
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return new Response(JSON.stringify({ error: 'Category not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ error: 'Failed to delete category' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
