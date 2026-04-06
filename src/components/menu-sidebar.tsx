"use client"

import * as React from "react"
import {
  AudioWaveform,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Target,
  TrendingUp,
  Calculator,
  AlertTriangle,
  Zap,
  Heart,
  Tag,
  Store,
  Layers,
  LayoutDashboard,
  Wallet,
  TrendingDown,
  CalendarDays,
  ChartColumnDecreasing,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuLink,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavMain } from "./menu-sidebar-content"
import { SavingsNavigation } from "./savings-navigation"
import { ThemeToggle } from "./theme-toggle"
import { UploadButton } from "./uploadButton"

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
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Annually Overview",
      url: "/annually-report",
      icon: CalendarDays,
    },
    {
      title: "Budget",
      url: "/budget",
      icon: Wallet,
    },
    {
      title: "Spending",
      url: "/analysis",
      icon: TrendingDown,
    },
    // {
    //   title: "Invistering",
    //   url: "#",
    //   icon: PiggyBank,
    // },
  ],
  manageItems: [
    {
      title: "Handlende",
      url: "/merchants",
      icon: Store,
    },
    {
      title: "Underkategorier",
      url: "/subcategories",
      icon: Layers,
    },
  ],
  insightItems: [
    {
      title: "Category Expenses",
      url: "/category-expenses",
      icon: ChartColumnDecreasing,
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

export function AppSidebar({ uncategorizedCount, ...props }: React.ComponentProps<typeof Sidebar> & { uncategorizedCount: number }) {

  const navItems = [
    ...(uncategorizedCount > 0
      ? [{ title: "Ukategoriserede", url: "/uncategorized", icon: Tag, highlight: true, count: uncategorizedCount }]
      : []),
    ...data.navMain,
  ]


  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {/* <TeamSwitcher teams={data.teams} /> */}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
        <SidebarGroup>
          <SidebarGroupLabel>Indsigt</SidebarGroupLabel>
          <SidebarMenu>
            {data.insightItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuLink href={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuLink>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Administrer</SidebarGroupLabel>
          <SidebarMenu>
            {data.manageItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuLink href={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuLink>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SavingsNavigation items={data.savingsAnalytics} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center justify-between ">
          <ThemeToggle />
          <UploadButton />
        </div>
        {/* <NavUser user={data.user} /> */}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
