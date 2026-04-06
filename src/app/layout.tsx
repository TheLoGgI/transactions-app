import { AppSidebar } from "@/components/menu-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { SWRConfig } from "swr";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const metadata: Metadata = {
  title: "Transactions Dashbaord",
  description: "Watch budgets on a monthly basis",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const uncategorizedCount = await prisma.transaction.count({
    where: {
      amount: { lt: 0 },
      AND: [{ subcategory: { category: null } }, { category: null }],
    },
  });
  return (
    <html lang="en" className={geist.variable} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <SWRConfig
            value={{
              refreshInterval: 30000, // Refresh every 30 seconds
              revalidateOnFocus: false,
              errorRetryCount: 3,
              errorRetryInterval: 1000,
            }}
          >
            <SidebarProvider>
              <AppSidebar uncategorizedCount={uncategorizedCount} />
              {children}
            </SidebarProvider>
          </SWRConfig>
        </ThemeProvider>
      </body>
    </html>
  );
}
