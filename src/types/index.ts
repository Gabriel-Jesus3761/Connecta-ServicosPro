export type PaymentMethod = 'pix' | 'credit' | 'debit' | 'cash' | 'boleto'

export interface Appointment {
  id: string
  clientName: string
  service: string
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
  name: string
  description: string
  price: number
  duration: number
  category: 'hair' | 'beard' | 'color' | 'treatment' | 'spa'
  image?: string
}

export interface Professional {
  id: string
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
  description: string
  category: ExpenseCategory
  amount: number
  date: Date
  paymentMethod?: PaymentMethod
  isPaid: boolean
  recurring: boolean
}
