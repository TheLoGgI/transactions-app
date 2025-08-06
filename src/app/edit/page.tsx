import { Toaster } from "sonner"
import { CategoryManager } from "./category-manager"

export default async function Home() {
  
  return (
    <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4">
            <CategoryManager categories={[]} />
        </div>
      <Toaster />
    </div>
  )
}
