"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FinancialHealthScoreCard } from "@/components/financial-health-score-card"
import { SpendingBenchmarksCard } from "@/components/spending-benchmarks-card"
import { 
  TrendingUp, 
  TrendingDown, 
  Heart, 
  DollarSign, 
  PieChart, 
  Target,
  AlertCircle,
  CheckCircle,
  Info,
  ArrowUp,
  ArrowDown
} from "lucide-react"

interface FinancialHealthMetrics {
  savingsRate: number
  expenseToIncomeRatio: number
  emergencyFundMonths: number
  debtToIncomeRatio: number
  investmentRate: number
  budgetAdherence: number
  overallScore: number
  monthlyIncome: number
  monthlyExpenses: number
  monthlySavings: number
  emergencyFund: number
  monthlyFixedExpenses: number
}

// Mock data - in real app, this would come from API
const mockMetrics: FinancialHealthMetrics = {
  savingsRate: 22.5,
  expenseToIncomeRatio: 77.5,
  emergencyFundMonths: 4.2,
  debtToIncomeRatio: 15.0,
  investmentRate: 8.5,
  budgetAdherence: 85.2,
  overallScore: 78,
  monthlyIncome: 45000,
  monthlyExpenses: 34875,
  monthlySavings: 10125,
  emergencyFund: 146700,
  monthlyFixedExpenses: 28000
}

export default function FinancialHealthPage() {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getHealthStatus = (score: number) => {
    if (score >= 80) return { label: 'Excellent', icon: CheckCircle, color: 'text-green-600' }
    if (score >= 60) return { label: 'Good', icon: Info, color: 'text-yellow-600' }
    return { label: 'Needs Attention', icon: AlertCircle, color: 'text-red-600' }
  }

  const getCategoryStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'poor': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const calculateNetWorth = () => {
    // Mock calculation - in real app, would include assets and liabilities
    const assets = mockMetrics.emergencyFund + 150000 // Assuming some other assets
    const liabilities = (mockMetrics.monthlyIncome * mockMetrics.debtToIncomeRatio / 100) * 12
    return assets - liabilities
  }

  const healthStatus = getHealthStatus(mockMetrics.overallScore)

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Financial Health Metrics</h1>
          <p className="text-muted-foreground">
            Monitor your overall financial wellness and track key performance indicators.
          </p>
        </header>

        {/* Overall Health Score */}
        <Card className="relative overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-6 w-6 text-red-500" />
                  Financial Wellness Score
                </CardTitle>
                <CardDescription>Your overall financial health assessment</CardDescription>
              </div>
              <div className="text-right">
                <div className={`text-4xl font-bold ${getScoreColor(mockMetrics.overallScore)}`}>
                  {mockMetrics.overallScore}
                </div>
                <div className="text-sm text-muted-foreground">out of 100</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Progress value={mockMetrics.overallScore} className="flex-1 mr-4" />
              <Badge variant="outline" className={`${getCategoryStatusColor(mockMetrics.overallScore >= 80 ? 'good' : mockMetrics.overallScore >= 60 ? 'warning' : 'poor')}`}>
                <healthStatus.icon className="h-4 w-4 mr-1" />
                {healthStatus.label}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {mockMetrics.savingsRate.toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground">Savings Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {mockMetrics.emergencyFundMonths.toFixed(1)}
                </p>
                <p className="text-sm text-muted-foreground">Emergency Fund (Months)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {mockMetrics.budgetAdherence.toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground">Budget Adherence</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Savings Rate */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Savings Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{mockMetrics.savingsRate.toFixed(1)}%</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <ArrowUp className="h-3 w-3 text-green-500" />
                <span>+2.1% from last month</span>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {mockMetrics.monthlySavings.toLocaleString("da-DK", { style: "currency", currency: "DKK" })} saved monthly
              </div>
            </CardContent>
          </Card>

          {/* Expense to Income Ratio */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expense-to-Income Ratio</CardTitle>
              <PieChart className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{mockMetrics.expenseToIncomeRatio.toFixed(1)}%</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <ArrowDown className="h-3 w-3 text-green-500" />
                <span>-1.5% from last month</span>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Target: &lt;70% for optimal health
              </div>
            </CardContent>
          </Card>

          {/* Emergency Fund */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Emergency Fund</CardTitle>
              <Target className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{mockMetrics.emergencyFundMonths.toFixed(1)} months</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <ArrowUp className="h-3 w-3 text-green-500" />
                <span>+0.3 months from last month</span>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {mockMetrics.emergencyFund.toLocaleString("da-DK", { style: "currency", currency: "DKK" })} total
              </div>
            </CardContent>
          </Card>

          {/* Debt to Income */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Debt-to-Income Ratio</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{mockMetrics.debtToIncomeRatio.toFixed(1)}%</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <ArrowDown className="h-3 w-3 text-green-500" />
                <span>-2.0% from last month</span>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Target: &lt;20% for healthy finances
              </div>
            </CardContent>
          </Card>

          {/* Investment Rate */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Investment Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{mockMetrics.investmentRate.toFixed(1)}%</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <ArrowUp className="h-3 w-3 text-green-500" />
                <span>+1.2% from last month</span>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {((mockMetrics.monthlyIncome * mockMetrics.investmentRate) / 100).toLocaleString("da-DK", { style: "currency", currency: "DKK" })} invested monthly
              </div>
            </CardContent>
          </Card>

          {/* Net Worth */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estimated Net Worth</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {calculateNetWorth().toLocaleString("da-DK", { style: "currency", currency: "DKK" })}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <ArrowUp className="h-3 w-3 text-green-500" />
                <span>+8.4% from last month</span>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Assets - Liabilities
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Health Score Breakdown */}
        <FinancialHealthScoreCard />

        {/* Category Breakdown */}
        <SpendingBenchmarksCard />

        {/* Improvement Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Improvement Recommendations</CardTitle>
            <CardDescription>
              Actionable steps to improve your financial health score
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-red-900">Reduce Shopping Expenses</h4>
                  <p className="text-sm text-red-800 mb-2">
                    You&apos;re spending 7.8% of income on shopping vs. 5% benchmark. Reducing by 35% would improve your score by 5 points.
                  </p>
                  <Button size="sm" variant="outline">Create Spending Limit</Button>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-yellow-900">Increase Emergency Fund</h4>
                  <p className="text-sm text-yellow-800 mb-2">
                    Aim for 6 months of expenses. Adding 61,250 DKK would reach the ideal target and improve your score by 8 points.
                  </p>
                  <Button size="sm" variant="outline">Set Savings Goal</Button>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-green-900">Excellent Savings Rate</h4>
                  <p className="text-sm text-green-800">
                    Your 22.5% savings rate is excellent! Keep this up to maintain strong financial health.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
