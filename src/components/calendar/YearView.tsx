import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Appointment } from '@/types'
import { theme } from '@/styles/theme'

interface YearViewProps {
  appointments: Appointment[]
  currentDate: Date
  onDateChange: (date: Date) => void
  onMonthClick?: (month: number) => void
}

export function YearView({ appointments, currentDate, onDateChange, onMonthClick }: YearViewProps) {
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  const dayNamesShort = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

  const previousYear = () => {
    const newDate = new Date(currentDate)
    newDate.setFullYear(newDate.getFullYear() - 1)
    onDateChange(newDate)
  }

  const nextYear = () => {
    const newDate = new Date(currentDate)
    newDate.setFullYear(newDate.getFullYear() + 1)
    onDateChange(newDate)
  }

  const goToCurrentYear = () => {
    onDateChange(new Date())
  }

  const getMonthData = (monthIndex: number) => {
    const year = currentDate.getFullYear()
    const firstDayOfMonth = new Date(year, monthIndex, 1)
    const lastDayOfMonth = new Date(year, monthIndex + 1, 0)
    const firstDayOfWeek = firstDayOfMonth.getDay()
    const daysInMonth = lastDayOfMonth.getDate()

    const days: Array<{ date: number | null; hasAppointments: boolean }> = []

    // Dias vazios antes do início do mês
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ date: null, hasAppointments: false })
    }

    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const hasAppointments = appointments.some(apt => {
        const aptDate = new Date(apt.date)
        return aptDate.getDate() === day &&
               aptDate.getMonth() === monthIndex &&
               aptDate.getFullYear() === year
      })
      days.push({ date: day, hasAppointments })
    }

    return days
  }

  const getMonthAppointmentsCount = (monthIndex: number) => {
    const year = currentDate.getFullYear()
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date)
      return aptDate.getMonth() === monthIndex && aptDate.getFullYear() === year
    }).length
  }

  const getMonthRevenue = (monthIndex: number) => {
    const year = currentDate.getFullYear()
    return appointments
      .filter(apt => {
        const aptDate = new Date(apt.date)
        return aptDate.getMonth() === monthIndex && aptDate.getFullYear() === year
      })
      .reduce((sum, apt) => sum + apt.price, 0)
  }

  const isToday = (monthIndex: number, day: number) => {
    const today = new Date()
    return today.getDate() === day &&
           today.getMonth() === monthIndex &&
           today.getFullYear() === currentDate.getFullYear()
  }

  const yearStats = useMemo(() => {
    const year = currentDate.getFullYear()
    const yearAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.date)
      return aptDate.getFullYear() === year
    })

    return {
      totalAppointments: yearAppointments.length,
      totalRevenue: yearAppointments.reduce((sum, apt) => sum + apt.price, 0),
      averagePerMonth: yearAppointments.length / 12
    }
  }, [appointments, currentDate])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gold">
            {currentDate.getFullYear()}
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {yearStats.totalAppointments} agendamentos no ano
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToCurrentYear}
            className="hidden sm:flex"
          >
            Ano Atual
          </Button>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={previousYear}
              className="h-9 w-9 text-gray-400 hover:text-gold"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextYear}
              className="h-9 w-9 text-gray-400 hover:text-gold"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Year Stats */}
      <Card className={`${theme.colors.card.base} border-gold/20`}>
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gold">{yearStats.totalAppointments}</div>
              <div className="text-xs text-gray-400">Total de Agendamentos</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gold">
                R$ {yearStats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-gray-400">Receita Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gold">
                {yearStats.averagePerMonth.toFixed(1)}
              </div>
              <div className="text-xs text-gray-400">Média por Mês</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Months Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {monthNames.map((monthName, monthIndex) => {
          const monthDays = getMonthData(monthIndex)
          const appointmentsCount = getMonthAppointmentsCount(monthIndex)
          const revenue = getMonthRevenue(monthIndex)

          return (
            <motion.div
              key={monthIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: monthIndex * 0.03 }}
            >
              <Card
                className={`${theme.colors.card.base} border-gray-700 hover:border-gold/50 transition-all cursor-pointer`}
                onClick={() => onMonthClick?.(monthIndex)}
              >
                <CardContent className="p-3">
                  {/* Month Header */}
                  <div className="mb-2">
                    <h3 className="font-bold text-sm text-gold mb-1">{monthName}</h3>
                    {appointmentsCount > 0 && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">{appointmentsCount} agend.</span>
                        <span className="text-green-400">
                          R$ {revenue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Day Names */}
                  <div className="grid grid-cols-7 gap-0.5 mb-1">
                    {dayNamesShort.map((day, i) => (
                      <div
                        key={i}
                        className="text-[8px] text-center text-gray-500 font-semibold"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Mini Calendar */}
                  <div className="grid grid-cols-7 gap-0.5">
                    {monthDays.map((day, index) => {
                      const isTodayDate = day.date ? isToday(monthIndex, day.date) : false

                      return (
                        <div
                          key={index}
                          className={`
                            aspect-square flex items-center justify-center text-[9px] rounded
                            ${day.date ? 'text-gray-300' : ''}
                            ${day.hasAppointments ? 'bg-gold/30 text-white font-bold' : ''}
                            ${isTodayDate ? 'ring-1 ring-gold bg-gold/20' : ''}
                          `}
                        >
                          {day.date}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
