import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Scissors, Sparkles, Heart, Waves, Hand, Activity, Zap, Palette, Search, MapPin, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { businessCategories } from '@/data/mockData'
import { BusinessCategory } from '@/types'
import { useState } from 'react'

const iconMap = {
  Scissors,
  Sparkles,
  Heart,
  Waves,
  Hand,
  Activity,
  Zap,
  Palette,
}

export function Home() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const handleCategoryClick = (categoryId: BusinessCategory) => {
    navigate(`/categorias/${categoryId}`)
  }

  const filteredCategories = businessCategories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center">
                <img
                  src="/Connecta-ServicosPro/assets/images/Logo.png"
                  alt="Logo"
                  className="w-full h-full object-cover rounded-full scale-110"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Connecta ServiçosPro</h1>
                <p className="text-sm text-gray-600">Encontre os melhores profissionais</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-gold text-white rounded-lg hover:bg-gold-dark transition-colors"
            >
              Entrar
            </button>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Qual serviço você procura?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Conecte-se com os melhores profissionais da sua região
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por categoria..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-6 text-lg rounded-full border-2 border-gray-200 focus:border-gold"
            />
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
            <MapPin className="w-8 h-8 text-gold mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-900">50+</p>
            <p className="text-sm text-gray-600">Estabelecimentos</p>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
            <Star className="w-8 h-8 text-gold mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-900">4.8</p>
            <p className="text-sm text-gray-600">Avaliação Média</p>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
            <Scissors className="w-8 h-8 text-gold mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-900">200+</p>
            <p className="text-sm text-gray-600">Serviços Disponíveis</p>
          </div>
        </motion.div>

        {/* Categories Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Categorias</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredCategories.map((category, index) => {
              const Icon = iconMap[category.icon as keyof typeof iconMap]

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className="h-full cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-gold group"
                    onClick={() => handleCategoryClick(category.id)}
                  >
                    <CardContent className="p-6">
                      <div className={`${category.bgColor} w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`w-8 h-8 ${category.color}`} />
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gold transition-colors">
                        {category.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {category.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Nenhuma categoria encontrada
              </h3>
              <p className="text-sm text-gray-500">
                Tente buscar por outro termo
              </p>
            </div>
          )}
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 bg-white rounded-2xl p-8 md:p-12 shadow-lg border border-gray-100"
        >
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Como funciona?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Escolha a Categoria</h4>
              <p className="text-gray-600">Selecione o tipo de serviço que você procura</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">2</span>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Encontre o Estabelecimento</h4>
              <p className="text-gray-600">Veja avaliações e escolha o melhor para você</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Agende seu Horário</h4>
              <p className="text-gray-600">Reserve com poucos cliques de forma rápida e fácil</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-lg font-bold mb-4">Connecta ServiçosPro</h4>
              <p className="text-gray-400 text-sm">
                Conectando você aos melhores profissionais de beleza e bem-estar.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Links Rápidos</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-gold transition-colors">Sobre Nós</a></li>
                <li><a href="#" className="hover:text-gold transition-colors">Ajuda</a></li>
                <li><a href="#" className="hover:text-gold transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-gold transition-colors">Privacidade</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Para Empresas</h4>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 bg-gold text-white rounded-lg hover:bg-gold-dark transition-colors"
              >
                Cadastre seu Negócio
              </button>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2024 Connecta ServiçosPro. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
