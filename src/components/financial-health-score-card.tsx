"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  Heart, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Shield,
  PieChart,
  Wallet,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react"

interface ScoreComponent {
  category: string
  currentScore: number
  maxScore: number
  weight: number
  status: 'excellent' | 'good' | 'warning' | 'poor'
  description: string
  recommendation?: string
  icon: React.ElementType
}

// Mock data - in real app, this would be calculated from actual financial data
const scoreComponents: ScoreComponent[] = [
  {
    category: 'Savings Rate',
    currentScore: 95,
    maxScore: 100,
    weight: 25,
    status: 'excellent',
    description: '22.5% savings rate exceeds 20% target',
    icon: TrendingUp
  },
  {
    category: 'Emergency Fund',
    currentScore: 70,
    maxScore: 100,
    weight: 20,
    status: 'good',
    description: '4.2 months coverage (target: 6 months)',
    recommendation: 'Build emergency fund to 6 months of expenses',
    icon: Shield
  },
  {
    category: 'Debt Management',
    currentScore: 85,
    maxScore: 100,
    weight: 20,
    status: 'good',
    description: '15% debt-to-income ratio (target: <20%)',
    icon: TrendingDown
  },
  {
    category: 'Budget Adherence',
    currentScore: 85,
    maxScore: 100,
    weight: 15,
    status: 'good',
    description: '85.2% adherence to budget goals',
    recommendation: 'Review spending categories causing overruns',
    icon: Target
  },
  {
    category: 'Investment Rate',
    currentScore: 65,
    maxScore: 100,
    weight: 10,
    status: 'warning',
    description: '8.5% investment rate (target: 15%)',
    recommendation: 'Increase investment allocation for long-term growth',
    icon: PieChart
  },
  {
    category: 'Expense Control',
    currentScore: 60,
    maxScore: 100,
    weight: 10,
    status: 'warning',
    description: '77.5% expense-to-income ratio (target: <70%)',
    recommendation: 'Reduce discretionary spending, especially shopping',
    icon: Wallet
  }
]

export function FinancialHealthScoreCard() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600'
      case 'good': return 'text-blue-600'
      case 'warning': return 'text-yellow-600'
      case 'poor': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusBadgeColor = (status: string) => {
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
        return <Info className="h-4 w-4" />
      case 'poor':
        return <AlertCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  const calculateWeightedScore = () => {
    const totalWeightedScore = scoreComponents.reduce((sum, component) => {
      return sum + (component.currentScore * component.weight / 100)
    }, 0)
    return Math.round(totalWeightedScore)
  }

  const overallScore = calculateWeightedScore()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-red-500" />
          Financial Health Score Breakdown
        </CardTitle>
        <CardDescription>
          Detailed analysis of your financial wellness components
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score Summary */}
        <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
          <div className={`text-5xl font-bold ${getStatusColor(overallScore >= 85 ? 'excellent' : overallScore >= 70 ? 'good' : overallScore >= 50 ? 'warning' : 'poor')}`}>
            {overallScore}
          </div>
          <div className="text-sm text-muted-foreground mt-1">Overall Financial Health Score</div>
          <Progress value={overallScore} className="mt-4" />
        </div>

        {/* Score Components */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Score Components</h4>
          {scoreComponents.map((component) => (
            <div key={component.category} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getStatusColor(component.status).replace('text-', 'bg-').replace('-600', '-100')}`}>
                    <component.icon className={`h-5 w-5 ${getStatusColor(component.status)}`} />
                  </div>
                  <div>
                    <h5 className="font-medium">{component.category}</h5>
                    <p className="text-sm text-muted-foreground">{component.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className={getStatusBadgeColor(component.status)}>
                    {getStatusIcon(component.status)}
                    <span className="ml-1 capitalize">{component.status}</span>
                  </Badge>
                  <div className="text-sm text-muted-foreground mt-1">
                    Weight: {component.weight}%
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Score: {component.currentScore}/{component.maxScore}</span>
                  <span>Contribution: {Math.round(component.currentScore * component.weight / 100)} points</span>
                </div>
                <Progress value={component.currentScore} className="h-2" />
              </div>

              {component.recommendation && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Recommendation:</strong> {component.recommendation}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Improvement Potential */}
        <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
          <h4 className="font-semibold text-green-900 mb-2">Improvement Potential</h4>
          <div className="space-y-2 text-sm text-green-800">
            <p>• Reaching target emergency fund could add <strong>6 points</strong> to your score</p>
            <p>• Increasing investment rate to 15% could add <strong>4 points</strong> to your score</p>
            <p>• Reducing expense ratio to 70% could add <strong>4 points</strong> to your score</p>
            <p className="font-medium">Total potential improvement: <strong>+14 points (score of 92)</strong></p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
