import { PrismaClient } from '@prisma/client'
import type { BudgetPeriod } from '@prisma/client'
import type { NextRequest } from 'next/server'

const prisma = new PrismaClient()

interface BudgetWithSpending {
  id: number
  categoryId: number
  amount: number
  period: BudgetPeriod
  startDate: Date
  endDate: Date | null
  category: {
    id: number
    name: string
    color: string
  }
  spent: number
  remaining: number
  percentageUsed: number
  isOverBudget: boolean
  daysRemaining?: number
}

// Helper function to calculate how many periods fit in the given date range
function calculatePeriodMultiplier(period: BudgetPeriod, fromDate: Date, toDate: Date): number {
  const timeDiffMs = toDate.getTime() - fromDate.getTime()
  const timeDiffDays = Math.ceil(timeDiffMs / (1000 * 60 * 60 * 24))
  
  switch (period) {
    case 'WEEKLY':
      return Math.max(1, Math.ceil(timeDiffDays / 7))
    case 'MONTHLY':
      // More accurate monthly calculation
      const startYear = fromDate.getFullYear()
      const startMonth = fromDate.getMonth()
      const endYear = toDate.getFullYear()
      const endMonth = toDate.getMonth()
      
      // Calculate total months including partial months
      let monthsDiff = (endYear - startYear) * 12 + (endMonth - startMonth)
      
      // Add 1 if we're spanning into another month or if it's the same month
      if (toDate.getDate() >= fromDate.getDate() || monthsDiff === 0) {
        monthsDiff += 1
      }
      
      return Math.max(1, monthsDiff)
    case 'QUARTERLY':
      // More precise quarterly calculation (3 months = 1 quarter)
      return Math.max(1, Math.ceil(timeDiffDays / 90))
    case 'YEARLY':
      // More accurate yearly calculation
      const years = toDate.getFullYear() - fromDate.getFullYear()
      const monthDiff = toDate.getMonth() - fromDate.getMonth()
      const dayDiff = toDate.getDate() - fromDate.getDate()
      
      // Calculate fractional years more precisely
      let yearMultiplier = years
      if (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)) {
        yearMultiplier += (monthDiff + (dayDiff >= 0 ? 1 : 0)) / 12
      } else if (monthDiff < 0) {
        yearMultiplier += monthDiff / 12
      }
      
      return Math.max(1, Math.ceil(yearMultiplier))
    default:
      return 1
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const paramFrom = url.searchParams.get('from')
  const paramTo = url.searchParams.get('to')

  let fromDate = paramFrom ? new Date(paramFrom) : null
  let toDate = paramTo ? new Date(paramTo) : null

  if (!fromDate || !toDate) {
    const today = new Date()
    fromDate = new Date(today.getFullYear(), today.getMonth() - 12, 1)
    toDate = new Date(today.getFullYear(), today.getMonth(), 0)
  }

  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')

    // Fetch active budgets
    const budgets = (await prisma.budget.findMany({
      where: {
        isActive: true,
        ...(categoryId && { categoryId: parseInt(categoryId) }),
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    })) as Array<{
      id: number
      categoryId: number
      amount: number
      period: BudgetPeriod
      startDate: Date
      endDate: Date | null
      category: {
        id: number
        name: string
        color: string
      }
    }>

    // Calculate spending for each budget
    const budgetsWithSpending: BudgetWithSpending[] = await Promise.all(
      budgets.map(async (budget): Promise<BudgetWithSpending> => {
        // Calculate how many periods the selected date range covers
        const periodMultiplier = calculatePeriodMultiplier(budget.period, fromDate, toDate)
        const scaledBudgetAmount = budget.amount * periodMultiplier

        // Calculate total spending for this category in the period
        const totalExpenses = await prisma.transaction.aggregate({
          _sum: {
            amount: true,
          },
          where: {
            categoryId: budget.categoryId,
            createdAt: {
              gte: fromDate,
              lte: toDate,
            },
            merchant: { isNot: null },
          },
        })

        const spent = Math.abs(totalExpenses._sum.amount ?? 0)
        const remaining = Math.max(0, scaledBudgetAmount - spent)
        const percentageUsed =
          scaledBudgetAmount > 0 ? (spent / scaledBudgetAmount) * 100 : 0
        const isOverBudget = spent > scaledBudgetAmount

        return {
          id: budget.id,
          categoryId: budget.categoryId,
          amount: scaledBudgetAmount, // Return the scaled amount
          period: budget.period,
          startDate: budget.startDate,
          endDate: budget.endDate,
          category: budget.category,
          spent,
          remaining,
          percentageUsed,
          isOverBudget,
        }
      }),
    )

    return new Response(JSON.stringify(budgetsWithSpending), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error fetching budget tracking:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch budget tracking' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }
}
