import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import { ArrowLeft, Search, MapPin, Star, Clock, Phone, SlidersHorizontal } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { mockBusinesses, businessCategories } from '@/data/mockData'
import { BusinessCategory } from '@/types'

export function EmpresasPorCategoria() {
  const { categoryId } = useParams<{ categoryId: BusinessCategory }>()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'rating' | 'reviews'>('rating')

  const category = businessCategories.find((cat) => cat.id === categoryId)
  const businesses = mockBusinesses.filter((business) => business.category === categoryId)

  const filteredBusinesses = businesses
    .filter((business) =>
      business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.address.neighborhood.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'rating') {
        return b.rating - a.rating
      }
      return b.totalReviews - a.totalReviews
    })

  const getTodayHours = (businessId: string) => {
    const business = businesses.find((b) => b.id === businessId)
    if (!business) return null

    const today = new Date().getDay()
    const todayHours = business.businessHours.find((h) => h.dayOfWeek === today)

    if (!todayHours || todayHours.isClosed) {
      return { isOpen: false, hours: 'Fechado hoje' }
    }

    return { isOpen: true, hours: `${todayHours.open} - ${todayHours.close}` }
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Categoria não encontrada</h2>
          <Button onClick={() => navigate('/')}>Voltar para início</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
              <p className="text-sm text-gray-600">{category.description}</p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-gold text-white rounded-lg hover:bg-gold-dark transition-colors"
            >
              Entrar
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar estabelecimentos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Sort */}
            <div className="flex gap-2">
              <Button
                variant={sortBy === 'rating' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('rating')}
                className={sortBy === 'rating' ? 'bg-gold hover:bg-gold-dark' : ''}
              >
                <Star className="w-4 h-4 mr-2" />
                Melhor Avaliados
              </Button>
              <Button
                variant={sortBy === 'reviews' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('reviews')}
                className={sortBy === 'reviews' ? 'bg-gold hover:bg-gold-dark' : ''}
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Mais Avaliações
              </Button>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {filteredBusinesses.length} estabelecimento{filteredBusinesses.length !== 1 ? 's' : ''} encontrado{filteredBusinesses.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Business Grid */}
        {filteredBusinesses.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Nenhum estabelecimento encontrado
            </h3>
            <p className="text-sm text-gray-500">
              Tente buscar por outro termo ou filtro
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBusinesses.map((business, index) => {
              const todayHours = getTodayHours(business.id)

              return (
                <motion.div
                  key={business.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                >
                  <Card
                    className="h-full cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-gold group overflow-hidden"
                    onClick={() => navigate(`/empresas/${business.id}`)}
                  >
                    {/* Image */}
                    <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="flex items-center justify-between">
                          <Badge className="bg-white/90 text-gray-900 hover:bg-white">
                            <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                            {business.rating.toFixed(1)}
                          </Badge>
                          {todayHours && (
                            <Badge
                              className={
                                todayHours.isOpen
                                  ? 'bg-green-500 hover:bg-green-600 text-white'
                                  : 'bg-gray-500 hover:bg-gray-600 text-white'
                              }
                            >
                              <Clock className="w-3 h-3 mr-1" />
                              {todayHours.isOpen ? 'Aberto' : 'Fechado'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-5">
                      {/* Business Name */}
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gold transition-colors">
                        {business.name}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {business.description}
                      </p>

                      {/* Address */}
                      <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
                        <MapPin className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                        <p className="line-clamp-2">
                          {business.address.street}, {business.address.number} - {business.address.neighborhood}
                          <br />
                          {business.address.city} - {business.address.state}
                        </p>
                      </div>

                      {/* Hours */}
                      {todayHours && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                          <Clock className="w-4 h-4 text-gold" />
                          <p>{todayHours.hours}</p>
                        </div>
                      )}

                      {/* Reviews */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <p>
                          {business.totalReviews} avalia{business.totalReviews !== 1 ? 'ções' : 'ção'}
                        </p>
                      </div>

                      {/* Contact */}
                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href={`tel:${business.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
                        >
                          <Phone className="w-4 h-4" />
                          Ligar
                        </a>
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-gold hover:bg-gold-dark"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/empresas/${business.id}`)
                          }}
                        >
                          Ver Mais
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
