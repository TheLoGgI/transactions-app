"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  AlertTriangle, 
  Bell, 
  BellRing,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  Plus,
  Settings,
  X
} from "lucide-react"

interface SpendingAlert {
  id: string
  category: string
  type: 'budget_exceeded' | 'unusual_spending' | 'monthly_limit' | 'category_spike'
  threshold: number
  currentAmount: number
  percentage: number
  isActive: boolean
  frequency: 'daily' | 'weekly' | 'monthly'
  icon: React.ElementType
  color: string
}

interface AlertRule {
  id: string
  name: string
  category: string
  type: 'budget_percentage' | 'fixed_amount' | 'average_increase'
  threshold: number
  isEnabled: boolean
  notifications: string[]
}

// Mock current alerts
const currentAlerts: SpendingAlert[] = [
  {
    id: '1',
    category: 'Shopping',
    type: 'budget_exceeded',
    threshold: 5000,
    currentAmount: 6200,
    percentage: 124,
    isActive: true,
    frequency: 'monthly',
    icon: Bell,
    color: 'red'
  },
  {
    id: '2',
    category: 'Food & Dining',
    type: 'category_spike',
    threshold: 4000,
    currentAmount: 4800,
    percentage: 120,
    isActive: true,
    frequency: 'monthly',
    icon: Bell,
    color: 'yellow'
  },
  {
    id: '3',
    category: 'Transportation',
    type: 'unusual_spending',
    threshold: 2500,
    currentAmount: 3200,
    percentage: 128,
    isActive: false,
    frequency: 'weekly',
    icon: Bell,
    color: 'orange'
  }
]

// Mock alert rules
const mockAlertRules: AlertRule[] = [
  {
    id: '1',
    name: 'Monthly Budget Limit',
    category: 'Shopping',
    type: 'budget_percentage',
    threshold: 100,
    isEnabled: true,
    notifications: ['email', 'push']
  },
  {
    id: '2',
    name: 'Food Spending Spike',
    category: 'Food & Dining',
    type: 'average_increase',
    threshold: 20,
    isEnabled: true,
    notifications: ['push']
  },
  {
    id: '3',
    name: 'Transportation Limit',
    category: 'Transportation',
    type: 'fixed_amount',
    threshold: 3000,
    isEnabled: false,
    notifications: ['email']
  }
]

