"use client"

import { useState } from "react"
import useSWR from "swr"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import type { IncomeExpensesOverTimeData } from "@/app/api/transactions/income-expenses-overtime/route"

interface IncomeExpensesChartProps {
  query: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const intervalOptions = [
  { value: 'month', label: 'Monthly' },
  { value: 'week', label: 'Weekly' },
  { value: 'day', label: 'Daily' },
  { value: 'year', label: 'Yearly' },
]

export function IncomeExpensesChart({ query }: IncomeExpensesChartProps) {
  const [interval, setInterval] = useState('month')
  
  const { data, isLoading, error } = useSWR<IncomeExpensesOverTimeData[]>(
    `/api/transactions/income-expenses-overtime${query}&interval=${interval}`,
    fetcher
  ) as { data: IncomeExpensesOverTimeData[] | undefined; isLoading: boolean; error: unknown }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: 'DKK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    switch (interval) {
      case 'day':
        return new Date(dateString).toLocaleDateString('da-DK', { 
          month: 'short', 
          day: 'numeric' 
        })
      case 'week':
        return new Date(dateString).toLocaleDateString('da-DK', { 
          month: 'short', 
          day: 'numeric' 
        })
      case 'year':
        return dateString
      case 'month':
      default:
        const [year, month] = dateString.split('-')
        if (!year || !month) return dateString
        return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('da-DK', {
          year: 'numeric',
          month: 'short',
        })
    }
  }

  interface TooltipProps {
    active?: boolean
    payload?: Array<{
      dataKey: string
      value: number
      color: string
    }>
    label?: string
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload?.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-md">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                Period
              </span>
              <span className="font-bold text-muted-foreground">
                {/* {label ? formatDate(label) : ''} */}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                Net
              </span>
              <span className="font-bold">
                {formatCurrency(payload.find((p) => p.dataKey === 'net')?.value ?? 0)}
              </span>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-green-600">
                Income
              </span>
              <span className="font-bold text-green-600">
                {formatCurrency(payload.find((p) => p.dataKey === 'income')?.value ?? 0)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-red-600">
                Expenses
              </span>
              <span className="font-bold text-red-600">
                {formatCurrency(payload.find((p) => p.dataKey === 'expenses')?.value ?? 0)}
              </span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Income vs Expenses Over Time</CardTitle>
          <CardDescription>Error loading chart data</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Income vs Expenses Over Time</CardTitle>
          <CardDescription>
            Track your financial flow over time to identify trends and patterns
          </CardDescription>
        </div>
        <div className="flex gap-1">
          {intervalOptions.map((option) => (
            <Button
              key={option.value}
              variant={interval === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setInterval(option.value)}
              disabled={isLoading}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-[400px] items-center justify-center">
            <div className="text-sm text-muted-foreground">Loading chart data...</div>
          </div>
        ) : data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={data.map(item => ({
                ...item,
                // date: formatDate(item.date)
              }))}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 12 }}
                tickFormatter={formatCurrency}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#16a34a"
                strokeWidth={2}
                name="Income"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#dc2626"
                strokeWidth={2}
                name="Expenses"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="net"
                stroke="#2563eb"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Net Flow"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[400px] items-center justify-center">
            <div className="text-sm text-muted-foreground">
              No data available for the selected period
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
