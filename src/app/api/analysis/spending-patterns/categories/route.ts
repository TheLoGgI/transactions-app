import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
  const url = new URL(request.url);
  const paramFrom = url.searchParams.get("from");
  const paramTo = url.searchParams.get("to");

  let fromDate = paramFrom ? new Date(paramFrom) : null;
  let toDate = paramTo ? new Date(paramTo) : null;

  if (!fromDate || !toDate) {
    const today = new Date();
    fromDate = new Date(today.getFullYear(), today.getMonth() - 12, 1)
    toDate = new Date(today.getFullYear(), today.getMonth(), 0)
  }


    // Get category spending data through merchants
    const merchantData = await prisma.transaction.groupBy({
      by: ['merchantId'],
      where: {
        merchantId: { not: null },
        createdAt: {
          gte: fromDate,
          lte: toDate,
        },
        agent: 'RECEIVER', // Only expenses
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    // Get merchant details with category codes
    const merchantIds = merchantData.map(m => m.merchantId).filter((id): id is string => id !== null);
    const merchants = await prisma.merchant.findMany({
      where: {
        id: { in: merchantIds },
      },
    });

    // Group by category code
    const categoryMap = new Map<string, {
      categoryCode: string;
      categoryName: string;
      totalAmount: number;
      transactionCount: number;
      color: string;
    }>();

    // Map category codes to readable names
    const getCategoryName = (code: string): string => {
      const categoryNames: Record<string, string> = {
        'GROCERY': 'Groceries',
        'RESTAURANT': 'Restaurants',
        'GAS_STATION': 'Gas Stations',
        'RETAIL': 'Retail',
        'ENTERTAINMENT': 'Entertainment',
        'HEALTHCARE': 'Healthcare',
        'TRANSPORT': 'Transportation',
        'SERVICES': 'Services',
        'OTHER': 'Other',
      };
      return categoryNames[code] ?? code;
    };

    const getCategoryColor = (code: string): string => {
      const colors: Record<string, string> = {
        'GROCERY': '#10B981',
        'RESTAURANT': '#F59E0B',
        'GAS_STATION': '#EF4444',
        'RETAIL': '#8B5CF6',
        'ENTERTAINMENT': '#EC4899',
        'HEALTHCARE': '#06B6D4',
        'TRANSPORT': '#84CC16',
        'SERVICES': '#6366F1',
        'OTHER': '#6B7280',
      };
      return colors[code] ?? '#6B7280';
    };

    merchantData.forEach(item => {
      const merchant = merchants.find(m => m.id === item.merchantId);
      if (!merchant || !item._sum.amount) return;

      const categoryCode = merchant.categoryCode;
      const existing = categoryMap.get(categoryCode);
      const amount = Math.abs(item._sum.amount);

      if (existing) {
        existing.totalAmount += amount;
        existing.transactionCount += item._count.id;
      } else {
        categoryMap.set(categoryCode, {
          categoryCode,
          categoryName: getCategoryName(categoryCode),
          totalAmount: amount,
          transactionCount: item._count.id,
          color: getCategoryColor(categoryCode),
        });
      }
    });

    // Calculate total for percentages
    const totalSpending = Array.from(categoryMap.values()).reduce((sum, category) => sum + category.totalAmount, 0);

    // Convert to array and add percentages
    const result = Array.from(categoryMap.values())
      .map(category => ({
        ...category,
        percentage: (category.totalAmount / totalSpending) * 100,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching category spending data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
