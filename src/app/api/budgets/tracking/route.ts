import { PrismaClient, BudgetPeriod } from '@prisma/client'
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

function getDateRangeForPeriod(period: BudgetPeriod, startDate: Date): { start: Date; end: Date } {
  const start = new Date(startDate)
  const end = new Date(startDate)

  switch (period) {
    case 'WEEKLY':
      end.setDate(start.getDate() + 7)
      break
    case 'MONTHLY':
      end.setMonth(start.getMonth() + 1)
      break
    case 'QUARTERLY':
      end.setMonth(start.getMonth() + 3)
      break
    case 'YEARLY':
      end.setFullYear(start.getFullYear() + 1)
      break
  }

  return { start, end }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')

    // Fetch active budgets
    const budgets = await prisma.budget.findMany({
      where: {
        isActive: true,
        ...(categoryId && { categoryId: parseInt(categoryId) })
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          }
        }
      }
    }) as Array<{
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
        const { start, end } = getDateRangeForPeriod(budget.period, budget.startDate)
        const currentEnd: Date = budget.endDate && budget.endDate < end ? budget.endDate : end
        
        // Calculate total spending for this category in the period
        const transactions = await prisma.transaction.findMany({
          where: {
            categoryId: budget.categoryId,
            createdAt: {
              gte: start,
              lte: currentEnd
            },
            amount: {
              lt: 0 // Only expenses (negative amounts)
            }
          }
        })

        const spent = Math.abs(transactions.reduce((sum: number, transaction: { amount: number }) => sum + transaction.amount, 0))
        const remaining = Math.max(0, budget.amount - spent)
        const percentageUsed = budget.amount > 0 ? (spent / budget.amount) * 100 : 0
        const isOverBudget = spent > budget.amount

        // Calculate days remaining in period
        const now = new Date()
        const daysRemaining = currentEnd > now ? Math.ceil((currentEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0

        return {
          id: budget.id,
          categoryId: budget.categoryId,
          amount: budget.amount,
          period: budget.period,
          startDate: budget.startDate,
          endDate: budget.endDate,
          category: budget.category,
          spent,
          remaining,
          percentageUsed,
          isOverBudget,
          daysRemaining
        }
      })
    )

    return new Response(JSON.stringify(budgetsWithSpending), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error fetching budget tracking:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch budget tracking' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
