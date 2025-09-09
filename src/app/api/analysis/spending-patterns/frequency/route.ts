import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
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

    // Get all transactions with merchants
    const transactions = await prisma.transaction.findMany({
      where: {
        merchantId: { not: null },
        createdAt: {
          gte: fromDate,
          lte: toDate,
        },
        agent: 'SENDER', // Only expenses
      },
      include: {
        merchant: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    // Group by merchant and analyze frequency
    const merchantMap = new Map<
      string,
      {
        merchantName: string
        transactions: { date: Date; amount: number }[]
        totalSpent: number
      }
    >()

    transactions.forEach((transaction) => {
      if (!transaction.merchant) return

      const existing = merchantMap.get(transaction.merchant.name)
      const amount = Math.abs(transaction.amount)

      if (existing) {
        existing.transactions.push({
          date: transaction.createdAt,
          amount,
        })
        existing.totalSpent += amount
      } else {
        merchantMap.set(transaction.merchant.name, {
          merchantName: transaction.merchant.name,
          transactions: [
            {
              date: transaction.createdAt,
              amount,
            },
          ],
          totalSpent: amount,
        })
      }
    })

    // Calculate frequency metrics
    const result = Array.from(merchantMap.values())
      .map((merchant) => {
        const transactions = merchant.transactions.sort(
          (a, b) => a.date.getTime() - b.date.getTime(),
        )
        const frequency = transactions.length

        let averageDaysBetween = 0
        if (frequency > 1) {
          const daysBetweenTransactions = []
          for (let i = 1; i < transactions.length; i++) {
            const current = transactions[i]
            const previous = transactions[i - 1]
            if (current && previous) {
              const daysBetween = Math.abs(
                (current.date.getTime() - previous.date.getTime()) /
                  (1000 * 60 * 60 * 24),
              )
              daysBetweenTransactions.push(daysBetween)
            }
          }
          averageDaysBetween =
            daysBetweenTransactions.reduce((sum, days) => sum + days, 0) /
            daysBetweenTransactions.length
        }

        const lastTransaction = transactions[transactions.length - 1]
        if (!lastTransaction) return null

        return {
          merchantName: merchant.merchantName,
          frequency,
          averageDaysBetween: Math.round(averageDaysBetween),
          lastTransaction: lastTransaction.date.toISOString(),
          totalSpent: merchant.totalSpent,
        }
      })
      .filter(
        (merchant): merchant is NonNullable<typeof merchant> =>
          merchant !== null && merchant.frequency > 1,
      ) // Only merchants visited multiple times
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 20) // Top 20 most frequent

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching frequency data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
