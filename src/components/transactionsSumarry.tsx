"use client"

import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import type { TransactionsSummaryResponse } from "./transactions-dashboard";
import useSWR from "swr";

interface IncomeExpensesOverTimeData {
  date: string;
  income: number;
  expenses: number;
  net: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface TransactionsSummaryStats {
  stats: TransactionsSummaryResponse;
  isStale: boolean;
  dateRange?: { from: Date; to: Date };
}


export function TransactionsSummary({stats, isStale, dateRange}: TransactionsSummaryStats) {

 const totalIncome = stats?.income.totalIncome ?? 0
 const totalExpenses = stats?.expenses.totalExpenses ?? 0
 const totalInvested = Math.abs(stats?.investments.totalInvested ?? 0)
 
 // Fetch daily expense data for median calculation
 const dailyDataUrl = useMemo(() => {
   if (!dateRange) return null;
   return `/api/transactions/income-expenses-overtime?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}&interval=day`;
 }, [dateRange]);

 const { data: dailyData } = useSWR<IncomeExpensesOverTimeData[]>(dailyDataUrl, fetcher);
 
 // Calculate median daily spending and period days
 const { medianDailySpending, avgDailySpending, stdDeviation, periodDays } = useMemo(() => {
   if (!dateRange) return { medianDailySpending: 0, avgDailySpending: 0, stdDeviation: 0, periodDays: 0 };
   
   const diffTime = Math.abs(dateRange.to.getTime() - dateRange.from.getTime());
   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
   
   // Calculate average
   const average = Math.abs(totalExpenses) / diffDays;
   
   if (!dailyData || dailyData.length === 0) {
     // Fallback to average if no daily data available
     return {
       medianDailySpending: average,
       avgDailySpending: average,
       stdDeviation: 0,
       periodDays: diffDays
     };
   }
   
   // Get daily expense amounts and sort them
   const dailyExpenses = dailyData.map(day => day.expenses).sort((a, b) => a - b);
   
   // Calculate median
   const median = dailyExpenses.length === 0 ? 0 :
     dailyExpenses.length % 2 === 0
       ? ((dailyExpenses[dailyExpenses.length / 2 - 1] ?? 0) + (dailyExpenses[dailyExpenses.length / 2] ?? 0)) / 2
       : dailyExpenses[Math.floor(dailyExpenses.length / 2)] ?? 0;
   
   // Calculate standard deviation
   const actualAverage = dailyExpenses.reduce((sum, expense) => sum + expense, 0) / dailyExpenses.length;
   const variance = dailyExpenses.reduce((sum, expense) => sum + Math.pow(expense - actualAverage, 2), 0) / dailyExpenses.length;
   const standardDeviation = Math.sqrt(variance);
   
   return {
     medianDailySpending: median,
     avgDailySpending: actualAverage,
     stdDeviation: standardDeviation,
     periodDays: diffDays
   };
 }, [totalExpenses, dateRange, dailyData]);
  
    return (
      <div className="relative">
          {isStale && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 dark:bg-background/90 backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin text-foreground dark:text-foreground" />
                <span className="text-sm font-medium text-foreground dark:text-foreground">Updating dashboard...</span>
              </div>
            </div>
          )}

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border dark:border-border bg-card dark:bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground dark:text-card-foreground">Finansiel oversigt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {totalIncome.toLocaleString("da-DK", { style: "currency", currency: "DKK" })}
                  </div>
                  <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                    {stats?.income.transactionsCount} indkomsttransaktioner
                  </p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {totalExpenses.toLocaleString("da-DK", { style: "currency", currency: "DKK" })}
                  </div>
                  <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                    {stats?.expenses.transactionsCount} udgiftstransaktioner
                    {totalIncome > 0 && ` (${Math.abs(((totalExpenses / totalIncome) * 100)).toFixed(1)}% af indkomst)`}
                  </p>
                </div>
                <div className="border-t pt-2">
                  <div className={`text-2xl font-bold ${totalIncome + totalExpenses >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    {(totalIncome + totalExpenses).toLocaleString("da-DK", { style: "currency", currency: "DKK" })}
                  </div>
                  <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                    {totalIncome + totalExpenses >= 0 ? "Overskud" : "Underskud"}
                    {totalIncome > 0 && ` (${(((totalIncome + totalExpenses) / totalIncome) * 100).toFixed(1)}% af indkomst)`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border dark:border-border bg-card dark:bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground dark:text-card-foreground">Investering</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold text-card-foreground dark:text-card-foreground`}
              >
                {(totalInvested).toLocaleString("da-DK", { style: "currency", currency: "DKK" })}

              </div>
              <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                {/* {totalIncome + totalExpenses >= 0 ? "Overskud" : "Underskud"} */}
                {`(${((totalInvested / totalIncome) * 100).toFixed(1)}% af indkomst)`}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border dark:border-border bg-card dark:bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground dark:text-card-foreground">Daglige udgifter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {medianDailySpending.toLocaleString("da-DK", { style: "currency", currency: "DKK" })}
                  </div>
                  <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                    median per dag
                  </p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {avgDailySpending.toLocaleString("da-DK", { style: "currency", currency: "DKK" })}
                  </div>
                  <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                    gennemsnit per dag
                  </p>
                </div>
                <div>
                  <div className="text-xl font-medium text-slate-600 dark:text-slate-400">
                    ±{stdDeviation.toLocaleString("da-DK", { style: "currency", currency: "DKK" })}
                  </div>
                  <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                    spredning (stabilitet)
                  </p>
                </div>
                <p className="text-xs text-muted-foreground dark:text-muted-foreground border-t pt-1">
                  over {periodDays} dage
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
    )
}