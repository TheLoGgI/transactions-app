import { SidebarInset } from "@/components/ui/sidebar"
import { MerchantMerge } from "@/components/merchant-merge"

export default function MerchantsPage() {
  return (
    <SidebarInset>
      <div className="p-6">
        <MerchantMerge />
      </div>
    </SidebarInset>
  )
}
