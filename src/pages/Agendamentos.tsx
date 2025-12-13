import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, User, Scissors, Filter, Plus, List, CalendarDays, CalendarRange, CalendarClock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { mockAppointments } from '@/data/mockData'
import { formatCurrency, formatDate } from '@/lib/utils'
import { theme, pageClasses } from '@/styles/theme'
import { CalendarView, CalendarMode } from '@/components/calendar/CalendarView'

type ViewMode = 'list' | 'calendar'

export function Agendamentos() {
  const [filter, setFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('month')

  const filteredAppointments = mockAppointments.filter(apt => {
    if (filter === 'all') return true
    return apt.status === filter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'success'
      case 'pending':
        return 'warning'
      case 'completed':
        return 'default'
      case 'cancelled':
        return 'destructive'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado'
      case 'pending':
        return 'Pendente'
      case 'completed':
        return 'Concluído'
      case 'cancelled':
        return 'Cancelado'
      default:
        return status
    }
  }

  return (
    <div className="min-h-screen text-white">
      <div className={pageClasses.content()}>
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gold mb-2">Agendamentos</h1>
          <p className="text-sm text-gray-400">Gerencie todos os agendamentos</p>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between mb-6 gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
            <Input
              type="search"
              placeholder="Buscar cliente..."
              className="w-full sm:w-80"
            />
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
                className="whitespace-nowrap"
              >
                Todos
              </Button>
              <Button
                variant={filter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('pending')}
                className="whitespace-nowrap"
              >
                Pendentes
              </Button>
              <Button
                variant={filter === 'confirmed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('confirmed')}
                className="whitespace-nowrap"
              >
                Confirmados
              </Button>
              <Button
                variant={filter === 'completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('completed')}
                className="whitespace-nowrap"
              >
                Concluídos
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Toggle de Visualização */}
            <div className="flex items-center gap-1 border border-gray-700 rounded-lg p-1">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 px-3"
              >
                <List className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Lista</span>
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('calendar')}
                className="h-8 px-3"
              >
                <CalendarDays className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Calendário</span>
              </Button>
            </div>

            <Button variant="outline" size="sm" className="flex-1 sm:flex-initial">
              <Filter className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Filtros</span>
            </Button>
            <Button variant="gold" size="sm" className="flex-1 sm:flex-initial">
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Novo</span>
              <span className="sm:hidden">Novo Agendamento</span>
            </Button>
          </div>
        </div>

        {/* Calendar Mode Selector - Only visible when in calendar view */}
        {viewMode === 'calendar' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <span className="text-sm text-gray-400 mr-2">Visualizar:</span>
            <Button
              variant={calendarMode === 'day' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCalendarMode('day')}
              className="whitespace-nowrap"
            >
              <CalendarClock className="w-4 h-4 mr-1" />
              Dia
            </Button>
            <Button
              variant={calendarMode === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCalendarMode('week')}
              className="whitespace-nowrap"
            >
              <CalendarRange className="w-4 h-4 mr-1" />
              Semana
            </Button>
            <Button
              variant={calendarMode === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCalendarMode('month')}
              className="whitespace-nowrap"
            >
              <CalendarDays className="w-4 h-4 mr-1" />
              Mês
            </Button>
            <Button
              variant={calendarMode === 'year' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCalendarMode('year')}
              className="whitespace-nowrap"
            >
              <Calendar className="w-4 h-4 mr-1" />
              Ano
            </Button>
          </div>
        )}

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <CalendarView
            appointments={filteredAppointments}
            mode={calendarMode}
            onAppointmentClick={(apt) => console.log('Clicked appointment:', apt)}
          />
        )}

        {/* List View - Appointments Grid */}
        {viewMode === 'list' && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredAppointments.map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`${theme.colors.card.base} hover:shadow-lg transition-all duration-200 border-l-4 border-l-gold`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <Badge variant={getStatusColor(appointment.status)}>
                          {getStatusLabel(appointment.status)}
                        </Badge>
                        <span className="text-xl font-bold text-gold">
                          {formatCurrency(appointment.price)}
                        </span>
                      </div>

                      <h3 className={`text-lg font-bold ${theme.colors.text.primary} mb-3`}>
                        {appointment.clientName}
                      </h3>

                      <div className="space-y-2 mb-4">
                        <div className={`flex items-center gap-2 text-sm ${theme.colors.text.secondary}`}>
                          <Scissors className="w-4 h-4 text-gold" />
                          <span>{appointment.service}</span>
                        </div>
                        <div className={`flex items-center gap-2 text-sm ${theme.colors.text.secondary}`}>
                          <User className="w-4 h-4 text-gold" />
                          <span>{appointment.professional}</span>
                        </div>
                        <div className={`flex items-center gap-2 text-sm ${theme.colors.text.secondary}`}>
                          <Calendar className="w-4 h-4 text-gold" />
                          <span>{formatDate(appointment.date)}</span>
                        </div>
                        <div className={`flex items-center gap-2 text-sm ${theme.colors.text.secondary}`}>
                          <Clock className="w-4 h-4 text-gold" />
                          <span>{appointment.time} • {appointment.duration} min</span>
                        </div>
                      </div>

                      <div className={`flex gap-2 pt-4 border-t ${theme.colors.border.light}`}>
                        <Button variant="outline" size="sm" className="flex-1">
                          Editar
                        </Button>
                        <Button variant="ghost" size="sm" className="flex-1 text-gold hover:text-gold-dark">
                          Detalhes
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {filteredAppointments.length === 0 && (
              <div className="text-center py-12">
                <Calendar className={`w-16 h-16 ${theme.colors.text.tertiary} mx-auto mb-4`} />
                <h3 className={`text-lg font-semibold ${theme.colors.text.secondary} mb-2`}>
                  Nenhum agendamento encontrado
                </h3>
                <p className={theme.colors.text.tertiary}>
                  Tente ajustar os filtros ou criar um novo agendamento
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
