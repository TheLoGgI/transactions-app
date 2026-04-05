"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  PiggyBank,
  SquareTerminal,
  Target,
  TrendingUp,
  Calculator,
  AlertTriangle,
  Zap,
  Heart,
  RefreshCw,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavMain } from "./menu-sidebar-content"
import { SavingsNavigation } from "./savings-navigation"
import { ThemeToggle } from "./theme-toggle"
import { UploadButton } from "./uploadButton"
import { Button } from "./ui/button"
import { mutate } from "swr"
import { toast } from "sonner"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Oversigt",
      url: "/",
      icon: SquareTerminal,
      isActive: true,
    },
    {
      title: "Budget",
      url: "/budget",
      icon: Bot,
    },
    {
      title: "Års oversigt",
      url: "/annually-report",
      icon: BookOpen,
    },
    {
      title: "Analyse",
      url: "/analysis",
      icon: Settings2,
    },
    {
      title: "Invistering",
      url: "#",
      icon: PiggyBank,
    },
  ],
  savingsAnalytics: [
    {
      title: "Savings Goals",
      url: "/savings/goals",
      icon: Target,
    },
    {
      title: "Budget Optimizer",
      url: "/savings/optimizer",
      icon: TrendingUp,
    },
    {
      title: "Savings Calculator",
      url: "/savings/calculator",
      icon: Calculator,
    },
    {
      title: "Financial Health",
      url: "/savings/health",
      icon: Heart,
    },
    {
      title: "Spending Alerts",
      url: "/savings/alerts",
      icon: AlertTriangle,
    },
    {
      title: "Quick Wins",
      url: "/savings/quick-wins",
      icon: Zap,
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [syncing, setSyncing] = React.useState(false)

  const handleSync = async () => {
    setSyncing(true)
    await mutate(() => true) // revalidate all SWR keys
    setSyncing(false)
    toast.success("Data refreshed")
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {/* <TeamSwitcher teams={data.teams} /> */}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <SavingsNavigation items={data.savingsAnalytics} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center justify-between ">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={handleSync} title="Refresh data">
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
          </Button>
          <UploadButton />
        </div>
        {/* <NavUser user={data.user} /> */}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
