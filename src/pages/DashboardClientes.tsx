import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useOutletContext } from 'react-router-dom'
import { Users, DollarSign, TrendingUp, Calendar, UserPlus, Award } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DateRangePicker } from '@/components/DateRangePicker'
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

type DateRange = { from?: Date; to?: Date }

interface ClientStats {
  name: string
  totalRevenue: number
  appointmentsCount: number
  completedCount: number
  cancelledCount: number
  lastVisit: Date
  firstVisit: Date
  favoriteService: string
  averageSpent: number
  completionRate: number
}

export function DashboardClientes() {
  const { setIsMobileMenuOpen } = useOutletContext<{ setIsMobileMenuOpen: (value: boolean) => void }>()
  const today = new Date()

  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(today.getFullYear(), today.getMonth(), 1),
    to: today
  })

  // Filtrar agendamentos por data
  const filteredAppointments = useMemo(() => {
    if (!dateRange.from) return []

    return mockAppointments.filter(apt => {
      const aptDate = new Date(apt.date)
      aptDate.setHours(0, 0, 0, 0)

      const fromDate = new Date(dateRange.from!)
      fromDate.setHours(0, 0, 0, 0)

      if (dateRange.to) {
        const toDate = new Date(dateRange.to)
        toDate.setHours(23, 59, 59, 999)
        return aptDate >= fromDate && aptDate <= toDate
      }

      return aptDate.toDateString() === fromDate.toDateString()
    })
  }, [dateRange])

  // Calcular estatísticas por cliente
  const clientStats = useMemo((): ClientStats[] => {
    const clientsMap = new Map<string, ClientStats>()

    // Considerar todos os agendamentos históricos para análise completa do cliente
    mockAppointments.forEach(apt => {
      const existing = clientsMap.get(apt.clientName)

      if (!existing) {
        // Primeiro agendamento deste cliente
        const clientAppointments = mockAppointments.filter(a => a.clientName === apt.clientName)
        const completed = clientAppointments.filter(a => a.status === 'completed')
        const cancelled = clientAppointments.filter(a => a.status === 'cancelled')

        // Encontrar serviço favorito (mais frequente)
        const serviceCounts = new Map<string, number>()
        completed.forEach(a => {
          serviceCounts.set(a.service, (serviceCounts.get(a.service) || 0) + 1)
        })
        const favoriteService = Array.from(serviceCounts.entries())
          .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'

        const totalRevenue = completed.reduce((sum, a) => sum + a.price, 0)
        const dates = clientAppointments.map(a => a.date)
        const firstVisit = new Date(Math.min(...dates.map(d => d.getTime())))
        const lastVisit = new Date(Math.max(...dates.map(d => d.getTime())))

        clientsMap.set(apt.clientName, {
          name: apt.clientName,
          totalRevenue,
          appointmentsCount: clientAppointments.length,
          completedCount: completed.length,
          cancelledCount: cancelled.length,
          lastVisit,
          firstVisit,
          favoriteService,
          averageSpent: completed.length > 0 ? totalRevenue / completed.length : 0,
          completionRate: clientAppointments.length > 0
            ? (completed.length / clientAppointments.length) * 100
            : 0
        })
      }
    })

    return Array.from(clientsMap.values())
  }, [])

  // Filtrar clientes que tiveram atividade no período selecionado
  const activeClientsInPeriod = useMemo(() => {
    const clientNamesInPeriod = new Set(filteredAppointments.map(apt => apt.clientName))
    return clientStats.filter(client => clientNamesInPeriod.has(client.name))
  }, [clientStats, filteredAppointments])

  // Top clientes por receita
  const topClients = useMemo(() => {
    return [...activeClientsInPeriod].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 10)
  }, [activeClientsInPeriod])

  // Novos clientes no período
  const newClients = useMemo(() => {
    if (!dateRange.from) return []

    const fromDate = new Date(dateRange.from)
    fromDate.setHours(0, 0, 0, 0)

    const toDate = dateRange.to ? new Date(dateRange.to) : new Date(dateRange.from)
    toDate.setHours(23, 59, 59, 999)

    return clientStats.filter(client => {
      const firstVisit = new Date(client.firstVisit)
      firstVisit.setHours(0, 0, 0, 0)
      return firstVisit >= fromDate && firstVisit <= toDate
    })
  }, [clientStats, dateRange])

  // Clientes inativos (última visita há mais de 30 dias)
  const inactiveClients = useMemo(() => {
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    return clientStats.filter(client => {
      return client.lastVisit < thirtyDaysAgo
    }).slice(0, 10)
  }, [clientStats])

  // Estatísticas gerais
  const totalStats = useMemo(() => {
    const revenue = activeClientsInPeriod.reduce((sum, c) => {
      // Calcular apenas receita do período filtrado
      const clientAppointmentsInPeriod = filteredAppointments.filter(
        apt => apt.clientName === c.name && apt.status === 'completed'
      )
      return sum + clientAppointmentsInPeriod.reduce((s, apt) => s + apt.price, 0)
    }, 0)

    const avgSpent = activeClientsInPeriod.length > 0
      ? revenue / activeClientsInPeriod.length
      : 0

    const totalAppointments = filteredAppointments.length
    const avgAppointmentsPerClient = activeClientsInPeriod.length > 0
      ? totalAppointments / activeClientsInPeriod.length
      : 0

    return {
      totalClients: clientStats.length,
      activeInPeriod: activeClientsInPeriod.length,
      newClients: newClients.length,
      revenue,
      avgSpent,
      avgAppointmentsPerClient,
      inactiveCount: inactiveClients.length
    }
  }, [activeClientsInPeriod, newClients, clientStats, filteredAppointments, inactiveClients])

  return (
    <div>
      <Header
        title="Dashboard de Clientes"
        subtitle="Análise de comportamento e estatísticas dos clientes"
        onMobileMenuClick={() => setIsMobileMenuOpen(true)}
      />

      <div className="p-4 md:p-8">
        {/* Filtros */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            className="w-full sm:w-auto"
          />
        </div>

        {/* Cards de Estatísticas Gerais */}
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
                      Clientes Ativos
                    </p>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">
                      {totalStats.activeInPeriod}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Total: {totalStats.totalClients} clientes
                    </p>
                  </div>
                  <div className="bg-blue-500 p-3 rounded-lg">
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
                      Novos Clientes
                    </p>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">
                      {totalStats.newClients}
                    </h3>
                    <p className="text-xs text-gray-500">
                      No período selecionado
                    </p>
                  </div>
                  <div className="bg-green-500 p-3 rounded-lg">
                    <UserPlus className="w-6 h-6 text-white" />
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
                      Receita no Período
                    </p>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">
                      {formatCurrency(totalStats.revenue)}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Média: {formatCurrency(totalStats.avgSpent)}/cliente
                    </p>
                  </div>
                  <div className="bg-gold p-3 rounded-lg">
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
                      Média Agend./Cliente
                    </p>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">
                      {totalStats.avgAppointmentsPerClient.toFixed(1)}
                    </h3>
                    <p className="text-xs text-gray-500">
                      No período selecionado
                    </p>
                  </div>
                  <div className="bg-purple-500 p-3 rounded-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Clientes */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-gold" />
                  Top Clientes (Receita Total)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {topClients.map((client, index) => (
                    <div
                      key={client.name}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4 items-center flex-1">
                          <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                            ${index === 0 ? 'bg-gold text-white' : ''}
                            ${index === 1 ? 'bg-gray-300 text-gray-700' : ''}
                            ${index === 2 ? 'bg-amber-600 text-white' : ''}
                            ${index > 2 ? 'bg-gray-100 text-gray-600' : ''}
                          `}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {client.name}
                            </h4>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {client.favoriteService}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                              <span>
                                {client.completedCount} visitas
                              </span>
                              <span>
                                Média: {formatCurrency(client.averageSpent)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900">
                            {formatCurrency(client.totalRevenue)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Última visita: {formatDate(client.lastVisit)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Novos Clientes */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-gold" />
                  Novos Clientes no Período
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {newClients.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {newClients.slice(0, 10).map((client) => (
                      <div
                        key={client.name}
                        className="p-6 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {client.name}
                            </h4>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="default" className="bg-green-500 text-xs">
                                Novo
                              </Badge>
                              <span className="text-xs text-gray-500">
                                Primeira visita: {formatDate(client.firstVisit)}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                              <span>
                                {client.appointmentsCount} agendamentos
                              </span>
                              <span>
                                {client.completedCount} concluídos
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">
                              {formatCurrency(client.totalRevenue)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    Nenhum cliente novo no período selecionado
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Clientes Inativos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-red-500" />
                  Clientes Inativos (Última visita há mais de 30 dias)
                </CardTitle>
                <Badge variant="destructive">
                  {inactiveClients.length} clientes
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Última Visita
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total de Visitas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Receita Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Serviço Favorito
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {inactiveClients.map((client) => {
                      const daysSinceLastVisit = Math.floor(
                        (today.getTime() - client.lastVisit.getTime()) / (1000 * 60 * 60 * 24)
                      )

                      return (
                        <tr key={client.name} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{client.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatDate(client.lastVisit)}
                            </div>
                            <div className="text-xs text-red-500">
                              Há {daysSinceLastVisit} dias
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-semibold">{client.completedCount}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-bold text-gray-900">
                              {formatCurrency(client.totalRevenue)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="outline">
                              {client.favoriteService}
                            </Badge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
