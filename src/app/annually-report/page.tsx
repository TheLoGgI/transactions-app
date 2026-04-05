import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { PrismaClient } from "@prisma/client";
import { Toaster } from "sonner"
import { EmptyDashboard } from "@/components/empty-dashboard"
import { YearlySpendingOverview } from "@/components/yearly-spending-overview";
import { Suspense } from "react";
const prisma = new PrismaClient();

export default async function AnnualyReport() {
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
                    <div className="w-full mx-auto py-8 px-4">
                        <div className="flex flex-col gap-6">
                            <header className="flex sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold tracking-tight">Årlig Report</h1>
                                    <p className="text-muted-foreground">
                                        View and categorize your transactions to better understand your spending habits.
                                    </p>
                                    

                                </div>

                            </header>

                            <Suspense fallback={<div>Loading overview...</div>}>
                                <YearlySpendingOverview />
                            </Suspense>
                        </div>
                    </div>
                </div>
                <Toaster />
            </SidebarInset>
        </SidebarProvider>
    )
}
