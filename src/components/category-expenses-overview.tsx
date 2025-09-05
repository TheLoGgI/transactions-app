"use client";

import { useState } from "react";
import useSWR from "swr";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Loader2, TrendingDown, Receipt, Calendar } from "lucide-react";

interface Category {
  id: number;
  name: string;
  color: string;
}

interface Transaction {
  id: string;
  amount: number;
  createdAt: string;
  currencyCode: string;
  transactionType: string;
  merchant?: {
    id: string;
    name: string;
    city: string;
  } | null;
  Sender?: {
    id: string;
    name: string;
    city: string;
  } | null;
  subcategory?: {
    id: number;
    name: string;
    category?: {
      id: number;
      name: string;
      color: string;
    } | null;
  } | null;
}

interface MerchantSummary {
  name: string;
  totalAmount: number;
  transactionCount: number;
  type: 'merchant' | 'sender';
}

interface CategoryExpensesData {
  transactions: Transaction[];
  merchantSummary: MerchantSummary[];
  totalExpenses: number;
  transactionCount: number;
  categoryId: number;
}

interface CategoryExpensesOverviewProps {
  query: string; // Date range query string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function CategoryExpensesOverview({ query }: CategoryExpensesOverviewProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  // Fetch categories for dropdown
  const { data: categories } = useSWR<Category[]>(
    "/api/categories",
    fetcher
  );

  // Fetch category expenses data
  const { data: expensesData, isLoading: expensesLoading, isValidating } = useSWR<CategoryExpensesData>(
    selectedCategoryId ? `/api/transactions/category/${selectedCategoryId}${query}` : null,
    fetcher
  );

  const formatCurrency = (amount: number) => {
    return Math.abs(amount).toLocaleString("da-DK", { 
      style: "currency", 
      currency: "DKK" 
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("da-DK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const selectedCategory = categories?.find(cat => cat.id.toString() === selectedCategoryId);

  const isDataLoading = expensesLoading || (isValidating && expensesData === undefined);

  return (
    <div className="space-y-6">
      {/* Category Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Category Expense Investigation
          </CardTitle>
          <CardDescription>
            Select a category to view detailed expense breakdown and transaction history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="w-full max-w-sm">
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category to investigate" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-3 w-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCategory && expensesData && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border">
                  <TrendingDown className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Expenses</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(expensesData.totalExpenses)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border">
                  <Receipt className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Transactions</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {expensesData.transactionCount}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border">
                  <Calendar className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Average per Transaction</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(expensesData.totalExpenses / expensesData.transactionCount)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedCategoryId && (
        <>
          {/* Merchant/Sender Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Top Merchants & Senders</CardTitle>
              <CardDescription>
                Breakdown of expenses by merchant and sender for {selectedCategory?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isDataLoading ? (
                <div className="flex items-center justify-center h-32 space-x-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="text-muted-foreground">Loading merchant data...</span>
                </div>
              ) : expensesData?.merchantSummary ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Transactions</TableHead>
                      <TableHead className="text-right">Total Amount</TableHead>
                      <TableHead className="text-right">Average</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expensesData.merchantSummary.slice(0, 10).map((merchant, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{merchant.name}</TableCell>
                        <TableCell>
                          <Badge variant={merchant.type === 'merchant' ? 'default' : 'secondary'}>
                            {merchant.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{merchant.transactionCount}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(merchant.totalAmount)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(merchant.totalAmount / merchant.transactionCount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">No data available</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Latest transactions for {selectedCategory?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isDataLoading ? (
                <div className="flex items-center justify-center h-32 space-x-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="text-muted-foreground">Loading transactions...</span>
                </div>
              ) : expensesData?.transactions ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Subcategory</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expensesData.transactions.slice(0, 20).map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                        <TableCell className="font-medium">
                          {transaction.merchant?.name ?? transaction.Sender?.name ?? 'Unknown'}
                        </TableCell>
                        <TableCell>
                          {transaction.subcategory?.name ? (
                            <Badge variant="outline">
                              {transaction.subcategory.name}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">No subcategory</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">No transactions found</p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
