"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import type { TimeRange } from "@/types/analytics"

interface AnalyticsHeaderProps {
  timeRange: TimeRange
  onTimeRangeChange: (range: TimeRange) => void
  dateRange: { from: Date; to: Date }
  onDateRangeChange: (range: { from: Date; to: Date }) => void
  onApply: () => void
}

export function CalendarItem({
  timeRange,
  onTimeRangeChange,
  dateRange,
  onDateRangeChange,
  onApply,
}: AnalyticsHeaderProps) {

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={timeRange} onValueChange={(value: TimeRange) => onTimeRangeChange(value)}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Theo ngày</SelectItem>
            <SelectItem value="week">Tuần trước</SelectItem>
            <SelectItem value="month">Tháng trước</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto bg-transparent">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(dateRange.from, "dd/MM/yyyy", { locale: vi })} -{" "}
              {format(dateRange.to, "dd/MM/yyyy", { locale: vi })}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="range"
              locale={vi}
              selected={{ from: dateRange.from, to: dateRange.to }}
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  onDateRangeChange({ from: range.from, to: range.to })
                }
              }}
              numberOfMonths={2}
              showOutsideDays={false}
            />
          </PopoverContent>
        </Popover>

        <Button onClick={onApply} className="bg-orange-500 hover:bg-orange-600 text-white">
          Áp dụng
        </Button>
      </div>
    </div>
  )
}
