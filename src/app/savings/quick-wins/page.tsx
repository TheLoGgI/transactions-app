"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Zap, 
  DollarSign,
  Clock,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  Target,
  CreditCard,
  Coffee,
  Car,
  Home,
  ShoppingBag,
  Smartphone,
  Star
} from "lucide-react"

interface QuickWin {
  id: string
  title: string
  description: string
  category: 'subscriptions' | 'utilities' | 'shopping' | 'food' | 'transportation' | 'insurance'
  potentialSaving: number
  timeToImplement: 'immediate' | '1-day' | '1-week' | '1-month'
  difficulty: 'easy' | 'medium' | 'hard'
  isCompleted: boolean
  actionSteps: string[]
  icon: React.ElementType
  priority: 'high' | 'medium' | 'low'
}

// Mock quick wins data
const quickWins: QuickWin[] = [
  {
    id: '1',
    title: 'Cancel Unused Subscriptions',
    description: 'Review and cancel streaming services, gym memberships, and software subscriptions you rarely use.',
    category: 'subscriptions',
    potentialSaving: 2400,
    timeToImplement: 'immediate',
    difficulty: 'easy',
    isCompleted: false,
    actionSteps: [
      'Review bank statements for recurring charges',
      'List all active subscriptions',
      'Cancel unused Netflix, Spotify, or gym memberships',
      'Set calendar reminders to review subscriptions quarterly'
    ],
    icon: Smartphone,
    priority: 'high'
  },
  {
    id: '2',
    title: 'Switch to Generic Brands',
    description: 'Replace name-brand groceries and household items with store brands for 20-30% savings.',
    category: 'shopping',
    potentialSaving: 1800,
    timeToImplement: 'immediate',
    difficulty: 'easy',
    isCompleted: false,
    actionSteps: [
      'Compare prices of current brands vs. store brands',
      'Try generic versions of frequently bought items',
      'Switch household cleaners and toiletries first',
      'Gradually replace food items based on taste preference'
    ],
    icon: ShoppingBag,
    priority: 'high'
  },
  {
    id: '3',
    title: 'Negotiate Phone Bill',
    description: 'Call your mobile provider to negotiate a better plan or switch to a cheaper competitor.',
    category: 'utilities',
    potentialSaving: 1200,
    timeToImplement: '1-day',
    difficulty: 'medium',
    isCompleted: true,
    actionSteps: [
      'Research competitor pricing',
      'Call current provider with competitor offers',
      'Ask for loyalty discounts or plan downgrades',
      'Consider switching if no better offer is made'
    ],
    icon: Smartphone,
    priority: 'high'
  },
  {
    id: '4',
    title: 'Meal Prep & Cook at Home',
    description: 'Reduce restaurant spending by preparing meals at home and batch cooking on weekends.',
    category: 'food',
    potentialSaving: 3600,
    timeToImplement: '1-week',
    difficulty: 'medium',
    isCompleted: false,
    actionSteps: [
      'Plan weekly meals and create shopping lists',
      'Batch cook proteins and grains on Sundays',
      'Invest in good food containers',
      'Start with 2-3 home-cooked meals, then increase'
    ],
    icon: Coffee,
    priority: 'high'
  },
  {
    id: '5',
    title: 'Refinance Insurance',
    description: 'Shop around for better rates on car, home, and health insurance.',
    category: 'insurance',
    potentialSaving: 2800,
    timeToImplement: '1-week',
    difficulty: 'medium',
    isCompleted: false,
    actionSteps: [
      'Gather current policy details',
      'Get quotes from 3-5 insurance companies',
      'Compare coverage levels and deductibles',
      'Switch to the best value option'
    ],
    icon: CreditCard,
    priority: 'medium'
  },
  {
    id: '6',
    title: 'Use Public Transportation',
    description: 'Replace some car trips with public transport, biking, or walking to save on fuel and parking.',
    category: 'transportation',
    potentialSaving: 1500,
    timeToImplement: 'immediate',
    difficulty: 'easy',
    isCompleted: false,
    actionSteps: [
      'Research public transport options in your area',
      'Calculate cost savings vs. car expenses',
      'Start with 1-2 days per week',
      'Consider monthly transport passes'
    ],
    icon: Car,
    priority: 'medium'
  },
  {
    id: '7',
    title: 'Reduce Energy Costs',
    description: 'Lower utility bills with simple energy-saving habits and efficient appliances.',
    category: 'utilities',
    potentialSaving: 1000,
    timeToImplement: 'immediate',
    difficulty: 'easy',
    isCompleted: false,
    actionSteps: [
      'Switch to LED bulbs',
      'Unplug devices when not in use',
      'Adjust thermostat by 2-3 degrees',
      'Use energy-efficient appliances'
    ],
    icon: Home,
    priority: 'low'
  },
  {
    id: '8',
    title: 'Automate Savings',
    description: 'Set up automatic transfers to savings account to pay yourself first.',
    category: 'utilities',
    potentialSaving: 0, // This is about saving money, not reducing expenses
    timeToImplement: 'immediate',
    difficulty: 'easy',
    isCompleted: false,
    actionSteps: [
      'Calculate affordable monthly saving amount',
      'Set up automatic transfer after payday',
      'Start with small amount and increase gradually',
      'Consider high-yield savings account'
    ],
    icon: Target,
    priority: 'high'
  }
]

