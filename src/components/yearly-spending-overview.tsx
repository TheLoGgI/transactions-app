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
        return amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }

    const getCellColor = (amount: number, isTotal = false) => {
        if (amount === 0) return "text-gray-400"
        if (isTotal) return "font-semibold text-blue-600"
        return "text-gray-900"
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
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
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
                    <div className="text-center p-8 text-red-600">
                        Failed to load spending overview. Please try again later.
                    </div>
                </CardContent>
            </Card>
        )
    }

    const { spendingSections, summary } = overview

    return (
        <Card>
            <CardHeader>
                <CardTitle>Yearly Spending Overview by Category ({overview.year})</CardTitle>
                <CardDescription>Monthly breakdown of expenses across different categories</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50">
                                <TableHead className="font-semibold text-gray-900 min-w-[200px]">Category</TableHead>
                                {months.map((month) => (
                                    <TableHead key={month} className="text-center font-semibold text-gray-900 min-w-[80px]">
                                        {month}
                                    </TableHead>
                                ))}
                                <TableHead className="text-center font-semibold text-gray-900 min-w-[100px]">TOTAL</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {spendingSections.map((section, sectionIndex) => (
                                <React.Fragment key={sectionIndex}>
                                    {/* Section Header */}
                                    <TableRow className="bg-gray-100">
                                        <TableCell colSpan={14} className="font-bold text-gray-800 py-2">
                                            {section.title}
                                        </TableCell>
                                    </TableRow>

                                    {/* Section Categories */}
                                    {section.categories.map((category, categoryIndex) => (
                                        <TableRow key={`${sectionIndex}-${categoryIndex}`} className="hover:bg-gray-50">
                                            <TableCell className="font-medium text-gray-700 pl-4">{category.name}</TableCell>
                                            {months.map((month) => (
                                                <TableCell
                                                    key={month}
                                                    className={`text-right ${getCellColor(category.monthlyAmounts[month] ?? 0)}`}
                                                >
                                                    {formatCurrency(category.monthlyAmounts[month] ?? 0)}
                                                </TableCell>
                                            ))}
                                            <TableCell className={`text-right ${getCellColor(category.total, true)}`}>
                                                ${formatCurrency(category.total)}
                                            </TableCell>
                                        </TableRow>
                                    ))}

                                    {/* Section Total */}
                                    <TableRow className="bg-blue-50 border-t-2 border-blue-200">
                                        <TableCell className="font-bold text-blue-800">Total {section.title}</TableCell>
                                        {months.map((month) => {
                                            const monthTotal = section.categories.reduce(
                                                (sum, cat) => sum + (cat.monthlyAmounts[month] ?? 0),
                                                0,
                                            )
                                            return (
                                                <TableCell key={month} className="text-right font-semibold text-blue-700">
                                                    {formatCurrency(monthTotal)}
                                                </TableCell>
                                            )
                                        })}
                                        <TableCell className="text-right font-bold text-blue-800">
                                            ${formatCurrency(section.sectionTotal)}
                                        </TableCell>
                                    </TableRow>
                                </React.Fragment>
                            ))}

                            {/* Grand Total */}
                            <TableRow className="bg-gray-800 text-white border-t-4 border-gray-600">
                                <TableCell className="font-bold">TOTAL EXPENSES</TableCell>
                                {summary.monthlyTotals.map((monthTotal, index) => (
                                    <TableCell key={months[index]} className="text-right font-bold">
                                        {formatCurrency(monthTotal)}
                                    </TableCell>
                                ))}
                                <TableCell className="text-right font-bold text-lg">${formatCurrency(summary.grandTotal)}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>

                {/* Summary Statistics */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">${formatCurrency(summary.averageMonthly)}</div>
                            <p className="text-xs text-muted-foreground">Average Monthly Spending</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">${formatCurrency(summary.highestMonthly)}</div>
                            <p className="text-xs text-muted-foreground">Highest Monthly Spending</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">${formatCurrency(summary.lowestMonthly)}</div>
                            <p className="text-xs text-muted-foreground">Lowest Monthly Spending</p>
                        </CardContent>
                    </Card>
                </div>
            </CardContent>
        </Card>
    )
}
