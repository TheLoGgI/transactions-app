"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calculator, TrendingUp, Target } from "lucide-react"

export default function SavingsCalculatorPage() {
  // Goal-based calculator state
  const [goalAmount, setGoalAmount] = useState("")
  const [targetMonths, setTargetMonths] = useState("")
  const [currentSavings, setCurrentSavings] = useState("")

  // Scenario calculator state
  const [monthlyIncome, setMonthlyIncome] = useState("")
  const [currentExpenses, setCurrentExpenses] = useState("")
  const [expenseReduction, setExpenseReduction] = useState("")

  // Compound interest calculator state
  const [initialAmount, setInitialAmount] = useState("")
  const [monthlyContribution, setMonthlyContribution] = useState("")
  const [interestRate, setInterestRate] = useState("")
  const [years, setYears] = useState("")

  const calculateGoalSavings = () => {
    const goal = parseFloat(goalAmount) || 0
    const months = parseFloat(targetMonths) || 1
    const current = parseFloat(currentSavings) || 0
    const remaining = Math.max(0, goal - current)
    const monthlyNeeded = remaining / months

    return {
      remaining,
      monthlyNeeded,
      dailyNeeded: monthlyNeeded / 30,
      weeklyNeeded: monthlyNeeded / 4.33
    }
  }

  const calculateScenario = () => {
    const income = parseFloat(monthlyIncome) || 0
    const expenses = parseFloat(currentExpenses) || 0
    const reduction = parseFloat(expenseReduction) || 0
    
    const currentSavingsRate = ((income - expenses) / income) * 100
    const newExpenses = expenses - (expenses * reduction / 100)
    const newSavings = income - newExpenses
    const newSavingsRate = (newSavings / income) * 100
    const additionalSavings = newSavings - (income - expenses)

    return {
      currentSavings: income - expenses,
      currentSavingsRate,
      newSavings,
      newSavingsRate,
      additionalSavings,
      yearlyIncrease: additionalSavings * 12
    }
  }

  const calculateCompoundInterest = () => {
    const initial = parseFloat(initialAmount) || 0
    const monthly = parseFloat(monthlyContribution) || 0
    const rate = parseFloat(interestRate) || 0
    const time = parseFloat(years) || 0

    const monthlyRate = rate / 100 / 12
    const totalMonths = time * 12

    // Compound interest for initial amount
    const futureValueInitial = initial * Math.pow(1 + monthlyRate, totalMonths)
    
    // Future value of monthly contributions
    const futureValueContributions = monthly * (
      (Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate
    )

    const totalFutureValue = futureValueInitial + futureValueContributions
    const totalContributions = initial + (monthly * totalMonths)
    const totalInterest = totalFutureValue - totalContributions

    return {
      totalFutureValue,
      totalContributions,
      totalInterest,
      returnOnInvestment: ((totalInterest / totalContributions) * 100)
    }
  }

  const goalResults = calculateGoalSavings()
  const scenarioResults = calculateScenario()
  const compoundResults = calculateCompoundInterest()

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Savings Calculator</h1>
          <p className="text-muted-foreground">
            Plan your financial future with our comprehensive savings calculators.
          </p>
        </header>

        {/* Goal-based Calculator */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Goal Calculator</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Goal Calculator
                </CardTitle>
                <CardDescription>
                  Calculate how much you need to save to reach your financial goal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="goalAmount">Target Amount (DKK)</Label>
                  <Input
                    id="goalAmount"
                    type="number"
                    placeholder="50000"
                    value={goalAmount}
                    onChange={(e) => setGoalAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetMonths">Time to Goal (months)</Label>
                  <Input
                    id="targetMonths"
                    type="number"
                    placeholder="12"
                    value={targetMonths}
                    onChange={(e) => setTargetMonths(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentSavings">Current Savings (DKK)</Label>
                  <Input
                    id="currentSavings"
                    type="number"
                    placeholder="10000"
                    value={currentSavings}
                    onChange={(e) => setCurrentSavings(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Results</CardTitle>
                <CardDescription>Your savings plan breakdown</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600">Monthly Target</p>
                    <p className="text-xl font-bold text-blue-900">
                      {goalResults.monthlyNeeded.toLocaleString("da-DK", { 
                        style: "currency", 
                        currency: "DKK" 
                      })}
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-600">Weekly Target</p>
                    <p className="text-xl font-bold text-green-900">
                      {goalResults.weeklyNeeded.toLocaleString("da-DK", { 
                        style: "currency", 
                        currency: "DKK" 
                      })}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-600">Daily Target</p>
                    <p className="text-xl font-bold text-purple-900">
                      {goalResults.dailyNeeded.toLocaleString("da-DK", { 
                        style: "currency", 
                        currency: "DKK" 
                      })}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <p className="text-sm text-orange-600">Remaining</p>
                    <p className="text-xl font-bold text-orange-900">
                      {goalResults.remaining.toLocaleString("da-DK", { 
                        style: "currency", 
                        currency: "DKK" 
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Scenario Analysis */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Scenario Analysis</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Scenario Analysis
                </CardTitle>
                <CardDescription>
                  See how reducing expenses affects your savings rate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="monthlyIncome">Monthly Income (DKK)</Label>
                  <Input
                    id="monthlyIncome"
                    type="number"
                    placeholder="40000"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentExpenses">Current Monthly Expenses (DKK)</Label>
                  <Input
                    id="currentExpenses"
                    type="number"
                    placeholder="35000"
                    value={currentExpenses}
                    onChange={(e) => setCurrentExpenses(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expenseReduction">Expense Reduction (%)</Label>
                  <Input
                    id="expenseReduction"
                    type="number"
                    placeholder="10"
                    value={expenseReduction}
                    onChange={(e) => setExpenseReduction(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Impact Analysis</CardTitle>
                <CardDescription>How your changes affect your finances</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">Current Savings Rate</span>
                    <span className="font-bold">{scenarioResults.currentSavingsRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm text-green-700">New Savings Rate</span>
                    <span className="font-bold text-green-800">{scenarioResults.newSavingsRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm text-blue-700">Additional Monthly Savings</span>
                    <span className="font-bold text-blue-800">
                      {scenarioResults.additionalSavings.toLocaleString("da-DK", { 
                        style: "currency", 
                        currency: "DKK" 
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm text-purple-700">Yearly Increase</span>
                    <span className="font-bold text-purple-800">
                      {scenarioResults.yearlyIncrease.toLocaleString("da-DK", { 
                        style: "currency", 
                        currency: "DKK" 
                      })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Compound Interest Calculator */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Investment Growth Calculator</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Investment Growth
                </CardTitle>
                <CardDescription>
                  Calculate compound interest and investment growth
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="initialAmount">Initial Investment (DKK)</Label>
                  <Input
                    id="initialAmount"
                    type="number"
                    placeholder="10000"
                    value={initialAmount}
                    onChange={(e) => setInitialAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyContribution">Monthly Contribution (DKK)</Label>
                  <Input
                    id="monthlyContribution"
                    type="number"
                    placeholder="1000"
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interestRate">Annual Interest Rate (%)</Label>
                  <Input
                    id="interestRate"
                    type="number"
                    placeholder="7"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="years">Investment Period (years)</Label>
                  <Input
                    id="years"
                    type="number"
                    placeholder="10"
                    value={years}
                    onChange={(e) => setYears(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Investment Projection</CardTitle>
                <CardDescription>Your investment growth over time</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-600">Final Value</p>
                    <p className="text-2xl font-bold text-green-900">
                      {compoundResults.totalFutureValue.toLocaleString("da-DK", { 
                        style: "currency", 
                        currency: "DKK" 
                      })}
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-600">Total Contributions</p>
                    <p className="text-xl font-bold text-blue-900">
                      {compoundResults.totalContributions.toLocaleString("da-DK", { 
                        style: "currency", 
                        currency: "DKK" 
                      })}
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-600">Interest Earned</p>
                    <p className="text-xl font-bold text-purple-900">
                      {compoundResults.totalInterest.toLocaleString("da-DK", { 
                        style: "currency", 
                        currency: "DKK" 
                      })}
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-sm text-orange-600">Return on Investment</p>
                    <p className="text-xl font-bold text-orange-900">
                      {compoundResults.returnOnInvestment.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
