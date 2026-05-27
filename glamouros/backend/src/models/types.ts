export interface DbBranch {
  id: string
  name: string
  location: string
  capacity: number
  fill_rate: number
  created_at?: Date
}

export interface DbStaff {
  id: string
  name: string
  specialty: string
  experience_level: 'Junior' | 'Senior' | 'Master'
  rating: number
  branch_id: string
  workload: number
  is_active: boolean
  created_at?: Date
}

export interface DbCustomer {
  id: string
  name: string
  phone: string
  membership_tier: 'Standard' | 'Silver' | 'Gold' | 'Platinum'
  loyalty_points: number
  preferred_service_id?: string
  favorite_stylist_id?: string
  notes?: string
  created_at?: Date
}

export interface DbService {
  id: string
  name: string
  price: number
  duration: number
  category: string
  sac_code: string
}

export interface DbAppointment {
  id: string
  customer_id: string
  branch_id: string
  stylist_id: string
  date: string
  time: string
  duration: number
  base_price: number
  applied_price: number
  status: 'Pending' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled'
  source: 'Website' | 'WhatsApp' | 'Walk-in' | 'Instagram' | 'Phone'
  notes?: string
  created_at?: Date
}

export interface DbInventory {
  id: string
  name: string
  category: string
  price: number
  stock: number
  min_stock: number
  branch_id: string
  supplier: string
}

export interface DbInvoice {
  id: string
  invoice_no: string
  appointment_id?: string
  customer_id?: string
  subtotal: number
  discount: number
  cgst: number
  sgst: number
  grand_total: number
  is_settled: boolean
  qr_code_payload?: string
  created_at?: Date
}

export interface DbInvoiceItem {
  id: string
  invoice_id: string
  item_type: 'Service' | 'Retail'
  item_name: string
  quantity: number
  unit_price: number
  total_price: number
}

export interface DbPayment {
  id: string
  invoice_id: string
  method: 'Cash' | 'UPI' | 'Card' | 'Wallet'
  amount: number
  transaction_id?: string
  status: string
}

export interface DbCommissionRate {
  level: 'Junior' | 'Senior' | 'Master'
  service_percent: number
  retail_percent: number
}

export interface DbCommissionLedger {
  id: string
  invoice_id: string
  staff_id: string
  service_commission: number
  retail_commission: number
  performance_bonus: number
  total_commission: number
  created_at?: Date
}
