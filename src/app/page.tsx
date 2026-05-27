"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useMainStore } from '../store/mainStore'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import {
  Sparkles, Calendar, MessageSquare, Receipt, Package, Users,
  TrendingUp, MapPin, Zap, ChevronRight, CheckCircle, ArrowRight,
  Gift, Heart, QrCode
} from 'lucide-react'

// VVIP Customer seeds for demonstration
const mockCustomers = [
  { name: 'Virat Kohli', phone: '+91 98888 77777', tier: 'Platinum' },
  { name: 'Deepika Padukone', phone: '+91 98765 43210', tier: 'Gold' },
  { name: 'Amitabh Bachchan', phone: '+91 95555 11111', tier: 'Platinum' },
  { name: 'Samantha Ruth', phone: '+91 99999 88888', tier: 'Gold' }
]

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)
  const [viewMode, setViewMode] = useState<'marketing' | 'customer_site'>('marketing')

  // Customer Booking States
  const [phoneSync, setPhoneSync] = useState('')
  const [customerPin, setCustomerPin] = useState('1234')
  const [scratched, setScratched] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [syncedCustomer, setSyncedCustomer] = useState<any>(null)
  const [syncSuccess, setSyncSuccess] = useState('')
  const [bookingBranchId, setBookingBranchId] = useState('b1000000-0000-0000-0000-000000000001')
  const [bookingServiceId, setBookingServiceId] = useState('ser1')
  const [bookingStylistId, setBookingStylistId] = useState('st100000-0000-0000-0000-000000000001')
  const [bookingDate, setBookingDate] = useState('2026-05-25')
  const [bookingTime, setBookingTime] = useState('15:30')
  const [reservationPass, setReservationPass] = useState<any>(null)

  // Phone + Password login states
  const [loginPassword, setLoginPassword] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const {
    branches,
    services,
    stylists,
    createAppointment,
    addNotification
  } = useMainStore()

  useEffect(() => {
    setMounted(true)
  }, [])



  if (!mounted) {
    return <div className="min-h-screen bg-[#080811] flex items-center justify-center text-slate-500">Loading Portal...</div>
  }

  const handlePasswordLogin = () => {
    const cleanPhone = phoneSync.replace(/\D/g, '')
    if (!cleanPhone || cleanPhone.length < 10) {
      setSyncSuccess('Please enter a valid 10-digit phone number.')
      return
    }
    if (!loginPassword || loginPassword.length < 6) {
      setSyncSuccess('Password must be at least 6 characters.')
      return
    }
    setIsLoggingIn(true)
    setSyncSuccess('')

    setTimeout(() => {
      const found = mockCustomers.find(c => c.phone.replace(/\D/g, '').includes(cleanPhone) || cleanPhone.includes(c.phone.replace(/\D/g, ''))) || {
        name: 'Guest Client',
        phone: phoneSync,
        tier: 'Standard'
      }
      setSyncedCustomer(found)
      setSyncSuccess(`Welcome back, ${found.name}!`)
      addNotification(`Customer Portal: Authenticated profile for ${found.name}`, 'success')
      setScratched(false)
      setCouponCode('')
      setIsLoggingIn(false)
    }, 900)
  }

  const activeBranch = branches.find(b => b.id === bookingBranchId) || branches[0]
  const activeService = services.find(s => s.id === bookingServiceId) || services[0]
  const activeStylist = stylists.find(s => s.id === bookingStylistId) || stylists[0]

  // Dynamic pricing calculations
  const originalPrice = activeService.price
  let tierDiscountPercent = 0
  if (syncedCustomer) {
    if (syncedCustomer.tier === 'Silver') tierDiscountPercent = 10
    else if (syncedCustomer.tier === 'Gold') tierDiscountPercent = 15
    else if (syncedCustomer.tier === 'Platinum') tierDiscountPercent = 20
  }

  // Happy hour discount if branch load is low
  const isBanjaraLowLoad = bookingBranchId === 'b1000000-0000-0000-0000-000000000001'
  const dynamicDiscountPercent = isBanjaraLowLoad ? 15 : 0

  const discountTotal = Math.round(originalPrice * ((tierDiscountPercent + dynamicDiscountPercent) / 100))
  const tax = Math.round((originalPrice - discountTotal) * 0.18)
  const totalDue = originalPrice - discountTotal + tax

  const handleCustomerBook = async () => {
    const appt = await createAppointment({
      customer_id: syncedCustomer ? syncedCustomer.phone : phoneSync || '+91 99999 00000',
      branch_id: bookingBranchId,
      stylist_id: bookingStylistId,
      date: bookingDate,
      time: bookingTime,
      duration: activeService.duration,
      base_price: activeService.price,
      source: 'Website',
      notes: `VVIP Customer Portal: ${syncedCustomer ? syncedCustomer.name : 'Guest User'} (${syncedCustomer ? syncedCustomer.tier : 'Standard'})`
    })

    setReservationPass({
      apptId: appt?.id || 'ap_' + Math.random().toString(36).substring(2, 9),
      customerName: syncedCustomer ? syncedCustomer.name : 'Guest User',
      branchName: activeBranch.name,
      serviceName: activeService.name,
      stylistName: activeStylist.name,
      dateTime: `${bookingDate} @ ${bookingTime}`,
      totalPaid: totalDue
    })
  }


  return (
    <div className="min-h-screen relative flex flex-col justify-between overflow-hidden bg-background">

      {/* Background glow meshes */}
      <div className="absolute top-[-10%] left-[-15%] w-[800px] h-[800px] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-15%] w-[800px] h-[800px] rounded-full bg-pink-900/10 blur-[120px] pointer-events-none" />

      {/* SaaS Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Zap className="w-6 h-6 text-zinc-950" />
          </div>
          <div>
            <h1 className="font-heading font-black text-lg tracking-tight text-zinc-100">
              GlamourOS
            </h1>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">AI Powered SaaS Operating System</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/book">
            <Button variant="outline" size="sm" className="h-9 text-xs rounded-xl font-bold border-zinc-700 text-[#C5A880] hover:text-white hover:bg-[#C5A880]/10 bg-zinc-950/60">
              📅 Book Now
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="sm" className="h-9 text-xs rounded-xl font-bold border-zinc-800 text-zinc-400 hover:text-zinc-200 bg-zinc-950/60">
              Customer Portal
            </Button>
          </Link>

          <Link href="/admin/login">
            <Button variant="glow" size="sm" className="h-9 text-xs rounded-xl font-extrabold bg-primary text-zinc-950 hover:bg-primary/95 shadow-md shadow-primary/10">
              Admin Console
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-6 py-10">

        {viewMode === 'marketing' ? (
          <div className="text-center max-w-5xl mx-auto flex flex-col justify-center items-center">

            {/* Hero Headlines */}
            <h2 className="font-heading font-black text-4xl sm:text-6xl tracking-tight text-zinc-100 max-w-4xl leading-[1.08] mb-6">
              The Omnichannel <span className="text-primary">AI Operating System</span> for Indian Salon Chains.
            </h2>

            <p className="text-sm sm:text-base text-zinc-400 max-w-2xl leading-relaxed mb-10">
              GlamourOS empowers multi-branch chains with automated workload-balancing scheduling, instant POS GST billing checkout, predictive stock forecasting, and live WhatsApp chat simulators.
            </p>

            {/* Central CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 items-center mb-16">
              <Link href="/login">
                <Button
                  variant="glow"
                  size="lg"
                  className="w-64 font-black shadow-xl shadow-primary/10 gap-2 text-sm uppercase tracking-wider py-3.5 shrink-0 bg-primary text-zinc-950 hover:bg-primary/90"
                >
                  Customer Login
                  <ArrowRight className="w-4.5 h-4.5 text-zinc-950" />
                </Button>
              </Link>

              <Link href="/admin/login">
                <Button variant="outline" size="lg" className="w-64 font-bold rounded-xl gap-2 text-sm uppercase tracking-wider py-3.5 bg-zinc-950/40 border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900/50">
                  Admin Login
                </Button>
              </Link>
            </div>            {/* Salon Gallery Grid */}
            <div className="w-full mt-8 border-t border-border pt-16">
              <div className="text-left mb-10">
                <h3 className="font-heading font-black text-2xl text-zinc-100 uppercase tracking-[2px] text-primary">Signature Experiences</h3>
                <p className="text-xs text-zinc-450 mt-1 leading-relaxed">
                  Step inside our state-of-the-art sanctuaries featuring premium VVIP services and award-winning master stylists.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="relative group overflow-hidden rounded-2xl border border-border/40 aspect-[4/3]">
                  <img
                    src="https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=600&auto=format&fit=crop"
                    alt="Master Hair Styling"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-5 text-left">
                    <span className="text-[10px] uppercase tracking-widest text-primary font-black">Couture Styling</span>
                    <h4 className="text-xs font-bold text-zinc-200 mt-1">Master Hair Designing</h4>
                  </div>
                </div>

                <div className="relative group overflow-hidden rounded-2xl border border-border/40 aspect-[4/3]">
                  <img
                    src="https://images.unsplash.com/photo-1600948836101-f9ffda59d250?q=80&w=600&auto=format&fit=crop"
                    alt="Luxury Salon Interior"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-5 text-left">
                    <span className="text-[10px] uppercase tracking-widest text-primary font-black">Elite Sanctuaries</span>
                    <h4 className="text-xs font-bold text-zinc-200 mt-1">Bespoke Suite Comfort</h4>
                  </div>
                </div>

                <div className="relative group overflow-hidden rounded-2xl border border-border/40 aspect-[4/3]">
                  <img
                    src="https://images.unsplash.com/photo-1607779097040-26e80aa78e66?q=80&w=600&auto=format&fit=crop"
                    alt="Wellness Treatment"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-5 text-left">
                    <span className="text-[10px] uppercase tracking-widest text-primary font-black">Skin Care & Spa</span>
                    <h4 className="text-xs font-bold text-zinc-200 mt-1">Nourishing Therapy Treatment</h4>
                  </div>
                </div>
              </div>
            </div>
>
          </div>
        ) : (
          /* CUSTOMER WEBSITE VIEW */
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <Badge variant="primary" className="px-3.5 py-1 text-[10px] font-bold rounded-full mb-3 uppercase tracking-widest bg-primary/10 border-primary/20 text-primary">
                💎 GLAMOUROS VVIP BOOKING HUB
              </Badge>
              <h2 className="font-heading font-black text-3xl sm:text-4xl text-zinc-100">Reserve Your Styling Experience</h2>
              <p className="text-xs text-zinc-450 max-w-lg mx-auto mt-2">
                Select your treatment, branch, and preferred stylist. Sync your VVIP loyalty number to instantly apply gold & platinum rewards.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

              {/* Left Column Form */}
              <div className="lg:col-span-7 flex flex-col gap-5">

                {/* 1. VVIP Loyalty Login & Dashboard Portal */}
                <Card className="p-5 bg-slate-950/60 border-slate-900/80 backdrop-blur-md">
                  {!syncedCustomer ? (
                    <div>
                      <h3 className="font-bold text-zinc-200 text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1.5 font-heading">
                        <Gift className="w-4 h-4 text-primary animate-bounce" />
                        Step 1: Customer Login
                      </h3>
                      <p className="text-[11px] text-zinc-500 mb-4">
                        Enter your phone number and password to sign in and unlock loyalty rewards.
                      </p>

                      {/* Phone + Password form */}
                      <div className="flex flex-col gap-3">
                        <div>
                          <label className="text-[9px] text-zinc-400 block font-bold mb-1.5 uppercase tracking-wider">Phone Number</label>
                          <input
                            type="tel"
                            maxLength={10}
                            value={phoneSync}
                            onChange={(e) => {
                              setPhoneSync(e.target.value.replace(/\D/g, ''))
                              setSyncSuccess('')
                            }}
                            placeholder="e.g. 9876543210"
                            className="w-full bg-zinc-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none focus:border-primary font-semibold font-mono tracking-widest"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] text-zinc-400 block font-bold mb-1.5 uppercase tracking-wider">Password</label>
                          <input
                            type="password"
                            value={loginPassword}
                            onChange={(e) => {
                              setLoginPassword(e.target.value)
                              setSyncSuccess('')
                            }}
                            placeholder="Min 6 characters"
                            className="w-full bg-zinc-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none focus:border-primary font-semibold"
                          />
                        </div>

                        <Button
                          onClick={handlePasswordLogin}
                          variant="glow"
                          size="sm"
                          disabled={isLoggingIn}
                          className="w-full justify-center rounded-xl py-2.5 font-extrabold text-xs uppercase tracking-wider bg-primary text-zinc-950 hover:bg-primary/95"
                        >
                          {isLoggingIn ? (
                            <span className="flex items-center gap-2">
                              <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent animate-spin rounded-full"></span>
                              Signing in...
                            </span>
                          ) : (
                            '⚡ Sign In'
                          )}
                        </Button>
                      </div>

                      {syncSuccess && (
                        <div className={`mt-3 text-[10px] p-2.5 rounded-lg font-bold text-center ${syncSuccess.includes('Welcome')
                          ? 'text-emerald-400 bg-emerald-500/5 border border-emerald-500/10'
                          : 'text-rose-400 bg-rose-500/5 border border-rose-500/10'
                          }`}>
                          {syncSuccess}
                        </div>
                      )}

                      <div className="mt-4 flex gap-2 flex-wrap items-center border-t border-slate-900/60 pt-3">
                        <span className="text-[9px] text-zinc-550 font-bold uppercase tracking-wider">⚡ Quick Demo:</span>
                        <button
                          onClick={() => {
                            setPhoneSync('9888877777')
                            setLoginPassword('password123')
                            setSyncSuccess('')
                          }}
                          className="text-[9px] font-extrabold text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/20 hover:bg-primary/10 transition-colors"
                        >
                          Virat (Platinum)
                        </button>
                        <button
                          onClick={() => {
                            setPhoneSync('9876543210')
                            setLoginPassword('password123')
                            setSyncSuccess('')
                          }}
                          className="text-[9px] font-extrabold text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/20 hover:bg-primary/10 transition-colors"
                        >
                          Deepika (Gold)
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">

                      {/* VVIP Authenticated Header */}
                      <div className="flex items-center justify-between border-b border-slate-900/60 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">VVIP Client Session Active</span>
                        </div>
                        <button
                          onClick={() => {
                            setSyncedCustomer(null)
                            setPhoneSync('')
                            setCustomerPin('1234')
                            setSyncSuccess('')
                            setScratched(false)
                            setCouponCode('')
                            addNotification('Customer profile logged out', 'info')
                          }}
                          className="text-[9px] font-bold text-rose-400 hover:text-rose-300 uppercase tracking-wider"
                        >
                          🔒 Sign Out
                        </button>
                      </div>

                      {/* Glowing Digital Member Card */}
                      <div className={`p-4 rounded-xl border relative overflow-hidden flex flex-col justify-between h-[130px] shadow-lg ${syncedCustomer.tier === 'Platinum'
                        ? 'bg-gradient-to-br from-indigo-950 via-slate-900 to-primary/20 border-primary/30 shadow-primary/5'
                        : 'bg-gradient-to-br from-amber-950 via-slate-900 to-yellow-500/20 border-yellow-500/30 shadow-yellow-500/5'
                        }`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">GlamourOS Elite Pass</span>
                            <h4 className="text-sm font-heading font-black text-zinc-100 tracking-tight mt-0.5">{syncedCustomer.name}</h4>
                          </div>
                          <Badge variant={syncedCustomer.tier === 'Platinum' ? 'primary' : 'gold'} className="scale-90 font-bold tracking-widest text-[9px]">
                            {syncedCustomer.tier.toUpperCase()} MEMBER
                          </Badge>
                        </div>

                        <div className="flex justify-between items-end">
                          <div>
                            <span className="text-[8px] text-zinc-500 block uppercase font-semibold">Synced Phone</span>
                            <span className="text-[10px] text-zinc-300 font-mono font-bold">{syncedCustomer.phone}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[8px] text-zinc-500 block uppercase font-semibold">Active Loyalty Points</span>
                            <span className={`text-xs font-black font-heading ${syncedCustomer.tier === 'Platinum' ? 'text-primary' : 'text-yellow-400'
                              }`}>
                              {syncedCustomer.tier === 'Platinum' ? '1,450 XP' : '850 XP'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Interactive Scratch-off Coupon Code */}
                      <div className="bg-slate-900/30 border border-slate-800/80 rounded-xl p-3 text-center">
                        <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest block mb-1.5">🎁 Daily VVIP Scratchcard Reward</span>

                        {!scratched ? (
                          <button
                            onClick={() => {
                              setScratched(true)
                              const code = syncedCustomer.tier === 'Platinum' ? 'GLAMPLAT20' : 'GLAMGOLD15'
                              setCouponCode(code)
                              addNotification(`Scratchcard code unlocked: ${code}`, 'success')
                            }}
                            className="w-full bg-slate-900/80 hover:bg-slate-900 border border-dashed border-primary/30 rounded-lg p-2.5 text-xs text-primary font-extrabold uppercase tracking-wider transition-all hover:scale-[1.02]"
                          >
                            🖱️ Click to Scratch Coupon
                          </button>
                        ) : (
                          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-2 animate-fadeIn">
                            <span className="text-[8px] text-emerald-400 font-bold uppercase block tracking-wider">Coupon Code Unlocked!</span>
                            <span className="text-sm font-mono font-black text-zinc-100 block tracking-widest mt-0.5">{couponCode}</span>
                            <span className="text-[8px] text-zinc-500 block mt-0.5">Use at front-desk terminal to claim complimentary hair spray!</span>
                          </div>
                        )}
                      </div>

                    </div>
                  )}
                </Card>

                {/* 2. Choose Branch, Service & Stylist */}
                <Card className="p-5 bg-slate-950/60 border-slate-900 flex flex-col gap-4">
                  <h3 className="font-bold text-zinc-200 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5 font-heading">
                    <Heart className="w-4 h-4 text-primary" />
                    Step 2: Customize Booking Details
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] text-zinc-400 block font-bold mb-1 uppercase">Select Branch</label>
                      <select
                        value={bookingBranchId}
                        onChange={(e) => setBookingBranchId(e.target.value)}
                        className="w-full bg-zinc-900 border border-slate-800 rounded-lg px-2.5 py-2 text-[11px] text-zinc-200 outline-none focus:border-primary"
                      >
                        {branches.map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[9px] text-zinc-400 block font-bold mb-1 uppercase">Service Treatment</label>
                      <select
                        value={bookingServiceId}
                        onChange={(e) => setBookingServiceId(e.target.value)}
                        className="w-full bg-zinc-900 border border-slate-800 rounded-lg px-2.5 py-2 text-[11px] text-zinc-200 outline-none focus:border-primary"
                      >
                        {services.map(s => (
                          <option key={s.id} value={s.id}>{s.name} (₹{s.price})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] text-zinc-400 block font-bold mb-1 uppercase">Preferred Stylist</label>
                      <select
                        value={bookingStylistId}
                        onChange={(e) => setBookingStylistId(e.target.value)}
                        className="w-full bg-zinc-900 border border-slate-800 rounded-lg px-2.5 py-2 text-[11px] text-zinc-200 outline-none focus:border-primary"
                      >
                        {stylists.filter(s => s.branch_id === bookingBranchId).map(st => (
                          <option key={st.id} value={st.id}>{st.name} ({st.specialty})</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] text-zinc-400 block font-bold mb-1 uppercase">Date</label>
                        <input
                          type="date"
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          className="w-full bg-zinc-900 border border-slate-800 rounded-lg px-2 py-1.5 text-[10px] text-zinc-200 outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-zinc-400 block font-bold mb-1 uppercase">Time Slot</label>
                        <input
                          type="text"
                          value={bookingTime}
                          onChange={(e) => setBookingTime(e.target.value)}
                          className="w-full bg-zinc-900 border border-slate-800 rounded-lg px-2 py-2 text-[10px] text-zinc-200 outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>

                  <Button onClick={handleCustomerBook} variant="glow" className="w-full justify-center text-xs py-2.5 mt-2 rounded-xl font-bold bg-primary text-zinc-950 hover:bg-primary/95">
                    ⚡ Confirm VVIP Reservation
                  </Button>
                </Card>
              </div>

              {/* Right Column Quote Summary */}
              <div className="lg:col-span-5 flex flex-col gap-4">

                {/* 3. Invoice Settle Quote */}
                <Card className="p-5 bg-slate-950/60 border-slate-900 flex flex-col justify-between min-h-[300px] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-indigo-500/5 blur-xl pointer-events-none" />

                  <div>
                    <h3 className="font-bold text-zinc-400 text-[10px] uppercase tracking-wider mb-4 border-b border-slate-900 pb-2 font-heading">
                      Dynamic Invoice Quote
                    </h3>

                    <div className="flex flex-col gap-3 text-xs">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Treatment Cost:</span>
                        <span className="text-zinc-350 font-medium">₹{originalPrice}</span>
                      </div>

                      {tierDiscountPercent > 0 && (
                        <div className="flex justify-between text-yellow-400 font-medium">
                          <span>Loyalty Tier ({syncedCustomer.tier} - {tierDiscountPercent}%):</span>
                          <span>-₹{Math.round(originalPrice * (tierDiscountPercent / 100))}</span>
                        </div>
                      )}

                      {dynamicDiscountPercent > 0 && (
                        <div className="flex justify-between text-indigo-400 font-medium">
                          <span>Branch Low-Occupancy Happy Hour (-15%):</span>
                          <span>-₹{Math.round(originalPrice * (dynamicDiscountPercent / 100))}</span>
                        </div>
                      )}

                      <div className="flex justify-between border-t border-slate-900 pt-3">
                        <span className="text-zinc-500">Subtotal:</span>
                        <span className="text-zinc-200 font-bold">₹{originalPrice - discountTotal}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-zinc-500">GST splitting (SAC 999721 @ 18%):</span>
                        <span className="text-zinc-350">₹{tax}</span>
                      </div>

                      <div className="flex justify-between border-t border-slate-800 pt-3 text-sm">
                        <span className="text-zinc-350 font-bold">Total Payable Amount:</span>
                        <span className="text-primary font-extrabold text-base">₹{totalDue}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-3 mt-4 text-[10px] leading-relaxed text-zinc-350">
                    <span className="text-[8px] text-primary font-extrabold uppercase block mb-1">💡 Sandbox Integration Check</span>
                    Once settled on the customer portal, open the **Sandbox Panel** (top right) and you will see the scheduling roster populate under **{activeStylist.name}** at **{activeBranch.name}** in real-time!
                  </div>
                </Card>

                {/* 4. Active Pass Output */}
                {reservationPass && (
                  <Card className="p-5 bg-gradient-to-br from-indigo-950/40 via-slate-950 to-slate-950 border border-emerald-500/20 rounded-2xl relative overflow-hidden shadow-2xl">
                    <div className="absolute top-[-10px] right-[-10px] w-14 h-14 bg-emerald-500/10 rounded-full blur-lg" />

                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <CheckCircle className="w-4.5 h-4.5 text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="font-heading font-black text-xs text-zinc-100 font-heading">Booking Confirmed!</h4>
                        <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-extrabold">{reservationPass.apptId}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 text-[11px] text-zinc-300">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Customer:</span>
                        <span className="font-semibold text-zinc-200">{reservationPass.customerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Service:</span>
                        <span className="text-zinc-250">{reservationPass.serviceName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Stylist:</span>
                        <span className="text-zinc-250">{reservationPass.stylistName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Schedule:</span>
                        <span className="font-semibold text-primary">{reservationPass.dateTime}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between gap-3 bg-zinc-900/50 p-2.5 rounded-xl border border-slate-850">
                      <div className="shrink-0 bg-white p-1 rounded-lg">
                        <QrCode className="w-10 h-10 text-slate-950" />
                      </div>
                      <p className="text-[9px] text-zinc-500 leading-normal">
                        Show this dynamic QR check-in pass at the front-desk POS billing terminal to claim VVIP membership credits!
                      </p>
                    </div>
                  </Card>
                )}

              </div>

            </div>

          </div>
        )}

      </main>

      {/* Footer copyright */}
      <footer className="border-t border-border/40 py-6 text-center text-[10px] text-zinc-650 relative z-10 bg-slate-950/40">
        <p>© 2026 GlamourOS. Sandbox simulated under RetailTech Hackathon schemas. All rights reserved.</p>
      </footer>



    </div>
  )
}
