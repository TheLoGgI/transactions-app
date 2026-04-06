"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"

import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuLink,
} from "@/components/ui/sidebar"

export function NavMain({
    items,
}: {
    items: {
        title: string
        url: string
        icon?: LucideIcon
        isActive?: boolean
        highlight?: boolean
        count?: number
        items?: {
            title: string
            url: string
        }[]
    }[]
}) {
    const highlighted = items.filter((i) => i.highlight)
    const normal = items.filter((i) => !i.highlight)

    return (
        <SidebarGroup>
            {highlighted.length > 0 && (
                <SidebarMenu className="mb-1">
                    {highlighted.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuLink
                                href={item.url}
                                className="bg-amber-100 text-amber-900 font-semibold ring-1 ring-amber-300 hover:bg-amber-200 hover:text-amber-900 dark:bg-amber-900/40 dark:text-amber-300 dark:ring-amber-700 dark:hover:bg-amber-900/60"
                            >
                                {item.icon && <item.icon className="shrink-0 text-amber-600 dark:text-amber-400" />}
                                <span className="flex-1">{item.title}</span>
                                {item.count !== undefined && (
                                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-xs font-bold text-white dark:bg-amber-600">
                                        {item.count}
                                    </span>
                                )}
                            </SidebarMenuLink>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            )}
            <SidebarGroupLabel>Oversigt</SidebarGroupLabel>
            <SidebarMenu>
                {normal.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuLink href={item.url}>
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuLink>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    )
}
