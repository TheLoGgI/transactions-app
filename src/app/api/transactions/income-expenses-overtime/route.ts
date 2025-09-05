import { PrismaClient } from '@prisma/client'
import type { NextRequest } from 'next/server'

const prisma = new PrismaClient()

export interface IncomeExpensesOverTimeData {
  date: string
  income: number
  expenses: number
  net: number
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const paramFrom = url.searchParams.get('from')
  const paramTo = url.searchParams.get('to')
  const interval = url.searchParams.get('interval') ?? 'month' // 'day', 'week', 'month', 'year'

  let fromDate = paramFrom ? new Date(paramFrom) : null
  let toDate = paramTo ? new Date(paramTo) : null
  
  if (!fromDate || !toDate) {
    const today = new Date()
    fromDate = new Date(today.getFullYear(), today.getMonth() - 12, 1)
    toDate = new Date(today.getFullYear(), today.getMonth(), 0)
  }

  // Get all transactions in the date range
  const transactions = await prisma.transaction.findMany({
    where: {
      createdAt: {
        gte: fromDate,
        lte: toDate,
      },
    },
    select: {
      amount: true,
      createdAt: true,
      merchant: {
        select: {
          name: true,
        },
      },
      Sender: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  })

  // Group transactions by time interval
  const groupedData = new Map<string, { income: number; expenses: number }>()

  transactions.forEach((transaction) => {
    const date = new Date(transaction.createdAt)
    let key: string

    switch (interval) {
      case 'day':
        key = date.toISOString().split('T')[0]! // YYYY-MM-DD
        break
      case 'week':
        const startOfWeek = new Date(date)
        startOfWeek.setDate(date.getDate() - date.getDay())
        key = startOfWeek.toISOString().split('T')[0]!
        break
      case 'year':
        key = date.getFullYear().toString()
        break
      case 'month':
      default:
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        break
    }

    if (!groupedData.has(key)) {
      groupedData.set(key, { income: 0, expenses: 0 })
    }

    const group = groupedData.get(key)!
    
    // Determine if this is income or expense
    if (transaction.Sender && transaction.amount > 0) {
      // Income - has sender and positive amount
      group.income += transaction.amount
    } else if (transaction.merchant && transaction.amount < 0) {
      // Expense - has merchant and negative amount
      group.expenses += Math.abs(transaction.amount)
    }
  })

  // Convert to array and sort by date
  const result: IncomeExpensesOverTimeData[] = Array.from(groupedData.entries())
    .map(([date, data]) => ({
      date,
      income: Math.round(data.income * 100) / 100, // Round to 2 decimal places
      expenses: Math.round(data.expenses * 100) / 100,
      net: Math.round((data.income - data.expenses) * 100) / 100,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return new Response(JSON.stringify(result), {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
