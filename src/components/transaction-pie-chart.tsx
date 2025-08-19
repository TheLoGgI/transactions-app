"use client"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface ChartData {
  name: string
  value: number
  color: string
}

interface TransactionPieChartProps {
  data: ChartData[]
}

export function TransactionPieChart({ data }: TransactionPieChartProps) {
  // Filter out zero values to avoid rendering issues
  const filteredData = data.filter((item) => item.value > 0)

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={filteredData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={175}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          scale=""
          // label={({ name, value }) => `${name}: ${value}%`}
        >
          {filteredData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number, name,) => [`${value}%`, name]} />
        {/* <Legend /> */}
      </PieChart>
    </ResponsiveContainer>
  )
}
