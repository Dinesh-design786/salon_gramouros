import { create } from 'zustand'

export interface Branch {
  id: string
  name: string
  location: string
  capacity: number
  fill_rate: number
}

export interface Stylist {
  id: string
  name: string
  specialty: string
  experience_level: 'Junior' | 'Senior' | 'Master'
  rating: number
  branch_id: string
  workload: number
  is_active: boolean
}

export interface Appointment {
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
}

export interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
  min_stock: number
  branch_id: string
  supplier: string
}

export interface EventNotification {
  id: string
  text: string
  time: string
  type: 'info' | 'success' | 'warning' | 'alert'
}

interface GlamourStore {
  // Database States
  branches: Branch[]
  stylists: Stylist[]
  appointments: Appointment[]
  inventory: Product[]
  notifications: EventNotification[]
  services: Array<{ id: string; name: string; price: number; duration: number; category: string }>
  
  // Auth & SMS States
  user: any | null
  isAuthenticated: boolean
  smsLogs: Array<{ id: string; phone: string; otp: string; message: string; timestamp: string }>
  wsMessages: Array<{ id: string; event: string; payload: any; timestamp: string }>

  // Selection States
  activeBranchId: string
  activeTab: 'calendar' | 'chat' | 'pos' | 'inventory' | 'staff' | 'analytics'
  isLoading: boolean
  isBackendConnected: boolean
  
  // Demo Presentation States
  demoStep: number
  isDemoRunning: boolean

  // Actions
  initData: () => Promise<void>
  setActiveBranch: (branchId: string) => void
  setActiveTab: (tab: 'calendar' | 'chat' | 'pos' | 'inventory' | 'staff' | 'analytics') => void
  addNotification: (text: string, type?: EventNotification['type']) => void
  clearNotifications: () => void
  
  // Auth Actions
  requestOtp: (phone: string) => Promise<any>
  verifyOtp: (phone: string, otp: string, role?: string) => Promise<any>
  login: (emailOrPhone: string, password: string) => Promise<any>
  registerUser: (userData: any) => Promise<any>
  adminLogin: (email: string, password: string) => Promise<any>
  checkAuth: () => Promise<any>
  logout: () => void
  addSmsLog: (log: { phone: string; otp: string; message: string }) => void
  addWsMessage: (msg: { event: string; payload: any }) => void

  // Simulated Scheduling Actions
  createAppointment: (apptData: Partial<Appointment>) => Promise<any>
  updateAppointmentStatus: (id: string, status: Appointment['status']) => Promise<void>
  restockProduct: (productId: string, qty: number) => Promise<void>
  
  // Chat Actions
  sendWhatsAppMessage: (msg: string) => Promise<string>
  
  // Demo Actions
  nextDemoStep: () => void
  resetDemo: () => void
}

const API_BASE = 'http://localhost:5000/api/v1'

