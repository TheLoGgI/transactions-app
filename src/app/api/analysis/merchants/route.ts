import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
      const url = new URL(request.url);
    const paramFrom = url.searchParams.get("from");
    const paramTo = url.searchParams.get("to");
    const sortBy = url.searchParams.get('sortBy') ?? 'amount';
    const limit = parseInt(url.searchParams.get('limit') ?? '10');

  let fromDate = paramFrom ? new Date(paramFrom) : null;
  let toDate = paramTo ? new Date(paramTo) : null;

  if (!fromDate || !toDate) {
    const today = new Date();
    fromDate = new Date(today.getFullYear(), today.getMonth() - 12, 1)
    toDate = new Date(today.getFullYear(), today.getMonth(), 0)
  }


    // Get merchant data
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

    // Get sender data (for income/transfers)
    const senderData = await prisma.transaction.groupBy({
      by: ['senderId'],
      where: {
        senderId: { not: null },
        createdAt: {
          gte: fromDate,
          lte: toDate,
        },
        agent: 'SENDER', // Only income
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    // Get merchant details
    const merchantIds = merchantData.map(m => m.merchantId).filter((id): id is string => id !== null);
    const merchants = await prisma.merchant.findMany({
      where: {
        id: { in: merchantIds },
      },
    });

    // Get sender details
    const senderIds = senderData.map(s => s.senderId).filter((id): id is string => id !== null);
    const senders = await prisma.sender.findMany({
      where: {
        id: { in: senderIds },
      },
    });

    // Calculate total spending for percentages
    const totalSpending = merchantData.reduce((sum, item) => sum + (item._sum.amount ?? 0), 0);

    // Process merchant data
    const processedMerchants = merchantData
      .map(item => {
        const merchant = merchants.find(m => m.id === item.merchantId);
        if (!merchant || !item._sum.amount) return null;

        return {
          name: merchant.name,
          city: merchant.city,
          country: merchant.country,
          totalAmount: Math.abs(item._sum.amount), // Make positive for expenses
          transactionCount: item._count.id,
          averageTransaction: Math.abs(item._sum.amount) / item._count.id,
          type: 'merchant' as const,
          categoryCode: merchant.categoryCode,
          percentage: (Math.abs(item._sum.amount) / totalSpending) * 100,
        };
      })
      .filter(Boolean);

    // Process sender data
    const processedSenders = senderData
      .map(item => {
        const sender = senders.find(s => s.id === item.senderId);
        if (!sender || !item._sum.amount) return null;

        return {
          name: sender.name,
          city: sender.city,
          country: sender.country ?? 'Unknown',
          totalAmount: item._sum.amount,
          transactionCount: item._count.id,
          averageTransaction: item._sum.amount / item._count.id,
          type: 'sender' as const,
          percentage: (item._sum.amount / totalSpending) * 100,
        };
      })
      .filter(Boolean);

    // Combine and sort
    const allData = [...processedMerchants, ...processedSenders].filter(Boolean);

    // Sort based on criteria
    let sortedData;
    switch (sortBy) {
      case 'count':
        sortedData = allData.sort((a, b) => {
          if (!a || !b) return 0;
          return b.transactionCount - a.transactionCount;
        });
        break;
      case 'average':
        sortedData = allData.sort((a, b) => {
          if (!a && !b) return 0;
          if (!a) return 1;
          if (!b) return -1;
          return b.averageTransaction - a.averageTransaction;
        });
        break;
      default: // amount
        sortedData = allData.sort((a, b) => {
          if (!a && !b) return 0;
          if (!a) return 1;
          if (!b) return -1;
          return b.totalAmount - a.totalAmount;
        });
        break;
    }

    return NextResponse.json(sortedData.slice(0, limit));
  } catch (error) {
    console.error('Error fetching merchant analysis:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
