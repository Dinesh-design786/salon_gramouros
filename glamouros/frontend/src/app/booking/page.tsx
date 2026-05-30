"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useMainStore } from '../../store/mainStore'
import { 
  Sparkles, User, Phone, Mail, Scissors, MapPin, Calendar, 
  Clock, CreditCard, CheckCircle2, AlertCircle, ArrowRight, 
  Receipt, MessageSquare, Loader2, X, LogOut, QrCode, Brain
} from 'lucide-react'
import { AISmartBookingAssistant } from '../../components/booking/AISmartBookingAssistant'

// ─── Constants ────────────────────────────────────────────────────────────────

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '14:00', '14:30', '15:00',
  '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
]

// ─── Types ────────────────────────────────────────────────────────────────────

interface Invoice {
  invoiceId: string
  customerName: string
  phone: string
  serviceName: string
  branchName: string
  bookingDate: string
  bookingTime: string
  offlinePayment: boolean
  paymentStatus: string
  bookingStatus: string
  createdAt: string
}

// ─── Input Component ──────────────────────────────────────────────────────────

const DarkInput = ({
  icon: Icon, label, type = 'text', value, onChange, placeholder, required = true, disabled = false
}: {
  icon: any; label: string; type?: string; value: string
  onChange?: (v: string) => void; placeholder: string; required?: boolean; disabled?: boolean
}) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex justify-between items-center">
      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{label}</label>
      {disabled && (
        <span className="text-[8px] text-[#C5A880] font-black uppercase tracking-wider">✦ VVIP Profile Sync</span>
      )}
    </div>
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-550">
        <Icon className="w-4 h-4" />
      </span>
      <input
        type={type}
        value={value}
        onChange={e => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`w-full border rounded-xl pl-10 pr-4 py-3 text-xs placeholder:text-zinc-650 outline-none transition-all font-semibold ${
          disabled 
            ? 'bg-[#151413]/70 border-[#C5A880]/20 text-[#C5A880]' 
            : 'bg-[#0d0c0b] border-[#2a2826] text-zinc-100 focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]/40'
        }`}
      />
    </div>
  </div>
)

