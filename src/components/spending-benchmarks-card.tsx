"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from "lucide-react"

interface SpendingBenchmark {
  category: string
  currentSpending: number
  currentPercentage: number
  benchmarkPercentage: number
  status: 'excellent' | 'good' | 'warning' | 'poor'
  trend: 'up' | 'down' | 'stable'
  trendPercentage: number
}

// Mock data - in real app, this would come from API
const spendingBenchmarks: SpendingBenchmark[] = [
  {
    category: 'Housing',
    currentSpending: 15000,
    currentPercentage: 33.3,
    benchmarkPercentage: 30,
    status: 'warning',
    trend: 'up',
    trendPercentage: 2.1
  },
  {
    category: 'Food & Dining',
    currentSpending: 4500,
    currentPercentage: 10.0,
    benchmarkPercentage: 15,
    status: 'excellent',
    trend: 'down',
    trendPercentage: 1.5
  },
  {
    category: 'Transportation',
    currentSpending: 3200,
    currentPercentage: 7.1,
    benchmarkPercentage: 10,
    status: 'good',
    trend: 'stable',
    trendPercentage: 0.2
  },
  {
    category: 'Entertainment',
    currentSpending: 2800,
    currentPercentage: 6.2,
    benchmarkPercentage: 5,
    status: 'warning',
    trend: 'up',
    trendPercentage: 0.8
  },
  {
    category: 'Shopping',
    currentSpending: 3500,
    currentPercentage: 7.8,
    benchmarkPercentage: 5,
    status: 'poor',
    trend: 'up',
    trendPercentage: 1.2
  },
  {
    category: 'Healthcare',
    currentSpending: 1200,
    currentPercentage: 2.7,
    benchmarkPercentage: 5,
    status: 'excellent',
    trend: 'down',
    trendPercentage: 0.3
  },
  {
    category: 'Utilities',
    currentSpending: 1800,
    currentPercentage: 4.0,
    benchmarkPercentage: 6,
    status: 'good',
    trend: 'stable',
    trendPercentage: 0.1
  },
  {
    category: 'Insurance',
    currentSpending: 2200,
    currentPercentage: 4.9,
    benchmarkPercentage: 5,
    status: 'good',
    trend: 'stable',
    trendPercentage: 0.0
  }
]

export function SpendingBenchmarksCard() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800 border-green-200'
      case 'good': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'poor': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
      case 'good':
        return <CheckCircle className="h-4 w-4" />
      case 'warning':
      case 'poor':
        return <AlertCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-red-500" />
      case 'down':
        return <TrendingDown className="h-3 w-3 text-green-500" />
      default:
        return <div className="h-3 w-3" />
    }
  }

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-500'
      case 'good': return 'bg-blue-500'
      case 'warning': return 'bg-yellow-500'
      case 'poor': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending vs. Benchmarks</CardTitle>
        <CardDescription>
          How your spending in each category compares to recommended financial guidelines
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {spendingBenchmarks.map((benchmark) => (
            <div key={benchmark.category} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h4 className="font-medium">{benchmark.category}</h4>
                  <Badge variant="outline" className={getStatusColor(benchmark.status)}>
                    {getStatusIcon(benchmark.status)}
                    <span className="ml-1 capitalize">{benchmark.status}</span>
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {benchmark.currentSpending.toLocaleString("da-DK", { style: "currency", currency: "DKK" })}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <span>{benchmark.currentPercentage.toFixed(1)}% of income</span>
                    {getTrendIcon(benchmark.trend)}
                    <span className={benchmark.trend === 'up' ? 'text-red-600' : benchmark.trend === 'down' ? 'text-green-600' : ''}>
                      {benchmark.trendPercentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Current: {benchmark.currentPercentage.toFixed(1)}%</span>
                  <span>Benchmark: {benchmark.benchmarkPercentage}%</span>
                </div>
                
                <div className="relative">
                  <Progress 
                    value={Math.min(100, (benchmark.currentPercentage / benchmark.benchmarkPercentage) * 100)} 
                    className="h-3"
                  />
                  {benchmark.currentPercentage > benchmark.benchmarkPercentage && (
                    <div 
                      className="absolute top-0 left-0 h-3 rounded-full opacity-60"
                      style={{ 
                        backgroundColor: getProgressColor(benchmark.status).replace('bg-', ''),
                        width: `${Math.min(100, (benchmark.currentPercentage / benchmark.benchmarkPercentage) * 100)}%`
                      }}
                    />
                  )}
                </div>
                
                <div className="text-xs text-muted-foreground">
                  {benchmark.currentPercentage > benchmark.benchmarkPercentage ? (
                    <span className="text-red-600">
                      {((benchmark.currentPercentage - benchmark.benchmarkPercentage) / benchmark.benchmarkPercentage * 100).toFixed(0)}% over benchmark
                    </span>
                  ) : (
                    <span className="text-green-600">
                      {((benchmark.benchmarkPercentage - benchmark.currentPercentage) / benchmark.benchmarkPercentage * 100).toFixed(0)}% under benchmark
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Benchmark Guidelines</h4>
          <p className="text-sm text-blue-800">
            These benchmarks are based on the 50/30/20 rule and financial planning best practices. 
            Staying within these ranges typically indicates healthy financial habits.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
