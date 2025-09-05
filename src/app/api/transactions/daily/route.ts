import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface DailyTransactionData {
  date: string;
  hasTransactions: boolean;
  transactionCount: number;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const paramFrom = url.searchParams.get("from");
  const paramTo = url.searchParams.get("to");

  let fromDate = paramFrom ? new Date(paramFrom) : null;
  let toDate = paramTo ? new Date(paramTo) : null;

  if (!fromDate || !toDate) {
    const today = new Date();
    fromDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    toDate = new Date(today.getFullYear(), today.getMonth(), 0);
  }

  // Get transactions grouped by date
  const transactions = await prisma.transaction.groupBy({
    by: ['createdAt'],
    _count: {
      id: true,
    },
    where: {
      createdAt: {
        gte: fromDate,
        lte: toDate,
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  // Create a map of dates with transaction counts
  const transactionDates = new Map<string, number>();
  transactions.forEach(transaction => {
    const dateStr = transaction.createdAt.toISOString().split('T')[0];
    if (dateStr) {
      transactionDates.set(dateStr, transaction._count.id);
    }
  });

  // Generate all dates in the range and mark which have transactions
  const dailyData: DailyTransactionData[] = [];
  const currentDate = new Date(fromDate);
  
  while (currentDate <= toDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    if (dateStr) {
      const transactionCount = transactionDates.get(dateStr) ?? 0;
      
      dailyData.push({
        date: dateStr,
        hasTransactions: transactionCount > 0,
        transactionCount,
      });
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return new Response(JSON.stringify(dailyData), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
