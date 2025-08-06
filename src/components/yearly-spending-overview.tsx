"use client"

import React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import useSWR from "swr";

type MonthlyData = Record<string, number>;

interface CategoryData {
    name: string
    monthlyAmounts: MonthlyData
    total: number
    isSubcategory?: boolean
    isSectionTotal?: boolean
}

interface SpendingSection {
    title: string
    categories: CategoryData[]
    sectionTotal?: number
}


const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function YearlySpendingOverview() {
      const { data: overview, isLoading } = useSWR<unknown>(`/api/transactions/overview`, fetcher)
      console.log('overview: ', overview);
    
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
    // const months = ["Januar", "Febuar", "Marts", "April", "Maj", "Juni", "Juli", "August", "September", "Oktober", "November", "December"]

    // Sample data based on the image structure
    const spendingSections: SpendingSection[] = [
        {
            title: "Fixed Expenses",
            categories: [
                {
                    name: "Housing",
                    monthlyAmounts: {
                        JAN: 3010.58,
                        FEB: 3010.58,
                        MAR: 3010.58,
                        APR: 3010.58,
                        MAY: 3010.58,
                        JUN: 3010.58,
                        JUL: 3010.58,
                        AUG: 3010.58,
                        SEP: 3010.58,
                        OCT: 3010.58,
                        NOV: 3010.58,
                        DEC: 3010.58,
                    },
                    total: 36126.96,
                },
                {
                    name: "Insurance",
                    monthlyAmounts: {
                        JAN: 109.58,
                        FEB: 109.58,
                        MAR: 109.58,
                        APR: 109.58,
                        MAY: 109.58,
                        JUN: 109.58,
                        JUL: 109.58,
                        AUG: 109.58,
                        SEP: 109.58,
                        OCT: 109.58,
                        NOV: 109.58,
                        DEC: 109.58,
                    },
                    total: 1314.96,
                },
                {
                    name: "HK Fagforening & A-kasse",
                    monthlyAmounts: {
                        JAN: 0.0,
                        FEB: 0.0,
                        MAR: 0.0,
                        APR: 1884.55,
                        MAY: 517.0,
                        JUN: 980.0,
                        JUL: 1176.0,
                        AUG: 0.0,
                        SEP: 0.0,
                        OCT: 0.0,
                        NOV: 0.0,
                        DEC: 0.0,
                    },
                    total: 4557.55,
                },
                {
                    name: "Phone",
                    monthlyAmounts: {
                        JAN: 128.75,
                        FEB: 128.75,
                        MAR: 128.75,
                        APR: 128.75,
                        MAY: 128.75,
                        JUN: 128.75,
                        JUL: 128.75,
                        AUG: 128.75,
                        SEP: 128.75,
                        OCT: 128.75,
                        NOV: 128.75,
                        DEC: 128.75,
                    },
                    total: 1545.0,
                },
                {
                    name: "Transportation",
                    monthlyAmounts: {
                        JAN: 300.0,
                        FEB: 300.0,
                        MAR: 300.0,
                        APR: 300.0,
                        MAY: 600.0,
                        JUN: 644.0,
                        JUL: 300.0,
                        AUG: 300.0,
                        SEP: 300.0,
                        OCT: 300.0,
                        NOV: 300.0,
                        DEC: 300.0,
                    },
                    total: 4244.0,
                },
                {
                    name: "Utilities",
                    monthlyAmounts: {
                        JAN: 40.0,
                        FEB: 40.0,
                        MAR: 40.0,
                        APR: 40.0,
                        MAY: 40.0,
                        JUN: 40.0,
                        JUL: 40.0,
                        AUG: 40.0,
                        SEP: 40.0,
                        OCT: 40.0,
                        NOV: 40.0,
                        DEC: 40.0,
                    },
                    total: 480.0,
                },
                {
                    name: "Internet",
                    monthlyAmounts: {
                        JAN: 175.42,
                        FEB: 175.42,
                        MAR: 175.42,
                        APR: 175.42,
                        MAY: 175.42,
                        JUN: 175.42,
                        JUL: 175.42,
                        AUG: 175.42,
                        SEP: 175.42,
                        OCT: 175.42,
                        NOV: 175.42,
                        DEC: 175.42,
                    },
                    total: 2105.04,
                },
            ],
            sectionTotal: 45815.96,
        },
        {
            title: "Subscriptions",
            categories: [
                {
                    name: "Apple Music",
                    monthlyAmounts: {
                        JAN: 59.0,
                        FEB: 59.0,
                        MAR: 59.0,
                        APR: 59.0,
                        MAY: 59.0,
                        JUN: 59.0,
                        JUL: 59.0,
                        AUG: 59.0,
                        SEP: 59.0,
                        OCT: 59.0,
                        NOV: 59.0,
                        DEC: 59.0,
                    },
                    total: 708.0,
                },
                {
                    name: "Disney+",
                    monthlyAmounts: {
                        JAN: 49.0,
                        FEB: 49.0,
                        MAR: 49.0,
                        APR: 49.0,
                        MAY: 49.0,
                        JUN: 49.0,
                        JUL: 49.0,
                        AUG: 49.0,
                        SEP: 49.0,
                        OCT: 49.0,
                        NOV: 49.0,
                        DEC: 49.0,
                    },
                    total: 588.0,
                },
                {
                    name: "Google Storage",
                    monthlyAmounts: {
                        JAN: 0.0,
                        FEB: 0.0,
                        MAR: 0.0,
                        APR: 15.0,
                        MAY: 15.0,
                        JUN: 15.0,
                        JUL: 15.0,
                        AUG: 15.0,
                        SEP: 15.0,
                        OCT: 15.0,
                        NOV: 15.0,
                        DEC: 15.0,
                    },
                    total: 135.0,
                },
            ],
            sectionTotal: 1431.0,
        },
        {
            title: "Variable Expenses",
            categories: [
                {
                    name: "Groceries",
                    monthlyAmounts: {
                        JAN: 2941.54,
                        FEB: 2500.0,
                        MAR: 2859.82,
                        APR: 2271.35,
                        MAY: 5255.85,
                        JUN: 1609.2,
                        JUL: 0.0,
                        AUG: 0.0,
                        SEP: 0.0,
                        OCT: 0.0,
                        NOV: 0.0,
                        DEC: 0.0,
                    },
                    total: 17437.76,
                },
                {
                    name: "Dining Out",
                    monthlyAmounts: {
                        JAN: 553.39,
                        FEB: 70.0,
                        MAR: 288.9,
                        APR: 2132.25,
                        MAY: 0.0,
                        JUN: 274.0,
                        JUL: 0.0,
                        AUG: 0.0,
                        SEP: 0.0,
                        OCT: 0.0,
                        NOV: 0.0,
                        DEC: 0.0,
                    },
                    total: 3318.54,
                },
                {
                    name: "Entertainment",
                    monthlyAmounts: {
                        JAN: 0.0,
                        FEB: 0.0,
                        MAR: 259.0,
                        APR: 0.0,
                        MAY: 0.0,
                        JUN: 496.0,
                        JUL: 0.0,
                        AUG: 0.0,
                        SEP: 0.0,
                        OCT: 0.0,
                        NOV: 0.0,
                        DEC: 0.0,
                    },
                    total: 755.0,
                },
                {
                    name: "Shopping",
                    monthlyAmounts: {
                        JAN: 0.0,
                        FEB: 0.0,
                        MAR: 0.0,
                        APR: 0.0,
                        MAY: 534.0,
                        JUN: 0.0,
                        JUL: 0.0,
                        AUG: 0.0,
                        SEP: 0.0,
                        OCT: 0.0,
                        NOV: 0.0,
                        DEC: 0.0,
                    },
                    total: 534.0,
                },
            ],
            sectionTotal: 22045.3,
        },
    ]

    const formatCurrency = (amount: number) => {
        if (amount === 0) return "0.00"
        return amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }

    const getCellColor = (amount: number, isTotal = false) => {
        if (amount === 0) return "text-gray-400"
        if (isTotal) return "font-semibold text-blue-600"
        return "text-gray-900"
    }

    const grandTotal = spendingSections.reduce((sum, section) => sum + (section.sectionTotal ?? 0), 0)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Yearly Spending Overview by Category</CardTitle>
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
                                    {section.sectionTotal && (
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
                                    )}
                                </React.Fragment>
                            ))}

                            {/* Grand Total */}
                            <TableRow className="bg-gray-800 text-white border-t-4 border-gray-600">
                                <TableCell className="font-bold hover:">TOTAL EXPENSES</TableCell>
                                {months.map((month) => {
                                    const monthGrandTotal = spendingSections.reduce(
                                        (sectionSum, section) =>
                                            sectionSum +
                                            section.categories.reduce((catSum, cat) => catSum + (cat.monthlyAmounts[month] ?? 0), 0),
                                        0,
                                    )
                                    return (
                                        <TableCell key={month} className="text-right font-bold">
                                            {formatCurrency(monthGrandTotal)}
                                        </TableCell>
                                    )
                                })}
                                <TableCell className="text-right font-bold text-lg">${formatCurrency(grandTotal)}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>

                {/* Summary Statistics */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">${formatCurrency(grandTotal / 12)}</div>
                            <p className="text-xs text-muted-foreground">Average Monthly Spending</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">
                                $
                                {formatCurrency(
                                    Math.max(
                                        ...months.map((month) =>
                                            spendingSections.reduce(
                                                (sum, section) =>
                                                    sum +
                                                    section.categories.reduce((catSum, cat) => catSum + (cat.monthlyAmounts[month] ?? 0), 0),
                                                0,
                                            ),
                                        ),
                                    ),
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">Highest Monthly Spending</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">
                                $
                                {formatCurrency(
                                    Math.min(
                                        ...months.map((month) =>
                                            spendingSections.reduce(
                                                (sum, section) =>
                                                    sum +
                                                    section.categories.reduce((catSum, cat) => catSum + (cat.monthlyAmounts[month] ?? 0), 0),
                                                0,
                                            ),
                                        ),
                                    ),
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">Lowest Monthly Spending</p>
                        </CardContent>
                    </Card>
                </div>
            </CardContent>
        </Card>
    )
}
