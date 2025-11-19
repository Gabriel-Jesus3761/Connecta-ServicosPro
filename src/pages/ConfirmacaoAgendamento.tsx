import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  CheckCircle,
  Calendar,
  Clock,
  User,
  Scissors,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Smartphone,
  Banknote,
  Download,
  Share2,
  Home,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import confetti from 'canvas-confetti'

interface ConfirmationData {
  businessId: string
  serviceId: string
  professionalId: string
  date: string
  time: string
  paymentMethod: string
  business: any
  service: any
  professional: any
}

export function ConfirmacaoAgendamento() {
  const navigate = useNavigate()
  const location = useLocation()
  const confirmationData = location.state as ConfirmationData
  const [bookingId] = useState(`AG${Date.now().toString().slice(-8)}`)

  useEffect(() => {
    // Disparar confetti ao carregar a página
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      })
    }, 250)

    return () => clearInterval(interval)
  }, [])

  if (!confirmationData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Dados não encontrados</h2>
          <Button onClick={() => navigate('/')}>Voltar para início</Button>
        </div>
      </div>
    )
  }

  const { business, service, professional, date, time, paymentMethod } = confirmationData

  const formatDate = (dateString: string) => {
    const dateObj = new Date(dateString + 'T00:00:00')
    return dateObj.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  }

  const getPaymentMethodInfo = () => {
    const methods = {
      credit: { name: 'Cartão de Crédito', icon: CreditCard },
      debit: { name: 'Cartão de Débito', icon: CreditCard },
      pix: { name: 'PIX', icon: Smartphone },
      cash: { name: 'Dinheiro', icon: Banknote },
    }
    return methods[paymentMethod as keyof typeof methods] || methods.cash
  }

  const paymentInfo = getPaymentMethodInfo()
  const PaymentIcon = paymentInfo.icon

  const handleDownloadReceipt = () => {
    alert('Funcionalidade de download em desenvolvimento')
  }

  const handleShareBooking = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Meu Agendamento',
        text: `Agendamento confirmado em ${business.name} para ${formatDate(date)} às ${time}`,
      })
    } else {
      alert('Compartilhamento não suportado neste navegador')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Agendamento Confirmado!</h1>
          <p className="text-lg text-gray-600">
            Seu horário foi reservado com sucesso
          </p>
        </motion.div>

        {/* Booking Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-2 border-green-200 shadow-xl">
            <CardContent className="p-8">
              {/* Booking ID */}
              <div className="text-center mb-8 pb-6 border-b border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Número do Agendamento</p>
                <p className="text-3xl font-bold text-gold">{bookingId}</p>
              </div>

              {/* Details Grid */}
              <div className="space-y-6">
                {/* Business */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-gold" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">Estabelecimento</p>
                    <p className="font-bold text-lg text-gray-900">{business.name}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {business.address.street}, {business.address.number} - {business.address.neighborhood}
                      <br />
                      {business.address.city} - {business.address.state}
                    </p>
                    <div className="flex gap-3 mt-2">
                      <a
                        href={`tel:${business.phone}`}
                        className="text-sm text-gold hover:text-gold-dark flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        {business.phone}
                      </a>
                      <a
                        href={`mailto:${business.email}`}
                        className="text-sm text-gold hover:text-gold-dark flex items-center gap-1"
                      >
                        <Mail className="w-3 h-3" />
                        Email
                      </a>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200" />

                {/* Service */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Scissors className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">Serviço</p>
                    <p className="font-bold text-lg text-gray-900">{service.name}</p>
                    <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        {service.duration} minutos
                      </Badge>
                      <Badge variant="outline" className="bg-gold/10 border-gold">
                        {formatCurrency(service.price)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200" />

                {/* Professional */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">Profissional</p>
                    <p className="font-bold text-lg text-gray-900">{professional.name}</p>
                    <p className="text-sm text-gray-600">{professional.role}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200" />

                {/* Date & Time */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">Data e Horário</p>
                    <p className="font-bold text-lg text-gray-900 capitalize">{formatDate(date)}</p>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {time}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200" />

                {/* Payment */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <PaymentIcon className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">Forma de Pagamento</p>
                    <p className="font-bold text-lg text-gray-900">{paymentInfo.name}</p>
                    {paymentMethod === 'cash' && (
                      <p className="text-sm text-amber-600 mt-1">
                        Pagamento a ser realizado no local
                      </p>
                    )}
                    {paymentMethod === 'pix' && (
                      <Badge className="bg-green-500 text-white mt-2">Pagamento Confirmado</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Important Info */}
              <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Informações Importantes</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Chegue com 10 minutos de antecedência</li>
                  <li>• Em caso de atraso, o horário poderá ser reagendado</li>
                  <li>• Para cancelamentos, avisar com no mínimo 24h de antecedência</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <Button
                  variant="outline"
                  onClick={handleDownloadReceipt}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Comprovante
                </Button>
                <Button
                  variant="outline"
                  onClick={handleShareBooking}
                  className="w-full"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartilhar
                </Button>
                <Button
                  variant="default"
                  onClick={() => navigate('/')}
                  className="w-full bg-gold hover:bg-gold-dark"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Voltar ao Início
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <Card className="bg-gradient-to-r from-gold/10 to-gold/5 border-gold/20">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                Próximos Passos
              </h3>
              <p className="text-gray-600 mb-4">
                Um email de confirmação foi enviado com todos os detalhes do seu agendamento.
              </p>
              <Button
                variant="outline"
                onClick={() => navigate('/login')}
                className="border-gold text-gold hover:bg-gold hover:text-white"
              >
                Fazer Login para Ver Meus Agendamentos
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
