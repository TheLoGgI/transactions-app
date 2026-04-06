"use client"

import { CategoryExpensesOverview } from "@/components/category-expenses-overview"
import { DateRangeSelector } from "@/components/date-range-selector"
import { useDateRange } from "@/hooks/useDateRange"

export function CategoryExpensesPage() {
  const { selectedPeriod, dateRange, urlQuery, setPredefinedRange } = useDateRange()

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Category Expenses</h1>
          <p className="text-muted-foreground">
            Investigate spending broken down by category.
          </p>
        </div>
        <div>
          <DateRangeSelector selectedPeriod={selectedPeriod} onChange={setPredefinedRange} />
          <p className="text-sm text-gray-600 font-medium py-2">
            {`${dateRange.from.toLocaleDateString("da-DK", { dateStyle: "long" })} to ${dateRange.to.toLocaleDateString("da-DK", { dateStyle: "long" })}`}
          </p>
        </div>
      </header>

      <CategoryExpensesOverview query={urlQuery} />
    </div>
  )
}
