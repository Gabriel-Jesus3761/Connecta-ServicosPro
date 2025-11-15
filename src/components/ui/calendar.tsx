import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export type CalendarProps = {
  mode?: "single" | "range"
  selected?: Date | { from?: Date; to?: Date }
  onSelect?: (date: Date | { from?: Date; to?: Date } | undefined) => void
  className?: string
  numberOfMonths?: number
}

export function Calendar({
  mode = "single",
  selected,
  onSelect,
  className,
}: CalendarProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date())

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ]

  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)

    if (mode === "single") {
      onSelect?.(clickedDate)
    } else if (mode === "range") {
      const range = selected as { from?: Date; to?: Date } | undefined

      if (!range?.from || (range.from && range.to)) {
        onSelect?.({ from: clickedDate, to: undefined })
      } else {
        if (clickedDate < range.from) {
          onSelect?.({ from: clickedDate, to: range.from })
        } else {
          onSelect?.({ from: range.from, to: clickedDate })
        }
      }
    }
  }

  const isSelected = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)

    if (mode === "single") {
      const selectedDate = selected as Date | undefined
      return selectedDate?.toDateString() === date.toDateString()
    } else {
      const range = selected as { from?: Date; to?: Date } | undefined
      if (!range?.from) return false

      const dateTime = date.getTime()
      const fromTime = range.from.getTime()
      const toTime = range.to?.getTime()

      if (toTime) {
        return dateTime >= fromTime && dateTime <= toTime
      }
      return range.from.toDateString() === date.toDateString()
    }
  }

  const isRangeStart = (day: number) => {
    if (mode !== "range") return false
    const range = selected as { from?: Date; to?: Date } | undefined
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    return range?.from?.toDateString() === date.toDateString()
  }

  const isRangeEnd = (day: number) => {
    if (mode !== "range") return false
    const range = selected as { from?: Date; to?: Date } | undefined
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    return range?.to?.toDateString() === date.toDateString()
  }

  const renderDays = () => {
    const days = []
    const totalDays = daysInMonth(currentDate)
    const firstDay = firstDayOfMonth(currentDate)

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2" />)
    }

    // Days of the month
    for (let day = 1; day <= totalDays; day++) {
      const selected = isSelected(day)
      const rangeStart = isRangeStart(day)
      const rangeEnd = isRangeEnd(day)

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          className={cn(
            "p-2 text-sm rounded-md hover:bg-gold/10 transition-colors",
            selected && "bg-gold text-white hover:bg-gold-dark",
            rangeStart && "rounded-r-none",
            rangeEnd && "rounded-l-none",
            selected && !rangeStart && !rangeEnd && mode === "range" && "rounded-none"
          )}
        >
          {day}
        </button>
      )
    }

    return days
  }

  return (
    <div className={cn("p-4 bg-white rounded-lg border", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={previousMonth}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <h3 className="font-semibold text-sm">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>

        <Button
          variant="ghost"
          size="icon"
          onClick={nextMonth}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((name) => (
          <div key={name} className="text-xs text-gray-500 text-center font-medium p-2">
            {name}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {renderDays()}
      </div>
    </div>
  )
}
