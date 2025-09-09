import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

interface DateRangeProps {
  onChange: (value: string) => void;
  // setDateRange: (range: { from: Date; to: Date }) => void;
  // dateRange: { from: Date; to: Date }
  selectedPeriod: string;
}

export const DateRangeSelector = ({ selectedPeriod, onChange }: DateRangeProps) => {


  return (
    <Select value={selectedPeriod} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select period" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="current">Indeværende Månede</SelectItem>
        <SelectItem value="lastMonth">Sidste månede</SelectItem>
        <SelectItem value="last3months">Sidste 3 måneder</SelectItem>
        <SelectItem value="last6months">Sidste 6 måneder</SelectItem>
        <SelectItem value="last12month">Sidste 12 måneder</SelectItem>
        <SelectItem value="all">Altid</SelectItem>
        {/* <SelectItem value="custom">Custom range</SelectItem> */}
      </SelectContent>
    </Select>
  )
}