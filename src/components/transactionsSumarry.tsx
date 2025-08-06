"use client"

import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

interface TransactionsSummaryResponse {
  stats: {
    expenses: {
      totalExpenses: number | null;
      transactionsCount: number;
    };
    income: {
      totalIncome: number | null;
      transactionsCount: number;
    };
  };
  isStale: boolean
}


export function TransactionsSummary({stats, isStale}: TransactionsSummaryResponse) {

 const totalIncome = stats?.income.totalIncome ?? 0
 const totalExpenses = stats?.expenses.totalExpenses ?? 0
  
    return (
      <div className="relative">
          {isStale && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-sm font-medium">Updating dashboard...</span>
              </div>
            </div>
          )}

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Samlet indkomst</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{totalIncome.toLocaleString("da-DK", { style: "currency", currency: "DKK" })}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.income.transactionsCount}{" "}
                indkomsttransaktioner
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Samlede udgifter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{totalExpenses.toLocaleString("da-DK", { style: "currency", currency: "DKK" })}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.expenses.transactionsCount}{" "}
                udgiftstransaktioner
                {totalIncome > 0 && ` (${Math.abs(((totalExpenses / totalIncome) * 100)).toFixed(1)}% af indkomst)`}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Nettoindkomst</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${totalIncome + totalExpenses >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {(totalIncome + totalExpenses).toLocaleString("da-DK", { style: "currency", currency: "DKK" })}

              </div>
              <p className="text-xs text-muted-foreground">
                {totalIncome + totalExpenses >= 0 ? "Overskud" : "Underskud"}
                {totalIncome > 0 && ` (${(((totalIncome + totalExpenses) / totalIncome) * 100).toFixed(1)}% af indkomst)`}
              </p>
            </CardContent>
          </Card>
        </div>
        </div>
    )
}