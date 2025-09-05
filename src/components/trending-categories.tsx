"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

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

interface TrendingCategoriesProps {
  query: string; // Date range query string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function TrendingCategories({ query }: TrendingCategoriesProps) {
  const { data: trendingData, isLoading, isValidating } = useSWR<TrendingCategory[]>(
    `/api/transactions/trending-categories${query}`,
    fetcher
  );

  const formatCurrency = (amount: number) => {
    return Math.abs(amount).toLocaleString("da-DK", { 
      style: "currency", 
      currency: "DKK" 
    });
  };

  const chartData = useMemo(() => {
    if (!trendingData || trendingData.length === 0) return [];
    
    // Get all unique periods from the data
    const allPeriods = trendingData[0]?.timeSeriesData.map(item => item.period) ?? [];
    
    // Transform data for multi-line chart
    return allPeriods.map(period => {
      const dataPoint: Record<string, number | string> = { period };
      
      trendingData.forEach(category => {
        const periodData = category.timeSeriesData.find(item => item.period === period);
        const categoryKey = category.name.length > 12 ? category.name.substring(0, 12) + "..." : category.name;
        dataPoint[categoryKey] = periodData?.amount ?? 0;
      });
      
      return dataPoint;
    });
  }, [trendingData]);

  const isDataLoading = isLoading || (isValidating && trendingData === undefined);

  if (isDataLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Trending Categories</CardTitle>
          <CardDescription>Most expensive categories and their trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!trendingData || trendingData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Trending Categories</CardTitle>
          <CardDescription>Most expensive categories and their trends</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No trending data available for the selected period.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top 5 Trending Categories
          </CardTitle>
          <CardDescription>
            Most expensive categories compared to the previous period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Current Period</TableHead>
                  <TableHead className="text-right">Previous Period</TableHead>
                  <TableHead className="text-right">Change</TableHead>
                  <TableHead className="text-right">Transactions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trendingData.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="truncate">{category.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(category.currentPeriodTotal)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {category.previousPeriodTotal > 0 
                        ? formatCurrency(category.previousPeriodTotal)
                        : "—"
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {category.isIncreasing ? (
                          <TrendingUp className="h-4 w-4 text-red-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-green-500" />
                        )}
                        <Popover>
                          <PopoverTrigger asChild>
                            <Badge 
                              variant={category.isIncreasing ? "destructive" : "secondary"}
                              className="font-mono cursor-pointer hover:opacity-80 transition-opacity"
                            >
                              {category.percentageChange > 0 ? "+" : ""}
                              {category.percentageChange.toFixed(1)}%
                            </Badge>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <div className="space-y-2">
                              <h4 className="font-medium leading-none">Change Details</h4>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Current Period:</span>
                                  <span className="font-medium">{formatCurrency(category.currentPeriodTotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Previous Period:</span>
                                  <span className="font-medium">
                                    {category.previousPeriodTotal > 0 
                                      ? formatCurrency(category.previousPeriodTotal)
                                      : "No data"
                                    }
                                  </span>
                                </div>
                                <div className="flex justify-between border-t pt-1">
                                  <span className="text-muted-foreground">Difference:</span>
                                  <span className={`font-medium ${category.isIncreasing ? "text-red-500" : "text-green-500"}`}>
                                    {category.currentPeriodTotal - category.previousPeriodTotal > 0 ? "+" : ""}
                                    {formatCurrency(category.currentPeriodTotal - category.previousPeriodTotal)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Percentage Change:</span>
                                  <span className={`font-medium ${category.isIncreasing ? "text-red-500" : "text-green-500"}`}>
                                    {category.percentageChange > 0 ? "+" : ""}
                                    {category.percentageChange.toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {category.transactionsCount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trending Categories Over Time</CardTitle>
          <CardDescription>
            Top 5 categories spending trends over the last 6 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="period" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                  fontSize={12}
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickLine={{ stroke: "hsl(var(--border))" }}
                />
                <YAxis 
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  fontSize={12}
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickLine={{ stroke: "hsl(var(--border))" }}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    formatCurrency(value),
                    name
                  ]}
                  labelFormatter={(label) => `Period: ${String(label)}`}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    color: "hsl(var(--card-foreground))",
                    boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)",
                    backdropFilter: "blur(16px) saturate(180%)",
                    padding: "16px 20px",
                    minWidth: "200px",
                    background: "linear-gradient(135deg, hsl(var(--card) / 0.95) 0%, hsl(var(--card) / 0.85) 100%)",
                  }}
                  labelStyle={{ 
                    color: "hsl(var(--card-foreground))",
                    fontWeight: "700",
                    marginBottom: "12px",
                    fontSize: "14px",
                    borderBottom: "1px solid hsl(var(--border))",
                    paddingBottom: "8px"
                  }}
                  itemStyle={{
                    color: "hsl(var(--card-foreground))",
                    padding: "4px 0",
                    fontSize: "13px",
                    fontWeight: "500"
                  }}
                  wrapperStyle={{
                    outline: "none",
                    filter: "drop-shadow(0 8px 16px rgb(0 0 0 / 0.15))",
                    zIndex: 1000
                  }}
                />
                <Legend 
                  wrapperStyle={{ color: "hsl(var(--foreground))" }}
                />
                {trendingData?.map((category) => {
                  const categoryKey = category.name.length > 12 ? category.name.substring(0, 12) + "..." : category.name;
                  return (
                    <Line 
                      key={category.id}
                      type="monotone"
                      dataKey={categoryKey} 
                      name={category.name}
                      stroke={category.color}
                      strokeWidth={3}
                      dot={{ fill: category.color, strokeWidth: 2, r: 4 }}
                      activeDot={{ 
                        r: 6, 
                        stroke: category.color, 
                        strokeWidth: 2, 
                        fill: "hsl(var(--background))",
                        style: { filter: `drop-shadow(0 2px 4px ${category.color}30)` }
                      }}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
