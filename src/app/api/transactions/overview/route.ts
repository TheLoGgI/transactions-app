import { PrismaClient } from '@prisma/client'
import type { NextRequest } from 'next/server'

const prisma = new PrismaClient()

type MonthlyData = Record<string, number>

interface CategoryOverview {
  name: string
  monthlyAmounts: MonthlyData
  total: number
}

interface SpendingSection {
  title: string
  categories: CategoryOverview[]
  sectionTotal: number
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year') ?? new Date().getFullYear().toString()

    // Get all transactions for the specified year with categories
    const transactions = await prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: new Date(`${year}-01-01`),
          lte: new Date(`${year}-12-31`)
        },
        amount: {
          lt: 0 // Only expenses (negative amounts)
        },
        OR: [
          { categoryId: { not: null } },
          { subcategoryId: { not: null } }
        ]
      },
      include: {
        category: true,
        subcategory: { include: { category: true } }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Get all categories to organize data
    const categories = await prisma.categories.findMany({
      include: {
        transactions: {
          where: {
            createdAt: {
              gte: new Date(`${year}-01-01`),
              lte: new Date(`${year}-12-31`)
            },
            amount: {
              lt: 0
            }
          }
        }
      }
    })

    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
    
    // Group transactions by category and month
    const categoryData: Record<string, CategoryOverview> = {}
    
    // Initialize all categories
    categories.forEach(category => {
      if (category.transactions.length > 0) {
        categoryData[category.name] = {
          name: category.name,
          monthlyAmounts: months.reduce((acc, month) => ({ ...acc, [month]: 0 }), {}),
          total: 0
        }
      }
    })

    // Process transactions
    transactions.forEach(transaction => {
      const resolvedCategory = transaction.category ?? transaction.subcategory?.category ?? null
      if (resolvedCategory) {
        const categoryName = resolvedCategory.name
        const monthIndex = new Date(transaction.createdAt).getMonth()
        const month = months[monthIndex]
        const amount = Math.abs(transaction.amount) // Convert to positive for display
        
        categoryData[categoryName] ??= {
          name: categoryName,
          monthlyAmounts: months.reduce((acc, month) => ({ ...acc, [month]: 0 }), {}),
          total: 0
        }
        
        if (month) {
          const categoryEntry = categoryData[categoryName]
          if (categoryEntry?.monthlyAmounts[month] !== undefined) {
            categoryEntry.monthlyAmounts[month] += amount
            categoryEntry.total += amount
          }
        }
      }
    })

    // Build section maps from DB expenseType tags
    // Use raw SQL to bypass stale Prisma client types until `prisma generate` is re-run
    const categoryTypes = await prisma.$queryRaw<{ name: string; expenseType: string | null }[]>`
      SELECT name, expenseType FROM categories
    `

    const fixedNames = categoryTypes.filter(c => c.expenseType === 'FIXED').map(c => c.name)
    const subscriptionNames = categoryTypes.filter(c => c.expenseType === 'SUBSCRIPTION').map(c => c.name)
    const variableNames = categoryTypes.filter(c => c.expenseType === 'VARIABLE').map(c => c.name)
    const taggedNames = new Set([...fixedNames, ...subscriptionNames, ...variableNames])

    const createSection = (title: string, categoryNames: string[]): SpendingSection => {
      const sectionCategories = categoryNames
        .map(name => categoryData[name])
        .filter((cat): cat is CategoryOverview => Boolean(cat))
        .sort((a, b) => b.total - a.total)

      const sectionTotal = sectionCategories.reduce((sum, cat) => sum + cat.total, 0)

      return { title, categories: sectionCategories, sectionTotal }
    }

    // Untagged categories go into "Other Expenses"
    const untaggedNames = Object.keys(categoryData).filter(name => !taggedNames.has(name))

    const spendingSections: SpendingSection[] = [
      createSection('Fixed Expenses', fixedNames),
      createSection('Subscriptions', subscriptionNames),
      createSection('Variable Expenses', variableNames),
      createSection('Other Expenses', untaggedNames),
    ].filter(section => section.categories.length > 0)

    // Calculate totals
    const grandTotal = spendingSections.reduce((sum, section) => sum + section.sectionTotal, 0)
    const monthlyTotals = months.map(month => 
      spendingSections.reduce((sum, section) => 
        sum + section.categories.reduce((catSum, cat) => catSum + (cat.monthlyAmounts[month] ?? 0), 0), 0
      )
    )

    const averageMonthly = grandTotal / 12
    const highestMonthly = Math.max(...monthlyTotals)
    const lowestMonthly = Math.min(...monthlyTotals.filter(total => total > 0))

    return Response.json({
      year: parseInt(year),
      spendingSections,
      summary: {
        grandTotal,
        averageMonthly,
        highestMonthly,
        lowestMonthly: lowestMonthly === Infinity ? 0 : lowestMonthly,
        monthlyTotals
      }
    })

  } catch (error) {
    console.error('Error fetching yearly spending overview:', error)
    return Response.json(
      { error: 'Failed to fetch yearly spending overview' },
      { status: 500 }
    )
  }
}