const DarkSelect = ({
  icon: Icon, label, value, onChange, options, placeholder
}: {
  icon: any; label: string; value: string
  onChange: (v: string) => void; options: string[]; placeholder: string
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{label}</label>
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
        <Icon className="w-4 h-4" />
      </span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        required
        className="w-full bg-[#0d0c0b] border border-[#2a2826] rounded-xl pl-10 pr-4 py-3 text-xs text-zinc-200 outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]/40 transition-all font-semibold appearance-none font-sans"
      >
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  </div>
)

// ─── Invoice Modal ────────────────────────────────────────────────────────────

const InvoiceModal = ({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) => {
  const qrData = encodeURIComponent(
    `GlamourOS Invoice\nID:${invoice.invoiceId}\nClient:${invoice.customerName}\nPhone:${invoice.phone}\nService:${invoice.serviceName}\nBranch:${invoice.branchName}\nDate:${invoice.bookingDate} ${invoice.bookingTime}\nPayment:${invoice.offlinePayment ? 'Offline' : 'Online'}`
  )
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&color=C5A880&bgcolor=111009&data=${qrData}`

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-md bg-[#111009] border border-[#C5A880]/30 rounded-3xl overflow-hidden shadow-2xl shadow-black my-4"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#C5A880]/20 to-[#8B6914]/10 border-b border-[#C5A880]/20 p-5 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C5A880]/15 border border-[#C5A880]/30 flex items-center justify-center shrink-0">
              <Receipt className="w-5 h-5 text-[#C5A880]" />
            </div>
            <div>
              <p className="text-[9px] font-black text-[#C5A880] uppercase tracking-widest">VVIP Member pass ✦ Invoice Ready</p>
              <h3 className="text-sm font-heading font-black text-white">GlamourOS Luxe Booking Pass</h3>
              <p className="text-[9px] font-mono text-zinc-400 mt-0.5">{invoice.invoiceId}</p>
            </div>
          </div>
        </div>

        {/* WhatsApp Confirmation Banner */}
        <div className="mx-5 mt-4 bg-[#1a2e1a] border border-emerald-850/60 rounded-2xl p-3.5 flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">WhatsApp Integration Live</p>
              <p className="text-[9px] text-emerald-600 mt-0.5">A booking pass was dispatched to <span className="text-emerald-400 font-bold">{invoice.phone}</span>. If you are using a Twilio Sandbox account, please click below to send it directly via WhatsApp!</p>
            </div>
          </div>
          <a
            href={`https://api.whatsapp.com/send?phone=${invoice.phone.replace(/[^0-9]/g, '')}&text=${encodeURIComponent(
              `✅ *GlamourOS Appointment Confirmed*\n\n💆 *Service:* ${invoice.serviceName}\n🏢 *Branch:* ${invoice.branchName}\n📅 *Date:* ${invoice.bookingDate}\n⏰ *Time:* ${invoice.bookingTime}\n🔑 *Booking ID:* ${invoice.invoiceId}\n\n📱 *QR Pass & Invoice:* http://localhost:3000/invoice/${invoice.invoiceId}\n\nThank you for choosing GlamourOS! ✨`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/20"
          >
            💬 Open &amp; Send via WhatsApp Web/App
          </a>
        </div>

        {/* Invoice rows */}
        <div className="px-5 pt-4 pb-2 flex flex-col gap-2.5 text-xs">
          {[
            ['Member Name', invoice.customerName, 'text-zinc-200 font-black'],
            ['Phone', invoice.phone, 'text-zinc-250'],
            ['Service', invoice.serviceName, 'text-zinc-200'],
            ['Branch Outlet', invoice.branchName, 'text-zinc-300 text-right'],
            ['Schedule Date & Time', `${invoice.bookingDate} · ${invoice.bookingTime}`, 'text-[#C5A880] font-bold'],
            ['Payment Selection', invoice.offlinePayment ? '💵 Counter Settle' : '📱 Online', 'text-amber-400 font-bold'],
            ['Booking Status', '✅ Confirmed VVIP', 'text-emerald-400 font-bold'],
          ].map(([key, val, cls]) => (
            <div key={key as string} className="flex justify-between items-start gap-4 border-b border-[#1e1c1a] pb-2.5 last:border-0 last:pb-0">
              <span className="text-zinc-500 shrink-0 font-medium">{key}</span>
              <span className={`text-right ${cls}`}>{val}</span>
            </div>
          ))}
        </div>

        {/* QR Code Section */}
        <div className="mx-5 my-4 bg-[#0d0c0b] border border-[#2a2826] rounded-2xl p-4 flex items-center gap-4">
          <div className="shrink-0 bg-white p-2 rounded-xl">
            <img
              src={qrUrl}
              alt="Booking QR Code"
              width={80}
              height={80}
              className="rounded-lg"
            />
          </div>
          <div>
            <p className="text-[10px] font-black text-[#C5A880] uppercase tracking-wider mb-1">👑 Scan at Front Desk</p>
            <p className="text-[9px] text-zinc-400 leading-relaxed">Present this VVIP pass to the salon coordinator to instantly redeem loyalty balance and initiate treatment.</p>
            <p className="text-[8px] font-mono text-zinc-650 mt-1">{invoice.invoiceId}</p>
          </div>
        </div>

        <div className="px-5 pb-5 flex flex-col gap-2">
          <Link href="/booking/qrs" className="w-full">
            <button
              className="w-full py-3 rounded-xl bg-[#7F77DD] hover:bg-[#9089e6] text-zinc-950 text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-[#7F77DD]/15 flex items-center justify-center gap-1.5"
            >
              <QrCode className="w-4 h-4 text-zinc-950" />
              Access My Check-In QR Pass
            </button>
          </Link>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-[#C5A880] hover:bg-[#B3966E] text-white text-xs font-extrabold uppercase tracking-wider transition-all shadow-lg shadow-[#C5A880]/15"
          >
            Done — Return to Dashboard
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CustomerBookingPage() {
  const router = useRouter()
  const {
    user,
    isAuthenticated,
    branches,
    services,
    createAppointment,
    addNotification,
    logout
  } = useMainStore()

  // Guard routing
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    } else if (user?.role !== 'customer') {
      router.push('/login')
    }
  }, [isAuthenticated, user, router])

  const [form, setForm] = useState({
    customerName: '', phone: '', email: '',
    serviceName: '', branchName: '',
    bookingDate: '', bookingTime: '',
    offlinePayment: false
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [showInvoice, setShowInvoice] = useState(false)
  const [recentBookings, setRecentBookings] = useState<Invoice[]>([])
  const [selectedUpsells, setSelectedUpsells] = useState<{ name: string; price: number }[]>([])

  // Pre-fill form from logged-in customer profile
  useEffect(() => {
    if (isAuthenticated && user) {
      setForm(prev => ({
        ...prev,
        customerName: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
      }))
    }
  }, [isAuthenticated, user])

  const set = (field: string) => (value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleAcceptAIBooking = async (aiDetails: any) => {
    setIsLoading(true)
    setError('')
    
    // Set form state so it reflects in page UI
    const updatedForm = {
      ...form,
      serviceName: aiDetails.serviceName,
      branchName: aiDetails.branchName,
      bookingDate: aiDetails.bookingDate,
      bookingTime: aiDetails.bookingTime,
      offlinePayment: true // default to offline pay for voice convenience
    }
    setForm(updatedForm)

    // Build immediate payload
    const bookingPayload = {
      customerName: form.customerName,
      phone: form.phone,
      email: form.email,
      serviceName: aiDetails.serviceName,
      branchName: aiDetails.branchName,
      bookingDate: aiDetails.bookingDate,
      bookingTime: aiDetails.bookingTime,
      offlinePayment: true
    }

    try {
      // 1. Post to MongoDB bookings endpoint (triggers live socket update and notifications)
      const res = await fetch('http://localhost:5000/api/v1/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload)
      })

      const data = await res.json()
      if (!res.ok) {
        if (data.conflict) {
          setError(`⚠️ Double Booking Conflict: ${data.error}`)
          addNotification(`Booking conflict detected at ${aiDetails.bookingTime}!`, 'alert')
          setIsLoading(false)
          return
        } else {
          throw new Error(data.error || 'Database submission failed.')
        }
      }

      // 2. Register in local/postgres schedule calendar database
      await createAppointment({
        customer_id: user?.phone || '9876543210',
        branch_id: 'b1000000-0000-0000-0000-000000000001',
        date: aiDetails.bookingDate,
        time: aiDetails.bookingTime,
        duration: aiDetails.duration,
        base_price: aiDetails.price,
        source: 'Website',
        notes: `AI Smart Booking Portal (M): ${form.customerName}`
      })

      // 3. Set the reservation pass to display in modal
      setInvoice(data.invoice)
      setShowInvoice(true)
      addNotification(`Luxe Booking: Confirmed styling pass for ${form.customerName}! (MongoDB Sync + SMS)`, 'success')

      // 4. Trigger Frontend Twilio WhatsApp API
      try {
        await fetch('/api/send-whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: form.phone,
            serviceName: aiDetails.serviceName,
            branchName: aiDetails.branchName,
            bookingDate: aiDetails.bookingDate,
            bookingTime: aiDetails.bookingTime
          })
        })
      } catch (waErr) {
        console.warn('Frontend Twilio Dispatch bypassed:', waErr)
      }

    } catch (err: any) {
      console.warn('⚠️ Server booking fallback active:', err.message)
      
      // Graceful offline fallback: still allow booking to register in local Zustand/Sandbox!
      const mockApptId = `GLAM-LOCAL-${Date.now().toString(36).toUpperCase()}`
      
      await createAppointment({
        customer_id: user?.phone || '9876543210',
        date: aiDetails.bookingDate,
        time: aiDetails.bookingTime,
        duration: aiDetails.duration,
        base_price: aiDetails.price,
        source: 'Website',
        notes: `AI Smart Booking Fallback: ${form.customerName}`
      })

      const localInvoice: Invoice = {
        invoiceId: mockApptId,
        customerName: form.customerName,
        phone: form.phone,
        serviceName: aiDetails.serviceName,
        branchName: aiDetails.branchName,
        bookingDate: aiDetails.bookingDate,
        bookingTime: aiDetails.bookingTime,
        offlinePayment: true,
        paymentStatus: 'pending',
        bookingStatus: 'confirmed',
        createdAt: new Date().toISOString()
      }

      setInvoice(localInvoice)
      setShowInvoice(true)
      setError('⚠️ Server offline — local VVIP confirmation generated. Start the backend for full functionality.')

      // Trigger Frontend Twilio WhatsApp API
      try {
        await fetch('/api/send-whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: form.phone,
            serviceName: aiDetails.serviceName,
            branchName: aiDetails.branchName,
            bookingDate: aiDetails.bookingDate,
            bookingTime: aiDetails.bookingTime
          })
        })
      } catch (waErr) {
        console.warn('Frontend Twilio Dispatch bypassed:', waErr)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Live bookings feed sync via polling
  useEffect(() => {
    let mounted = true
    const fetchRecent = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/v1/bookings?limit=5')
        if (!res.ok) return
        const data = await res.json()
        if (mounted && data.bookings) {
          setRecentBookings(data.bookings.slice(0, 5))
        }
      } catch {
        // Backend offline — silently skip
      }
    }

    fetchRecent()
    const interval = setInterval(fetchRecent, 8000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  if (!isAuthenticated || user?.role !== 'customer') {
    return <div className="min-h-screen bg-[#0B0A09] flex items-center justify-center text-zinc-400 font-sans">Verifying credentials...</div>
  }

  const getUpsellOptions = (service: string) => {
    const s = service.toLowerCase()
    if (s.includes('haircut') || s.includes('hair cut')) {
      return [
        { name: 'Detox Hair Spa Treatment', price: 1500, desc: 'Re-hydrates hair follicles' },
        { name: 'Beard Trimming & Razored Lines', price: 600, desc: 'Sharp edges matching styling' },
        { name: 'Upgrade to Gold Plan', price: 1200, desc: 'Save 10% on future bookings' }
      ]
    }
    if (s.includes('facial') || s.includes('face')) {
      return [
        { name: 'Dead Sea Mud Peel Off', price: 900, desc: 'Deep pore purification' },
        { name: 'Collagen Mask Infusion', price: 1400, desc: 'Anti-aging glow activation' },
        { name: 'Upgrade to VIP Elite Plan', price: 2500, desc: 'Save 20% on future bookings' }
      ]
    }
    return [
      { name: 'Luxury Tea Tree Blowout Wash', price: 800, desc: 'Aromatic therapeutic cleanse' },
      { name: 'Hydrating Botanical Mask', price: 1100, desc: 'Instant facial moisture recharge' }
    ]
  }

  const toggleUpsell = (option: { name: string; price: number }) => {
    setSelectedUpsells(prev => {
      const exists = prev.find(item => item.name === option.name)
      if (exists) {
        addNotification(`Removed ${option.name} addon.`, 'info')
        return prev.filter(item => item.name !== option.name)
      } else {
        addNotification(`Added ${option.name} addon (+₹${option.price})!`, 'success')
        return [...prev, option]
      }
    })
  }

  const handleCustomerBook = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const finalServiceName = selectedUpsells.length > 0 
      ? `${form.serviceName} (+ ${selectedUpsells.map(u => u.name).join(', ')})`
      : form.serviceName

    const bookingPayload = {
      customerName: form.customerName,
      phone: form.phone,
      email: form.email,
      serviceName: finalServiceName,
      branchName: form.branchName,
      bookingDate: form.bookingDate,
      bookingTime: form.bookingTime,
      offlinePayment: form.offlinePayment
    }

    try {
      // 1. Post to MongoDB bookings endpoint (triggers live socket update and notifications)
      const res = await fetch('http://localhost:5000/api/v1/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload)
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.conflict) {
          setError(`⚠️ Double Booking Conflict: ${data.error}`)
          addNotification(`Booking conflict detected at ${form.bookingTime}!`, 'alert')
          setIsLoading(false)
          return
        } else {
          throw new Error(data.error || 'Database submission failed.')
        }
      }

      // 2. Register in local/postgres schedule calendar database
      await createAppointment({
        customer_id: user?.phone || '9876543210',
        branch_id: 'b1000000-0000-0000-0000-000000000001',
        date: form.bookingDate,
        time: form.bookingTime,
        duration: 60,
        base_price: 1500,
        source: 'Website',
        notes: `Customer Booking Portal (M): ${form.customerName}`
      })

      // 3. Set the reservation pass to display in modal
      setInvoice(data.invoice)
      setShowInvoice(true)
      addNotification(`Luxe Booking: Confirmed styling pass for ${form.customerName}! (MongoDB Sync + SMS)`, 'success')

      // 4. Trigger Frontend Twilio WhatsApp API
      try {
        await fetch('/api/send-whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: form.phone,
            serviceName: form.serviceName,
            branchName: form.branchName,
            bookingDate: form.bookingDate,
            bookingTime: form.bookingTime,
            bookingId: data.invoice.invoiceId
          })
        })
      } catch (waErr) {
        console.warn('Frontend Twilio Dispatch bypassed:', waErr)
      }

    } catch (err: any) {
      console.warn('⚠️ Server booking fallback active:', err.message)
      
      // Graceful offline fallback: still allow booking to register in local Zustand/Sandbox!
      const mockApptId = `GLAM-LOCAL-${Date.now().toString(36).toUpperCase()}`
      
      await createAppointment({
        customer_id: user?.phone || '9876543210',
        date: form.bookingDate,
        time: form.bookingTime,
        duration: 60,
        base_price: 1500,
        source: 'Website',
        notes: `Customer Booking Fallback: ${form.customerName}`
      })

      const localInvoice: Invoice = {
        invoiceId: mockApptId,
        customerName: form.customerName,
        phone: form.phone,
        serviceName: form.serviceName,
        branchName: form.branchName,
        bookingDate: form.bookingDate,
        bookingTime: form.bookingTime,
        offlinePayment: form.offlinePayment,
        paymentStatus: 'pending',
        bookingStatus: 'confirmed',
        createdAt: new Date().toISOString()
      }

      setInvoice(localInvoice)
      setShowInvoice(true)
      setError('⚠️ Server offline — local VVIP confirmation generated. Start the backend for full functionality.')

      // Trigger Frontend Twilio WhatsApp API
      try {
        await fetch('/api/send-whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: form.phone,
            serviceName: form.serviceName,
            branchName: form.branchName,
            bookingDate: form.bookingDate,
            bookingTime: form.bookingTime,
            bookingId: mockApptId
          })
        })
      } catch (waErr) {
        console.warn('Frontend Twilio Dispatch bypassed:', waErr)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = () => {
    logout()
    router.push('/login')
  }

  const today = new Date().toISOString().split('T')[0]

  // Convert store services & branches arrays to readable options for dropdowns
  const serviceOptions = services.map(s => s.name)
  const branchOptions = branches.map(b => b.name)

  return (
    <div className="min-h-screen bg-[#0B0A09] text-zinc-100 font-sans relative overflow-hidden">

      {/* Full-screen background image with dark overlay */}
      <div className="fixed inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=2000&auto=format&fit=crop"
          alt="Luxury Salon"
          className="w-full h-full object-cover opacity-20 animate-pulse-slow"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B0A09]/95 via-[#0B0A09]/85 to-[#1a120a]/90" />
      </div>

      {/* Ambient glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#C5A880]/4 blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#8B6914]/5 blur-[130px] pointer-events-none z-0" />

      {/* Luxury Header */}
      <header className="relative z-10 max-w-6xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#C5A880] flex items-center justify-center shadow-lg shadow-[#C5A880]/20">
            <Sparkles className="w-5.5 h-5.5 text-white" />
          </div>
          <div>
            <h1 className="font-heading font-black text-lg text-white tracking-tight">GlamourOS</h1>
            <p className="text-[10px] text-[#C5A880] font-bold uppercase tracking-wider">Luxe Salon & Spa</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-xs font-black tracking-wider text-zinc-400 hidden md:inline">
            👑 Hello, <span className="text-[#C5A880] font-extrabold">{user?.name}</span>
          </span>
          
          <Link href="/customer">
            <button
              className="text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl border border-[#7F77DD]/40 bg-[#7F77DD]/10 text-[#7F77DD] hover:bg-[#7F77DD]/20 transition-all flex items-center gap-1.5 shadow font-sans"
            >
              <User className="w-3.5 h-3.5" />
              Client Portal
            </button>
          </Link>

          <button 
            onClick={handleSignOut}
            className="text-xs font-black uppercase tracking-wider px-4 py-2 rounded-xl border border-[#2a2826] bg-[#151413]/60 text-rose-400 hover:text-rose-350 hover:bg-rose-950/20 transition-all flex items-center gap-1.5 shadow"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Reservation Space */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8 pb-20">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block text-[10px] font-black text-[#C5A880] uppercase tracking-[5px] mb-4">
            ✦ Luxe Appointments Hub
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-black text-white leading-tight">
            Book Your Premium<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C5A880] to-[#F0D58C]">
              Salon Experience
            </span>
          </h2>
          <p className="text-zinc-400 text-sm mt-4 max-w-md mx-auto leading-relaxed">
            Fill in your details below. You'll receive an instant invoice and WhatsApp confirmation.
          </p>
        </motion.div>

        {/* Floating AI Smart Booking Assistant Trigger */}
        <AISmartBookingAssistant onAcceptBooking={handleAcceptAIBooking} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ── Booking Form ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-7"
          >
            <form
              onSubmit={handleCustomerBook}
              className="overflow-hidden border border-[#2a2826] rounded-3xl backdrop-blur-md shadow-2xl shadow-black/85 flex flex-col"
            >
              {/* Mixed Light/Dark Header Banner */}
              <div className="bg-gradient-to-r from-[#DFD5C6] via-[#F4EFE6] to-[#E9DFCE] border-b border-[#C5A880]/30 px-7 py-5.5 flex justify-between items-center shrink-0">
                <div>
                  <h3 className="font-heading font-black text-base text-zinc-950 tracking-tight">Customer Booking</h3>
                  <p className="text-[10px] text-zinc-550 font-bold mt-0.5">VVIP profile auto-synchronized</p>
                </div>
                <Badge className="bg-[#C5A880]/20 border border-[#C5A880]/40 text-[#9E835A] text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
                  ✦ Active Member
                </Badge>
              </div>

              {/* Deep Dark Body Section */}
              <div className="bg-[#111009]/95 p-7 flex flex-col gap-5">
                {/* Personal info (Locked/Read-Only) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DarkInput icon={User} label="Full Name" value={form.customerName} placeholder="Full Name" disabled={true} />
                  <DarkInput icon={Phone} label="Phone Number" type="tel" value={form.phone} placeholder="Phone Number" disabled={true} />
                </div>

                <DarkInput icon={Mail} label="Email Address" type="email" value={form.email} placeholder="Email Address" disabled={true} />

                {/* Service & Branch */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DarkSelect icon={Scissors} label="Select Service" value={form.serviceName}
                    onChange={set('serviceName')} options={serviceOptions} placeholder="Choose a service..." />
                  <DarkSelect icon={MapPin} label="Select Branch" value={form.branchName}
                    onChange={set('branchName')} options={branchOptions} placeholder="Choose a branch..." />
                </div>

                {/* AI Upselling Recommendations Panel */}
                {form.serviceName && (
                  <div className="bg-[#0c0c0f] border border-[#7F77DD]/30 rounded-2xl p-5 flex flex-col gap-3.5 relative overflow-hidden">
                    {/* Pulsing AI badge */}
                    <div className="absolute top-0 right-0 px-3 py-1 bg-[#7F77DD]/10 border-l border-b border-[#7F77DD]/20 text-[7.5px] font-black uppercase text-[#7F77DD] tracking-widest flex items-center gap-1">
                      <Brain className="w-3 h-3 animate-pulse" /> AI Upselling Engine Active
                    </div>

                    <div>
                      <h4 className="text-[10px] font-black text-zinc-300 uppercase tracking-widest flex items-center gap-1.5">
                        🤖 Recommended Add-ons for {form.serviceName}
                      </h4>
                      <p className="text-[8.5px] text-zinc-550 font-sans mt-0.5">Complementary VVIP treatments selected to optimize post-session beauty outcomes.</p>
                    </div>

                    {/* Horizontal list of cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {getUpsellOptions(form.serviceName).map(opt => {
                        const selected = selectedUpsells.some(u => u.name === opt.name)
                        return (
                          <div 
                            key={opt.name}
                            onClick={() => toggleUpsell(opt)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between min-h-[90px] ${
                              selected 
                                ? 'bg-[#7F77DD]/10 border-[#7F77DD]/45 text-[#7F77DD]' 
                                : 'bg-[#111014] border-zinc-850 text-zinc-450 hover:border-zinc-800 hover:bg-[#111014]/80'
                            }`}
                          >
                            <div>
                              <h5 className="text-[9.5px] font-extrabold leading-tight">{opt.name}</h5>
                              <p className="text-[8px] text-zinc-550 font-sans leading-snug mt-1">{opt.desc}</p>
                            </div>
                            <div className="flex justify-between items-center mt-3 border-t border-zinc-900/60 pt-2 text-[9px] font-black font-mono">
                              <span className="text-[#C5A880]">+ ₹{opt.price}</span>
                              <span className="text-[7.5px] uppercase tracking-wider">
                                {selected ? '✓ Added' : '✦ Addon'}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Date & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Booking Date</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                        <Calendar className="w-4 h-4" />
                      </span>
                      <input
                        type="date"
                        value={form.bookingDate}
                        min={today}
                        onChange={e => set('bookingDate')(e.target.value)}
                        required
                        className="w-full bg-[#0d0c0b] border border-[#2a2826] rounded-xl pl-10 pr-4 py-3 text-xs text-zinc-200 outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]/40 transition-all font-semibold"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Preferred Time</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                        <Clock className="w-4 h-4" />
                      </span>
                      <select
                        value={form.bookingTime}
                        onChange={e => set('bookingTime')(e.target.value)}
                        required
                        className="w-full bg-[#0d0c0b] border border-[#2a2826] rounded-xl pl-10 pr-4 py-3 text-xs text-zinc-200 outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]/40 transition-all font-semibold appearance-none font-sans"
                      >
                        <option value="">Select a time slot...</option>
                        {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Payment Toggle */}
                <div className="bg-[#0d0c0b] border border-[#2a2826] rounded-xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#C5A880]/10 border border-[#C5A880]/20 flex items-center justify-center shrink-0">
                      <CreditCard className="w-4 h-4 text-[#C5A880]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-200">Offline Payment</p>
                      <p className="text-[10px] text-zinc-500">Pay at salon counter on arrival</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => set('offlinePayment')(!form.offlinePayment)}
                    className={`relative w-11 h-6 rounded-full transition-all duration-300 shrink-0 ${form.offlinePayment ? 'bg-[#C5A880]' : 'bg-[#2a2826]'}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${form.offlinePayment ? 'left-5.5' : 'left-0.5'}`} />
                  </button>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="bg-rose-950/20 border border-rose-800/40 rounded-xl p-3.5 flex gap-2.5 items-start"
                    >
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-rose-300 font-semibold">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl bg-[#C5A880] hover:bg-[#B3966E] disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#C5A880]/15"
                >
                  {isLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Confirming VVIP Reservation...</>
                  ) : (
                    <><Receipt className="w-4 h-4" /> Confirm & Get Invoice <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </form>
          </motion.div>

          {/* ── Right Column ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-5 flex flex-col gap-5"
          >
            {/* What to expect */}
            <div className="bg-[#111009]/80 border border-[#2a2826] rounded-3xl p-6 backdrop-blur-sm">
              <h4 className="text-xs font-heading font-black text-white uppercase tracking-wider mb-5 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C5A880]" />
                What Happens Next
              </h4>
              <div className="flex flex-col gap-4">
                {[
                  { icon: CheckCircle2, color: 'emerald', title: 'Instant Booking Saved', desc: 'Your details are stored in our MongoDB database immediately.' },
                  { icon: Receipt, color: 'amber', title: 'Invoice Generated', desc: 'A unique Invoice ID is created with all your booking details.' },
                  { icon: MessageSquare, color: 'blue', title: 'WhatsApp Confirmation', desc: 'We send a confirmation message to your phone number via WhatsApp.' },
                  { icon: MapPin, color: 'rose', title: 'Admin Notified Live', desc: 'Admin dashboard receives your booking in real-time via Socket.IO.' },
                ].map(({ icon: Icon, color, title, desc }) => (
                  <div key={title} className="flex gap-3 items-start">
                    <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-[#2a2826] flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-3.5 h-3.5 text-[#C5A880]" />
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-zinc-200 tracking-wide">{title}</p>
                      <p className="text-[10px] text-zinc-500 leading-relaxed mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Feed */}
            <div className="bg-[#111009]/80 border border-[#2a2826] rounded-3xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h4 className="text-xs font-heading font-black text-white uppercase tracking-wider">Live Bookings Feed</h4>
              </div>
              {recentBookings.length === 0 ? (
                <p className="text-[10px] text-zinc-600 text-center py-4">
                  Waiting for real-time bookings via Socket.IO...
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {recentBookings.map((b, i) => (
                    <motion.div
                      key={b.invoiceId}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-[#0d0c0b] border border-[#2a2826] rounded-xl p-3"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-black text-zinc-200">{b.customerName}</span>
                        <span className="text-[8px] font-mono text-[#C5A880]">{b.invoiceId.split('-').pop()}</span>
                      </div>
                      <p className="text-[9px] text-zinc-500">{b.serviceName}</p>
                      <p className="text-[9px] text-zinc-650 mt-0.5">{b.bookingDate} · {b.bookingTime}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Salon info card */}
            <div className="bg-[#111009]/80 border border-[#2a2826] rounded-2xl p-4">
              <p className="text-[10px] font-black text-[#C5A880] uppercase tracking-widest mb-1">✦ GlamourOS Luxe</p>
              <p className="text-[9px] text-zinc-500 leading-relaxed">For queries or rescheduling, WhatsApp us or call your branch directly. Your booking ID is always in your confirmation message.</p>
            </div>
          </motion.div>

        </div>
      </main>

      {/* Invoice Modal */}
      <AnimatePresence>
        {showInvoice && invoice && (
          <InvoiceModal invoice={invoice} onClose={() => setShowInvoice(false)} />
        )}
      </AnimatePresence>

    </div>
  )
}

// ── Helper Badge Component for standard tailwind fallback ───────────────────────
function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center font-bold tracking-wider px-2 py-0.5 rounded text-xs ${className}`}>
      {children}
    </span>
  )
}
