"use client";
import { TransactionPieChart } from "./transaction-pie-chart";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import type { TransactionCategory } from "./transactions-dashboard";
import useSWR from "swr";
import { Edit2, Loader2 } from "lucide-react";
import { useMemo } from "react";
import Link from "next/link";

interface TransactionsCategoryProps {
    totalExpenses: number;
    query: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export const TransactionsCategory = ({ totalExpenses, query }: TransactionsCategoryProps) => {
    const { data: categories, isLoading, isValidating } = useSWR<TransactionCategory[]>(`/api/transactions/category${query}`, fetcher)
    // console.log('categories: ', categories);

    const chartData = useMemo(() => categories?.map((category) => ({
        name: category.name,
        value: category.category.totalExpenses || 0,
        color: category.color,
    })), [categories]);

    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* Pie Chart */}
            <Card className="md:col-span-1">
                <CardHeader>
                    <CardTitle>Forbrug pr. kategori</CardTitle>
                    <CardDescription>Fordeling af dine kategoriserede transaktioner</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <div className="h-[350px] w-full max-w-[350px]">
                        {(isLoading || isValidating && categories === undefined) ? (
                            <div className="flex items-center justify-center h-full w-full space-x-2">
                                <Loader2 className="h-6 w-6 animate-spin" />
                                <span>Indlæser...</span>
                            </div>
                        ) : (
                            <TransactionPieChart data={chartData ?? []} />
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Category List */}
            <Card className="md:col-span-1">
                <CardHeader>
                    <CardTitle>Udgiftskategorier</CardTitle>
                    <CardDescription>Opdeling af forbrug pr. kategori</CardDescription>
                    <CardAction>
                        <Link href="/edit" className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-200 hover:bg-gray-200 hover:text-gray-700">
                            <Edit2 className="w-4 h-4" />
                        </Link>
                    </CardAction>
                </CardHeader>
                <CardContent>
                    {(isLoading || isValidating && categories === undefined) ? (
                        <div className="flex items-center justify-center h-full w-full space-x-2">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span>Indlæser...</span>
                        </div>
                    ) :
                        (<div className="space-y-4">
                            {categories
                                ?.map((category) => {
                                    const categoryTotal = category.category.totalExpenses
                                    const absouluteExpenses = Math.abs(totalExpenses || 0)
                                    const percentage = absouluteExpenses > 0 ? (categoryTotal / absouluteExpenses) * 100 : 0

                                    return (
                                        <div key={category.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: category.color }} />
                                                <span>{category.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">{categoryTotal.toLocaleString("da-DK", { style: "currency", currency: "DKK" })}</span>
                                                <span className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</span>
                                            </div>
                                        </div>
                                    )
                                })}
                        </div>)}
                </CardContent>
            </Card>
        </div>
    );
}