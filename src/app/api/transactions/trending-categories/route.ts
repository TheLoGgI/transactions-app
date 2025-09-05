import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

interface CategoryInfo {
  id: number;
  name: string;
  color: string;
}

export interface TrendingCategory {
  id: number;
  name: string;
  color: string;
  currentPeriodTotal: number;
  previousPeriodTotal: number;
  percentageChange: number;
  transactionsCount: number;
  isIncreasing: boolean;
  timeSeriesData: Array<{
    period: string;
    amount: number;
  }>;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const paramFrom = url.searchParams.get("from");
  const paramTo = url.searchParams.get("to");
  const seasonalComparison = url.searchParams.get("seasonal") === "true";

  const toDate = paramTo ? new Date(paramTo) : new Date();
  const fromDate = paramFrom ? new Date(paramFrom) : new Date(toDate.getFullYear(), toDate.getMonth() - 5, 1);

  // Calculate the duration of the requested period in months
  const monthsDifference = (toDate.getFullYear() - fromDate.getFullYear()) * 12 + 
                          (toDate.getMonth() - fromDate.getMonth()) + 1;

  // Generate periods for time series 
  const periodsCount = seasonalComparison ? Math.max(monthsDifference * 2, 18) : monthsDifference * 2;
  const periods: Array<{ start: Date; end: Date; label: string }> = [];
  for (let i = periodsCount - 1; i >= 0; i--) {
    const periodEnd = new Date(toDate.getFullYear(), toDate.getMonth() - i, 0);
    const periodStart = new Date(toDate.getFullYear(), toDate.getMonth() - i - 1, 1);
    const label = periodStart.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    periods.push({ start: periodStart, end: periodEnd, label });
  }

  if (periods.length === 0) {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Fetch transactions for all periods
  const allTransactions = await prisma.transaction.findMany({
    where: {
      createdAt: {
        gte: periods[0]!.start,
        lte: periods[periods.length - 1]!.end,
      },
      agent: "RECEIVER",
      amount: {
        lt: 0, // Only expenses (negative amounts)
      },
    },
    select: {
      amount: true,
      createdAt: true,
      category: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
      subcategory: {
        include: {
          category: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      },
    },
  });

  // Group transactions by category and period
  const categoryTimeSeriesMap = new Map<string, { 
    category: CategoryInfo; 
    periods: Map<string, number>;
    totalCurrent: number;
    totalPrevious: number;
    transactionCount: number;
  }>();

  allTransactions.forEach((transaction) => {
    const categoryId = String(transaction.subcategory?.categoryId ?? transaction.category?.id ?? 0);
    const category = transaction.subcategory?.category ?? transaction.category;
    
    if (!category) return;

    // Find which period this transaction belongs to
    const transactionDate = transaction.createdAt;
    const period = periods.find(p => transactionDate >= p.start && transactionDate <= p.end);
    
    if (!period) return;

    if (!categoryTimeSeriesMap.has(categoryId)) {
      categoryTimeSeriesMap.set(categoryId, {
        category: {
          id: category.id,
          name: category.name,
          color: category.color,
        },
        periods: new Map(),
        totalCurrent: 0,
        totalPrevious: 0,
        transactionCount: 0,
      });
    }

    const categoryData = categoryTimeSeriesMap.get(categoryId)!;
    const amount = Math.abs(transaction.amount);
    
    // Add to period total
    const periodTotal = categoryData.periods.get(period.label) ?? 0;
    categoryData.periods.set(period.label, periodTotal + amount);
    
    // Determine current and previous periods based on comparison type
    let isCurrentPeriod: boolean;
    let isPreviousPeriod: boolean;
    
    if (seasonalComparison) {
      // Option 3: Seasonal comparison (current period vs same period last year)
      const currentPeriodIndex = periods.findIndex(p => p === period);
      
      // Current period: requested duration (e.g., last 3 months)
      isCurrentPeriod = currentPeriodIndex >= periods.length - monthsDifference;
      
      // Previous period: same duration from previous year (12 months ago)
      isPreviousPeriod = currentPeriodIndex >= periods.length - monthsDifference - 12 && 
                        currentPeriodIndex <= periods.length - 13;
    } else {
      // Option 2: Sequential comparison (requested duration vs same duration before that)
      const currentPeriodIndex = periods.findIndex(p => p === period);
      
      // Current period: requested duration (e.g., last 3 months)
      isCurrentPeriod = currentPeriodIndex >= periods.length - monthsDifference;
      
      // Previous period: same duration immediately before current period
      isPreviousPeriod = currentPeriodIndex >= periods.length - (monthsDifference * 2) && 
                        currentPeriodIndex < periods.length - monthsDifference;
    }
    
    if (isCurrentPeriod) {
      categoryData.totalCurrent += amount;
      categoryData.transactionCount += 1;
    }
    if (isPreviousPeriod) {
      categoryData.totalPrevious += amount;
    }
  });

  // Convert to trending categories with time series data
  const trendingCategories: TrendingCategory[] = [];
  
  categoryTimeSeriesMap.forEach((categoryData) => {
    const currentTotal = categoryData.totalCurrent;
    const previousTotal = categoryData.totalPrevious;
    
    // Calculate percentage change
    let percentageChange = 0;
    if (previousTotal > 0) {
      percentageChange = ((currentTotal - previousTotal) / previousTotal) * 100;
    } else if (currentTotal > 0) {
      percentageChange = 100;
    }

    // Generate time series data
    const timeSeriesData = periods.map(period => ({
      period: period.label,
      amount: categoryData.periods.get(period.label) ?? 0,
    }));

    trendingCategories.push({
      id: categoryData.category.id,
      name: categoryData.category.name ?? "Unknown Category",
      color: categoryData.category.color ?? "#d1d5dc",
      currentPeriodTotal: currentTotal,
      previousPeriodTotal: previousTotal,
      percentageChange: Math.round(percentageChange * 100) / 100,
      transactionsCount: categoryData.transactionCount,
      isIncreasing: currentTotal > previousTotal,
      timeSeriesData,
    });
  });

  // Sort by current period total and get top 5
  const topTrendingCategories = trendingCategories
    .sort((a, b) => b.currentPeriodTotal - a.currentPeriodTotal)
    .slice(0, 5);

  return new Response(JSON.stringify(topTrendingCategories), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
