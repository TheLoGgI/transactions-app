import { SidebarCategoryManager } from "@/components/category-manager-sidebar"
import { TransactionsDashboard } from "@/components/transactions-dashboard"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { PrismaClient } from "@prisma/client";
import { Toaster } from "sonner"
import { EmptyDashboard } from "@/components/empty-dashboard"
const prisma = new PrismaClient();

export default async function Home() {
  // Check if there are any transactions in the database
  const transactionsCount = await prisma.transaction.count()

  // If no transactions exist, show empty dashboard
  if (transactionsCount === 0) {
    return (
      <SidebarInset>

        <EmptyDashboard />
      </SidebarInset>
    )
  }

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
      <SidebarCategoryManager categoriesData={categories} side="right" />
    </SidebarProvider>
  )
}
