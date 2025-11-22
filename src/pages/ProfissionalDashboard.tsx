import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, DollarSign, CheckCircle, XCircle, Building2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'

// Mock de dados de agendamentos por empresa
const mockAppointmentsByBusiness = {
  '1': {
    businessName: 'BarberPro Centro',
    address: 'Rua das Flores, 123 - Centro',
    appointments: [
      {
        id: '1',
        clientName: 'João Silva',
        clientAvatar: undefined,
        service: 'Corte Masculino',
        date: '2024-01-20',
        time: '10:00',
        duration: 30,
        price: 35.00,
        status: 'confirmed' as const,
      },
      {
        id: '2',
        clientName: 'Pedro Santos',
        clientAvatar: undefined,
        service: 'Barba Completa',
        date: '2024-01-20',
        time: '14:30',
        duration: 20,
        price: 25.00,
        status: 'confirmed' as const,
      },
      {
        id: '3',
        clientName: 'Lucas Oliveira',
        clientAvatar: undefined,
        service: 'Corte + Barba',
        date: '2024-01-21',
        time: '09:00',
        duration: 45,
        price: 55.00,
        status: 'pending' as const,
      },
    ],
  },
  '2': {
    businessName: 'BarberPro Shopping',
    address: 'Shopping Center, Loja 205',
    appointments: [
      {
        id: '4',
        clientName: 'Carlos Mendes',
        clientAvatar: undefined,
        service: 'Design de Barba',
        date: '2024-01-20',
        time: '11:00',
        duration: 20,
        price: 25.00,
        status: 'confirmed' as const,
      },
      {
        id: '5',
        clientName: 'Roberto Costa',
        clientAvatar: undefined,
        service: 'Corte Masculino',
        date: '2024-01-20',
        time: '16:00',
        duration: 30,
        price: 35.00,
        status: 'completed' as const,
      },
    ],
  },
}

type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

const statusLabels: Record<AppointmentStatus, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  completed: 'Concluído',
  cancelled: 'Cancelado',
}

const statusColors: Record<AppointmentStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export function ProfissionalDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [selectedBusiness, setSelectedBusiness] = useState<string>('all')
  const [selectedDate, setSelectedDate] = useState<string>('today')

  if (!user || user.role !== 'professional') {
    return null
  }

  // Filtrar agendamentos
  const getFilteredAppointments = () => {
    let allAppointments: any[] = []

    if (selectedBusiness === 'all') {
      // Combinar todos os agendamentos de todas as empresas
      Object.entries(mockAppointmentsByBusiness).forEach(([businessId, data]) => {
        allAppointments.push(...data.appointments.map(apt => ({ ...apt, businessId, businessName: data.businessName })))
      })
    } else {
      const businessData = mockAppointmentsByBusiness[selectedBusiness as keyof typeof mockAppointmentsByBusiness]
      if (businessData) {
        allAppointments = businessData.appointments.map(apt => ({
          ...apt,
          businessId: selectedBusiness,
          businessName: businessData.businessName
        }))
      }
    }

    // Filtrar por data
    const today = new Date().toISOString().split('T')[0]
    if (selectedDate === 'today') {
      allAppointments = allAppointments.filter(apt => apt.date === today || apt.date === '2024-01-20')
    } else if (selectedDate === 'tomorrow') {
      allAppointments = allAppointments.filter(apt => apt.date === '2024-01-21')
    }

    return allAppointments.sort((a, b) => a.time.localeCompare(b.time))
  }

  const filteredAppointments = getFilteredAppointments()

  // Estatísticas
  const totalAppointmentsToday = getFilteredAppointments().filter(apt => apt.status !== 'cancelled').length
  const completedToday = getFilteredAppointments().filter(apt => apt.status === 'completed').length
  const totalEarnings = getFilteredAppointments()
    .filter(apt => apt.status === 'completed')
    .reduce((sum, apt) => sum + apt.price, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1">
                Olá, {user.name}!
              </h1>
              <p className="text-purple-100">Gerencie seus atendimentos</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="bg-white text-purple-600 hover:bg-purple-50"
                onClick={() => navigate('/profissional/perfil')}
              >
                Meu Perfil
              </Button>
              <Button
                variant="outline"
                className="bg-white text-purple-600 hover:bg-purple-50"
                onClick={logout}
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Agendamentos Hoje</p>
                  <p className="text-3xl font-bold text-gray-900">{totalAppointmentsToday}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Concluídos</p>
                  <p className="text-3xl font-bold text-gray-900">{completedToday}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Ganhos Hoje</p>
                  <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalEarnings)}</p>
                </div>
                <div className="w-12 h-12 bg-gold-light rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-gold" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Empresa
                </label>
                <Select value={selectedBusiness} onValueChange={setSelectedBusiness}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as empresas</SelectItem>
                    {Object.entries(mockAppointmentsByBusiness).map(([id, data]) => (
                      <SelectItem key={id} value={id}>
                        {data.businessName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Período
                </label>
                <Select value={selectedDate} onValueChange={setSelectedDate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="tomorrow">Amanhã</SelectItem>
                    <SelectItem value="week">Esta semana</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Seus Agendamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Nenhum agendamento encontrado
                </h3>
                <p className="text-sm text-gray-500">
                  Você não tem agendamentos para o período selecionado
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAppointments.map((appointment, index) => (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                              {appointment.clientName.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">
                                {appointment.clientName}
                              </h4>
                              <p className="text-sm text-gray-600 mb-2">{appointment.service}</p>
                              <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                                {selectedBusiness === 'all' && (
                                  <span className="flex items-center gap-1">
                                    <Building2 className="w-3 h-3" />
                                    {appointment.businessName}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {appointment.time} ({appointment.duration} min)
                                </span>
                                <span className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" />
                                  {formatCurrency(appointment.price)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 md:flex-col md:items-end">
                            <Badge className={statusColors[appointment.status as AppointmentStatus]}>
                              {statusLabels[appointment.status as AppointmentStatus]}
                            </Badge>
                            {appointment.status === 'confirmed' && (
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="text-xs">
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Cancelar
                                </Button>
                                <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700 text-xs">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Concluir
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
