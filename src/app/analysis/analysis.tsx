"use client"

import { Suspense } from "react"

import { DateRangeSelector } from "@/components/date-range-selector"
import { CategoryExpensesOverview } from "@/components/category-expenses-overview"
import { TopMerchantsAnalysis } from "@/components/top-merchants-analysis"
import { SpendingPatternsAnalysis } from "@/components/spending-patterns-analysis"
import { LoadingState } from "@/components/loading-states"
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

export function daysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate();
}


export function AnalysisOverview() {
  const { selectedPeriod, dateRange, urlQuery, setPredefinedRange } = useDateRange()

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-6">
        <header className="flex sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Transactions Dashboard</h1>
            <p className="text-muted-foreground">
              View and categorize your transactions to better understand your spending habits.
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

        <Suspense fallback={
          <LoadingState 
            title="Loading category expenses..." 
            description="Analyzing your spending by category"
            showSkeleton={true}
          />
        }>
          <CategoryExpensesOverview query={urlQuery} />
        </Suspense>

        <Suspense fallback={
          <LoadingState 
            title="Loading merchants analysis..." 
            description="Identifying your top spending destinations"
            showSkeleton={true}
          />
        }>
          <TopMerchantsAnalysis query={urlQuery} />
        </Suspense>

        <Suspense fallback={
          <LoadingState 
            title="Loading spending patterns..." 
            description="Analyzing your spending behavior and trends"
            showSkeleton={true}
          />
        }>
          <SpendingPatternsAnalysis query={urlQuery} />
        </Suspense>


      </div>
    </div>
  )
}
