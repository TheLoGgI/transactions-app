import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function GET(request: Request) {
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

// export async function POST(request: Request) {
//   // Parse the request body
//   const body = await request.json() as  { code: string; name: string; color: string };
//   const { name, color, code } = body;

//   // e.g. Insert new category into your DB
//   const newCategory = await prisma.categories.create({
//     data: { name, color, code }
//   });

//   return new Response(JSON.stringify(newCategory), {
//     status: 201,
//     headers: { 'Content-Type': 'application/json' }
//   });
// }
