import { AppSidebar } from "@/components/menu-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { SWRConfig } from "swr";

export const metadata: Metadata = {
  title: "Transactions Dashbaord",
  description: "Watch budgets on a monthly basis",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
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
              <AppSidebar />
              {children}
            </SidebarProvider>
          </SWRConfig>
        </ThemeProvider>
      </body>
    </html>
  );
}
