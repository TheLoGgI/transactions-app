"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Target, Plus, TrendingUp, Calendar, DollarSign } from "lucide-react"

interface SavingsGoal {
  id: string
  title: string
  targetAmount: number
  currentAmount: number
  targetDate: string
  category: string
  priority: 'high' | 'medium' | 'low'
}

// Mock data for now
const mockGoals: SavingsGoal[] = [
  {
    id: '1',
    title: 'Emergency Fund',
    targetAmount: 50000,
    currentAmount: 32500,
    targetDate: '2025-12-31',
    category: 'Security',
    priority: 'high'
  },
  {
    id: '2',
    title: 'Vacation to Japan',
    targetAmount: 25000,
    currentAmount: 8500,
    targetDate: '2025-08-15',
    category: 'Travel',
    priority: 'medium'
  },
  {
    id: '3',
    title: 'New Laptop',
    targetAmount: 15000,
    currentAmount: 12000,
    targetDate: '2025-04-30',
    category: 'Technology',
    priority: 'low'
  },
]

export default function SavingsGoalsPage() {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'default'
    }
  }

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const getDaysUntilTarget = (targetDate: string) => {
    const today = new Date()
    const target = new Date(targetDate)
    const diffTime = target.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-6">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Savings Goals</h1>
            <p className="text-muted-foreground">
              Track your progress towards financial milestones and savings targets.
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add New Goal
          </Button>
        </header>

        {/* Goals Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockGoals.map((goal) => {
            const progressPercentage = getProgressPercentage(goal.currentAmount, goal.targetAmount)
            const daysRemaining = getDaysUntilTarget(goal.targetDate)
            const remaining = goal.targetAmount - goal.currentAmount

            return (
              <Card key={goal.id} className="relative overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      {goal.title}
                    </CardTitle>
                    <Badge variant={getPriorityColor(goal.priority)}>
                      {goal.priority}
                    </Badge>
                  </div>
                  <CardDescription>{goal.category}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">
                        {progressPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>
                        {goal.currentAmount.toLocaleString("da-DK", { 
                          style: "currency", 
                          currency: "DKK" 
                        })}
                      </span>
                      <span>
                        {goal.targetAmount.toLocaleString("da-DK", { 
                          style: "currency", 
                          currency: "DKK" 
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Remaining</p>
                        <p className="text-sm font-medium">
                          {remaining.toLocaleString("da-DK", { 
                            style: "currency", 
                            currency: "DKK" 
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Days left</p>
                        <p className="text-sm font-medium">{daysRemaining} days</p>
                      </div>
                    </div>
                  </div>

                  {progressPercentage >= 100 ? (
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 p-2 rounded">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-medium">Goal Achieved! 🎉</span>
                    </div>
                  ) : daysRemaining > 0 ? (
                    <div className="text-xs text-muted-foreground">
                      Need to save{" "}
                      <span className="font-medium">
                        {(remaining / daysRemaining).toLocaleString("da-DK", { 
                          style: "currency", 
                          currency: "DKK" 
                        })}
                      </span>{" "}
                      per day to reach goal
                    </div>
                  ) : (
                    <div className="text-xs text-red-600">
                      Target date has passed
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common savings goals to get you started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto flex-col p-4">
                <Target className="h-6 w-6 mb-2" />
                <span className="font-medium">Emergency Fund</span>
                <span className="text-xs text-muted-foreground">3-6 months expenses</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col p-4">
                <TrendingUp className="h-6 w-6 mb-2" />
                <span className="font-medium">Investment Goal</span>
                <span className="text-xs text-muted-foreground">Long-term wealth building</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col p-4">
                <DollarSign className="h-6 w-6 mb-2" />
                <span className="font-medium">Custom Goal</span>
                <span className="text-xs text-muted-foreground">Set your own target</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
