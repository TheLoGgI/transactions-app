import { PrismaClient, type BudgetPeriod } from '@prisma/client'
import type { NextRequest } from 'next/server'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const budgets = await prisma.budget.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          }
        }
      },
      where: {
        isActive: true
      }
    })

    return new Response(JSON.stringify(budgets), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error fetching budgets:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch budgets' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      categoryId: number
      amount: number
      period: BudgetPeriod
      startDate?: string
      endDate?: string
    }

    const { categoryId, amount, period, startDate, endDate } = body

    // Check if budget already exists for this category
    const existingBudget = await prisma.budget.findUnique({
      where: { categoryId }
    })

    if (existingBudget) {
      // Update existing budget
      const updatedBudget = await prisma.budget.update({
        where: { categoryId },
        data: {
          amount,
          period,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          isActive: true
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
      })

      return new Response(JSON.stringify(updatedBudget), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    } else {
      // Create new budget
      const newBudget = await prisma.budget.create({
        data: {
          categoryId,
          amount,
          period,
          startDate: startDate ? new Date(startDate) : new Date(),
          endDate: endDate ? new Date(endDate) : undefined,
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
      })

      return new Response(JSON.stringify(newBudget), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  } catch (error) {
    console.error('Error creating/updating budget:', error)
    return new Response(JSON.stringify({ error: 'Failed to create/update budget' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')

    if (!categoryId) {
      return new Response(JSON.stringify({ error: 'Category ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    await prisma.budget.update({
      where: { categoryId: parseInt(categoryId) },
      data: { isActive: false }
    })

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error deleting budget:', error)
    return new Response(JSON.stringify({ error: 'Failed to delete budget' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
