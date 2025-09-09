import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react"

interface BudgetCardProps {
  budget: {
    id: number
    categoryId: number
    amount: number
    period: string
    // startDate?: string
    // endDate?: string
    category: {
      id: number
      name: string
      color: string
    }
    spent: number
    remaining: number
    percentageUsed: number
    isOverBudget: boolean
    daysRemaining?: number
  }
  onEdit?: () => void
}

export function BudgetCard({ budget, onEdit }: BudgetCardProps) {
  const { category, amount, spent, remaining, percentageUsed, isOverBudget, period } = budget

  const getStatusColor = () => {
    if (isOverBudget) return "destructive"
    if (percentageUsed > 80) return "secondary"
    return "default"
  }

  const getStatusIcon = () => {
    if (isOverBudget) return <AlertTriangle className="h-4 w-4" />
    if (percentageUsed > 80) return <TrendingUp className="h-4 w-4" />
    return <TrendingDown className="h-4 w-4" />
  }

  return (
    <Card className="relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={onEdit}>
      <div 
        className="absolute top-0 left-0 w-1 h-full"
        style={{ backgroundColor: category.color }}
      />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{category.name}</CardTitle>
          <Badge variant={getStatusColor()} className="flex items-center gap-1">
            {getStatusIcon()}
            {isOverBudget ? "Over Budget" : percentageUsed > 80 ? "Warning" : "On Track"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Spent</span>
            <span className={isOverBudget ? "text-red-600 font-semibold" : "text-foreground"}>
              {spent.toLocaleString("da-DK", { style: "currency", currency: "DKK" })}
            </span>
          </div>
          <Progress 
            value={Math.min(percentageUsed, 100)} 
            className="h-2"
            // Add custom color for over-budget
            style={{
              "--progress-background": isOverBudget ? "#ef4444" : category.color
            } as React.CSSProperties}
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Budget: {amount.toLocaleString("da-DK", { style: "currency", currency: "DKK" })}</span>
            <span>{percentageUsed.toFixed(1)}%</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-2 border-t">
          <div className="text-sm">
            <span className="text-muted-foreground">Remaining: </span>
            <span className={remaining > 0 ? "text-green-600" : "text-red-600"}>
              {remaining > 0 
                ? remaining.toLocaleString("da-DK", { style: "currency", currency: "DKK" })
                : `(${Math.abs(remaining).toLocaleString("da-DK", { style: "currency", currency: "DKK" })})`
              }
            </span>
          </div>
          {/* <div className="flex flex-col items-end text-xs text-muted-foreground">
            {daysRemaining !== undefined && (
              <div>{daysRemaining} days left</div>
            )}
          </div> */}
        </div>
        
        <div className="text-xs text-muted-foreground">
          Period: {period.toLowerCase()}
        </div>
      </CardContent>
    </Card>
  )
}
