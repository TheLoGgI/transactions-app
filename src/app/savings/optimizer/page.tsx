"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Lightbulb, ArrowRight } from "lucide-react"

interface BudgetOptimization {
  category: string
  currentSpending: number
  budgetAmount: number
  averageSpending: number
  recommendation: string
  potentialSavings: number
  priority: 'high' | 'medium' | 'low'
  status: 'over' | 'warning' | 'good'
}

// Mock data
const mockOptimizations: BudgetOptimization[] = [
  {
    category: 'Dining Out',
    currentSpending: 3500,
    budgetAmount: 2500,
    averageSpending: 2800,
    recommendation: 'You\'re spending 40% more than budget. Try cooking at home 2-3 more times per week.',
    potentialSavings: 1000,
    priority: 'high',
    status: 'over'
  },
  {
    category: 'Transportation',
    currentSpending: 1200,
    budgetAmount: 1500,
    averageSpending: 1400,
    recommendation: 'Good control! Consider using public transport more to save even more.',
    potentialSavings: 200,
    priority: 'low',
    status: 'good'
  },
  {
    category: 'Entertainment',
    currentSpending: 2200,
    budgetAmount: 2000,
    averageSpending: 1800,
    recommendation: 'Slightly over budget. Look for free entertainment options this month.',
    potentialSavings: 400,
    priority: 'medium',
    status: 'warning'
  },
  {
    category: 'Shopping',
    currentSpending: 4500,
    budgetAmount: 3000,
    averageSpending: 3200,
    recommendation: 'Significant overspending. Implement a 24-hour waiting period before purchases.',
    potentialSavings: 1500,
    priority: 'high',
    status: 'over'
  },
]

export default function BudgetOptimizerPage() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'over': return <AlertTriangle className="h-5 w-5 text-red-500" />
      case 'warning': return <TrendingUp className="h-5 w-5 text-orange-500" />
      case 'good': return <CheckCircle className="h-5 w-5 text-green-500" />
      default: return <AlertTriangle className="h-5 w-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'over': return 'destructive'
      case 'warning': return 'secondary'
      case 'good': return 'default'
      default: return 'default'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'default'
    }
  }

  const totalPotentialSavings = mockOptimizations.reduce((sum, opt) => sum + opt.potentialSavings, 0)

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Budget Optimizer</h1>
          <p className="text-muted-foreground">
            Identify opportunities to optimize your spending and increase your savings.
          </p>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Potential Monthly Savings</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {totalPotentialSavings.toLocaleString("da-DK", { style: "currency", currency: "DKK" })}
              </div>
              <p className="text-xs text-muted-foreground">
                By following optimization recommendations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories Over Budget</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {mockOptimizations.filter(opt => opt.status === 'over').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Need immediate attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Annual Savings Potential</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {(totalPotentialSavings * 12).toLocaleString("da-DK", { style: "currency", currency: "DKK" })}
              </div>
              <p className="text-xs text-muted-foreground">
                Yearly optimization impact
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Optimization Recommendations */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Optimization Recommendations</h2>
          
          {mockOptimizations
            .sort((a, b) => {
              const priorityOrder = { high: 3, medium: 2, low: 1 }
              return priorityOrder[b.priority] - priorityOrder[a.priority]
            })
            .map((optimization) => {
              const percentageUsed = (optimization.currentSpending / optimization.budgetAmount) * 100

              return (
                <Card key={optimization.category} className="relative overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(optimization.status)}
                        <div>
                          <CardTitle className="text-lg">{optimization.category}</CardTitle>
                          <CardDescription>
                            Current: {optimization.currentSpending.toLocaleString("da-DK", { style: "currency", currency: "DKK" })} | 
                            Budget: {optimization.budgetAmount.toLocaleString("da-DK", { style: "currency", currency: "DKK" })}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={getPriorityColor(optimization.priority)}>
                          {optimization.priority} priority
                        </Badge>
                        <Badge variant={getStatusColor(optimization.status)}>
                          {optimization.status === 'over' ? 'Over Budget' : 
                           optimization.status === 'warning' ? 'Warning' : 'On Track'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Budget Usage</span>
                        <span className={`font-medium ${percentageUsed > 100 ? 'text-red-600' : 
                                        percentageUsed > 80 ? 'text-orange-600' : 'text-green-600'}`}>
                          {percentageUsed.toFixed(1)}%
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(percentageUsed, 100)} 
                        className="h-2"
                      />
                      {percentageUsed > 100 && (
                        <div className="text-xs text-red-600">
                          {(percentageUsed - 100).toFixed(1)}% over budget
                        </div>
                      )}
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium text-blue-900 mb-1">Recommendation</h4>
                          <p className="text-sm text-blue-800 mb-2">{optimization.recommendation}</p>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-blue-600">Potential savings:</span>
                            <span className="font-medium text-green-600">
                              {optimization.potentialSavings.toLocaleString("da-DK", { style: "currency", currency: "DKK" })}
                            </span>
                            <span className="text-blue-600">per month</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <div className="text-sm text-muted-foreground">
                        Average spending: {optimization.averageSpending.toLocaleString("da-DK", { style: "currency", currency: "DKK" })}
                      </div>
                      <Button size="sm" variant="outline">
                        View Details
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
        </div>

        {/* Action Items */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Action Items</CardTitle>
            <CardDescription>
              Start with these high-impact changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div className="flex-1">
                  <p className="font-medium">Reduce dining out by 30%</p>
                  <p className="text-sm text-muted-foreground">Potential savings: 1,000 DKK/month</p>
                </div>
                <Button size="sm">Set Goal</Button>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border">
                <TrendingDown className="h-5 w-5 text-orange-600" />
                <div className="flex-1">
                  <p className="font-medium">Implement shopping wait time</p>
                  <p className="text-sm text-muted-foreground">Potential savings: 1,500 DKK/month</p>
                </div>
                <Button size="sm">Create Rule</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
