import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Appointment } from '@/types'
import { theme } from '@/styles/theme'
import { DayView } from './DayView'
import { WeekView } from './WeekView'
import { YearView } from './YearView'

export type CalendarMode = 'day' | 'week' | 'month' | 'year'

interface CalendarViewProps {
  appointments: Appointment[]
  mode?: CalendarMode
  onAppointmentClick?: (appointment: Appointment) => void
}

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  appointments: Appointment[]
}

export function CalendarView({ appointments, mode = 'month', onAppointmentClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date)
      return aptDate.getDate() === date.getDate() &&
             aptDate.getMonth() === date.getMonth() &&
             aptDate.getFullYear() === date.getFullYear()
    }).sort((a, b) => {
      const timeA = a.time.split(':').map(Number)
      const timeB = b.time.split(':').map(Number)
      return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1])
    })
  }

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)
    const firstDayOfWeek = firstDayOfMonth.getDay()
    const daysInMonth = lastDayOfMonth.getDate()

    const days: CalendarDay[] = []

    // Dias do mês anterior
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i)
      days.push({
        date,
        isCurrentMonth: false,
        appointments: getAppointmentsForDate(date)
      })
    }

    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      days.push({
        date,
        isCurrentMonth: true,
        appointments: getAppointmentsForDate(date)
      })
    }

    // Dias do próximo mês para completar a grade
    const remainingDays = 42 - days.length // 6 semanas * 7 dias
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day)
      days.push({
        date,
        isCurrentMonth: false,
        appointments: getAppointmentsForDate(date)
      })
    }

    return days
  }, [currentDate, appointments])

  const isToday = (date: Date) => {
    const today = new Date()
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-500/20 border-blue-500 text-blue-200'
      case 'pending':
        return 'bg-yellow-500/20 border-yellow-500 text-yellow-200'
      case 'completed':
        return 'bg-green-500/20 border-green-500 text-green-200'
      case 'cancelled':
        return 'bg-red-500/20 border-red-500 text-red-200'
      default:
        return 'bg-gray-500/20 border-gray-500 text-gray-200'
    }
  }

  // Renderizar componentes específicos baseado no modo (após todos os hooks)
  if (mode === 'day') {
    return (
      <DayView
        appointments={appointments}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        onAppointmentClick={onAppointmentClick}
      />
    )
  }

  if (mode === 'week') {
    return (
      <WeekView
        appointments={appointments}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        onAppointmentClick={onAppointmentClick}
      />
    )
  }

  if (mode === 'year') {
    return (
      <YearView
        appointments={appointments}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        onMonthClick={(month) => {
          const newDate = new Date(currentDate.getFullYear(), month, 1)
          setCurrentDate(newDate)
        }}
      />
    )
  }

  // Visualização mensal (padrão)
  return (
    <div className="space-y-4">
      {/* Header do Calendário */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {appointments.length} agendamento{appointments.length !== 1 ? 's' : ''} no total
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="hidden sm:flex"
          >
            Hoje
          </Button>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={previousMonth}
              className="h-9 w-9 text-gray-400 hover:text-gold"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextMonth}
              className="h-9 w-9 text-gray-400 hover:text-gold"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Grade do Calendário */}
      <Card className={`${theme.colors.card.base} border-gold/20`}>
        <CardContent className="p-4">
          {/* Cabeçalho dos dias da semana */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {dayNames.map((day, index) => (
              <div
                key={`day-name-${index}`}
                className={`text-center text-sm font-semibold py-2 ${
                  index === 0 || index === 6 ? 'text-gold/70' : 'text-gray-400'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Grade de dias */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => {
              const isCurrentDay = isToday(day.date)

              return (
                <motion.div
                  key={`day-${index}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.005 }}
                  className={`
                    min-h-[120px] border rounded-lg p-2 transition-all duration-200
                    ${day.isCurrentMonth
                      ? 'bg-gray-900/50 border-gray-700'
                      : 'bg-gray-900/20 border-gray-800'
                    }
                    ${isCurrentDay
                      ? 'ring-2 ring-gold shadow-lg shadow-gold/20'
                      : ''
                    }
                    hover:border-gold/50 hover:shadow-md
                  `}
                >
                  {/* Número do dia */}
                  <div className="flex items-center justify-between mb-1">
                    <span className={`
                      text-sm font-semibold
                      ${day.isCurrentMonth ? 'text-white' : 'text-gray-600'}
                      ${isCurrentDay ? 'text-gold' : ''}
                    `}>
                      {day.date.getDate()}
                    </span>
                    {day.appointments.length > 0 && (
                      <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                        {day.appointments.length}
                      </Badge>
                    )}
                  </div>

                  {/* Lista de agendamentos do dia */}
                  <div className="space-y-1">
                    {day.appointments.slice(0, 3).map((appointment) => (
                      <motion.div
                        key={appointment.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => onAppointmentClick?.(appointment)}
                        className={`
                          text-xs p-1.5 rounded border-l-2 cursor-pointer
                          transition-all duration-200
                          ${getStatusColor(appointment.status)}
                          hover:shadow-md
                        `}
                      >
                        <div className="flex items-center gap-1 mb-0.5">
                          <Clock className="w-3 h-3" />
                          <span className="font-medium">{appointment.time}</span>
                        </div>
                        <div className="font-semibold truncate">
                          {appointment.clientName}
                        </div>
                        <div className="text-xs opacity-80 truncate">
                          {appointment.service}
                        </div>
                      </motion.div>
                    ))}

                    {day.appointments.length > 3 && (
                      <div className="text-xs text-gray-500 text-center py-1">
                        +{day.appointments.length - 3} mais
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legenda */}
      <div className="flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded border-2 border-blue-500 bg-blue-500/20" />
          <span className="text-gray-400">Confirmado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded border-2 border-yellow-500 bg-yellow-500/20" />
          <span className="text-gray-400">Pendente</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded border-2 border-green-500 bg-green-500/20" />
          <span className="text-gray-400">Concluído</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded border-2 border-red-500 bg-red-500/20" />
          <span className="text-gray-400">Cancelado</span>
        </div>
      </div>
    </div>
  )
}
