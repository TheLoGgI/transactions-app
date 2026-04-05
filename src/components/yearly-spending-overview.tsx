"use client"

import React, { useState } from "react"
import useSWR from "swr"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type MonthlyData = Record<string, number>

interface CategoryData {
    name: string
    monthlyAmounts: MonthlyData
    total: number
}

interface SpendingSection {
    title: string
    categories: CategoryData[]
    sectionTotal: number
}

interface OverviewResponse {
    year: number
    spendingSections: SpendingSection[]
    summary: {
        grandTotal: number
        averageMonthly: number
        highestMonthly: number
        lowestMonthly: number
        monthlyTotals: number[]
    }
}

const fetcher = async (url: string): Promise<OverviewResponse> => {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status}`);
    }
    return res.json() as Promise<OverviewResponse>;
}

export function YearlySpendingOverview() {
    const currentYear = new Date().getFullYear()
    const [selectedYear, setSelectedYear] = useState(currentYear)
    const years = Array.from({ length: currentYear - 2020 + 1 }, (_, i) => currentYear - i)

    const { data: overview, error, isLoading } = useSWR<OverviewResponse, Error>(
        `/api/transactions/overview?year=${selectedYear}`,
        fetcher
    )

    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]

    // One distinct color per section (bg for header, text for totals)
    const sectionColors = [
        { header: "bg-blue-500/15 dark:bg-blue-500/20", total: "bg-blue-500/10", text: "text-blue-700 dark:text-blue-400", border: "border-blue-400/40" },
        { header: "bg-emerald-500/15 dark:bg-emerald-500/20", total: "bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-400/40" },
        { header: "bg-violet-500/15 dark:bg-violet-500/20", total: "bg-violet-500/10", text: "text-violet-700 dark:text-violet-400", border: "border-violet-400/40" },
        { header: "bg-amber-500/15 dark:bg-amber-500/20", total: "bg-amber-500/10", text: "text-amber-700 dark:text-amber-400", border: "border-amber-400/40" },
        { header: "bg-rose-500/15 dark:bg-rose-500/20", total: "bg-rose-500/10", text: "text-rose-700 dark:text-rose-400", border: "border-rose-400/40" },
        { header: "bg-cyan-500/15 dark:bg-cyan-500/20", total: "bg-cyan-500/10", text: "text-cyan-700 dark:text-cyan-400", border: "border-cyan-400/40" },
    ]

    const formatCurrency = (amount: number) => {
        if (amount === 0) return "0.00"
        return amount.toLocaleString("da-DK", { minimumFractionDigits: 2, maximumFractionDigits: 2, style: "currency", currency: "DKK" })
    }

    // Heat-map colouring: dim zeros, gradient from light to intense based on relative size
    const getCellColor = (amount: number, max: number, isTotal = false) => {
        if (amount === 0) return "text-muted-foreground/40"
        if (isTotal) return "font-semibold"
        const ratio = max > 0 ? amount / max : 0
        if (ratio >= 0.75) return "text-red-600 dark:text-red-400 font-medium"
        if (ratio >= 0.5) return "text-orange-500 dark:text-orange-400"
        if (ratio >= 0.25) return "text-yellow-600 dark:text-yellow-400"
        return "text-foreground"
    }

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Yearly Spending Overview by Category</CardTitle>
                    <CardDescription>Loading spending data...</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (error || !overview) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Yearly Spending Overview by Category</CardTitle>
                    <CardDescription>Error loading spending data</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center p-8 text-destructive">
                        Failed to load spending overview. Please try again later.
                    </div>
                </CardContent>
            </Card>
        )
    }

    const { spendingSections, summary } = overview

    return (
        <>
            {/* Summary Statistics */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-border dark:border-border bg-card dark:bg-card">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-card-foreground dark:text-card-foreground">Average Monthly Spending</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-card-foreground dark:text-card-foreground">
                            {summary.averageMonthly.toLocaleString("da-DK", { style: "currency", currency: "DKK" })}
                        </div>
                        <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                            Monthly average across {overview.year}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-border dark:border-border bg-card dark:bg-card">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-card-foreground dark:text-card-foreground">Highest Monthly Spending</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                            {summary.highestMonthly.toLocaleString("da-DK", { style: "currency", currency: "DKK" })}
                        </div>
                        <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                            Peak spending month
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-border dark:border-border bg-card dark:bg-card">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-card-foreground dark:text-card-foreground">Lowest Monthly Spending</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {summary.lowestMonthly.toLocaleString("da-DK", { style: "currency", currency: "DKK" })}
                        </div>
                        <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                            Minimum spending month
                        </p>
                    </CardContent>
                </Card>
            </div>


            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Yearly Spending Overview by Category ({overview.year})</CardTitle>
                        <CardDescription>Monthly breakdown of expenses across different categories</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setSelectedYear((y) => y - 1)}
                            disabled={selectedYear <= 2020}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
                            <SelectTrigger className="w-[110px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((y) => (
                                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setSelectedYear((y) => y + 1)}
                            disabled={selectedYear >= currentYear}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="font-semibold text-foreground min-w-[200px]">Category</TableHead>
                                    {months.map((month) => (
                                        <TableHead key={month} className="text-center font-semibold text-foreground min-w-[80px]">
                                            {month}
                                        </TableHead>
                                    ))}
                                    <TableHead className="text-center font-semibold text-foreground min-w-[100px]">TOTAL</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {spendingSections.map((section, sectionIndex) => {
                                    const color = sectionColors[sectionIndex % sectionColors.length]!
                                    // Max cell value in this section for heat-map scaling
                                    const sectionMax = Math.max(
                                        ...section.categories.flatMap((cat) =>
                                            months.map((m) => cat.monthlyAmounts[m] ?? 0)
                                        )
                                    )
                                    return (
                                    <React.Fragment key={sectionIndex}>
                                        {/* Section Header */}
                                        <TableRow className={color.header}>
                                            <TableCell colSpan={14} className={`font-bold py-2 ${color.text}`}>
                                                {section.title}
                                            </TableCell>
                                        </TableRow>

                                        {/* Section Categories */}
                                        {section.categories.map((category, categoryIndex) => (
                                            <TableRow key={`${sectionIndex}-${categoryIndex}`} className="hover:bg-muted/20">
                                                <TableCell className="font-medium text-foreground pl-4">{category.name}</TableCell>
                                                {months.map((month) => (
                                                    <TableCell
                                                        key={month}
                                                        className={`text-right ${getCellColor(category.monthlyAmounts[month] ?? 0, sectionMax)}`}
                                                    >
                                                        {formatCurrency(category.monthlyAmounts[month] ?? 0)}
                                                    </TableCell>
                                                ))}
                                                <TableCell className={`text-right ${getCellColor(category.total, sectionMax, true)} ${color.text}`}>
                                                    {formatCurrency(category.total)}
                                                </TableCell>
                                            </TableRow>
                                        ))}

                                        {/* Section Total */}
                                        <TableRow className={`${color.total} border-t-2 ${color.border}`}>
                                            <TableCell className={`font-bold ${color.text}`}>Total {section.title}</TableCell>
                                            {months.map((month) => {
                                                const monthTotal = section.categories.reduce(
                                                    (sum, cat) => sum + (cat.monthlyAmounts[month] ?? 0),
                                                    0,
                                                )
                                                return (
                                                    <TableCell key={month} className={`text-right font-semibold ${color.text}`}>
                                                        {formatCurrency(monthTotal)}
                                                    </TableCell>
                                                )
                                            })}
                                            <TableCell className={`text-right font-bold ${color.text}`}>
                                                {formatCurrency(section.sectionTotal)}
                                            </TableCell>
                                        </TableRow>
                                    </React.Fragment>
                                    )
                                })}

                                {/* Grand Total */}
                                <TableRow className="bg-accent border-t-4 border-border">
                                    <TableCell className="font-bold text-accent-foreground">TOTAL EXPENSES</TableCell>
                                    {summary.monthlyTotals.map((monthTotal, index) => (
                                        <TableCell key={months[index]} className="text-right font-bold text-accent-foreground">
                                            {formatCurrency(monthTotal)}
                                        </TableCell>
                                    ))}
                                    <TableCell className="text-right font-bold text-lg text-accent-foreground">{formatCurrency(summary.grandTotal)}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>


                </CardContent>
            </Card>
        </>
    )
}
