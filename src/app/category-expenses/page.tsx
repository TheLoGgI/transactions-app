import { SidebarInset } from "@/components/ui/sidebar"
import { CategoryExpensesPage } from "./category-expenses"

export default function CategoryExpensesPageRoute() {
  return (
    <SidebarInset>
      <div className="p-6">
        <CategoryExpensesPage />
      </div>
    </SidebarInset>
  )
}
