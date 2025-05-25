import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

interface DateRangeProps {
onChange: (value: string) => void;
// setDateRange: (range: { from: Date; to: Date }) => void;
// dateRange: { from: Date; to: Date }
selectedPeriod: string;
}

export const DateRangeSelector = ({selectedPeriod, onChange}: DateRangeProps) => {
  

    return (
        <div className="flex items-center gap-2">
            <Select value={selectedPeriod} onValueChange={onChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="3months">Last 3 months</SelectItem>
                <SelectItem value="6months">Last 6 months</SelectItem>
                <SelectItem value="1year">Last year</SelectItem>
                <SelectItem value="all">All time</SelectItem>
                {/* <SelectItem value="custom">Custom range</SelectItem> */}
              </SelectContent>
            </Select>

            {/* {selectedPeriod === "custom" && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {dateRange.from.toLocaleDateString()} - {dateRange.to.toLocaleDateString()}
                        </>
                      ) : (
                        dateRange.from.toLocaleDateString()
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={(range) => {setDateRange(range)}}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            )} */}
          </div>
    )
}