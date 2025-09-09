"use client"

import React from "react"
import useSWR from "swr"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

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
    const { data: overview, error, isLoading } = useSWR<OverviewResponse, Error>(
        `/api/transactions/overview?year=${currentYear}`,
        fetcher
    )

    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]

    const formatCurrency = (amount: number) => {
        if (amount === 0) return "0.00"
        return amount.toLocaleString("da-DK", { minimumFractionDigits: 2, maximumFractionDigits: 2, style: "currency", currency: "DKK" })
    }

    const getCellColor = (amount: number, isTotal = false) => {
        if (amount === 0) return "text-muted-foreground"
        if (isTotal) return "font-semibold text-primary"
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
                <CardHeader>
                    <CardTitle>Yearly Spending Overview by Category ({overview.year})</CardTitle>
                    <CardDescription>Monthly breakdown of expenses across different categories</CardDescription>
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
                                {spendingSections.map((section, sectionIndex) => (
                                    <React.Fragment key={sectionIndex}>
                                        {/* Section Header */}
                                        <TableRow className="bg-muted/30">
                                            <TableCell colSpan={14} className="font-bold text-foreground py-2">
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
                                                        className={`text-right ${getCellColor(category.monthlyAmounts[month] ?? 0)}`}
                                                    >
                                                        {formatCurrency(category.monthlyAmounts[month] ?? 0)}
                                                    </TableCell>
                                                ))}
                                                <TableCell className={`text-right ${getCellColor(category.total, true)}`}>
                                                    {formatCurrency(category.total)}
                                                </TableCell>
                                            </TableRow>
                                        ))}

                                        {/* Section Total */}
                                        <TableRow className="bg-primary/10 border-t-2 border-primary/20">
                                            <TableCell className="font-bold text-primary">Total {section.title}</TableCell>
                                            {months.map((month) => {
                                                const monthTotal = section.categories.reduce(
                                                    (sum, cat) => sum + (cat.monthlyAmounts[month] ?? 0),
                                                    0,
                                                )
                                                return (
                                                    <TableCell key={month} className="text-right font-semibold text-primary">
                                                        {formatCurrency(monthTotal)}
                                                    </TableCell>
                                                )
                                            })}
                                            <TableCell className="text-right font-bold text-primary">
                                                {formatCurrency(section.sectionTotal)}
                                            </TableCell>
                                        </TableRow>
                                    </React.Fragment>
                                ))}

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
