import { Appointment, Service, Professional, DashboardStats, PaymentMethod, Expense, ExpenseCategory } from '@/types'

// Função auxiliar para gerar agendamentos
const generateAppointments = (): Appointment[] => {
  const appointments: Appointment[] = []
  const names = [
    'Ana Paula', 'Lucas Ferreira', 'Pedro Alves', 'Marina Santos', 'Roberto Silva',
    'Fernanda Costa', 'João Pedro', 'Carla Mendes', 'Rafael Souza', 'Juliana Oliveira',
    'Bruno Lima', 'Patricia Rocha', 'Diego Santos', 'Amanda Silva', 'Thiago Martins',
    'Camila Alves', 'Leonardo Costa', 'Beatriz Ferreira', 'Gustavo Pereira', 'Larissa Santos',
    'Felipe Oliveira', 'Natália Lima', 'Eduardo Costa', 'Gabriela Souza', 'Rodrigo Martins',
    'Vanessa Almeida', 'Marcelo Ribeiro', 'Isabella Rocha', 'Gabriel Fernandes', 'Renata Castro'
  ]

  const services = [
    { name: 'Corte Masculino', price: 35, duration: 30 },
    { name: 'Corte Feminino', price: 50, duration: 45 },
    { name: 'Barba Completa', price: 25, duration: 20 },
    { name: 'Corte + Barba', price: 55, duration: 45 },
    { name: 'Coloração', price: 80, duration: 60 },
    { name: 'Luzes', price: 150, duration: 120 },
    { name: 'Hidratação Capilar', price: 120, duration: 90 },
    { name: 'Progressiva', price: 200, duration: 180 },
  ]

  const professionals = [
    'João Santos', 'Mariana Costa', 'Carlos Silva', 'Juliana Lima', 'Ricardo Mendes'
  ]

  // Distribuição realista de formas de pagamento
  // PIX: 40%, Crédito: 30%, Débito: 15%, Dinheiro: 10%, Boleto: 5%
  const getRandomPaymentMethod = (): PaymentMethod => {
    const rand = Math.random()
    if (rand < 0.40) return 'pix'
    if (rand < 0.70) return 'credit'
    if (rand < 0.85) return 'debit'
    if (rand < 0.95) return 'cash'
    return 'boleto'
  }

  let id = 1

  // Gerar agendamentos dos últimos 3 meses até +30 dias no futuro
  const today = new Date()
  const startDate = new Date(today)
  startDate.setMonth(startDate.getMonth() - 3)

  const endDate = new Date(today)
  endDate.setDate(endDate.getDate() + 30)

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    // Gerar entre 3 a 8 agendamentos por dia (mais realista)
    const appointmentsPerDay = Math.floor(Math.random() * 6) + 3

    for (let i = 0; i < appointmentsPerDay; i++) {
      const service = services[Math.floor(Math.random() * services.length)]
      const hour = 9 + Math.floor(Math.random() * 9) // 9h às 18h
      const minute = Math.random() > 0.5 ? 0 : 30

      // Para datas passadas, mais agendamentos concluídos
      // Para datas futuras, mais confirmados/pendentes
      let status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
      if (d < today) {
        const rand = Math.random()
        if (rand < 0.75) status = 'completed'
        else if (rand < 0.90) status = 'cancelled'
        else status = 'confirmed'
      } else {
        const rand = Math.random()
        if (rand < 0.60) status = 'confirmed'
        else if (rand < 0.85) status = 'pending'
        else status = 'completed'
      }

      appointments.push({
        id: String(id++),
        clientName: names[Math.floor(Math.random() * names.length)],
        service: service.name,
        professional: professionals[Math.floor(Math.random() * professionals.length)],
        date: new Date(d.getFullYear(), d.getMonth(), d.getDate(), hour, minute),
        time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
        price: service.price,
        status: status,
        duration: service.duration,
        paymentMethod: status === 'completed' ? getRandomPaymentMethod() : undefined,
      })
    }
  }

  return appointments
}

