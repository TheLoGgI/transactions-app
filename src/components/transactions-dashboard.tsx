"use client"

import { Suspense, useCallback, useMemo, useState } from "react"

import useSWR from "swr"
import { TransactionsSummary } from "./transactionsSumarry"
import { TransactionsCategory } from "./transactions-category"
import { DateRangeSelector } from "./date-range-selector"
import {  type TransactionRange } from '@/app/api/transactions/general/route'
import { UploadButton } from './uploadButton'
import UncategorizedTransactions from "./uncategoriezed-transactions"
import { CategoryExpensesOverview } from "./category-expenses-overview"
import { IncomeExpensesChart } from "./income-expenses-chart"
import { YearlySpendingOverview } from "./yearly-spending-overview"
import { TrendingCategories } from "./trending-categories"
import { TimelineVisualization } from "./timeline-visualization"

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
  const [selectedPeriod, setSelectedPeriod] = useState("lastMonth")
  const today = useMemo(() => new Date(), []);
  const defaultDate = useMemo(() => ({
    from: new Date(today.getFullYear(), today.getMonth() - 1, 1, 0, 0, 0),
    to: new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59),
  }), [today]);

  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>(defaultDate)

  // const [isUploading, setIsUploading] = useState(false)
  const urlQuery = useMemo(() => {
    if (!dateRange) return "";
    return `?from=${dateRange.from.toISOString()}&to=${(dateRange.to ?? dateRange.from).toISOString()}`;
  }, [dateRange]);
  const { data: stats, isLoading: statsIsLoading, isValidating } = useSWR<TransactionsSummaryResponse>(`/api/transactions${urlQuery}`, fetcher)

  // const { trigger, isMutating } = useSWRMutation('/api/transactions', uploadTransactions)
  const { data: dataRange } = useSWR<TransactionRange>('/api/transactions/general', fetcher)

  // Calculate income and expenses separately
  const totalExpenses = stats?.expenses?.totalExpenses ?? 0

  // Simple date object creation - no need to memoize these lightweight operations
  const totalStartDate = dataRange?.firstInRange ? new Date(dataRange.firstInRange) : null;
  const totalEndDate = dataRange?.lastInRange ? new Date(dataRange.lastInRange) : null;

  // Helper function to set predefined date ranges
  const setPredefinedRange = useCallback((period: string) => {
    const today = new Date()
    // console.log('today.getDate(): ', today.getDate());
    const ranges = {
      "current": {
        to: today,
        from: new Date(today.getFullYear(), today.getMonth(), 1, 0, 23, 59, 59),
      },
      "lastMonth": defaultDate,
      "last3months": {
        to: new Date(today.getFullYear(), today.getMonth(), 0, 1, 0, 0, 0),
        from: new Date(today.getFullYear(), today.getMonth() - 3, 1, 0, 23, 59, 59),
      },
      "last6months": {
        to: new Date(today.getFullYear(), today.getMonth(), 0, 1, 0, 0, 0),
        from: new Date(today.getFullYear(), today.getMonth() - 6, 1, 0, 23, 59, 59),
      },
      "last12month": {
        to: new Date(today.getFullYear(), today.getMonth(), 0, 1, 0, 0, 0),
        from: new Date(today.getFullYear() - 1, today.getMonth(), 1, 0, 23, 59, 59),
      },
      all: {
        from: new Date(2020, 0, 1, 23, 59, 59),
        to: today,
      },
    }

    if (period in ranges) {
      setDateRange(ranges[period as keyof typeof ranges])
      setSelectedPeriod(period)
    }
  }, [defaultDate])

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
            <div className="flex items-center gap-2">
              <UploadButton />

              {/* Date Range Selector */}
              <DateRangeSelector selectedPeriod={selectedPeriod} onChange={setPredefinedRange} />
            </div>
            <p className="text-sm text-right text-gray-600 font-medium py-2">
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

        <Suspense fallback={<div>Loading category expenses overview...</div>}>
          <CategoryExpensesOverview query={urlQuery} />
        </Suspense>

        <Suspense fallback={<div>Loading trending categories...</div>}>
          <TrendingCategories query={urlQuery} />
        </Suspense>

        <Suspense fallback={<div>Loading income expenses chart...</div>}>
          <IncomeExpensesChart query={urlQuery} />
        </Suspense>

        <Suspense fallback={<div>Loading overview...</div>}>
          <YearlySpendingOverview />
        </Suspense>
      </div>
    </div>
  )
}
