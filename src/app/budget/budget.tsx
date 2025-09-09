
"use client"

import { useState } from "react"
import useSWR from "swr"
import { BudgetCard } from "@/components/budget-card"
import { BudgetFormDialog } from "@/components/budget-form-dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Plus, RefreshCw } from "lucide-react"
import { DateRangeSelector } from "@/components/date-range-selector"
import { useDateRange } from "@/hooks/useDateRange"

export interface BudgetCategory {
  id: number
  name: string
  color: string
  budget: {
    amount: number,
    period: string,
    isActive: boolean,
    // startDate: string;
    // endDate: string | null;
  } | null
}

interface BudgetWithSpending {
  id: number
  categoryId: number
  amount: number
  period: string
  startDate: string
  endDate: string | null
  category: BudgetCategory
  spent: number
  remaining: number
  percentageUsed: number
  isOverBudget: boolean
  daysRemaining?: number
}

// SWR fetcher function
const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`)
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return response.json()
}

// Custom hooks for data fetching
const useBudgets = (urlQuery: string) => {
  const result = useSWR<BudgetWithSpending[]>(`/api/budgets/tracking${urlQuery}`, fetcher)
  return {
    ...result,
    error: result.error as Error | undefined
  }
}

export function Budget({categories}: {categories: BudgetCategory[]}) {
  const { selectedPeriod, dateRange, urlQuery, setPredefinedRange } = useDateRange()
  
  const [error, setError] = useState<string | null>(null)
  
  // Use SWR hooks for data fetching
  const { 
    data: budgets = [], 
    error: budgetsError, 
    isLoading: budgetsLoading,
    mutate: mutateBudgets 
  } = useBudgets(urlQuery)
  
  // Combine loading states
  const loading = budgetsLoading

  // Handle errors from SWR
  const swrError = budgetsError
  const displayError = error ?? (swrError ? 'Failed to load data' : null)

  const handleSaveBudget = async (budgetData: {
    categoryId: number
    amount: number
    period: string
  }) => {
    try {
      setError(null)
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(budgetData),
      })

      if (!response.ok) throw new Error('Failed to save budget')
      
      // Revalidate budgets data using SWR's mutate
      await mutateBudgets()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save budget')
    }
  }

  // Remove unused function for now - we'll implement edit functionality later
  // const handleDeleteBudget = async (categoryId: number) => {
  //   try {
  //     const response = await fetch(`/api/budgets?categoryId=${categoryId}`, {
  //       method: 'DELETE',
  //     })

  //     if (!response.ok) throw new Error('Failed to delete budget')
      
  //     // Refresh budgets after deleting
  //     await fetchBudgets()
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : 'Failed to delete budget')
  //   }
  // }

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0)
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0)
  const overBudgetCount = budgets.filter(budget => budget.isOverBudget).length

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col gap-6">
          <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Budget</h1>
              <p className="text-muted-foreground">
                Set and track budgets for your spending categories.
              </p>
            </div>
          </header>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (displayError) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col gap-6">
          <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Budget</h1>
              <p className="text-muted-foreground">
                Set and track budgets for your spending categories.
              </p>
            </div>
          </header>
          <div className="flex items-center gap-2 p-4 border border-red-200 rounded-lg bg-red-50">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-700">{displayError}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setError(null)
                void mutateBudgets()
              }}
              className="ml-auto"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Budget</h1>
            <p className="text-muted-foreground">
              Set and track budgets for your spending categories.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* <Button 
              variant="outline" 
              size="sm" 
              onClick={() => void mutateBudgets()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button> */}
            <BudgetFormDialog 
              categories={categories.filter(category => !budgets.some(budget => budget.categoryId === category.id))}
              onSave={handleSaveBudget}
              trigger={
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Budget
                </Button>
              }
            />
            <DateRangeSelector selectedPeriod={selectedPeriod} onChange={setPredefinedRange} />
          </div>
        </header>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-muted-foreground">Total Budget</div>
            <div className="text-2xl font-bold">{totalBudget.toFixed(2)} DKK</div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-muted-foreground">Total Spent</div>
            <div className="text-2xl font-bold">{totalSpent.toFixed(2)} DKK</div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-muted-foreground">Over Budget</div>
            <div className={`text-2xl font-bold ${overBudgetCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {overBudgetCount} categories
            </div>
          </div>
        </div>

        {/* Budget Cards */}
        {budgets.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">No budgets created yet</div>
            <BudgetFormDialog 
              categories={categories.filter(category => !budgets.some(budget => budget.categoryId === category.id))}
              onSave={handleSaveBudget}
              trigger={
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Budget
                </Button>
              }
            />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {budgets.map((budget) => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                onEdit={() => {
                  // Handle edit - could open the form dialog with existing data
                  // For now, let's just log to console
                  console.log('Edit budget:', budget)
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}