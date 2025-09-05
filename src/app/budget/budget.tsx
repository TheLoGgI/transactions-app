
"use client"

import { useEffect, useState } from "react"
import { BudgetCard } from "@/components/budget-card"
import { BudgetFormDialog } from "@/components/budget-form-dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Plus, RefreshCw } from "lucide-react"

interface Category {
  id: number
  name: string
  color: string
}

interface BudgetWithSpending {
  id: number
  categoryId: number
  amount: number
  period: string
  startDate: string
  endDate: string | null
  category: Category
  spent: number
  remaining: number
  percentageUsed: number
  isOverBudget: boolean
  daysRemaining?: number
}

export function Budget() {
  const [budgets, setBudgets] = useState<BudgetWithSpending[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBudgets = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/budgets/tracking')
      if (!response.ok) throw new Error('Failed to fetch budgets')
      const data = await response.json() as BudgetWithSpending[]
      setBudgets(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch budgets')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (!response.ok) throw new Error('Failed to fetch categories')
      const data = await response.json() as Category[]
      setCategories(data)
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    }
  }

  useEffect(() => {
    void fetchBudgets()
    void fetchCategories()
  }, [])

  const handleSaveBudget = async (budgetData: {
    categoryId: number
    amount: number
    period: string
  }) => {
    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(budgetData),
      })

      if (!response.ok) throw new Error('Failed to save budget')
      
      // Refresh budgets after saving
      await fetchBudgets()
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

  if (error) {
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
            <span className="text-red-700">{error}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setError(null)
                void fetchBudgets()
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
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchBudgets}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <BudgetFormDialog 
              categories={categories.filter(cat => !budgets.some(budget => budget.categoryId === cat.id))}
              onSave={handleSaveBudget}
              trigger={
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Budget
                </Button>
              }
            />
          </div>
        </header>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-muted-foreground">Total Budget</div>
            <div className="text-2xl font-bold">${totalBudget.toFixed(2)}</div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-muted-foreground">Total Spent</div>
            <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
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
              categories={categories}
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