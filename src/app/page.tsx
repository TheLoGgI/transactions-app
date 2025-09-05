import { SidebarCategoryManager } from "@/components/category-manager-sidebar"
import { TransactionsDashboard } from "@/components/transactions-dashboard"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { PrismaClient } from "@prisma/client";
import { Toaster } from "sonner"
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
    <SidebarProvider style={{
      // @ts-expect-error - type has to be string
    "--sidebar-width": "25rem",
    "--sidebar-width-mobile": "20rem",
  }}
  defaultOpen={false}
  >
      <SidebarInset>
        <div className="min-h-screen bg-background">
          <TransactionsDashboard />
          <Toaster />
        </div>
      </SidebarInset>
      <SidebarCategoryManager categoriesData={categories}  side="right" />
    </SidebarProvider>
  )
}
