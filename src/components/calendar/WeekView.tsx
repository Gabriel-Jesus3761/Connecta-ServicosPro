import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Appointment } from '@/types'
import { theme } from '@/styles/theme'

interface WeekViewProps {
  appointments: Appointment[]
  currentDate: Date
  onDateChange: (date: Date) => void
  onAppointmentClick?: (appointment: Appointment) => void
}

export function WeekView({ appointments, currentDate, onDateChange, onAppointmentClick }: WeekViewProps) {
  const getWeekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day

    const weekDays = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentDate)
      date.setDate(diff + i)
      weekDays.push(date)
    }
    return weekDays
  }, [currentDate])

  const previousWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() - 7)
    onDateChange(newDate)
  }

  const nextWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + 7)
    onDateChange(newDate)
  }

  const goToToday = () => {
    onDateChange(new Date())
  }

  const getAppointmentsForDay = (date: Date) => {
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

  const formatWeekRange = () => {
    const firstDay = getWeekDays[0]
    const lastDay = getWeekDays[6]

    const firstDayStr = firstDay.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
    const lastDayStr = lastDay.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })

    return `${firstDayStr} - ${lastDayStr}`
  }

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gold">
            {formatWeekRange()}
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {appointments.length} agendamento{appointments.length !== 1 ? 's' : ''} na semana
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="hidden sm:flex"
          >
            Esta Semana
          </Button>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={previousWeek}
              className="h-9 w-9 text-gray-400 hover:text-gold"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextWeek}
              className="h-9 w-9 text-gray-400 hover:text-gold"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Week Grid */}
      <Card className={`${theme.colors.card.base} border-gold/20`}>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {getWeekDays.map((date, index) => {
              const dayAppointments = getAppointmentsForDay(date)
              const isCurrentDay = isToday(date)

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`
                    min-h-[300px] border rounded-lg p-3 transition-all
                    ${isCurrentDay
                      ? 'bg-gold/10 border-gold shadow-lg shadow-gold/20'
                      : 'bg-gray-900/30 border-gray-700 hover:border-gold/50'
                    }
                  `}
                >
                  {/* Cabeçalho do dia */}
                  <div className="mb-3 pb-2 border-b border-gray-700">
                    <div className={`text-xs font-semibold ${isCurrentDay ? 'text-gold' : 'text-gray-400'}`}>
                      {dayNames[date.getDay()]}
                    </div>
                    <div className={`text-2xl font-bold ${isCurrentDay ? 'text-gold' : 'text-white'}`}>
                      {date.getDate()}
                    </div>
                    {dayAppointments.length > 0 && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {dayAppointments.length}
                      </Badge>
                    )}
                  </div>

                  {/* Lista de agendamentos */}
                  <div className="space-y-2">
                    {dayAppointments.map((appointment) => (
                      <motion.div
                        key={appointment.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => onAppointmentClick?.(appointment)}
                        className={`
                          p-2 rounded border-l-2 cursor-pointer
                          text-xs transition-all
                          ${getStatusColor(appointment.status)}
                          hover:shadow-md
                        `}
                      >
                        <div className="flex items-center gap-1 mb-1">
                          <Clock className="w-3 h-3" />
                          <span className="font-bold">{appointment.time}</span>
                        </div>
                        <div className="font-semibold text-white mb-0.5">
                          {appointment.clientName}
                        </div>
                        <div className="opacity-80 truncate">
                          {appointment.service}
                        </div>
                      </motion.div>
                    ))}

                    {dayAppointments.length === 0 && (
                      <div className="text-center text-gray-600 text-xs py-4">
                        Sem agendamentos
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
