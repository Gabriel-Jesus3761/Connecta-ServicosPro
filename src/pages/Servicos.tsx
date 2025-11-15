import { motion } from 'framer-motion'
import { useOutletContext } from 'react-router-dom'
import { Scissors, Clock, DollarSign, Plus, Edit, Trash2 } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { mockServices } from '@/data/mockData'
import { formatCurrency } from '@/lib/utils'

const categoryLabels: Record<string, string> = {
  hair: 'Cabelo',
  beard: 'Barba',
  color: 'Coloração',
  treatment: 'Tratamento',
  spa: 'Spa'
}

const categoryColors: Record<string, string> = {
  hair: 'bg-blue-500',
  beard: 'bg-green-500',
  color: 'bg-purple-500',
  treatment: 'bg-gold',
  spa: 'bg-pink-500'
}

export function Servicos() {
  const { setIsMobileMenuOpen } = useOutletContext<{ setIsMobileMenuOpen: (value: boolean) => void }>()

  return (
    <div>
      <Header
        title="Serviços"
        subtitle="Gerencie seu catálogo de serviços"
        onMobileMenuClick={() => setIsMobileMenuOpen(true)}
      />

      <div className="p-4 md:p-8">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">
              {mockServices.length} Serviços Disponíveis
            </h2>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              Organize e atualize seus serviços
            </p>
          </div>

          <Button variant="gold" size="sm" className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Serviço
          </Button>
        </div>

        {/* Services Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {mockServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 group">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`${categoryColors[service.category]} p-3 rounded-lg`}>
                      <Scissors className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant="outline">
                      {categoryLabels[service.category]}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg group-hover:text-gold transition-colors">
                    {service.name}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {service.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4 text-gold" />
                        Duração
                      </span>
                      <span className="font-semibold text-gray-900">
                        {service.duration} min
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-gray-600">
                        <DollarSign className="w-4 h-4 text-gold" />
                        Preço
                      </span>
                      <span className="font-bold text-lg text-gold">
                        {formatCurrency(service.price)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <h3 className="text-sm font-medium mb-2 opacity-90">Mais Popular</h3>
              <p className="text-2xl font-bold mb-1">Corte Masculino</p>
              <p className="text-sm opacity-75">245 agendamentos este mês</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <h3 className="text-sm font-medium mb-2 opacity-90">Maior Receita</h3>
              <p className="text-2xl font-bold mb-1">Progressiva</p>
              <p className="text-sm opacity-75">{formatCurrency(4800)} este mês</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gold to-gold-dark text-white">
            <CardContent className="p-6">
              <h3 className="text-sm font-medium mb-2 opacity-90">Média de Preço</h3>
              <p className="text-2xl font-bold mb-1">{formatCurrency(85)}</p>
              <p className="text-sm opacity-75">Por serviço</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
