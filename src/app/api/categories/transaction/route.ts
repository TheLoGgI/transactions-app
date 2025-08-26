import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function GET() {
  // For example, fetch data from your DB here
    const categories = await prisma.transaction.findMany({
        where: {
            agent: "RECEIVER",
            
        },
    })

  return new Response(JSON.stringify(categories), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
