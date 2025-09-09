import { PrismaClient } from "@prisma/client";
import { Toaster } from "sonner"
import { Budget, type BudgetCategory } from "./budget";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

const prisma = new PrismaClient();

export default async function Home() {

  const categories = await prisma.categories.findMany({
    select: {
      id: true,
      name: true,
      color: true,
      budget: {
        select: {
          amount: true,
          period: true,
          isActive: true,
        }
      }
    }
  })

  return (
    <SidebarProvider style={{
      // @ts-expect-error - type has to be string
      "--sidebar-width": "25rem",
      "--sidebar-width-mobile": "20rem",
    }}
    defaultOpen={false}
    >
      <SidebarInset>
        <div className="min-h-screen bg-background">
          <Budget categories={categories}/>
          <Toaster />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
