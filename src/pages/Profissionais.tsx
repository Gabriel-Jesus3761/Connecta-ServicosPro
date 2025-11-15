import { motion } from 'framer-motion'
import { useOutletContext } from 'react-router-dom'
import { Star, Calendar, Award, Plus, Mail, Phone } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { mockProfessionals } from '@/data/mockData'

export function Profissionais() {
  const { setIsMobileMenuOpen } = useOutletContext<{ setIsMobileMenuOpen: (value: boolean) => void }>()

  return (
    <div>
      <Header
        title="Profissionais"
        subtitle="Gerencie sua equipe"
        onMobileMenuClick={() => setIsMobileMenuOpen(true)}
      />

      <div className="p-4 md:p-8">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">
              {mockProfessionals.length} Profissionais
            </h2>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              {mockProfessionals.filter(p => p.available).length} disponíveis para agendamento
            </p>
          </div>

          <Button variant="gold" size="sm" className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Profissional
          </Button>
        </div>

        {/* Professionals Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {mockProfessionals.map((professional, index) => (
            <motion.div
              key={professional.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
            >
              <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-br from-gray-900 to-black text-white pb-16 relative">
                  <div className="absolute top-4 right-4">
                    {professional.available ? (
                      <Badge variant="success">Disponível</Badge>
                    ) : (
                      <Badge variant="destructive">Indisponível</Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="relative pt-0 pb-6">
                  {/* Avatar */}
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                    <div className="w-24 h-24 bg-gradient-to-br from-gold to-gold-dark rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg">
                      {professional.name.charAt(0)}
                    </div>
                  </div>

                  <div className="mt-14 text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {professional.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">{professional.role}</p>

                    {/* Rating */}
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(professional.rating)
                                ? 'fill-gold text-gold'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-semibold text-gray-900">
                        {professional.rating.toFixed(1)}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="flex items-center justify-center gap-1 text-gold mb-1">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          {professional.totalAppointments}
                        </p>
                        <p className="text-xs text-gray-500">Agendamentos</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-center gap-1 text-gold mb-1">
                          <Award className="w-4 h-4" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          {professional.specialties.length}
                        </p>
                        <p className="text-xs text-gray-500">Especialidades</p>
                      </div>
                    </div>

                    {/* Specialties */}
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2 text-left">
                        Especialidades:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {professional.specialties.map((specialty, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Mail className="w-3 h-3 mr-1" />
                        Email
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Phone className="w-3 h-3 mr-1" />
                        Ligar
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gold hover:text-gold-dark">
                        Ver Perfil
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Team Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold mb-2">
                {mockProfessionals.length}
              </div>
              <p className="text-sm opacity-90">Total de Profissionais</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold mb-2">
                {mockProfessionals.filter(p => p.available).length}
              </div>
              <p className="text-sm opacity-90">Disponíveis Agora</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gold to-gold-dark text-white">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold mb-2">
                {(mockProfessionals.reduce((acc, p) => acc + p.rating, 0) / mockProfessionals.length).toFixed(1)}
              </div>
              <p className="text-sm opacity-90">Avaliação Média</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold mb-2">
                {mockProfessionals.reduce((acc, p) => acc + p.totalAppointments, 0)}
              </div>
              <p className="text-sm opacity-90">Agendamentos Totais</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
