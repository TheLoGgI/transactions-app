import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export interface TransactionRange {
    firstInRange: Date | null;
    lastInRange: Date | null;
}

export const transactionsGeneralAPI = `/api/transactions/general`


export async function GET(request: Request) {
  const url = new URL(request.url);
  const paramFrom = url.searchParams.get("from");
  const paramTo = url.searchParams.get("to");

  let fromDate = paramFrom ? new Date(paramFrom) : null;
  let toDate = paramTo ? new Date(paramTo) : null;

  if (!fromDate || !toDate) {
    const today = new Date();
    fromDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    toDate = today;
  }

  const firstInRange = await prisma.transaction.findFirst({
    select: {
      createdAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const lastInRange = await prisma.transaction.findFirst({
    select: {
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return new Response(
    JSON.stringify({
      firstInRange: firstInRange?.createdAt ?? null,
      lastInRange: lastInRange?.createdAt ?? null,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
}