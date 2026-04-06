"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Loader2, TrendingDown, Receipt, Banknote, RotateCcw } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

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
  returnCount: number;
  returnTotal: number;
  transactionCount: number;
  type: 'merchant' | 'sender';
}

interface CategoryExpensesData {
  transactions: Transaction[];
  merchantSummary: MerchantSummary[];
  totalExpenses: number;
  totalReturns: number;
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

  // Default to the first category once loaded
  useEffect(() => {
    if (categories && categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0]!.id.toString()) // Ignore type !
    }
  }, [categories, selectedCategoryId])

  // Fetch category expenses data
  const { data: expensesData, isLoading: expensesLoading, isValidating } = useSWR<CategoryExpensesData>(
    selectedCategoryId ? `/api/transactions/category/${selectedCategoryId}${query}` : null,
    fetcher
  );

  const formatCurrency = (amount: number) => {
    const safe = Number(amount)
    return Math.abs(safe || 0).toLocaleString("da-DK", { 
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
      {/* Category selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Kategori udgifter
          </CardTitle>
          <CardDescription>
            Vælg en kategori for at se en detaljeret udgiftsoversigt og transaktionshistorik.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full max-w-sm">
            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Vælg en kategori" />
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
        </CardContent>
      </Card>

      {selectedCategoryId && (
        <>
          {/* Summary stats */}
          {isDataLoading ? (
            <div className="flex items-center justify-center h-32 space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-muted-foreground">Indlæser data...</span>
            </div>
          ) : expensesData && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border">
                <TrendingDown className="h-8 w-8 text-red-500 shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Samlede udgifter</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    -{formatCurrency(expensesData.totalExpenses)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border">
                <RotateCcw className="h-8 w-8 text-green-500 shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Samlede returneringer</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    +{formatCurrency(expensesData.totalReturns)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border">
                <Receipt className="h-8 w-8 text-blue-500 shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Transaktioner</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {expensesData.transactionCount}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border">
                <Banknote className="h-8 w-8 text-orange-500 shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Nettoudgift</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {formatCurrency(expensesData.totalExpenses - expensesData.totalReturns)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Merchant / sender breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Top handlende og afsendere</CardTitle>
              <CardDescription>
                Udgiftsopdeling pr. handlende og afsender for {selectedCategory?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isDataLoading ? (
                <div className="flex items-center justify-center h-32 space-x-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="text-muted-foreground">Indlæser...</span>
                </div>
              ) : expensesData?.merchantSummary?.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Navn</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Transaktioner</TableHead>
                      <TableHead className="text-right">Returneringer</TableHead>
                      <TableHead className="text-right">Samlet forbrug</TableHead>
                      <TableHead className="text-right">Gennemsnit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expensesData.merchantSummary.slice(0, 10).map((merchant, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{merchant.name}</TableCell>
                        <TableCell>
                          <Badge variant={merchant.type === 'merchant' ? 'default' : 'secondary'}>
                            {merchant.type === 'merchant' ? 'Handlende' : 'Afsender'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {merchant.transactionCount - merchant.returnCount}
                        </TableCell>
                        <TableCell className="text-right">
                          {merchant.returnCount > 0 ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge variant="outline" className="text-green-600 border-green-400 text-xs cursor-default flex items-center gap-1 ml-auto w-fit">
                                    <RotateCcw className="h-3 w-3" />
                                    {merchant.returnCount} · +{formatCurrency(merchant.returnTotal)}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {merchant.returnCount} returnering{merchant.returnCount > 1 ? 'er' : ''} på i alt +{formatCurrency(merchant.returnTotal)}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          -{formatCurrency(merchant.totalAmount)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(merchant.totalAmount / (merchant.transactionCount - merchant.returnCount || 1))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">Ingen data tilgængeligt</p>
              )}
            </CardContent>
          </Card>

          {/* Transaction list */}
          <Card>
            <CardHeader>
              <CardTitle>Seneste transaktioner</CardTitle>
              <CardDescription>
                Nyeste transaktioner for {selectedCategory?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isDataLoading ? (
                <div className="flex items-center justify-center h-32 space-x-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="text-muted-foreground">Indlæser...</span>
                </div>
              ) : expensesData?.transactions?.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dato</TableHead>
                      <TableHead>Beskrivelse</TableHead>
                      <TableHead>Underkategori</TableHead>
                      <TableHead className="text-right">Beløb</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expensesData.transactions.slice(0, 20).map((transaction) => {
                      const isReturn = transaction.amount > 0;
                      return (
                        <TableRow key={transaction.id}>
                          <TableCell className="text-muted-foreground">{formatDate(transaction.createdAt)}</TableCell>
                          <TableCell className="font-medium">
                            {transaction.merchant?.name ?? transaction.Sender?.name ?? 'Ukendt'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {transaction.subcategory?.name ? (
                                <Badge variant="outline">{transaction.subcategory.name}</Badge>
                              ) : (
                                <span className="text-muted-foreground text-sm">Ingen underkategori</span>
                              )}
                              {isReturn && (
                                <Badge variant="outline" className="text-green-600 border-green-400">
                                  Returnering
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className={`text-right font-medium ${isReturn ? 'text-green-600 dark:text-green-400' : ''}`}>
                            {isReturn ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">Ingen transaktioner fundet</p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
