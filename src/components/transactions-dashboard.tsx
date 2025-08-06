"use client"

import { Suspense, useCallback, useMemo, useState } from "react"

import useSWR from "swr"
import { TransactionsSummary } from "./transactionsSumarry"
import { TransactionsCategory } from "./transactions-category"
import { DateRangeSelector } from "./date-range-selector"
import type { TransactionRange } from '@/app/api/transactions/general/route'
import { UploadButton } from './uploadButton'
import UncategorizedTransactions from "./uncategoriezed-transactions"
import { Circle } from "lucide-react"

interface TransactionsSummaryResponse {
  expenses: {
    totalExpenses: number | null;
    transactionsCount: number;
  };
  income: {
    totalIncome: number | null;
    transactionsCount: number;
  };
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

export function TransactionsDashboard() {
  const today = new Date()
  const [selectedPeriod, setSelectedPeriod] = useState("30days")
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000), // May 1, 2023
    to: today,
  })

    // const [isUploading, setIsUploading] = useState(false)
  const urlQuery = useMemo(() => `?from=${dateRange.from.toISOString()}&to=${(dateRange.to ?? dateRange.from).toISOString()}`, [dateRange.from, dateRange.to])
  const { data: stats, isLoading: statsIsLoading, isValidating } = useSWR<TransactionsSummaryResponse>(`/api/transactions${urlQuery}`, fetcher)

    // const { trigger, isMutating } = useSWRMutation('/api/transactions', uploadTransactions)
  const {data: dataRange} = useSWR<TransactionRange>(`/api/transactions/general`, fetcher)

  // Calculate income and expenses separately
  const totalExpenses = stats?.expenses?.totalExpenses ?? 0

  // Helper function to set predefined date ranges
  const setPredefinedRange = useCallback((period: string) => {
    const today = new Date()
    const ranges = {
      "7days": {
        from: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
        to: today,
      },
      "30days": {
        from: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
        to: today,
      },
      "3months": {
        from: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000),
        to: today,
      },
      "6months": {
        from: new Date(today.getTime() - 180 * 24 * 60 * 60 * 1000),
        to: today,
      },
      "1year": {
        from: new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000),
        to: today,
      },
      all: {
        from: new Date(2020, 0, 1),
        to: today,
      },
    }

    if (period in ranges) {
      setDateRange(ranges[period as keyof typeof ranges])
      setSelectedPeriod(period)
    }
  }, [])

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
              {dataRange?.firstInRange && dataRange?.lastInRange
                ? `Data available from ${new Date(dataRange.firstInRange).toLocaleDateString("da-DK", {dateStyle: "long"})} to ${new Date(dataRange.lastInRange).toLocaleDateString("da-DK", {dateStyle: "long"})}`
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
              {dateRange.from.toLocaleDateString("da-DK", {dateStyle: "long"})} to {dateRange.to.toLocaleDateString("da-DK", {dateStyle: "long"})}
            </p>

          </div>

        </header>

        {/* <div className="w-full">
          <svg className="w-full" height="50" viewBox="0 0 -1 50">
            {new Array(50).fill(Math.random() > .5).map((item, index) => {
              return <circle key={index} cx={`${20 * (index + 1)}`} cy="10" r="8" fill={item === true ? "black" : "none"} stroke={item === false ? "gray" : "none"}  stroke-width="2"  />
            })}
          </svg>
        </div> */}

          <TransactionsSummary
            stats={stats ?? {
              expenses: { totalExpenses: 0, transactionsCount: 0 },
              income: { totalIncome: 0, transactionsCount: 0 }
            }}
            // isStale={statsIsLoading && isValidating && stats !== undefined}
            isStale={statsIsLoading || isValidating && stats === undefined}
          />

        {/* Main Content */}
        <Suspense fallback={<div>Loading summary...</div>}>
          <TransactionsCategory totalExpenses={totalExpenses} query={urlQuery} />
        </Suspense>

        <UncategorizedTransactions />
        
      </div>
    </div>
  )
}
