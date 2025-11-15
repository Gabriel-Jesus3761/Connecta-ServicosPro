import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useOutletContext } from 'react-router-dom'
import { Calendar, DollarSign, Users, Clock, TrendingUp, UserCheck, Scissors } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { mockAppointments } from '@/data/mockData'
import { formatCurrency, formatDate } from '@/lib/utils'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export function Dashboard() {
  const { setIsMobileMenuOpen } = useOutletContext<{ setIsMobileMenuOpen: (value: boolean) => void }>()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Filtrar apenas agendamentos de hoje
  const todayAppointments = useMemo(() => {
    return mockAppointments.filter(apt => {
      const aptDate = new Date(apt.date)
      aptDate.setHours(0, 0, 0, 0)
      return aptDate.getTime() === today.getTime()
    })
  }, [today])

  // Próximos agendamentos de hoje
  const upcomingToday = useMemo(() => {
    const now = new Date()
    return todayAppointments
      .filter(apt => apt.date >= now)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 6)
  }, [todayAppointments])

  // Estatísticas de hoje
  const todayStats = useMemo(() => {
    const completed = todayAppointments.filter(apt => apt.status === 'completed')
    const confirmed = todayAppointments.filter(apt => apt.status === 'confirmed')
    const pending = todayAppointments.filter(apt => apt.status === 'pending')
    const cancelled = todayAppointments.filter(apt => apt.status === 'cancelled')
    const totalRevenue = completed.reduce((sum, apt) => sum + apt.price, 0)

    return {
      total: todayAppointments.length,
      completed: completed.length,
      confirmed: confirmed.length,
      pending: pending.length,
      cancelled: cancelled.length,
      revenue: totalRevenue
    }
  }, [todayAppointments])

  // Top 3 profissionais de hoje
  const topProfessionalsToday = useMemo(() => {
    const profStats = new Map<string, { name: string; count: number; revenue: number }>()

    todayAppointments
      .filter(apt => apt.status === 'completed')
      .forEach(apt => {
        const existing = profStats.get(apt.professional) || { name: apt.professional, count: 0, revenue: 0 }
        profStats.set(apt.professional, {
          ...existing,
          count: existing.count + 1,
          revenue: existing.revenue + apt.price
        })
      })

    return Array.from(profStats.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3)
  }, [todayAppointments])

  // Top 3 serviços de hoje
  const topServicesToday = useMemo(() => {
    const serviceStats = new Map<string, { name: string; count: number; revenue: number }>()

    todayAppointments
      .filter(apt => apt.status === 'completed')
      .forEach(apt => {
        const existing = serviceStats.get(apt.service) || { name: apt.service, count: 0, revenue: 0 }
        serviceStats.set(apt.service, {
          ...existing,
          count: existing.count + 1,
          revenue: existing.revenue + apt.price
        })
      })

    return Array.from(serviceStats.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
  }, [todayAppointments])

  // Clientes únicos de hoje
  const uniqueClientsToday = useMemo(() => {
    const clients = new Set(todayAppointments.map(apt => apt.clientName))
    return clients.size
  }, [todayAppointments])

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
    <div>
      <Header
        title="Dashboard Geral"
        subtitle={`Visão geral do dia - ${formatDate(new Date())}`}
        onMobileMenuClick={() => setIsMobileMenuOpen(true)}
      />

      <div className="p-4 md:p-8">
        {/* Stats Grid - Cards de resumo do dia */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <motion.div variants={item}>
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Agendamentos Hoje
                    </p>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">
                      {todayStats.total}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {todayStats.completed} concluídos, {todayStats.confirmed} confirmados
                    </p>
                  </div>
                  <div className="bg-blue-500 p-3 rounded-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Receita Hoje
                    </p>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">
                      {formatCurrency(todayStats.revenue)}
                    </h3>
                    <p className="text-xs text-gray-500">
                      De {todayStats.completed} serviços concluídos
                    </p>
                  </div>
                  <div className="bg-green-500 p-3 rounded-lg">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Clientes Atendidos
                    </p>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">
                      {uniqueClientsToday}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Clientes únicos hoje
                    </p>
                  </div>
                  <div className="bg-purple-500 p-3 rounded-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Status do Dia
                    </p>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">
                      {todayStats.pending}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Pendentes • {todayStats.cancelled} cancelados
                    </p>
                  </div>
                  <div className="bg-gold p-3 rounded-lg">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Top Profissionais Hoje */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center gap-2 text-base">
                  <UserCheck className="w-5 h-5 text-gold" />
                  Top Profissionais Hoje
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {topProfessionalsToday.length > 0 ? (
                  <div className="space-y-4">
                    {topProfessionalsToday.map((prof, index) => (
                      <div key={prof.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                            ${index === 0 ? 'bg-gold text-white' : 'bg-gray-100 text-gray-600'}
                          `}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{prof.name}</p>
                            <p className="text-xs text-gray-500">{prof.count} atendimentos</p>
                          </div>
                        </div>
                        <span className="font-bold text-gray-900">
                          {formatCurrency(prof.revenue)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 text-sm py-4">
                    Nenhum atendimento concluído hoje
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Serviços Hoje */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Scissors className="w-5 h-5 text-gold" />
                  Serviços Mais Realizados
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {topServicesToday.length > 0 ? (
                  <div className="space-y-4">
                    {topServicesToday.map((service, index) => (
                      <div key={service.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                            ${index === 0 ? 'bg-gold text-white' : 'bg-gray-100 text-gray-600'}
                          `}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{service.name}</p>
                            <p className="text-xs text-gray-500">{service.count}x realizados</p>
                          </div>
                        </div>
                        <span className="font-bold text-gray-900">
                          {formatCurrency(service.revenue)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 text-sm py-4">
                    Nenhum serviço concluído hoje
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Resumo do Dia */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-gradient-to-br from-gray-900 to-black text-white">
              <CardHeader className="border-b border-gold/20">
                <CardTitle className="flex items-center gap-2 text-base text-white">
                  <TrendingUp className="w-5 h-5 text-gold" />
                  Resumo do Dia
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Total de Agendamentos</p>
                    <h3 className="text-3xl font-bold">{todayStats.total}</h3>
                  </div>

                  <div className="pt-4 border-t border-gray-700">
                    <p className="text-sm text-gray-400 mb-2">Status</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-green-400">Concluídos</span>
                        <span className="font-semibold">{todayStats.completed}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-blue-400">Confirmados</span>
                        <span className="font-semibold">{todayStats.confirmed}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-yellow-400">Pendentes</span>
                        <span className="font-semibold">{todayStats.pending}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-red-400">Cancelados</span>
                        <span className="font-semibold">{todayStats.cancelled}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-700">
                    <p className="text-sm text-gray-400 mb-1">Receita Total</p>
                    <h3 className="text-2xl font-bold text-gold">
                      {formatCurrency(todayStats.revenue)}
                    </h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Próximos Agendamentos de Hoje */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gold" />
                  Próximos Agendamentos de Hoje
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {upcomingToday.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {upcomingToday.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4 flex-1">
                          <div className="bg-gold/10 rounded-lg p-3 flex flex-col items-center justify-center min-w-[60px]">
                            <span className="text-xs uppercase text-gold font-semibold">
                              Hoje
                            </span>
                            <span className="text-2xl font-bold text-gray-900">
                              {appointment.time}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {appointment.clientName}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                              {appointment.service}
                            </p>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <UserCheck className="w-4 h-4" />
                                {appointment.professional}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {appointment.duration} min
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={getStatusColor(appointment.status)}>
                            {getStatusLabel(appointment.status)}
                          </Badge>
                          <p className="text-lg font-bold text-gray-900 mt-2">
                            {formatCurrency(appointment.price)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  Nenhum agendamento pendente para hoje
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
