import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { categoryId: string } }) {
  const url = new URL(request.url);
  const paramFrom = url.searchParams.get("from");
  const paramTo = url.searchParams.get("to");
  const categoryId = parseInt(params.categoryId);

  let fromDate = paramFrom ? new Date(paramFrom) : null;
  let toDate = paramTo ? new Date(paramTo) : null;

  if (!fromDate || !toDate) {
    const today = new Date();
    fromDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    toDate = today;
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      createdAt: {
        gte: fromDate,
        lte: toDate,
      },
      agent: "RECEIVER",
      OR: [
        {
          subcategory: {
            categoryId: categoryId
          }
        },
        {
          categoryId: categoryId
        }
      ]
    },
    select: {
      id: true,
      amount: true,
      createdAt: true,
      currencyCode: true,
      transactionType: true,
      merchant: {
        select: {
          id: true,
          name: true,
          city: true,
        },
      },
      Sender: {
        select: {
          id: true,
          name: true,
          city: true,
        },
      },
      subcategory: {
        select: {
          id: true,
          name: true,
          category: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        }
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Group transactions by merchant/sender for summary
  const merchantSummary = new Map<string, {
    name: string;
    totalAmount: number;
    transactionCount: number;
    type: 'merchant' | 'sender';
  }>();

  transactions.forEach(transaction => {
    const key = transaction.merchant?.name ?? transaction.Sender?.name ?? 'Unknown';
    const type = transaction.merchant ? 'merchant' : 'sender';
    
    if (merchantSummary.has(key)) {
      const existing = merchantSummary.get(key)!;
      existing.totalAmount += Math.abs(transaction.amount);
      existing.transactionCount += 1;
    } else {
      merchantSummary.set(key, {
        name: key,
        totalAmount: Math.abs(transaction.amount),
        transactionCount: 1,
        type,
      });
    }
  });

  const sortedMerchantSummary = Array.from(merchantSummary.values())
    .sort((a, b) => b.totalAmount - a.totalAmount);

  // Calculate total expenses for this category
  const totalExpenses = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return new Response(JSON.stringify({
    transactions,
    merchantSummary: sortedMerchantSummary,
    totalExpenses,
    transactionCount: transactions.length,
    categoryId,
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