export const useMainStore = create<GlamourStore>((set, get) => ({
  services: [
    { id: 'ser1', name: 'Signature Haircut & Wash', price: 499, duration: 45, category: 'Hair' },
    { id: 'ser2', name: 'Balayage Hair Coloring', price: 2999, duration: 120, category: 'Hair' },
    { id: 'ser3', name: 'Detox Facial & Massage', price: 1499, duration: 60, category: 'Skin' },
    { id: 'ser4', name: 'Glaze Nail Art & Gel Extensions', price: 999, duration: 75, category: 'Nails' },
    { id: 'ser5', name: 'Therapeutic Aromatherapy Spa', price: 2499, duration: 90, category: 'Spa' },
  ],
  branches: [
    { id: 'b1000000-0000-0000-0000-000000000001', name: 'GlamourOS Banjara Hills', location: 'Road No. 12, Banjara Hills, Hyderabad', capacity: 80, fill_rate: 25.00 },
    { id: 'b1000000-0000-0000-0000-000000000002', name: 'GlamourOS Jubilee Hills', location: 'Road No. 36, Jubilee Hills, Hyderabad', capacity: 70, fill_rate: 42.00 },
    { id: 'b1000000-0000-0000-0000-000000000003', name: 'GlamourOS Madhapur', location: 'Hitech City Road, Madhapur, Hyderabad', capacity: 60, fill_rate: 90.00 }
  ],
  stylists: [
    { id: 'st100000-0000-0000-0000-000000000001', name: 'Rohan Sharma', specialty: 'Hair Styling & Color', experience_level: 'Master', rating: 4.90, branch_id: 'b1000000-0000-0000-0000-000000000001', workload: 30, is_active: true },
    { id: 'st100000-0000-0000-0000-000000000002', name: 'Kavya Reddy', specialty: 'Bridal & Makeovers', experience_level: 'Master', rating: 4.80, branch_id: 'b1000000-0000-0000-0000-000000000001', workload: 20, is_active: true },
    { id: 'st100000-0000-0000-0000-000000000003', name: 'Sandeep Naidu', specialty: 'Haircuts & Grooming', experience_level: 'Senior', rating: 4.70, branch_id: 'b1000000-0000-0000-0000-000000000002', workload: 45, is_active: true },
    { id: 'st100000-0000-0000-0000-000000000004', name: 'Priya Patel', specialty: 'Facials & Skincare', experience_level: 'Junior', rating: 4.50, branch_id: 'b1000000-0000-0000-0000-000000000002', workload: 15, is_active: true },
    { id: 'st100000-0000-0000-0000-000000000005', name: 'Vikram Rao', specialty: 'Keratin & Treatments', experience_level: 'Senior', rating: 4.60, branch_id: 'b1000000-0000-0000-0000-000000000003', workload: 85, is_active: true },
    { id: 'st100000-0000-0000-0000-000000000006', name: 'Anjali Sen', specialty: 'Nail Art & Spa', experience_level: 'Junior', rating: 4.40, branch_id: 'b1000000-0000-0000-0000-000000000003', workload: 60, is_active: true }
  ],
  appointments: [
    { id: 'a1000000-0000-0000-0000-000000000001', customer_id: 'c1000000-0000-0000-0000-000000000001', branch_id: 'b1000000-0000-0000-0000-000000000001', stylist_id: 'st100000-0000-0000-0000-000000000002', date: '2026-05-25', time: '10:00', duration: 180, base_price: 8000.00, applied_price: 6800.00, status: 'Completed', source: 'Website', notes: 'Royal Bridal Package' },
    { id: 'a1000000-0000-0000-0000-000000000002', customer_id: 'c1000000-0000-0000-0000-000000000002', branch_id: 'b1000000-0000-0000-0000-000000000001', stylist_id: 'st100000-0000-0000-0000-000000000001', date: '2026-05-25', time: '14:30', duration: 30, base_price: 500.00, applied_price: 450.00, status: 'Confirmed', source: 'WhatsApp', notes: 'Standard haircut' },
    { id: 'a1000000-0000-0000-0000-000000000003', customer_id: 'c1000000-0000-0000-0000-000000000004', branch_id: 'b1000000-0000-0000-0000-000000000002', stylist_id: 'st100000-0000-0000-0000-000000000004', date: '2026-05-25', time: '16:00', duration: 45, base_price: 800.00, applied_price: 800.00, status: 'In Progress', source: 'Walk-in' }
  ],
  inventory: [
    { id: 'p1000000-0000-0000-0000-000000000001', name: "L'Oreal Professional Hair Dye", category: 'Color', price: 850.00, stock: 4, min_stock: 6, branch_id: 'b1000000-0000-0000-0000-000000000001', supplier: "L'Oreal India Dist." },
    { id: 'p1000000-0000-0000-0000-000000000002', name: 'Organic Keratin Argan Serum', category: 'Serum', price: 1200.00, stock: 18, min_stock: 5, branch_id: 'b1000000-0000-0000-0000-000000000001', supplier: 'ArganCo Hyderabad' },
    { id: 'p1000000-0000-0000-0000-000000000003', name: 'Moroccan Spa Therapy Massage Oil', category: 'Spa', price: 950.00, stock: 3, min_stock: 5, branch_id: 'b1000000-0000-0000-0000-000000000001', supplier: 'TheraDistributors AP' },
    { id: 'p1000000-0000-0000-0000-000000000004', name: 'Charcoal Detan Peeling Scrub', category: 'Skincare', price: 450.00, stock: 25, min_stock: 8, branch_id: 'b1000000-0000-0000-0000-000000000002', supplier: 'Himalaya Retail Hyd' },
    { id: 'p1000000-0000-0000-0000-000000000005', name: "L'Oreal Professional Hair Dye", category: 'Color', price: 850.00, stock: 15, min_stock: 6, branch_id: 'b1000000-0000-0000-0000-000000000002', supplier: "L'Oreal India Dist." }
  ],
  notifications: [
    { id: 'n1', text: 'GlamourOS Operations Roster fully calibrated.', time: '09:00 AM', type: 'info' },
    { id: 'n2', text: 'Critical stock alert! L\'Oreal Dye stock has dropped to 4 units at Banjara Hills.', time: '10:15 AM', type: 'alert' },
    { id: 'n3', text: 'Gold membership invoice INV-550912 successfully settled. Stylist Rohan Sharma credited ₹2720 commissions.', time: '11:00 AM', type: 'success' }
  ],
  
  // Auth initial state
  user: null,
  isAuthenticated: false,
  smsLogs: [],
  wsMessages: [],

  activeBranchId: 'b1000000-0000-0000-0000-000000000001',
  activeTab: 'calendar',
  isLoading: false,
  isBackendConnected: false,
  
  demoStep: 0,
  isDemoRunning: false,

  // Initialize data from local server or trigger memory fallback
  initData: async () => {
    set({ isLoading: true })
    
    // Read cached login sessions
    if (typeof window !== 'undefined') {
      const cachedUser = localStorage.getItem('glamour_user')
      if (cachedUser) {
        set({ user: JSON.parse(cachedUser), isAuthenticated: true })
        // Check token validity in the background
        setTimeout(async () => {
          await get().checkAuth()
        }, 10)
      }
    }

    try {
      const res = await fetch(`${API_BASE}/branches`)
      if (res.ok) {
        const data = await res.json()
        set({ branches: data.branches, isBackendConnected: true })
        
        // Fetch inventory
        const resInv = await fetch(`${API_BASE}/inventory?branchId=${get().activeBranchId}`)
        if (resInv.ok) {
          const dataInv = await resInv.json()
          set({ inventory: dataInv.inventory })
        }
      }
    } catch (err) {
      console.log('🤖 Express server offline. Running on dynamic client-side sandbox.')
      set({ isBackendConnected: false })
    } finally {
      set({ isLoading: false })
    }
  },

  requestOtp: async (phone: string) => {
    return { success: true, otp: '123456', smsPayload: 'SMS verification is deprecated. Please register/login with passwords.' }
  },

  verifyOtp: async (phone: string, otp: string, role?: string) => {
    return { success: true, message: 'OTP is decommissioned.' }
  },

  login: async (emailOrPhone: string, password: string) => {
    const isBackend = get().isBackendConnected
    if (isBackend) {
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emailOrPhone, password })
        })
        if (res.ok) {
          const data = await res.json()
          set({ user: data.user, isAuthenticated: true })
          if (typeof window !== 'undefined') {
            localStorage.setItem('glamour_user', JSON.stringify(data.user))
            localStorage.setItem('glamour_token', data.token)
          }
          get().addNotification(`Access Granted: Welcome back, ${data.user.name}!`, 'success')
          return data
        } else {
          const errData = await res.json()
          throw new Error(errData.error || 'Authentication failed.')
        }
      } catch (err: any) {
        get().addNotification(`Security Shield: Login error - ${err.message}`, 'alert')
        throw err
      }
    }

    // Mock Fallback Search
    const searchVal = emailOrPhone.trim().toLowerCase()
    if (searchVal === 'admin@glamouros.com' || searchVal === '9888877777') {
      if (password === 'admin123') {
        const mockUser = { id: 'usr_mock_admin_1', name: 'Suhail Rao (Admin)', email: 'admin@glamouros.com', phone: '9888877777', role: 'admin', created_at: new Date() }
        set({ user: mockUser, isAuthenticated: true })
        if (typeof window !== 'undefined') {
          localStorage.setItem('glamour_user', JSON.stringify(mockUser))
          localStorage.setItem('glamour_token', 'mock_token_admin')
        }
        get().addNotification('Access Granted: Welcome, Suhail Rao! (Sandbox Mode)', 'success')
        return { success: true, user: mockUser, token: 'mock_token_admin' }
      }
    } else if (searchVal === 'virat@kohli.com' || searchVal === '9876543210') {
      if (password === 'password123') {
        const mockUser = { id: 'usr_mock_customer_1', name: 'Virat Kohli (Platinum)', email: 'virat@kohli.com', phone: '9876543210', role: 'customer', created_at: new Date() }
        set({ user: mockUser, isAuthenticated: true })
        if (typeof window !== 'undefined') {
          localStorage.setItem('glamour_user', JSON.stringify(mockUser))
          localStorage.setItem('glamour_token', 'mock_token_customer')
        }
        get().addNotification('Access Granted: Welcome, Virat Kohli! (Sandbox Mode)', 'success')
        return { success: true, user: mockUser, token: 'mock_token_customer' }
      }
    }
    throw new Error('Invalid login credentials (Sandbox fallback). Use admin@glamouros.com / admin123 or virat@kohli.com / password123')
  },

  registerUser: async (userData: any) => {
    const isBackend = get().isBackendConnected
    if (isBackend) {
      try {
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        })
        if (res.ok) {
          const data = await res.json()
          set({ user: data.user, isAuthenticated: true })
          if (typeof window !== 'undefined') {
            localStorage.setItem('glamour_user', JSON.stringify(data.user))
            localStorage.setItem('glamour_token', data.token)
          }
          get().addNotification(`Successfully Registered: Welcome ${data.user.name}!`, 'success')
          return data
        } else {
          const errData = await res.json()
          throw new Error(errData.error || 'Registration failed.')
        }
      } catch (err: any) {
        get().addNotification(`Security Shield: Registration error - ${err.message}`, 'alert')
        throw err
      }
    }

    // Mock register
    const mockId = 'usr_' + Math.random().toString(36).substring(2, 9)
    const mockUser = {
      id: mockId,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      role: 'customer',
      created_at: new Date()
    }
    set({ user: mockUser, isAuthenticated: true })
    if (typeof window !== 'undefined') {
      localStorage.setItem('glamour_user', JSON.stringify(mockUser))
      localStorage.setItem('glamour_token', 'mock_token_' + mockId)
    }
    get().addNotification(`Registered successfully: Welcome, ${userData.name}! (Sandbox Mode)`, 'success')
    return { success: true, user: mockUser, token: 'mock_token_' + mockId }
  },

  adminLogin: async (email: string, password: string) => {
    const isBackend = get().isBackendConnected
    if (isBackend) {
      try {
        const res = await fetch(`${API_BASE}/auth/admin-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        })
        if (res.ok) {
          const data = await res.json()
          set({ user: data.user, isAuthenticated: true })
          if (typeof window !== 'undefined') {
            localStorage.setItem('glamour_user', JSON.stringify(data.user))
            localStorage.setItem('glamour_token', data.token)
          }
          get().addNotification(`Access Granted: Welcome Admin, ${data.user.name}!`, 'success')
          return data
        } else {
          const errData = await res.json()
          throw new Error(errData.error || 'Admin authentication failed.')
        }
      } catch (err: any) {
        get().addNotification(`Security Shield: Admin login error - ${err.message}`, 'alert')
        throw err
      }
    }

    // Mock Admin Fallback
    const searchVal = email.trim().toLowerCase()
    if (searchVal === 'admin@glamouros.com' && password === 'admin123') {
      const mockUser = { id: 'usr_mock_admin_1', name: 'Suhail Rao (Admin)', email: 'admin@glamouros.com', phone: '9888877777', role: 'admin', created_at: new Date() }
      set({ user: mockUser, isAuthenticated: true })
      if (typeof window !== 'undefined') {
        localStorage.setItem('glamour_user', JSON.stringify(mockUser))
        localStorage.setItem('glamour_token', 'mock_token_admin')
      }
      get().addNotification('Access Granted: Welcome Admin, Suhail Rao! (Sandbox Mode)', 'success')
      return { success: true, user: mockUser, token: 'mock_token_admin' }
    }
    throw new Error('Invalid admin credentials (Sandbox fallback). Use admin@glamouros.com / admin123')
  },

  checkAuth: async () => {
    const isBackend = get().isBackendConnected
    if (isBackend) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('glamour_token') : null
      if (!token) return null
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
        if (res.ok) {
          const data = await res.json()
          set({ user: data.user, isAuthenticated: true })
          return data.user
        } else {
          // Token expired or invalid
          get().logout()
          return null
        }
      } catch (err) {
        console.error('CheckAuth failed', err)
        return null
      }
    }
    return get().user
  },

  logout: () => {
    set({ user: null, isAuthenticated: false })
    if (typeof window !== 'undefined') {
      localStorage.removeItem('glamour_user')
      localStorage.removeItem('glamour_token')
    }
    get().addNotification('Secure Logout: Roster workspace locked.', 'info')
  },

  addSmsLog: (log) => {
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    const newLog = {
      id: Math.random().toString(),
      phone: log.phone,
      otp: log.otp,
      message: log.message,
      timestamp: timeStr
    }
    set(state => ({ smsLogs: [newLog, ...state.smsLogs] }))
  },

  addWsMessage: (msg) => {
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    const newMsg = {
      id: Math.random().toString(),
      event: msg.event,
      payload: msg.payload,
      timestamp: timeStr
    }
    set(state => ({ wsMessages: [newMsg, ...state.wsMessages] }))
  },

  setActiveBranch: (branchId) => {
    set({ activeBranchId: branchId })
    get().addNotification(`Switched branch workspace focus to ${branchId === 'b1000000-0000-0000-0000-000000000001' ? 'Banjara Hills' : branchId === 'b1000000-0000-0000-0000-000000000002' ? 'Jubilee Hills' : 'Madhapur'}.`, 'info')
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  addNotification: (text, type = 'info') => {
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    const newNotif: EventNotification = {
      id: Math.random().toString(),
      text,
      time: timeStr,
      type
    }
    set((state) => ({ notifications: [newNotif, ...state.notifications] }))
  },

  clearNotifications: () => set({ notifications: [] }),

  createAppointment: async (apptData) => {
    const { activeBranchId, isBackendConnected } = get()
    
    // Sync with backend if connected
    if (isBackendConnected) {
      try {
        const response = await fetch(`${API_BASE}/appointments/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...apptData, branchId: activeBranchId })
        })
        if (response.ok) {
          const result = await response.json()
          get().addNotification(`Appt Confirmation: ${result.message}`, 'success')
          
          // Re-fetch appointments
          const resAppts = await fetch(`${API_BASE}/appointments?branchId=${activeBranchId}`)
          if (resAppts.ok) {
            const dataAppts = await resAppts.json()
            set({ appointments: dataAppts.appointments })
          }
          return result
        }
      } catch (err) {
        console.error('Failed to communicate with Express API backend', err)
      }
    }

    // Dynamic Client Mock Trigger
    const apptId = 'ap_' + Math.random().toString(36).substring(2, 9)
    const originalPrice = apptData.base_price || 500
    
    // Dynamic Pricing Logic: Happy hour if Madhapur fill rate or Banjara fill rate < 30%
    const activeBranch = get().branches.find(b => b.id === activeBranchId)
    const fillRate = activeBranch?.fill_rate || 35
    let appliedPrice = originalPrice
    let pricingApplied = 'Standard'

    if (fillRate < 30) {
      appliedPrice = Math.round(originalPrice * 0.85) // 15% discount
      pricingApplied = 'Happy Hour'
    } else if (fillRate > 85) {
      appliedPrice = Math.round(originalPrice * 1.20) // 20% surcharge
      pricingApplied = 'Surge'
    }

    const newAppt: Appointment = {
      id: apptId,
      customer_id: apptData.customer_id || 'c1000000-0000-0000-0000-000000000001',
      branch_id: activeBranchId,
      stylist_id: apptData.stylist_id || 'st100000-0000-0000-0000-000000000001',
      date: apptData.date || '2026-05-25',
      time: apptData.time || '15:00',
      duration: apptData.duration || 60,
      base_price: originalPrice,
      applied_price: appliedPrice,
      status: 'Confirmed',
      source: apptData.source || 'Website',
      notes: apptData.notes || `Dynamic Pricing: ${pricingApplied}`
    }

    set((state) => ({
      appointments: [...state.appointments, newAppt],
      // Adjust stylist load
      stylists: state.stylists.map(s => s.id === newAppt.stylist_id ? { ...s, workload: Math.min(100, s.workload + 15) } : s)
    }))

    get().addNotification(`Successfully booked standard calendar slot conflict-free. Dynamic Pricing applied: ${pricingApplied} (₹${appliedPrice}).`, 'success')
    return { success: true, appointment: newAppt }
  },

  updateAppointmentStatus: async (id, status) => {
    const { isBackendConnected, activeBranchId } = get()
    
    if (isBackendConnected) {
      try {
        await fetch(`${API_BASE}/appointments/status/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        })
      } catch (err) {
        console.error('Failed to patch appointment status', err)
      }
    }

    // Client mock trigger
    set((state) => {
      const appt = state.appointments.find(a => a.id === id)
      if (!appt) return {}

      // If completed, deduct L'Oreal professional dye (Simulating Auto-Deduct inventory!)
      if (status === 'Completed' && appt.status !== 'Completed') {
        get().addNotification(`POS Status Completed. Running auto-deduct inventory checks...`, 'info')
        
        // Auto-deduct simulated item based on service category
        const updatedInventory = state.inventory.map(prod => {
          if (prod.name.includes("L'Oreal") && prod.branch_id === activeBranchId) {
            const newStock = Math.max(0, prod.stock - 1)
            if (newStock < prod.min_stock) {
              setTimeout(() => {
                get().addNotification(`Inventory Shortage Warning! "${prod.name}" dropped to ${newStock} units. Safety threshold breached!`, 'alert')
              }, 400)
            }
            return { ...prod, stock: newStock }
          }
          return prod
        })

        // Stylist payout calculation: Rohan Sharma (experience level Master gets 35% commission + rating bonus)
        const payoutCommission = Math.round(appt.applied_price * 0.35)
        const ratingBonus = 150 // standard bonus
        
        setTimeout(() => {
          get().addNotification(`Ledger Credit: Stylist Rohan Sharma credited ₹${payoutCommission} service commission + ₹${ratingBonus} performance rating payout.`, 'success')
        }, 800)

        return {
          appointments: state.appointments.map(a => a.id === id ? { ...a, status } : a),
          inventory: updatedInventory,
          stylists: state.stylists.map(s => s.id === appt.stylist_id ? { ...s, workload: Math.max(0, s.workload - 15) } : s)
        }
      }

      return {
        appointments: state.appointments.map(a => a.id === id ? { ...a, status } : a)
      }
    })
  },

  restockProduct: async (productId, qty) => {
    const { isBackendConnected } = get()
    if (isBackendConnected) {
      try {
        await fetch(`${API_BASE}/inventory/restock`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, quantity: qty })
        })
      } catch (err) {
        console.error('Failed to post restocking items', err)
      }
    }

    set((state) => ({
      inventory: state.inventory.map(p => p.id === productId ? { ...p, stock: p.stock + qty } : p)
    }))
    
    const pName = get().inventory.find(p => p.id === productId)?.name
    get().addNotification(`Restock Logged: Replenished +${qty} units of "${pName}" successfully.`, 'success')
  },

  sendWhatsAppMessage: async (msg) => {
    const { isBackendConnected, activeBranchId } = get()
    
    if (isBackendConnected) {
      try {
        const response = await fetch(`${API_BASE}/whatsapp/message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: msg, customerPhone: '+91 98480 22338' })
        })
        if (response.ok) {
          const data = await response.json()
          
          // Re-fetch appointments
          const resAppts = await fetch(`${API_BASE}/appointments?branchId=${activeBranchId}`)
          if (resAppts.ok) {
            const dataAppts = await resAppts.json()
            set({ appointments: dataAppts.appointments })
          }
          return data.responseMessage
        }
      } catch (err) {
        console.error('WhatsApp sim error', err)
      }
    }

    // Client mock NLP engine fallback
    const text = msg.toLowerCase()
    let serviceName = 'Signature Haircut'
    let serviceCost = 500
    let stylistName = 'Rohan Sharma'
    let finalTime = '17:00'
    let isConflict = false

    if (text.includes('haircut')) {
      serviceName = 'Signature Haircut'
      serviceCost = 500
    } else if (text.includes('color') || text.includes('balayage')) {
      serviceName = 'Balayage Hair Color'
      serviceCost = 1500
    } else if (text.includes('bridal') || text.includes('shadi')) {
      serviceName = 'Royal Bridal Package'
      serviceCost = 8000
    }

    // Simulate conflict check on tomorrow afternoon (busy roster slot!)
    if (text.includes('conflict') || text.includes('3:30')) {
      isConflict = true
      finalTime = '15:45' // Auto offset conflict by +15 mins!
    }

    const apptId = 'ap_wa_' + Math.random().toString(36).substring(2, 9)
    const newAppt: Appointment = {
      id: apptId,
      customer_id: 'c1000000-0000-0000-0000-000000000001',
      branch_id: activeBranchId,
      stylist_id: 'st100000-0000-0000-0000-000000000001', // Rohan
      date: '2026-05-26', // Tomorrow
      time: finalTime,
      duration: 60,
      base_price: serviceCost,
      applied_price: serviceCost,
      status: 'Confirmed',
      source: 'WhatsApp',
      notes: 'WhatsApp parsed booking.'
    }

    set((state) => ({
      appointments: [...state.appointments, newAppt],
      stylists: state.stylists.map(s => s.id === newAppt.stylist_id ? { ...s, workload: Math.min(100, s.workload + 15) } : s)
    }))

    let reply = `Namaste! Ji bilkul, tomorrow evening space available undi at GlamourOS Banjara Hills. I have confirmed your "${serviceName}" booking with senior specialist *${stylistName}* at *${finalTime}*. Can you confirm if this is fine?`
    if (isConflict) {
      reply = `⚠️ *Collision Warning Overridden* \n\nNamaste! Rohan is double-booked at 3:30. To resolve this, I have auto-adjusted your "${serviceName}" booking with *${stylistName}* to *${finalTime}* (next immediate conflict-free slot). Can you confirm if this is fine?`
    }

    get().addNotification(`WhatsApp NLP booked appointment. Conflict Resolved: ${isConflict ? 'YES' : 'NO'}.`, 'success')
    return reply
  },

  nextDemoStep: () => {
    set((state) => {
      const nextStep = (state.demoStep + 1) % 8
      return { demoStep: nextStep, isDemoRunning: true }
    })
  },

  resetDemo: () => {
    set({
      demoStep: 0,
      isDemoRunning: false,
      appointments: [
        { id: 'a1000000-0000-0000-0000-000000000001', customer_id: 'c1000000-0000-0000-0000-000000000001', branch_id: 'b1000000-0000-0000-0000-000000000001', stylist_id: 'st100000-0000-0000-0000-000000000002', date: '2026-05-25', time: '10:00', duration: 180, base_price: 8000.00, applied_price: 6800.00, status: 'Completed', source: 'Website', notes: 'Royal Bridal Package' },
        { id: 'a1000000-0000-0000-0000-000000000002', customer_id: 'c1000000-0000-0000-0000-000000000002', branch_id: 'b1000000-0000-0000-0000-000000000001', stylist_id: 'st100000-0000-0000-0000-000000000001', date: '2026-05-25', time: '14:30', duration: 30, base_price: 500.00, applied_price: 450.00, status: 'Confirmed', source: 'WhatsApp', notes: 'Standard haircut' }
      ],
      inventory: [
        { id: 'p1000000-0000-0000-0000-000000000001', name: "L'Oreal Professional Hair Dye", category: 'Color', price: 850.00, stock: 4, min_stock: 6, branch_id: 'b1000000-0000-0000-0000-000000000001', supplier: "L'Oreal India Dist." },
        { id: 'p1000000-0000-0000-0000-000000000002', name: 'Organic Keratin Argan Serum', category: 'Serum', price: 1200.00, stock: 18, min_stock: 5, branch_id: 'b1000000-0000-0000-0000-000000000001', supplier: 'ArganCo Hyderabad' }
      ]
    })
    get().addNotification('Demo presentation runway reset to Step 0.', 'info')
  }
}))
export default useMainStore
