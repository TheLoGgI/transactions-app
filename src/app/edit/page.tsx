import { Toaster } from "sonner"
import { CategoryManager } from "./category-manager"
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function Home() {

const categories = await prisma.categories.findMany({
  select: {
        id: true,
        name: true,
        color: true,
      }
    })

  
  return (
    <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4">
            <CategoryManager categoriesData={categories} />
        </div>
      <Toaster />
    </div>
  )
}
