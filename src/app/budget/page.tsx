import { PrismaClient } from "@prisma/client";
import { Toaster } from "sonner"
import { Budget } from "./budget";
const prisma = new PrismaClient();

export default async function Home() {

  return (

        <div className="min-h-screen bg-background">
            
          <Budget />
          <Toaster />
        </div>

  )
}
