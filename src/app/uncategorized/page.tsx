import { SidebarInset } from "@/components/ui/sidebar"
import UncategorizedTransactions from "@/components/uncategoriezed-transactions"

export default function UncategorizedPage() {
    return (
        <SidebarInset>
            <div className="p-6">
                <UncategorizedTransactions />
            </div>
        </SidebarInset>
    )
}
