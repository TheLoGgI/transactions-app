"use client"

import { Suspense } from "react"

import useSWR from "swr"
import { TransactionsSummary } from "./transactionsSumarry"
import { TransactionsCategory } from "./transactions-category"
import { DateRangeSelector } from "./date-range-selector"
import { type TransactionRange } from '@/app/api/transactions/general/route'
import UncategorizedTransactions from "./uncategoriezed-transactions"
import { CategoryExpensesOverview } from "./category-expenses-overview"
import { IncomeExpensesChart } from "./income-expenses-chart"
import { TrendingCategories } from "./trending-categories"
import { TimelineVisualization } from "./timeline-visualization"
import { useDateRange } from "@/hooks/useDateRange"

export interface TransactionsSummaryResponse {
  expenses: {
    totalExpenses: number | null;
    transactionsCount: number;
  };
  income: {
    totalIncome: number | null;
    transactionsCount: number;
  };
  investments: {
    totalInvested: number | null;
    transactionsCount: number;
  }
}

export interface TransactionCategory {
  id: number;
  name: string;
  color: string;
  category: {
    totalExpenses: number;
    transactionsCount: number;
  };
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function daysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate();
}


export function TransactionsDashboard() {
  const { selectedPeriod, dateRange, urlQuery, setPredefinedRange } = useDateRange()

  const { data: stats, isLoading: statsIsLoading, isValidating } = useSWR<TransactionsSummaryResponse>(`/api/transactions${urlQuery}`, fetcher)

  // const { trigger, isMutating } = useSWRMutation('/api/transactions', uploadTransactions)
  const { data: dataRange } = useSWR<TransactionRange>('/api/transactions/general', fetcher)

  // Calculate income and expenses separately
  const totalExpenses = stats?.expenses?.totalExpenses ?? 0

  // Simple date object creation - no need to memoize these lightweight operations
  const totalStartDate = dataRange?.firstInRange ? new Date(dataRange.firstInRange) : null;
  const totalEndDate = dataRange?.lastInRange ? new Date(dataRange.lastInRange) : null;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-6">
        <header className="flex sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Transactions Dashboard</h1>
            <p className="text-muted-foreground">
              View and categorize your transactions to better understand your spending habits.
            </p>
            <p className="text-muted-foreground">
              {totalStartDate && totalEndDate
                ? `Data available from ${totalStartDate.toLocaleDateString("da-DK", { dateStyle: "long" })} to ${totalEndDate.toLocaleDateString("da-DK", { dateStyle: "long" })}`
                : "No data available yet."}
            </p>

          </div>



          {/* Controls */}
          <div>
            <DateRangeSelector selectedPeriod={selectedPeriod} onChange={setPredefinedRange} />
            <p className="text-sm text-gray-600 font-medium py-2">
              {`${dateRange.from.toLocaleDateString("da-DK", { dateStyle: "long" })} to ${dateRange.to.toLocaleDateString("da-DK", { dateStyle: "long" })}`}
            </p>

          </div>

        </header>

        {/* Timeline Visualization */}
        {totalStartDate && totalEndDate && (
          <TimelineVisualization
            totalStart={totalStartDate}
            totalEnd={totalEndDate}
            selectedStart={dateRange.from}
            selectedEnd={dateRange.to}
          />
        )}

        <TransactionsSummary
          stats={stats ?? {
            expenses: { totalExpenses: 0, transactionsCount: 0 },
            income: { totalIncome: 0, transactionsCount: 0 },
            investments: { totalInvested: 0, transactionsCount: 0 }
          }}
          isStale={statsIsLoading || isValidating && stats === undefined}
          dateRange={dateRange}
        />



        {/* Main Content */}
        <Suspense fallback={<div>Loading summary...</div>}>
          <TransactionsCategory totalExpenses={totalExpenses} query={urlQuery} />
        </Suspense>

        <UncategorizedTransactions />


        <Suspense fallback={<div>Loading trending categories...</div>}>
          <TrendingCategories query={urlQuery} />
        </Suspense>

        <Suspense fallback={<div>Loading income expenses chart...</div>}>
          <IncomeExpensesChart query={urlQuery} />
        </Suspense>
      </div>
    </div>
  )
}
