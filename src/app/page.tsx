import { TransactionsDashboard } from "@/components/transactions-dashboard"
import { Toaster } from "sonner"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <TransactionsDashboard />
      <Toaster />
    </div>
  )
}
