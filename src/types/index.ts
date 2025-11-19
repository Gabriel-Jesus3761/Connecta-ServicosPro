export type PaymentMethod = 'pix' | 'credit' | 'debit' | 'cash' | 'boleto'

export type BusinessCategory = 'barbearia' | 'estetica' | 'spa' | 'salao' | 'manicure' | 'massagem' | 'depilacao' | 'maquiagem'

export interface BusinessHours {
  dayOfWeek: number // 0-6 (domingo a sábado)
  open: string // formato "HH:mm"
  close: string // formato "HH:mm"
  isClosed: boolean
}

export interface Business {
  id: string
  name: string
  category: BusinessCategory
  description: string
  address: {
    street: string
    number: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
  }
  phone: string
  email: string
  image: string
  gallery?: string[]
  rating: number
  totalReviews: number
  businessHours: BusinessHours[]
  ownerId: string
}

export interface Appointment {
  id: string
  businessId: string
  clientId: string
  clientName: string
  serviceId: string
  service: string
  professionalId: string
  professional: string
  date: Date
  time: string
  price: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  duration: number
  paymentMethod?: PaymentMethod
}

export interface Service {
  id: string
  businessId: string
  name: string
  description: string
  price: number
  duration: number
  category: 'hair' | 'beard' | 'color' | 'treatment' | 'spa' | 'nails' | 'skin' | 'massage' | 'depilation' | 'makeup'
  image?: string
}

export interface Professional {
  id: string
  businessId: string
  name: string
  role: string
  avatar?: string
  specialties: string[]
  rating: number
  totalAppointments: number
  available: boolean
}

export interface DashboardStats {
  todayAppointments: number
  monthlyRevenue: number
  activeProfessionals: number
  availableServices: number
}

export type ExpenseCategory = 'rent' | 'utilities' | 'supplies' | 'salaries' | 'marketing' | 'maintenance' | 'other'

export interface Expense {
  id: string
  businessId: string
  description: string
  category: ExpenseCategory
  amount: number
  date: Date
  paymentMethod?: PaymentMethod
  isPaid: boolean
  recurring: boolean
}

export interface CategoryInfo {
  id: BusinessCategory
  name: string
  description: string
  icon: string
  color: string
  bgColor: string
}