export const mockAppointments: Appointment[] = generateAppointments()

export const mockServices: Service[] = [
  {
    id: '1',
    name: 'Corte Masculino',
    description: 'Corte moderno e estiloso com acabamento premium',
    price: 35.00,
    duration: 30,
    category: 'hair',
  },
  {
    id: '2',
    name: 'Corte Feminino',
    description: 'Corte personalizado com técnicas avançadas',
    price: 50.00,
    duration: 45,
    category: 'hair',
  },
  {
    id: '3',
    name: 'Barba Completa',
    description: 'Design de barba com navalha e toalha quente',
    price: 25.00,
    duration: 20,
    category: 'beard',
  },
  {
    id: '4',
    name: 'Corte + Barba',
    description: 'Combo completo de corte e design de barba',
    price: 55.00,
    duration: 45,
    category: 'hair',
  },
  {
    id: '5',
    name: 'Coloração',
    description: 'Coloração profissional com produtos de alta qualidade',
    price: 80.00,
    duration: 60,
    category: 'color',
  },
  {
    id: '6',
    name: 'Luzes',
    description: 'Mechas e luzes com técnicas personalizadas',
    price: 150.00,
    duration: 120,
    category: 'color',
  },
  {
    id: '7',
    name: 'Hidratação Capilar',
    description: 'Tratamento intensivo para reconstrução capilar',
    price: 120.00,
    duration: 90,
    category: 'treatment',
  },
  {
    id: '8',
    name: 'Progressiva',
    description: 'Escova progressiva para alisamento natural',
    price: 200.00,
    duration: 180,
    category: 'treatment',
  },
]

export const mockProfessionals: Professional[] = [
  {
    id: '1',
    name: 'João Santos',
    role: 'Barbeiro Master',
    specialties: ['Corte Masculino', 'Barba', 'Design de Sobrancelha'],
    rating: 4.9,
    totalAppointments: 1250,
    available: true,
  },
  {
    id: '2',
    name: 'Mariana Costa',
    role: 'Cabeleireira',
    specialties: ['Coloração', 'Corte Feminino', 'Mechas'],
    rating: 4.8,
    totalAppointments: 980,
    available: true,
  },
  {
    id: '3',
    name: 'Carlos Silva',
    role: 'Barbeiro',
    specialties: ['Corte Masculino', 'Barba', 'Pigmentação'],
    rating: 4.7,
    totalAppointments: 750,
    available: true,
  },
  {
    id: '4',
    name: 'Juliana Lima',
    role: 'Hair Stylist',
    specialties: ['Hidratação', 'Reconstrução', 'Tratamentos'],
    rating: 5.0,
    totalAppointments: 620,
    available: false,
  },
  {
    id: '5',
    name: 'Ricardo Mendes',
    role: 'Barbeiro',
    specialties: ['Corte Masculino', 'Barba', 'Design'],
    rating: 4.6,
    totalAppointments: 540,
    available: true,
  },
]

export const mockDashboardStats: DashboardStats = {
  todayAppointments: 12,
  monthlyRevenue: 8500.00,
  activeProfessionals: 5,
  availableServices: 8,
}

