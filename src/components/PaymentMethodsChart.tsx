import { useMemo } from 'react'
import { CreditCard, Smartphone, Banknote, DollarSign, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Appointment, PaymentMethod } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { motion } from 'framer-motion'

interface PaymentMethodsChartProps {
  appointments: Appointment[]
}

const paymentMethodConfig = {
  pix: {
    label: 'PIX',
    icon: Smartphone,
    color: 'bg-teal-500',
    lightColor: 'bg-teal-100',
    textColor: 'text-teal-700',
  },
  credit: {
    label: 'Cartão de Crédito',
    icon: CreditCard,
    color: 'bg-blue-500',
    lightColor: 'bg-blue-100',
    textColor: 'text-blue-700',
  },
  debit: {
    label: 'Cartão de Débito',
    icon: CreditCard,
    color: 'bg-purple-500',
    lightColor: 'bg-purple-100',
    textColor: 'text-purple-700',
  },
  cash: {
    label: 'Dinheiro',
    icon: Banknote,
    color: 'bg-green-500',
    lightColor: 'bg-green-100',
    textColor: 'text-green-700',
  },
  boleto: {
    label: 'Boleto',
    icon: FileText,
    color: 'bg-orange-500',
    lightColor: 'bg-orange-100',
    textColor: 'text-orange-700',
  },
}

export function PaymentMethodsChart({ appointments }: PaymentMethodsChartProps) {
  const paymentStats = useMemo(() => {
    const completedAppointments = appointments.filter(apt => apt.status === 'completed' && apt.paymentMethod)

    const stats = {
      pix: { count: 0, revenue: 0 },
      credit: { count: 0, revenue: 0 },
      debit: { count: 0, revenue: 0 },
      cash: { count: 0, revenue: 0 },
      boleto: { count: 0, revenue: 0 },
    }

    completedAppointments.forEach(apt => {
      if (apt.paymentMethod) {
        stats[apt.paymentMethod].count++
        stats[apt.paymentMethod].revenue += apt.price
      }
    })

    const totalRevenue = completedAppointments.reduce((sum, apt) => sum + apt.price, 0)

    return Object.entries(stats).map(([method, data]) => ({
      method: method as PaymentMethod,
      count: data.count,
      revenue: data.revenue,
      percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0,
    })).sort((a, b) => b.revenue - a.revenue)
  }, [appointments])

  const totalRevenue = paymentStats.reduce((sum, stat) => sum + stat.revenue, 0)
  const totalCount = paymentStats.reduce((sum, stat) => sum + stat.count, 0)

  return (
    <Card className="col-span-full">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-gold" />
          Formas de Pagamento
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {paymentStats.map((stat, index) => {
            const config = paymentMethodConfig[stat.method]
            const Icon = config.icon

            return (
              <motion.div
                key={stat.method}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="bg-white border-2 border-gray-100 rounded-lg p-4 hover:shadow-lg transition-all duration-200 hover:border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`${config.color} p-2 rounded-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{stat.count}</span>
                  </div>

                  <h4 className="text-sm font-semibold text-gray-700 mb-1">{config.label}</h4>

                  <div className="space-y-2">
                    <div className="text-lg font-bold text-gray-900">
                      {formatCurrency(stat.revenue)}
                    </div>

                    {/* Barra de porcentagem */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.percentage}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className={`${config.color} h-2 rounded-full`}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">{stat.percentage.toFixed(1)}%</span>
                      <span className={`font-semibold ${config.textColor}`}>
                        {totalCount > 0 ? ((stat.count / totalCount) * 100).toFixed(0) : 0}% transações
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Resumo Total */}
        <div className="bg-gradient-to-r from-gold/10 to-gold/5 rounded-lg p-4 border border-gold/20">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-600 mb-1">Total de Transações</p>
              <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Receita Total</p>
              <p className="text-2xl font-bold text-gold">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="col-span-2 md:col-span-1">
              <p className="text-xs text-gray-600 mb-1">Ticket Médio</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalCount > 0 ? formatCurrency(totalRevenue / totalCount) : formatCurrency(0)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
