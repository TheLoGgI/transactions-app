"use client"

import { Suspense, useCallback, useMemo, useState } from "react"

import useSWR from "swr"
import { TransactionsSummary } from "./transactionsSumarry"
import { TransactionsCategory } from "./transactions-category"
import { DateRangeSelector } from "./date-range-selector"
import type { TransactionRange } from '@/app/api/transactions/general/route'
import { UploadButton } from './uploadButton'

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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
          <div className="flex items-center gap-2">
           <UploadButton />

          {/* Date Range Selector */}
          <DateRangeSelector selectedPeriod={selectedPeriod} onChange={setPredefinedRange} />
          </div>
        </div>


        {/* Summary Cards */}
        {/* <Suspense fallback={<div>Loading summary...</div>}> */}
          <TransactionsSummary
            stats={stats ?? {
              expenses: { totalExpenses: 0, transactionsCount: 0 },
              income: { totalIncome: 0, transactionsCount: 0 }
            }}
            // isStale={statsIsLoading && isValidating && stats !== undefined}
            isStale={statsIsLoading || isValidating && stats === undefined}
          />
        {/* </Suspense> */}

        {/* Main Content */}
        <Suspense fallback={<div>Loading summary...</div>}>
          <TransactionsCategory totalExpenses={totalExpenses} query={urlQuery} />
        </Suspense>


        {/* Uncategorized Transactions */}
        {/* {uncategorizedTransactions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Ukategoriserede transaktioner</CardTitle>
              <CardDescription>
                Tildel kategorier til disse transaktioner for at forbedre din forbrugsindsigt
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dato</TableHead>
                    <TableHead>Beskrivelse</TableHead>
                    <TableHead className="text-right">Beløb</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="text-right">Handlinger</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {uncategorizedTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.date}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell className="text-right">{transaction.amount.toLocaleString("da-DK", {style:"currency", currency:"DKK"})}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-gray-100">
                          Ukategoriseret
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <span className="sr-only">Åbn menu</span>
                              <PlusIcon className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {categories
                              .filter((category) =>
                                transaction.type === "expense"
                                  ? !["Salary", "Freelance", "Investment"].includes(category.name)
                                  : ["Salary", "Freelance", "Investment"].includes(category.name),
                              )
                              .map((category) => (
                                <DropdownMenuItem
                                  key={category.id}
                                  onClick={() => categorizeTransaction(transaction.id, category.id)}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: category.color }} />
                                    {category.name}
                                  </div>
                                </DropdownMenuItem>
                              ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )} */}

        {/* Recent Categorized Transactions */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Seneste kategoriserede transaktioner</CardTitle>
            <CardDescription>Dine senest kategoriserede transaktioner</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dato</TableHead>
                  <TableHead>Beskrivelse</TableHead>
                  <TableHead className="text-right">Beløb</TableHead>
                  <TableHead>Kategori</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categorizedTransactions
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 5)
                  .map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.date}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell className="text-right">{transaction.amount.toLocaleString("da-DK", {style:"currency", currency:"DKK"})}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="flex w-fit items-center gap-1"
                          style={{
                            backgroundColor: `${getCategoryColor(transaction.categoryId)}20`,
                            borderColor: getCategoryColor(transaction.categoryId),
                          }}
                        >
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: getCategoryColor(transaction.categoryId) }}
                          />
                          {getCategoryName(transaction.categoryId)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card> */}
      </div>
    </div>
  )
}
