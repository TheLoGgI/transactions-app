import { useState, useMemo, useCallback } from "react"

interface DateRange {
  from: Date
  to: Date
}

export function useDateRange() {
  const [selectedPeriod, setSelectedPeriod] = useState("lastMonth")
  
  const today = useMemo(() => new Date(), [])
  
  const defaultDate = useMemo(() => ({
    from: new Date(today.getFullYear(), today.getMonth() - 1, 1, 0, 0, 0),
    to: new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59),
  }), [today])

  const [dateRange, setDateRange] = useState<DateRange>(defaultDate)

  const urlQuery = useMemo(() => {
    if (!dateRange) return ""
    return `?from=${dateRange.from.toISOString()}&to=${(dateRange.to ?? dateRange.from).toISOString()}`
  }, [dateRange])

  // Helper function to set predefined date ranges
  const setPredefinedRange = useCallback((period: string) => {
    const today = new Date()
    
    const ranges = {
      "current": {
        to: today,
        from: new Date(today.getFullYear(), today.getMonth(), 1, 0, 23, 59, 59),
      },
      "lastMonth": defaultDate,
      "last3months": {
        to: new Date(today.getFullYear(), today.getMonth(), 0, 1, 0, 0, 0),
        from: new Date(today.getFullYear(), today.getMonth() - 3, 1, 0, 23, 59, 59),
      },
      "last6months": {
        to: new Date(today.getFullYear(), today.getMonth(), 0, 1, 0, 0, 0),
        from: new Date(today.getFullYear(), today.getMonth() - 6, 1, 0, 23, 59, 59),
      },
      "last12month": {
        to: new Date(today.getFullYear(), today.getMonth(), 0, 1, 0, 0, 0),
        from: new Date(today.getFullYear() - 1, today.getMonth(), 1, 0, 23, 59, 59),
      },
      all: {
        from: new Date(2020, 0, 1, 23, 59, 59),
        to: today,
      },
    }

    if (period in ranges) {
      setDateRange(ranges[period as keyof typeof ranges])
      setSelectedPeriod(period)
    }
  }, [defaultDate])

  return {
    selectedPeriod,
    dateRange,
    urlQuery,
    setDateRange,
    setPredefinedRange,
  }
}
