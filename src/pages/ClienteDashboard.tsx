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
    <div className="min-h-screen bg-black">
      {/* Header */}
      <motion.header
        className="bg-black/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-10"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gold to-yellow-600 rounded-full flex items-center justify-center overflow-hidden">
                <img
                  src="/Projeto-barbearia/assets/images/Logo.png"
                  alt="Logo BarberPro"
                  className="w-full h-full object-cover scale-110"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">BarberPro</h1>
                <p className="text-xs text-gray-400">Área do Cliente</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-white">{user?.name}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="border-white/10 hover:bg-white/5 text-white"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent mb-2">
            Olá, {user?.name?.split(' ')[0]}!
          </h2>
          <p className="text-gray-400">
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
              <Card className="bg-white/5 backdrop-blur-sm border-l-4 border-l-gold border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Calendar className="w-5 h-5 text-gold" />
                    Próximo Agendamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {nextAppointment.service}
                      </h3>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/50">Confirmado</Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gold" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Profissional</p>
                          <p className="font-semibold text-white">
                            {nextAppointment.professional}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center">
                          <Clock className="w-5 h-5 text-gold" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Data e Hora</p>
                          <p className="font-semibold text-white">
                            {formatDate(nextAppointment.date)} • {nextAppointment.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div>
                        <p className="text-sm text-gray-400">Valor</p>
                        <p className="text-2xl font-bold bg-gradient-to-r from-gold to-yellow-600 bg-clip-text text-transparent">
                          {formatCurrency(nextAppointment.price)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/5 text-white">
                          Remarcar
                        </Button>
                        <Button variant="gold" size="sm" className="bg-gradient-to-r from-gold to-yellow-600 hover:from-yellow-600 hover:to-gold text-black font-semibold">
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
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <History className="w-5 h-5 text-gold" />
                    Histórico de Agendamentos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {appointmentHistory.map((appointment, index) => (
                      <motion.div
                        key={appointment.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg hover:border-gold/50 hover:bg-white/10 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center">
                            <Scissors className="w-6 h-6 text-gold" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">
                              {appointment.service}
                            </h4>
                            <p className="text-sm text-gray-400">
                              {appointment.professional} • {formatDate(appointment.date)}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < appointment.rating
                                      ? 'fill-gold text-gold'
                                      : 'text-gray-600'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-white">
                            {formatCurrency(appointment.price)}
                          </p>
                          <Button variant="ghost" size="sm" className="mt-1 hover:bg-white/5 text-gray-400 hover:text-white">
                            Reagendar
                          </Button>
                        </div>
                      </motion.div>
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
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="gold" className="w-full justify-start bg-gradient-to-r from-gold to-yellow-600 hover:from-yellow-600 hover:to-gold text-black font-semibold">
                      <Calendar className="w-4 h-4 mr-2" />
                      Novo Agendamento
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="outline" className="w-full justify-start border-white/10 hover:bg-white/5 text-white">
                      <User className="w-4 h-4 mr-2" />
                      Meu Perfil
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="outline" className="w-full justify-start border-white/10 hover:bg-white/5 text-white">
                      <History className="w-4 h-4 mr-2" />
                      Ver Histórico Completo
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Favorite Services */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Star className="w-5 h-5 text-gold" />
                    Serviços Favoritos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {favoriteServices.map((service, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg hover:border-gold/50 transition-all"
                      >
                        <div>
                          <p className="font-semibold text-white text-sm">
                            {service.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {service.count}x agendado
                          </p>
                        </div>
                        <p className="font-bold text-gold">
                          {formatCurrency(service.price)}
                        </p>
                      </motion.div>
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
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Estatísticas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Total Agendamentos</p>
                    <p className="text-3xl font-bold text-white">24</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Total Investido</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-gold to-yellow-600 bg-clip-text text-transparent">
                      {formatCurrency(1450)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Desde</p>
                    <p className="text-lg font-semibold text-white">
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