export default function QuickWinsPage() {
  const [wins, setWins] = useState<QuickWin[]>(quickWins)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showCompleted, setShowCompleted] = useState(false)

  const toggleCompletion = (id: string) => {
    setWins(wins.map(win => 
      win.id === id ? { ...win, isCompleted: !win.isCompleted } : win
    ))
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTimeColor = (time: string) => {
    switch (time) {
      case 'immediate': return 'bg-green-100 text-green-800'
      case '1-day': return 'bg-blue-100 text-blue-800'
      case '1-week': return 'bg-yellow-100 text-yellow-800'
      case '1-month': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'subscriptions', label: 'Subscriptions' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'food', label: 'Food & Dining' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'insurance', label: 'Insurance' }
  ]

  const filteredWins = wins.filter(win => {
    const categoryMatch = selectedCategory === 'all' || win.category === selectedCategory
    const completionMatch = showCompleted || !win.isCompleted
    return categoryMatch && completionMatch
  })

  const totalPotentialSavings = filteredWins
    .filter(win => !win.isCompleted)
    .reduce((sum, win) => sum + win.potentialSaving, 0)

  const completedWins = wins.filter(win => win.isCompleted).length
  const totalWins = wins.length

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Zap className="h-8 w-8 text-yellow-500" />
            Quick Wins
          </h1>
          <p className="text-muted-foreground">
            Immediate money-saving opportunities and actionable tips to reduce your expenses.
          </p>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-600">
                {totalPotentialSavings.toLocaleString("da-DK", { style: "currency", currency: "DKK" })}
              </div>
              <p className="text-sm text-muted-foreground">Potential Annual Savings</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-blue-600">
                {completedWins}/{totalWins}
              </div>
              <p className="text-sm text-muted-foreground">Wins Completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold text-orange-600">
                {filteredWins.filter(w => w.timeToImplement === 'immediate' && !w.isCompleted).length}
              </div>
              <p className="text-sm text-muted-foreground">Immediate Actions</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Star className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold text-purple-600">
                {filteredWins.filter(w => w.priority === 'high' && !w.isCompleted).length}
              </div>
              <p className="text-sm text-muted-foreground">High Priority</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
            <CardDescription>Track your money-saving journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Completion Rate</span>
                <span>{completedWins}/{totalWins} ({Math.round((completedWins / totalWins) * 100)}%)</span>
              </div>
              <Progress value={(completedWins / totalWins) * 100} className="h-3" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="font-semibold text-green-800">Easy Wins</p>
                  <p className="text-sm text-green-600">
                    {wins.filter(w => w.difficulty === 'easy' && w.isCompleted).length} / {wins.filter(w => w.difficulty === 'easy').length} completed
                  </p>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <p className="font-semibold text-yellow-800">Medium Wins</p>
                  <p className="text-sm text-yellow-600">
                    {wins.filter(w => w.difficulty === 'medium' && w.isCompleted).length} / {wins.filter(w => w.difficulty === 'medium').length} completed
                  </p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="font-semibold text-red-800">Hard Wins</p>
                  <p className="text-sm text-red-600">
                    {wins.filter(w => w.difficulty === 'hard' && w.isCompleted).length} / {wins.filter(w => w.difficulty === 'hard').length} completed
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.value}
                    variant={selectedCategory === category.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.value)}
                  >
                    {category.label}
                  </Button>
                ))}
              </div>
              <Button
                variant={showCompleted ? "default" : "outline"}
                size="sm"
                onClick={() => setShowCompleted(!showCompleted)}
              >
                {showCompleted ? "Hide" : "Show"} Completed
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Wins List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredWins.map((win) => (
            <Card key={win.id} className={`relative ${win.isCompleted ? 'bg-gray-50 opacity-75' : ''}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${win.isCompleted ? 'bg-green-100' : 'bg-blue-100'}`}>
                      {win.isCompleted ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <win.icon className="h-6 w-6 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <CardTitle className={`text-lg ${win.isCompleted ? 'line-through text-gray-500' : ''}`}>
                        {win.title}
                      </CardTitle>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className={getPriorityColor(win.priority)}>
                          {win.priority} priority
                        </Badge>
                        <Badge variant="outline" className={getDifficultyColor(win.difficulty)}>
                          {win.difficulty}
                        </Badge>
                        <Badge variant="outline" className={getTimeColor(win.timeToImplement)}>
                          {win.timeToImplement}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {win.potentialSaving > 0 && (
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {win.potentialSaving.toLocaleString("da-DK", { style: "currency", currency: "DKK" })}
                      </div>
                      <div className="text-xs text-muted-foreground">per year</div>
                    </div>
                  )}
                </div>
                <CardDescription className={win.isCompleted ? 'text-gray-400' : ''}>
                  {win.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Action Steps:
                    </h4>
                    <ul className="space-y-1 text-sm">
                      {win.actionSteps.map((step, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <ArrowRight className="h-3 w-3 text-blue-500 flex-shrink-0" />
                          <span className={win.isCompleted ? 'text-gray-400' : ''}>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    onClick={() => toggleCompletion(win.id)}
                    variant={win.isCompleted ? "outline" : "default"}
                    className="w-full"
                  >
                    {win.isCompleted ? "Mark as Not Done" : "Mark as Complete"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredWins.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
              <h3 className="text-xl font-semibold mb-2">Great Job!</h3>
              <p className="text-muted-foreground">
                {showCompleted 
                  ? "You've completed all quick wins in this category!" 
                  : "No remaining quick wins in this category. Try showing completed items or selecting a different category."
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
