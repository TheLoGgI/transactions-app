"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, TrendingUp, PieChart } from "lucide-react"
import Link from "next/link"

export function EmptyDashboard() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 py-8">
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="mb-8">
            <TrendingUp className="w-20 h-20 mx-auto text-muted-foreground mb-6" />
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Welcome to Your Financial Dashboard
            </h1>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
              Start tracking your expenses by uploading your transaction data
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 max-w-4xl mx-auto">
          <Card className="p-6 border-primary/20 hover:border-primary/40 transition-colors">
            <div className="text-center">
              <Upload className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-3 text-lg">Upload Transactions</h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Import your bank transaction data to get started with expense tracking
              </p>
              <Badge variant="secondary" className="text-xs">JSON Format</Badge>
            </div>
          </Card>

          <Card className="p-6 border-primary/20 hover:border-primary/40 transition-colors">
            <div className="text-center">
              <PieChart className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-3 text-lg">Track Spending</h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Categorize expenses and monitor your spending patterns over time
              </p>
              <Badge variant="secondary" className="text-xs">Categories</Badge>
            </div>
          </Card>

          <Card className="p-6 border-primary/20 hover:border-primary/40 transition-colors">
            <div className="text-center">
              <TrendingUp className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-3 text-lg">Budget Management</h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Set monthly budgets and get insights into your financial habits
              </p>
              <Badge variant="secondary" className="text-xs">Budgets</Badge>
            </div>
          </Card>

          <Card className="p-6 border-primary/20 hover:border-primary/40 transition-colors">
            <div className="text-center">
              <FileText className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-3 text-lg">Monthly Reports</h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Generate detailed reports and visualizations of your spending
              </p>
              <Badge variant="secondary" className="text-xs">Analytics</Badge>
            </div>
          </Card>
        </div>

        <div className="text-center space-y-6">
          <Link href="/onboarding" className="block">
            <Button size="lg" className="text-lg px-8 py-6 h-auto">
              <Upload className="w-5 h-5 mr-3" />
              Get Started
            </Button>
          </Link>
          
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Ready to upload your transaction data? Start the onboarding process to import your financial data and begin tracking your expenses.
          </p>
        </div>
      </div>
    </div>
  )
}
