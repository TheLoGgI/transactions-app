"use client";

import { useState } from "react";
import useSWR from "swr";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Loader2, Store, MapPin, Calendar, TrendingUp } from "lucide-react";
import { Progress } from "./ui/progress";
import { LoadingState, EmptyState } from "./loading-states";

interface MerchantSummary {
  name: string;
  city: string;
  country: string;
  totalAmount: number;
  transactionCount: number;
  averageTransaction: number;
  type: 'merchant' | 'sender';
  categoryCode?: string;
  percentage: number;
}

interface TopMerchantsAnalysisProps {
  query: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function TopMerchantsAnalysis({ query }: TopMerchantsAnalysisProps) {
  const [sortBy, setSortBy] = useState<'amount' | 'count' | 'average'>('amount');
  const [limit, setLimit] = useState('10');

  const { data, error, isLoading } = useSWR<MerchantSummary[]>(
      `/api/analysis/merchants?${query}&sortBy=${sortBy}&limit=${limit}`,
      fetcher
    ) as { data: MerchantSummary[] | undefined; error: unknown; isLoading: boolean };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Top Merchants Analysis
          </CardTitle>
          <CardDescription>Error loading merchant data</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const maxAmount = data ? Math.max(...data.map(m => m.totalAmount)) : 0;
  console.log('maxAmount: ', maxAmount);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Top Merchants Analysis
          </CardTitle>
          <CardDescription>
            Discover where you spend the most money and identify spending patterns
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={(value: 'amount' | 'count' | 'average') => setSortBy(value)} disabled={isLoading}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="amount">By Amount</SelectItem>
              <SelectItem value="count">By Frequency</SelectItem>
              <SelectItem value="average">By Average</SelectItem>
            </SelectContent>
          </Select>
          <Select value={limit} onValueChange={setLimit} disabled={isLoading}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">Top 5</SelectItem>
              <SelectItem value="10">Top 10</SelectItem>
              <SelectItem value="20">Top 20</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-[400px] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div className="text-center space-y-1">
                <p className="text-sm font-medium">Loading merchant data...</p>
                <p className="text-xs text-muted-foreground">
                  Analyzing your spending patterns and top merchants
                </p>
              </div>
            </div>
          </div>
        ) : data && data.length > 0 ? (
          <div className="space-y-4 relative">
            {isLoading && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Total Spent</TableHead>
                  <TableHead className="text-right">Transactions</TableHead>
                  <TableHead className="text-right">Avg. Transaction</TableHead>
                  <TableHead className="text-right">% of Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((merchant, index) => (
                  <TableRow key={`${merchant.name}-${merchant.city}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                          {merchant.type === 'merchant' ? (
                            <Store className="h-4 w-4 text-primary" />
                          ) : (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{merchant.name}</div>
                          <div className="text-xs text-muted-foreground">
                            #{index + 1} {merchant.type}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{merchant.city}</span>
                        {merchant.country && (
                          <Badge variant="outline" className="text-xs">
                            {merchant.country}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="space-y-1">
                        <div className="font-medium">
                          {merchant.totalAmount.toLocaleString("da-DK", { 
                            style: "currency", 
                            currency: "DKK" 
                          })}
                        </div>
                        <Progress 
                          value={(merchant.totalAmount / maxAmount) * 100} 
                          className="h-1 w-20 ml-auto"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span>{merchant.transactionCount}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {merchant.averageTransaction.toLocaleString("da-DK", { 
                        style: "currency", 
                        currency: "DKK" 
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">
                        {merchant.percentage.toFixed(1)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <EmptyState 
            title="No merchant data available"
            description="No spending data found for the selected period. Try adjusting your date range."
            height="h-[300px]"
          />
        )}
      </CardContent>
    </Card>
  );
}
