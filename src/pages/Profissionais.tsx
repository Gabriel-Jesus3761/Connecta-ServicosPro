import { motion } from 'framer-motion'
import { useOutletContext } from 'react-router-dom'
import { Star, Calendar, Plus, Mail, Phone, Users } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {mockProfessionals.map((professional, index) => (
            <motion.div
              key={professional.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 group border border-black">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="bg-gradient-to-br from-gold to-gold-dark p-3 rounded-lg">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant={professional.available ? "success" : "destructive"}>
                      {professional.available ? "Disponível" : "Indisponível"}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg group-hover:text-gold transition-colors">
                    {professional.name}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    {professional.role}
                  </p>

                  {/* Rating */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-gray-600">
                        <Star className="w-4 h-4 text-gold fill-gold" />
                        Avaliação
                      </span>
                      <span className="font-semibold text-gray-900">
                        {professional.rating.toFixed(1)} / 5.0
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4 text-gold" />
                        Agendamentos
                      </span>
                      <span className="font-semibold text-gray-900">
                        {professional.totalAppointments}
                      </span>
                    </div>
                  </div>

                  {/* Specialties */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">
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
                  <div className="space-y-2 pt-4 border-t border-gray-100">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Mail className="w-3 h-3 mr-1" />
                        Email
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Phone className="w-3 h-3 mr-1" />
                        Ligar
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm" className="w-full text-gold hover:text-gold-dark">
                      Ver Perfil Completo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