export default function SpendingAlertsPage() {
  const [alertRules, setAlertRules] = useState<AlertRule[]>(mockAlertRules)
  const [showNewRuleForm, setShowNewRuleForm] = useState(false)
  const [newRule, setNewRule] = useState({
    name: '',
    category: '',
    type: 'budget_percentage' as 'budget_percentage' | 'fixed_amount' | 'average_increase',
    threshold: 100,
    notifications: ['push'] as string[]
  })

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'budget_exceeded': return 'Budget Exceeded'
      case 'unusual_spending': return 'Unusual Spending'
      case 'monthly_limit': return 'Monthly Limit'
      case 'category_spike': return 'Category Spike'
      default: return 'Alert'
    }
  }

  const toggleAlertRule = (id: string) => {
    setAlertRules(rules => 
      rules.map(rule => 
        rule.id === id ? { ...rule, isEnabled: !rule.isEnabled } : rule
      )
    )
  }

  const addNewRule = () => {
    if (newRule.name && newRule.category) {
      const rule: AlertRule = {
        id: Date.now().toString(),
        name: newRule.name,
        category: newRule.category,
        type: newRule.type,
        threshold: newRule.threshold,
        isEnabled: true,
        notifications: newRule.notifications
      }
      setAlertRules([...alertRules, rule])
      setNewRule({
        name: '',
        category: '',
        type: 'budget_percentage',
        threshold: 100,
        notifications: ['push']
      })
      setShowNewRuleForm(false)
    }
  }

  const deleteRule = (id: string) => {
    setAlertRules(rules => rules.filter(rule => rule.id !== id))
  }

  const activeAlertsCount = currentAlerts.filter(alert => alert.isActive).length
  const totalBudgetUsage = currentAlerts.reduce((sum, alert) => sum + alert.currentAmount, 0)

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Spending Alerts</h1>
          <p className="text-muted-foreground">
            Monitor your spending patterns and get notified when you exceed budget limits.
          </p>
        </header>

        {/* Active Alerts Summary */}
        <Card className="border-l-4 border-l-red-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BellRing className="h-6 w-6 text-red-500" />
                  Active Alerts
                </CardTitle>
                <CardDescription>Current spending alerts requiring attention</CardDescription>
              </div>
              <Badge variant="destructive" className="text-lg px-3 py-1">
                {activeAlertsCount} Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{activeAlertsCount}</p>
                <p className="text-sm text-red-800">Active Alerts</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">
                  {totalBudgetUsage.toLocaleString("da-DK", { style: "currency", currency: "DKK" })}
                </p>
                <p className="text-sm text-orange-800">Total Alert Amount</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{alertRules.filter(r => r.isEnabled).length}</p>
                <p className="text-sm text-blue-800">Active Rules</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Current Alerts</CardTitle>
            <CardDescription>Spending alerts that need your attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentAlerts.length > 0 ? (
              currentAlerts.map((alert) => {
                return (
                  <div key={alert.id} className={`p-4 rounded-lg border ${alert.isActive ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${alert.isActive ? 'bg-red-100' : 'bg-gray-100'}`}>
                          <alert.icon className={`h-5 w-5 ${alert.isActive ? 'text-red-600' : 'text-gray-600'}`} />
                        </div>
                        <div>
                          <h4 className="font-medium">{alert.category}</h4>
                          <p className="text-sm text-muted-foreground">{getAlertTypeLabel(alert.type)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={alert.isActive ? "destructive" : "secondary"}>
                          {alert.percentage}% of limit
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {alert.currentAmount.toLocaleString("da-DK", { style: "currency", currency: "DKK" })} / {alert.threshold.toLocaleString("da-DK", { style: "currency", currency: "DKK" })}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Progress 
                        value={Math.min(100, alert.percentage)} 
                        className={`h-2 ${alert.percentage > 100 ? 'bg-red-200' : ''}`}
                      />
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p>No active alerts! Your spending is within limits.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alert Rules */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Alert Rules</CardTitle>
                <CardDescription>Configure when and how you want to be notified</CardDescription>
              </div>
              <Button onClick={() => setShowNewRuleForm(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Rule
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {alertRules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Button
                    variant={rule.isEnabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleAlertRule(rule.id)}
                  >
                    {rule.isEnabled ? 'ON' : 'OFF'}
                  </Button>
                  <div>
                    <h4 className="font-medium">{rule.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {rule.category} • {rule.type === 'budget_percentage' ? `${rule.threshold}% of budget` : 
                       rule.type === 'fixed_amount' ? `${rule.threshold.toLocaleString("da-DK", { style: "currency", currency: "DKK" })} limit` :
                       `${rule.threshold}% increase`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {rule.notifications.includes('email') && (
                      <Badge variant="outline" className="text-xs">Email</Badge>
                    )}
                    {rule.notifications.includes('push') && (
                      <Badge variant="outline" className="text-xs">Push</Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteRule(rule.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {/* New Rule Form */}
            {showNewRuleForm && (
              <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                <h4 className="font-medium mb-4">Create New Alert Rule</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rule-name">Rule Name</Label>
                    <Input
                      id="rule-name"
                      value={newRule.name}
                      onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                      placeholder="e.g., Shopping Budget Alert"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rule-category">Category</Label>
                    <Select value={newRule.category} onValueChange={(value) => setNewRule({...newRule, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Shopping">Shopping</SelectItem>
                        <SelectItem value="Food & Dining">Food & Dining</SelectItem>
                        <SelectItem value="Transportation">Transportation</SelectItem>
                        <SelectItem value="Entertainment">Entertainment</SelectItem>
                        <SelectItem value="Housing">Housing</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="rule-type">Alert Type</Label>
                    <Select 
                      value={newRule.type} 
                      onValueChange={(value: 'budget_percentage' | 'fixed_amount' | 'average_increase') => 
                        setNewRule({...newRule, type: value})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="budget_percentage">Budget Percentage</SelectItem>
                        <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                        <SelectItem value="average_increase">Average Increase</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="rule-threshold">Threshold</Label>
                    <Input
                      id="rule-threshold"
                      type="number"
                      value={newRule.threshold}
                      onChange={(e) => setNewRule({...newRule, threshold: Number(e.target.value)})}
                      placeholder={newRule.type === 'fixed_amount' ? 'Amount in DKK' : 'Percentage'}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setShowNewRuleForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addNewRule}>
                    Create Rule
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common alert management tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <Settings className="h-6 w-6" />
                <span>Notification Settings</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <Calendar className="h-6 w-6" />
                <span>Set Monthly Budgets</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <Target className="h-6 w-6" />
                <span>Category Limits</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
