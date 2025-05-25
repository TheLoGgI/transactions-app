"use client"
import useSWRMutation from 'swr/mutation'

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react"

import useSWR from "swr"
import { TransactionsSummary } from "./transactionsSumarry"
import { TransactionsCategory } from "./transactions-category"
import { DateRangeSelector } from "./date-range-selector"
import { Loader2, LoaderIcon, Upload } from "lucide-react"
import { Button } from "./ui/button"
import { Toaster } from "./ui/sonner"
import { toast } from "sonner"

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
const uploadTransactions = (url: string, { arg }: { arg: File }) => {
  const formData = new FormData()
  formData.append("transactions", arg)

  return fetch(url, {
    method: "POST",
    body: formData,
  }).then((res) => {
    if (!res.ok) {
      throw new Error("Failed to upload transactions")
    }
    return res.json()
  })
}

export function TransactionsDashboard() {
  const today = new Date()
  const [selectedPeriod, setSelectedPeriod] = useState("30days")
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000), // May 1, 2023
    to: today,
  })
    const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const urlQuery = useMemo(() => `?from=${dateRange.from.toISOString()}&to=${(dateRange.to ?? dateRange.from).toISOString()}`, [dateRange.from, dateRange.to])
  const { data: stats, isLoading: statsIsLoading, isValidating } = useSWR<TransactionsSummaryResponse>(`/api/transactions${urlQuery}`, fetcher)
  console.log('statsIsLoading: ', statsIsLoading);
    const { trigger, isMutating } = useSWRMutation('/api/transactions', uploadTransactions)


//   useEffect(() => {
//     console.group("state")
//     console.log(stats, 'stats in TransactionsDashboard');
//     console.log(statsIsLoading, 'loading');
//     console.log(isValidating, 'isValidating');
//     console.groupEnd()
// }, [isValidating, stats, statsIsLoading])

  // Helper function to check if a date is within the selected range
  // const isDateInRange = (dateString: string) => {
  //   if (!dateRange.from || !dateRange.to) return true
  //   const transactionDate = new Date(dateString)
  //   return transactionDate >= dateRange.from && transactionDate <= dateRange.to
  // }

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

  // if (statsIsLoading && !stats) {
  //   return <div>Loading stats...</div>
  // }

  // Calculate income and expenses separately
  const totalExpenses = stats?.expenses?.totalExpenses ?? 0


  // File upload handler
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== "application/json") {
      toast("Invalid file type", {
        description: "Please upload a JSON file.",
      })
      return
    }

    setIsUploading(true)

    try {
      await trigger(file)
      
      // const text = await file.text()
      // console.log('text: ', text);
      // const data = JSON.parse(text)

      // Validate the JSON structure
      // if (!Array.isArray(data.transactions)) {
      //   throw new Error("JSON must contain a 'transactions' array")
      // }

      // Simulate processing time
      // await new Promise((resolve) => setTimeout(resolve, 1000))

      // Add to existing transactions
      // setCategorizedTransactions((prev) => [...prev, ...newCategorized])
      // setUncategorizedTransactions((prev) => [...prev, ...newUncategorized])

      // Show success message
      toast("Transactions uploaded successfully!", {
          // description: `Added ${validTransactions.length} transactions to your dashboard.${invalidTransactions.length > 0 ? ` ${invalidTransactions.length} invalid transactions were skipped.` : ""}`,
          // action: {
          //   label: "Undo",
          //   onClick: () => console.log("Undo"),
          // },
        })

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("Error parsing JSON:", error)
      toast("Upload failed", {
        description: error instanceof Error ? error.message : "Failed to parse the JSON file.",
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Trigger file input
  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Transactions Dashboard</h1>
            <p className="text-muted-foreground">
              View and categorize your transactions to better understand your spending habits.
            </p>
          </div>
          
                    {/* Controls */}
          <div className="flex items-center gap-2">
           {/* File Upload Button */}
            <Button
              variant="outline"
              onClick={triggerFileUpload}
              disabled={isUploading || statsIsLoading}
              className="flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload JSON
                </>
              )}
            </Button>

            {/* Hidden file input */}
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileUpload} className="hidden" />

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
