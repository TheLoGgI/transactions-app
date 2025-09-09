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

    // Get geographic spending data
    const geographicData = await prisma.transaction.groupBy({
      by: ['merchantId'],
      where: {
        merchantId: { not: null },
        createdAt: {
          gte: fromDate,
          lte: toDate,
        },
        agent: 'SENDER', // Only expenses
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    // Get merchant details with city/country
    const merchantIds = geographicData.map(m => m.merchantId).filter((id): id is string => id !== null);
    const merchants = await prisma.merchant.findMany({
      where: {
        id: { in: merchantIds },
      },
    });

    // Group by city
    const cityMap = new Map<string, {
      city: string;
      country: string;
      totalAmount: number;
      transactionCount: number;
      merchants: string[];
    }>();

    geographicData.forEach(item => {
      const merchant = merchants.find(m => m.id === item.merchantId);
      if (!merchant || !item._sum.amount) return;

      const cityKey = `${merchant.city}-${merchant.country}`;
      const existing = cityMap.get(cityKey);
      const amount = Math.abs(item._sum.amount);

      if (existing) {
        existing.totalAmount += amount;
        existing.transactionCount += item._count.id;
        if (!existing.merchants.includes(merchant.name)) {
          existing.merchants.push(merchant.name);
        }
      } else {
        cityMap.set(cityKey, {
          city: merchant.city,
          country: merchant.country,
          totalAmount: amount,
          transactionCount: item._count.id,
          merchants: [merchant.name],
        });
      }
    });

    // Calculate total for percentages
    const totalSpending = Array.from(cityMap.values()).reduce((sum, city) => sum + city.totalAmount, 0);

    // Convert to array and add percentages
    const result = Array.from(cityMap.values())
      .map(city => ({
        ...city,
        percentage: (city.totalAmount / totalSpending) * 100,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching geographic spending data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
