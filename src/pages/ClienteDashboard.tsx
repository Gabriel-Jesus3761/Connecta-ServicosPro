import { motion } from 'framer-motion'
import { Calendar, Clock, Scissors, LogOut, User, Star, History } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { formatCurrency, formatDate } from '@/lib/utils'

export function ClienteDashboard() {
  const { user, logout } = useAuth()

  // Dados mockados para demonstração
  const nextAppointment = {
    id: '1',
    service: 'Corte + Barba',
    professional: 'Carlos Silva',
    date: new Date(2024, 11, 20, 14, 30),
    duration: 60,
    price: 75,
    status: 'confirmed',
  }

  const appointmentHistory = [
    {
      id: '1',
      service: 'Corte Tradicional',
      professional: 'João Santos',
      date: new Date(2024, 10, 15),
      price: 50,
      rating: 5,
    },
    {
      id: '2',
      service: 'Corte + Barba',
      professional: 'Carlos Silva',
      date: new Date(2024, 10, 1),
      price: 75,
      rating: 5,
    },
    {
      id: '3',
      service: 'Barba',
      professional: 'Pedro Costa',
      date: new Date(2024, 9, 20),
      price: 35,
      rating: 4,
    },
  ]

  const favoriteServices = [
    { name: 'Corte + Barba', count: 5, price: 75 },
    { name: 'Corte Tradicional', count: 3, price: 50 },
    { name: 'Barba', count: 2, price: 35 },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center overflow-hidden">
                <img
                  src="/Projeto-barbearia/assets/images/Logo.png"
                  alt="Logo BarberPro"
                  className="w-full h-full object-cover scale-110"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">BarberPro</h1>
                <p className="text-xs text-gray-500">Área do Cliente</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Olá, {user?.name?.split(' ')[0]}!
          </h2>
          <p className="text-gray-600">
            Bem-vindo de volta. Confira seus agendamentos e histórico.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Next Appointment */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-l-4 border-l-gold">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gold" />
                    Próximo Agendamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {nextAppointment.service}
                      </h3>
                      <Badge variant="success">Confirmado</Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gold-light rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gold" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Profissional</p>
                          <p className="font-semibold text-gray-900">
                            {nextAppointment.professional}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gold-light rounded-full flex items-center justify-center">
                          <Clock className="w-5 h-5 text-gold" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Data e Hora</p>
                          <p className="font-semibold text-gray-900">
                            {formatDate(nextAppointment.date)} • {nextAppointment.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-sm text-gray-500">Valor</p>
                        <p className="text-2xl font-bold text-gold">
                          {formatCurrency(nextAppointment.price)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Remarcar
                        </Button>
                        <Button variant="gold" size="sm">
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Appointment History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5 text-gold" />
                    Histórico de Agendamentos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {appointmentHistory.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gold-light rounded-full flex items-center justify-center">
                            <Scissors className="w-6 h-6 text-gold" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {appointment.service}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {appointment.professional} • {formatDate(appointment.date)}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < appointment.rating
                                      ? 'fill-gold text-gold'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            {formatCurrency(appointment.price)}
                          </p>
                          <Button variant="ghost" size="sm" className="mt-1">
                            Reagendar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="gold" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Novo Agendamento
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <User className="w-4 h-4 mr-2" />
                    Meu Perfil
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <History className="w-4 h-4 mr-2" />
                    Ver Histórico Completo
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Favorite Services */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-gold" />
                    Serviços Favoritos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {favoriteServices.map((service, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">
                            {service.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {service.count}x agendado
                          </p>
                        </div>
                        <p className="font-bold text-gold">
                          {formatCurrency(service.price)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Agendamentos</p>
                    <p className="text-3xl font-bold text-gray-900">24</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Investido</p>
                    <p className="text-3xl font-bold text-gold">
                      {formatCurrency(1450)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Desde</p>
                    <p className="text-lg font-semibold text-gray-900">
                      Janeiro 2024
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