// Função auxiliar para gerar despesas
const generateExpenses = (): Expense[] => {
  const expenses: Expense[] = []
  const today = new Date()

  const expenseTemplates = [
    { description: 'Aluguel do imóvel', category: 'rent' as ExpenseCategory, amount: 3500, recurring: true, dayOfMonth: 5 },
    { description: 'Conta de luz', category: 'utilities' as ExpenseCategory, amount: 450, recurring: true, dayOfMonth: 10 },
    { description: 'Conta de água', category: 'utilities' as ExpenseCategory, amount: 120, recurring: true, dayOfMonth: 15 },
    { description: 'Internet e telefone', category: 'utilities' as ExpenseCategory, amount: 200, recurring: true, dayOfMonth: 8 },
    { description: 'Salário - João Santos', category: 'salaries' as ExpenseCategory, amount: 3200, recurring: true, dayOfMonth: 1 },
    { description: 'Salário - Mariana Costa', category: 'salaries' as ExpenseCategory, amount: 2800, recurring: true, dayOfMonth: 1 },
    { description: 'Salário - Carlos Silva', category: 'salaries' as ExpenseCategory, amount: 2500, recurring: true, dayOfMonth: 1 },
    { description: 'Salário - Juliana Lima', category: 'salaries' as ExpenseCategory, amount: 2900, recurring: true, dayOfMonth: 1 },
    { description: 'Salário - Ricardo Mendes', category: 'salaries' as ExpenseCategory, amount: 2400, recurring: true, dayOfMonth: 1 },
  ]

  const oneTimeExpenses = [
    { description: 'Produtos para coloração', category: 'supplies' as ExpenseCategory, amount: 680 },
    { description: 'Toalhas e capas', category: 'supplies' as ExpenseCategory, amount: 350 },
    { description: 'Navalhas e tesouras profissionais', category: 'supplies' as ExpenseCategory, amount: 890 },
    { description: 'Produtos de limpeza', category: 'supplies' as ExpenseCategory, amount: 180 },
    { description: 'Shampoos e condicionadores', category: 'supplies' as ExpenseCategory, amount: 520 },
    { description: 'Anúncios Google Ads', category: 'marketing' as ExpenseCategory, amount: 450 },
    { description: 'Anúncios Instagram/Facebook', category: 'marketing' as ExpenseCategory, amount: 380 },
    { description: 'Manutenção ar condicionado', category: 'maintenance' as ExpenseCategory, amount: 280 },
    { description: 'Reparo cadeira de barbeiro', category: 'maintenance' as ExpenseCategory, amount: 320 },
    { description: 'Material de escritório', category: 'other' as ExpenseCategory, amount: 150 },
  ]

  let id = 1

  // Gerar despesas recorrentes dos últimos 3 meses
  for (let monthOffset = 3; monthOffset >= 0; monthOffset--) {
    expenseTemplates.forEach(template => {
      const expenseDate = new Date(today.getFullYear(), today.getMonth() - monthOffset, template.dayOfMonth)

      if (expenseDate <= today) {
        const isPaid = expenseDate < today || Math.random() > 0.3

        expenses.push({
          id: String(id++),
          description: template.description,
          category: template.category,
          amount: template.amount,
          date: expenseDate,
          paymentMethod: isPaid ? (['pix', 'credit', 'debit', 'boleto'] as PaymentMethod[])[Math.floor(Math.random() * 4)] : undefined,
          isPaid,
          recurring: template.recurring
        })
      }
    })
  }

  // Gerar despesas únicas nos últimos 3 meses
  const startDate = new Date(today)
  startDate.setMonth(startDate.getMonth() - 3)

  for (let i = 0; i < 15; i++) {
    const randomDays = Math.floor(Math.random() * 90)
    const expenseDate = new Date(startDate)
    expenseDate.setDate(expenseDate.getDate() + randomDays)

    if (expenseDate <= today) {
      const template = oneTimeExpenses[Math.floor(Math.random() * oneTimeExpenses.length)]
      const isPaid = expenseDate < today || Math.random() > 0.4
      const variation = 0.8 + Math.random() * 0.4 // ±20% variation

      expenses.push({
        id: String(id++),
        description: template.description,
        category: template.category,
        amount: Math.round(template.amount * variation),
        date: expenseDate,
        paymentMethod: isPaid ? (['pix', 'credit', 'debit', 'boleto'] as PaymentMethod[])[Math.floor(Math.random() * 4)] : undefined,
        isPaid,
        recurring: false
      })
    }
  }

  return expenses.sort((a, b) => b.date.getTime() - a.date.getTime())
}

export const mockExpenses: Expense[] = generateExpenses()
