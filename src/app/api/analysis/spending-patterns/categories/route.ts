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
      fromDate = new Date(today.getFullYear(), today.getMonth() - 12, 1);
      toDate = new Date(today.getFullYear(), today.getMonth(), 0);
    }

    const dateWhere = { createdAt: { gte: fromDate, lte: toDate }, agent: 'RECEIVER' as const };

    // Query 1: transactions with a direct categoryId
    const grouped = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: { ...dateWhere, categoryId: { not: null } },
      _sum: { amount: true },
      _count: { id: true },
    });

    // Query 2: transactions with only a subcategoryId — resolve category via subcategory relation
    const subcategoryTxs = await prisma.transaction.findMany({
      where: { ...dateWhere, categoryId: null, subcategoryId: { not: null } },
      select: { amount: true, subcategory: { select: { categoryId: true } } },
    });

    // Merge both into a single map keyed by categoryId
    const mergedMap = new Map<number, { amount: number; count: number }>();

    for (const g of grouped) {
      if (g.categoryId === null) continue;
      mergedMap.set(g.categoryId, { amount: g._sum.amount ?? 0, count: g._count.id });
    }

    for (const tx of subcategoryTxs) {
      const catId = tx.subcategory?.categoryId;
      if (!catId) continue;
      const existing = mergedMap.get(catId);
      if (existing) {
        existing.amount += tx.amount;
        existing.count += 1;
      } else {
        mergedMap.set(catId, { amount: tx.amount, count: 1 });
      }
    }

    // Fetch the matching category records
    const categoryIds = [...mergedMap.keys()];

    const categories = await prisma.categories.findMany({
      where: { id: { in: categoryIds } },
    });

    // Calculate total for percentages
    const totalSpending = [...mergedMap.values()].reduce(
      (sum, g) => sum + Math.abs(g.amount),
      0,
    );

    const result = [...mergedMap.entries()]
      .map(([catId, data]) => {
        const category = categories.find(c => c.id === catId);
        if (!category) return null;
        const totalAmount = Math.abs(data.amount);
        return {
          categoryCode: String(category.id),
          categoryName: category.name,
          totalAmount,
          transactionCount: data.count,
          color: category.color,
          percentage: totalSpending > 0 ? (totalAmount / totalSpending) * 100 : 0,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b!.totalAmount - a!.totalAmount);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching category spending data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
