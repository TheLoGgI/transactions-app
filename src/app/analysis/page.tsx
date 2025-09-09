import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { PrismaClient } from "@prisma/client";
import { Toaster } from "sonner"
import { EmptyDashboard } from "@/components/empty-dashboard"
import { AnalysisOverview } from "./analysis";
const prisma = new PrismaClient();

export default async function AnalysisPage() {
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
                     <AnalysisOverview />
                </div>
                <Toaster />
            </SidebarInset>
         </SidebarProvider>
    )
}
