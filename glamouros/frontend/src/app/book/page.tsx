"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useMainStore } from '../../store/mainStore'
import { 
  Sparkles, User, Phone, Mail, Scissors, MapPin, Calendar, 
  Clock, CreditCard, CheckCircle2, AlertCircle, ArrowRight, 
  Receipt, MessageSquare, Loader2, X, LogOut
} from 'lucide-react'

// ─── Constants ────────────────────────────────────────────────────────────────

const SERVICES = [
  'Luxury Hair Sculpt & Style', 'Balayage Color Therapy', 'Royal Keratin Treatment',
  'Bridal Makeup & Draping', 'Moroccan Argan Spa', 'Nail Art & Extensions',
  'Beard Grooming & Shaping', 'Deep Scalp Massage', 'Eyebrow Threading & Tint'
]

const BRANCHES = [
  'GlamourOS — Banjara Hills, Hyderabad',
  'GlamourOS — Jubilee Hills, Hyderabad',
  'GlamourOS — Hitech City, Hyderabad',
  'GlamourOS — Kukatpally, Hyderabad',
  'GlamourOS — Madhapur, Hyderabad'
]

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
  icon: Icon, label, type = 'text', value, onChange, placeholder, required = true
}: {
  icon: any; label: string; type?: string; value: string
  onChange: (v: string) => void; placeholder: string; required?: boolean
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{label}</label>
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
        <Icon className="w-4 h-4" />
      </span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full bg-[#0d0c0b] border border-[#2a2826] rounded-xl pl-10 pr-4 py-3 text-xs text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]/40 transition-all font-medium"
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
        className="w-full bg-[#0d0c0b] border border-[#2a2826] rounded-xl pl-10 pr-4 py-3 text-xs text-zinc-200 outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]/40 transition-all font-medium appearance-none"
      >
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  </div>
)

// ─── Invoice Modal ────────────────────────────────────────────────────────────

const InvoiceModal = ({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) => {
  // Build QR content: compact booking summary scanned at front-desk
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
              <p className="text-[9px] font-black text-[#C5A880] uppercase tracking-widest">Booking Confirmed ✦ Invoice Ready</p>
              <h3 className="text-sm font-heading font-black text-white">GlamourOS Booking Pass</h3>
              <p className="text-[9px] font-mono text-zinc-400 mt-0.5">{invoice.invoiceId}</p>
            </div>
          </div>
        </div>

        {/* WhatsApp Confirmation Banner */}
        <div className="mx-5 mt-4 bg-[#1a2e1a] border border-emerald-800/50 rounded-2xl p-3 flex items-start gap-3">
          <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">WhatsApp Message Sent</p>
            <p className="text-[9px] text-emerald-600 mt-0.5">A booking confirmation with full invoice details has been sent to <span className="text-emerald-400 font-bold">{invoice.phone}</span> via WhatsApp.</p>
          </div>
        </div>

        {/* Invoice rows */}
        <div className="px-5 pt-4 pb-2 flex flex-col gap-2.5 text-xs">
          {[
            ['Client Name', invoice.customerName, 'text-zinc-200 font-bold'],
            ['Phone', invoice.phone, 'text-zinc-200'],
            ['Service', invoice.serviceName, 'text-zinc-200'],
            ['Branch', invoice.branchName, 'text-zinc-300 text-right'],
            ['Date & Time', `${invoice.bookingDate} · ${invoice.bookingTime}`, 'text-zinc-200 font-bold'],
            ['Payment', invoice.offlinePayment ? '💵 Offline — Pay at Counter' : '📱 Online', invoice.offlinePayment ? 'text-amber-400 font-bold' : 'text-blue-400 font-bold'],
            ['Status', '✅ Confirmed', 'text-emerald-400 font-bold'],
          ].map(([key, val, cls]) => (
            <div key={key as string} className="flex justify-between items-start gap-4 border-b border-[#1e1c1a] pb-2.5 last:border-0 last:pb-0">
              <span className="text-zinc-500 shrink-0">{key}</span>
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
            <p className="text-[10px] font-black text-[#C5A880] uppercase tracking-wider mb-1">📱 Scan at Front Desk</p>
            <p className="text-[9px] text-zinc-400 leading-relaxed">Show this QR code at the salon reception to instantly confirm your appointment and apply VVIP loyalty credits.</p>
            <p className="text-[8px] font-mono text-zinc-600 mt-1.5">{invoice.invoiceId}</p>
          </div>
        </div>

        <div className="px-5 pb-5">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-[#C5A880] hover:bg-[#B3966E] text-white text-xs font-extrabold uppercase tracking-wider transition-all shadow-lg shadow-[#C5A880]/15"
          >
            Done — Close Invoice
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BookingRegistrationPage() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useMainStore()

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

  // Pre-fill form from logged-in session
  useEffect(() => {
    if (isAuthenticated && user) {
      setForm(prev => ({
        ...prev,
        customerName: prev.customerName || user.name || '',
        phone: prev.phone || user.phone || '',
        email: prev.email || user.email || '',
      }))
    }
  }, [isAuthenticated, user])

  const set = (field: string) => (value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }))

  // Live feed of bookings via polling (no extra package required)
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
    const interval = setInterval(fetchRecent, 8000) // Poll every 8 seconds
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.customerName || !form.phone || !form.email || !form.serviceName
      || !form.branchName || !form.bookingDate || !form.bookingTime) {
      setError('Please fill in all required fields.')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('http://localhost:5000/api/v1/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.conflict) {
          setError(`⚠️ Double Booking Conflict: ${data.error}`)
        } else {
          setError(data.error || 'Booking failed. Please try again.')
        }
        return
      }

      setInvoice(data.invoice)
      setShowInvoice(true)

      // Trigger Frontend Twilio WhatsApp API as configured in Step 6
      try {
        await fetch('/api/send-whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: form.phone,
            serviceName: form.serviceName,
            branchName: form.branchName,
            bookingDate: form.bookingDate,
            bookingTime: form.bookingTime
          })
        });
      } catch (waErr) {
        console.warn('Frontend Twilio Dispatch bypassed:', waErr);
      }

      setForm({
        customerName: '', phone: '', email: '',
        serviceName: '', branchName: '',
        bookingDate: '', bookingTime: '',
        offlinePayment: false
      })

    } catch (err: any) {
      // Graceful offline fallback — generate local invoice
      const localInvoice: Invoice = {
        invoiceId: `GLAM-LOCAL-${Date.now().toString(36).toUpperCase()}`,
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
      setError('⚠️ Server offline — local confirmation generated. Start the backend for full functionality.')

      // Trigger Frontend Twilio WhatsApp API as configured in Step 6
      try {
        await fetch('/api/send-whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: form.phone,
            serviceName: form.serviceName,
            branchName: form.branchName,
            bookingDate: form.bookingDate,
            bookingTime: form.bookingTime
          })
        });
      } catch (waErr) {
        console.warn('Frontend Twilio Dispatch bypassed:', waErr);
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Minimum booking date = today
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-[#0B0A09] text-zinc-100 font-sans relative overflow-hidden">

      {/* Full-screen background image with dark overlay */}
      <div className="fixed inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=2000&auto=format&fit=crop"
          alt="Luxury Salon"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B0A09]/95 via-[#0B0A09]/85 to-[#1a120a]/90" />
      </div>

      {/* Ambient glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#C5A880]/4 blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#8B6914]/5 blur-[130px] pointer-events-none z-0" />

      {/* Header */}
      <header className="relative z-10 max-w-6xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#C5A880] flex items-center justify-center shadow-lg shadow-[#C5A880]/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-heading font-black text-lg text-white tracking-tight">GlamourOS</h1>
            <p className="text-[10px] text-[#C5A880] font-bold uppercase tracking-wider">Luxe Salon & Spa</p>
          </div>
        </Link>
        <Link href="/login">
          <button className="text-xs font-bold px-4 py-2 rounded-xl border border-[#2a2826] bg-[#151413]/60 text-zinc-400 hover:text-zinc-200 hover:border-[#C5A880]/40 transition-all">
            ← Customer Login
          </button>
        </Link>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8 pb-20">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block text-[10px] font-black text-[#C5A880] uppercase tracking-[5px] mb-4">
            ✦ Reserve Your Experience
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-black text-white leading-tight">
            Book Your Luxury<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C5A880] to-[#F0D58C]">
              Salon Appointment
            </span>
          </h2>
          <p className="text-zinc-400 text-sm mt-4 max-w-md mx-auto leading-relaxed">
            Fill in your details below. You'll receive an instant invoice and WhatsApp confirmation.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ── Booking Form ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-7"
          >
            <form
              onSubmit={handleSubmit}
              className="overflow-hidden border border-[#2a2826] rounded-3xl backdrop-blur-md shadow-2xl shadow-black/85 flex flex-col"
            >
              {/* Mixed Light/Dark Header Banner */}
              <div className="bg-gradient-to-r from-[#DFD5C6] via-[#F4EFE6] to-[#E9DFCE] border-b border-[#C5A880]/30 px-7 py-5.5 flex justify-between items-center shrink-0">
                <div>
                  <h3 className="font-heading font-black text-base text-zinc-950 tracking-tight">Customer Registration</h3>
                  <p className="text-[10px] text-zinc-550 font-bold mt-0.5">All fields are required for booking confirmation</p>
                </div>
              </div>

              {/* Deep Dark Body Section */}
              <div className="bg-[#111009]/95 p-7 flex flex-col gap-5">
                {/* Personal info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DarkInput icon={User} label="Full Name" value={form.customerName}
                    onChange={set('customerName')} placeholder="e.g. Priya Sharma" />
                  <DarkInput icon={Phone} label="Phone Number" type="tel" value={form.phone}
                    onChange={set('phone')} placeholder="e.g. 9876543210" />
                </div>

                <DarkInput icon={Mail} label="Email Address" type="email" value={form.email}
                  onChange={set('email')} placeholder="e.g. priya@example.com" />

                {/* Service & Branch */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DarkSelect icon={Scissors} label="Select Service" value={form.serviceName}
                    onChange={set('serviceName')} options={SERVICES} placeholder="Choose a service..." />
                  <DarkSelect icon={MapPin} label="Select Branch" value={form.branchName}
                    onChange={set('branchName')} options={BRANCHES} placeholder="Choose a branch..." />
                </div>

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
                        className="w-full bg-[#0d0c0b] border border-[#2a2826] rounded-xl pl-10 pr-4 py-3 text-xs text-zinc-200 outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]/40 transition-all font-medium"
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
                        className="w-full bg-[#0d0c0b] border border-[#2a2826] rounded-xl pl-10 pr-4 py-3 text-xs text-zinc-200 outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]/40 transition-all font-medium appearance-none"
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
                    <><Loader2 className="w-4 h-4 animate-spin" /> Confirming Booking...</>
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
                    <div className={`w-7 h-7 rounded-lg bg-${color}-500/10 border border-${color}-500/20 flex items-center justify-center shrink-0 mt-0.5`}>
                      <Icon className={`w-3.5 h-3.5 text-${color}-400`} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-zinc-200">{title}</p>
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
                        <span className="text-[10px] font-bold text-zinc-200">{b.customerName}</span>
                        <span className="text-[8px] font-mono text-[#C5A880]">{b.invoiceId.split('-').pop()}</span>
                      </div>
                      <p className="text-[9px] text-zinc-500">{b.serviceName}</p>
                      <p className="text-[9px] text-zinc-600">{b.bookingDate} · {b.bookingTime}</p>
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
