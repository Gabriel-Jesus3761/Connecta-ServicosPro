import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import {
  ArrowLeft,
  MapPin,
  Star,
  Clock,
  Phone,
  Mail,
  Calendar,
  User,
  Scissors,
  Check,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { mockBusinesses, mockServices, mockProfessionals } from '@/data/mockData'
import { formatCurrency } from '@/lib/utils'

export function EmpresaDetalhes() {
  const { businessId } = useParams<{ businessId: string }>()
  const navigate = useNavigate()
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<string>('')
  const [selectedProfessional, setSelectedProfessional] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')

  const business = mockBusinesses.find((b) => b.id === businessId)
  const businessServices = mockServices.filter((s) => s.businessId === businessId)
  const businessProfessionals = mockProfessionals.filter((p) => p.businessId === businessId)

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Estabelecimento não encontrado</h2>
          <Button onClick={() => navigate('/')}>Voltar para início</Button>
        </div>
      </div>
    )
  }

  const getDayName = (dayOfWeek: number) => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
    return days[dayOfWeek]
  }

  const getAvailableTimes = () => {
    if (!selectedDate) return []

    const date = new Date(selectedDate + 'T00:00:00')
    const dayOfWeek = date.getDay()
    const hours = business.businessHours.find((h) => h.dayOfWeek === dayOfWeek)

    if (!hours || hours.isClosed) return []

    const times: string[] = []
    const [openHour] = hours.open.split(':').map(Number)
    const [closeHour, closeMinute] = hours.close.split(':').map(Number)

    for (let hour = openHour; hour < closeHour; hour++) {
      times.push(`${hour.toString().padStart(2, '0')}:00`)
      if (hour !== closeHour - 1 || closeMinute >= 30) {
        times.push(`${hour.toString().padStart(2, '0')}:30`)
      }
    }

    return times
  }

  const handleBooking = () => {
    if (!selectedService || !selectedProfessional || !selectedDate || !selectedTime) {
      alert('Por favor, preencha todos os campos')
      return
    }

    // Redirecionar para checkout com os dados da pré-reserva
    setIsBookingDialogOpen(false)
    navigate('/checkout', {
      state: {
        businessId: business.id,
        serviceId: selectedService,
        professionalId: selectedProfessional,
        date: selectedDate,
        time: selectedTime,
      },
    })
  }

  const selectedServiceData = businessServices.find((s) => s.id === selectedService)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{business.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-gold text-white">
                  <Star className="w-3 h-3 mr-1 fill-white" />
                  {business.rating.toFixed(1)}
                </Badge>
                <span className="text-sm text-gray-600">
                  ({business.totalReviews} avaliações)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl h-64 overflow-hidden"
            >
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                Imagem do Estabelecimento
              </div>
            </motion.div>

            {/* About */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Sobre</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{business.description}</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Services */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Serviços</CardTitle>
                </CardHeader>
                <CardContent>
                  {businessServices.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      Nenhum serviço disponível no momento
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {businessServices.map((service) => (
                        <div
                          key={service.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center">
                              <Scissors className="w-5 h-5 text-gold" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{service.name}</h4>
                              <p className="text-sm text-gray-600">{service.description}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {service.duration} min
                                </span>
                                <span className="text-sm font-semibold text-gold">
                                  {formatCurrency(service.price)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Professionals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Profissionais</CardTitle>
                </CardHeader>
                <CardContent>
                  {businessProfessionals.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      Nenhum profissional cadastrado no momento
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {businessProfessionals.map((professional) => (
                        <div
                          key={professional.id}
                          className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-gold" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{professional.name}</h4>
                            <p className="text-sm text-gray-600">{professional.role}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm text-gray-600">{professional.rating.toFixed(1)}</span>
                            </div>
                          </div>
                          <Badge
                            className={
                              professional.available
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-400 text-white'
                            }
                          >
                            {professional.available ? 'Disponível' : 'Indisponível'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-24"
            >
              <Card className="border-2 border-gold">
                <CardHeader>
                  <CardTitle className="text-center">Agendar Horário</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="default"
                    size="lg"
                    className="w-full bg-gold hover:bg-gold-dark"
                    onClick={() => setIsBookingDialogOpen(true)}
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Fazer Agendamento
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Informações de Contato</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-600">
                      <p>{business.address.street}, {business.address.number}</p>
                      <p>{business.address.neighborhood}</p>
                      <p>{business.address.city} - {business.address.state}</p>
                      <p>{business.address.zipCode}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gold" />
                    <a
                      href={`tel:${business.phone}`}
                      className="text-sm text-gray-600 hover:text-gold transition-colors"
                    >
                      {business.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gold" />
                    <a
                      href={`mailto:${business.email}`}
                      className="text-sm text-gray-600 hover:text-gold transition-colors"
                    >
                      {business.email}
                    </a>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Business Hours */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Horário de Funcionamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {business.businessHours.map((hours) => (
                      <div
                        key={hours.dayOfWeek}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-gray-600 font-medium">
                          {getDayName(hours.dayOfWeek)}
                        </span>
                        <span className={hours.isClosed ? 'text-red-500' : 'text-gray-900'}>
                          {hours.isClosed ? 'Fechado' : `${hours.open} - ${hours.close}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Agendar Horário</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Service Selection */}
            <div className="space-y-2">
              <Label htmlFor="service">Serviço</Label>
              <select
                id="service"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
              >
                <option value="">Selecione um serviço</option>
                {businessServices.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} - {formatCurrency(service.price)} ({service.duration} min)
                  </option>
                ))}
              </select>
            </div>

            {/* Professional Selection */}
            <div className="space-y-2">
              <Label htmlFor="professional">Profissional</Label>
              <select
                id="professional"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                value={selectedProfessional}
                onChange={(e) => setSelectedProfessional(e.target.value)}
              >
                <option value="">Selecione um profissional</option>
                {businessProfessionals
                  .filter((p) => p.available)
                  .map((professional) => (
                    <option key={professional.id} value={professional.id}>
                      {professional.name} - {professional.role}
                    </option>
                  ))}
              </select>
            </div>

            {/* Date Selection */}
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <input
                type="date"
                id="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value)
                  setSelectedTime('')
                }}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div className="space-y-2">
                <Label htmlFor="time">Horário</Label>
                <select
                  id="time"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                >
                  <option value="">Selecione um horário</option>
                  {getAvailableTimes().map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Summary */}
            {selectedService && selectedServiceData && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Resumo do Agendamento</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <strong>Serviço:</strong> {selectedServiceData.name}
                  </p>
                  <p>
                    <strong>Duração:</strong> {selectedServiceData.duration} minutos
                  </p>
                  <p>
                    <strong>Valor:</strong> {formatCurrency(selectedServiceData.price)}
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsBookingDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="default"
              className="bg-gold hover:bg-gold-dark"
              onClick={handleBooking}
            >
              <Check className="w-4 h-4 mr-2" />
              Confirmar Agendamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
