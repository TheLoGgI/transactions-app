import { SidebarInset } from "@/components/ui/sidebar"
import { SubcategoryMerge } from "@/components/subcategory-merge"

export default function SubcategoriesPage() {
  return (
    <SidebarInset>
      <div className="p-6">
        <SubcategoryMerge />
      </div>
    </SidebarInset>
  )
}
