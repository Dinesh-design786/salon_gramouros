"use client"

import React, { useState, useEffect } from 'react'
import { useMainStore } from '../../store/mainStore'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { BookingCalendar } from '../../components/booking/BookingCalendar'
import { WhatsAppMock } from '../../components/dashboard/WhatsAppMock'
import { BillingPOS } from '../../components/billing/BillingPOS'
import { InventoryTab } from '../../components/inventory/InventoryTab'
import { StaffCommission } from '../../components/dashboard/StaffCommission'
import { AnalyticsTab } from '../../components/analytics/AnalyticsTab'
import { QRManagerTab } from '../../components/dashboard/QRManagerTab'
import {
  Sparkles, Calendar, MessageSquare, Receipt, Package, Users,
  TrendingUp, MapPin, Bell, RefreshCw, Layers, Zap, UserCheck, ChevronRight, QrCode
} from 'lucide-react'

export default function DashboardPage() {
  const {
    branches,
    activeBranchId,
    setActiveBranch,
    notifications,
    clearNotifications,
    activeTab,
    setActiveTab,
    demoStep,
    nextDemoStep,
    resetDemo,
    appointments,
    stylists,
    services,
    createAppointment,
    user,
    isAuthenticated,
    logout,
    requestOtp,
    verifyOtp,
    smsLogs,
    initData
  } = useMainStore()

  // Quick Booking Form States
  const [bookingName, setBookingName] = useState('Ananya Reddy')
  const [bookingPhone, setBookingPhone] = useState('+91 98480 22338')
  const [bookingTier, setBookingTier] = useState<'Standard' | 'Silver' | 'Gold' | 'Platinum'>('Platinum')
  const [bookingServiceId, setBookingServiceId] = useState('ser1')
  const [bookingStylistId, setBookingStylistId] = useState('s1')
  const [bookingDate, setBookingDate] = useState('2026-05-25')
  const [bookingTime, setBookingTime] = useState('15:30')

  const [mounted, setMounted] = useState(false)

  // Admin Authentication States
  const [adminEmail, setAdminEmail] = useState('admin@glamouros.com')
  const [adminPassword, setAdminPassword] = useState('1234')
  const [adminError, setAdminError] = useState('')
  const [activeAdminProfile, setActiveAdminProfile] = useState<any>(null)

  // Staff Login Modes & OTP states
  const [adminLoginMode, setAdminLoginMode] = useState<'password' | 'otp'>('password')
  const [adminPhone, setAdminPhone] = useState('+91 98480 22338')
  const [adminOtpSent, setAdminOtpSent] = useState(false)
  const [adminGeneratedOtp, setAdminGeneratedOtp] = useState('')
  const [adminOtpInput, setAdminOtpInput] = useState('')
  const [isAdminOtpSending, setIsAdminOtpSending] = useState(false)
  const [adminOtpCountdown, setAdminOtpCountdown] = useState(59)

  // Admin Google SSO Modal
  const [showAdminGooglePicker, setShowAdminGooglePicker] = useState(false)
  const [isAdminGoogleLoading, setIsAdminGoogleLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
    initData()
  }, [])

  useEffect(() => {
    let timer: any
    if (adminOtpSent && adminOtpCountdown > 0) {
      timer = setInterval(() => {
        setAdminOtpCountdown(prev => prev - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [adminOtpSent, adminOtpCountdown])

  if (!mounted) return <div className="min-h-screen bg-background flex items-center justify-center text-zinc-500">Loading GlamourOS Dashboard...</div>

  const handleAdminSendOtp = async () => {
    if (!adminPhone || adminPhone.length < 10) {
      setAdminError('Please enter a valid staff phone number.')
      return
    }
    setIsAdminOtpSending(true)
    setAdminError('')
    try {
      const res = await requestOtp(adminPhone)
      setAdminGeneratedOtp(res.otp)
      setAdminOtpSent(true)
      setAdminOtpCountdown(59)
    } catch (err: any) {
      setAdminError(err.message || 'OTP dispatch failed.')
    } finally {
      setIsAdminOtpSending(false)
    }
  }

  const handleAdminVerifyOtp = async () => {
    if (!adminOtpInput) {
      setAdminError('Please enter the 6-digit passcode.')
      return
    }
    setIsAdminOtpSending(true)
    setAdminError('')
    try {
      await verifyOtp(adminPhone, adminOtpInput, 'Branch Manager')
    } catch (err: any) {
      setAdminError(err.message || 'Invalid verification passcode.')
    } finally {
      setIsAdminOtpSending(false)
    }
  }

  if (mounted && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#080811] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

        <Card className="max-w-md w-full bg-slate-950/60 border border-slate-800/80 p-8 backdrop-blur-2xl rounded-2xl relative shadow-2xl shadow-slate-950/50">
          <div className="flex flex-col items-center text-center gap-2 mb-4">
            <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center shadow-lg shadow-primary/10 mb-2">
              <Zap className="w-6 h-6 text-primary animate-pulse" />
            </div>
            <h2 className="text-xl font-heading font-black text-slate-100 tracking-tight flex items-center gap-1.5">
              GlamourOS Administrative Portal
            </h2>
            <p className="text-xs text-zinc-450 font-medium">SaaS Operations & Staff Dashboard Authentication</p>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-[10px] text-zinc-400 block font-bold mb-1.5 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => {
                  setAdminEmail(e.target.value)
                  setAdminError('')
                }}
                className="w-full bg-zinc-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 outline-none focus:border-primary/50 transition-all font-semibold"
                placeholder="manager@glamouros.com"
              />
            </div>

            <div>
              <label className="text-[10px] text-zinc-400 block font-bold mb-1.5 uppercase tracking-wider">Security PIN / Password</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => {
                  setAdminPassword(e.target.value)
                  setAdminError('')
                }}
                className="w-full bg-zinc-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 outline-none focus:border-primary/50 transition-all"
                placeholder="••••"
              />
            </div>

            {adminError && (
              <p className="text-[11px] text-rose-450 font-semibold text-center mt-1">{adminError}</p>
            )}

            <Button
              onClick={async () => {
                if (adminEmail === 'admin@glamouros.com' && adminPassword === '1234') {
                  try {
                    await verifyOtp('+91 98888 77777', '123456', 'Branch Manager')
                  } catch (err: any) {
                    setAdminError(err.message || 'Verification failed')
                  }
                } else {
                  setAdminError('Invalid credentials. Hint: use admin@glamouros.com / 1234')
                }
              }}
              variant="glow"
              size="md"
              className="w-full justify-center text-xs py-3 rounded-xl font-bold mt-2"
            >
              ⚡ Authenticate Session
            </Button>

            {/* Google Authentication Section */}
            <div className="relative my-2 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-900/60"></div>
              </div>
              <span className="relative bg-[#0b0c16] px-3 text-[9px] font-bold text-zinc-550 uppercase tracking-widest">Or Single Sign-On</span>
            </div>

            <Button
              onClick={() => setShowAdminGooglePicker(true)}
              variant="secondary"
              size="sm"
              className="w-full justify-center gap-2 rounded-xl py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-900/80 transition-all font-bold text-xs"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Continue with Google Workspace
            </Button>

            <div className="border-t border-slate-900/60 my-2 pt-3">
              <span className="text-[9px] text-zinc-550 font-bold block mb-2 text-center uppercase tracking-wider">⚡ Quick-Login Roster Shortcuts</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={async () => {
                    setAdminEmail('admin@glamouros.com')
                    setAdminPassword('1234')
                    try {
                      await verifyOtp('+91 98888 77777', '123456', 'Branch Manager')
                    } catch (err) { }
                  }}
                  className="bg-slate-900/50 hover:bg-slate-900 border border-slate-800/60 rounded-xl p-2.5 text-left transition-all group hover:border-primary/30"
                >
                  <span className="text-[10px] text-zinc-300 font-bold block group-hover:text-primary transition-all">Store Manager</span>
                  <span className="text-[9px] text-zinc-500 font-semibold block">Full admin session</span>
                </button>

                <button
                  onClick={async () => {
                    setAdminEmail('rohan@glamouros.com')
                    setAdminPassword('1234')
                    try {
                      await verifyOtp('+91 99890 44556', '123456', 'Master Stylist')
                    } catch (err) { }
                  }}
                  className="bg-slate-900/50 hover:bg-slate-900 border border-slate-800/60 rounded-xl p-2.5 text-left transition-all group hover:border-primary/30"
                >
                  <span className="text-[10px] text-zinc-300 font-bold block group-hover:text-primary transition-all">Rohan Sharma</span>
                  <span className="text-[9px] text-zinc-500 font-semibold block">Stylist terminal</span>
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Google SSO Staff Account Picker Modal */}
        {showAdminGooglePicker && (
          <div className="fixed inset-0 z-50 bg-[#04040a]/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="max-w-sm w-full bg-[#0a0a14] border border-slate-800 rounded-2xl p-6 shadow-2xl relative animate-scaleUp">

              {/* Header */}
              <div className="flex flex-col items-center text-center mb-5">
                <div className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center shadow-md mb-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
                <h3 className="font-heading font-black text-slate-100 text-sm">Choose Google Workspace Account</h3>
                <p className="text-[10px] text-zinc-500">to continue to <span className="text-primary font-bold">GlamourOS Staff Terminal</span></p>
              </div>

              {isAdminGoogleLoading ? (
                <div className="py-8 flex flex-col items-center gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  <span className="text-[10px] text-zinc-400 font-semibold tracking-wider uppercase">Authenticating Staff SSO...</span>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {/* Store Manager */}
                  <button
                    onClick={() => {
                      setIsAdminGoogleLoading(true)
                      setTimeout(async () => {
                        try {
                          await verifyOtp('+91 98888 77777', '123456', 'Branch Manager')
                        } catch (err) { }
                        setShowAdminGooglePicker(false)
                        setIsAdminGoogleLoading(false)
                      }, 1200)
                    }}
                    className="w-full flex items-center gap-3 p-3 bg-slate-900/50 hover:bg-slate-900 border border-slate-800/80 rounded-xl transition-all text-left group"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20">SM</div>
                    <div className="flex-1">
                      <span className="text-xs font-bold text-zinc-250 block group-hover:text-primary transition-colors">Store Manager</span>
                      <span className="text-[9px] text-zinc-550 block font-mono">manager@glamouros.com</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-650 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  {/* Rohan */}
                  <button
                    onClick={() => {
                      setIsAdminGoogleLoading(true)
                      setTimeout(async () => {
                        try {
                          await verifyOtp('+91 99890 44556', '123456', 'Master Stylist')
                        } catch (err) { }
                        setShowAdminGooglePicker(false)
                        setIsAdminGoogleLoading(false)
                      }, 1200)
                    }}
                    className="w-full flex items-center gap-3 p-3 bg-slate-900/50 hover:bg-slate-900 border border-slate-800/80 rounded-xl transition-all text-left group"
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-950 flex items-center justify-center text-[10px] font-bold text-indigo-350 border border-indigo-500/20">RS</div>
                    <div className="flex-1">
                      <span className="text-xs font-bold text-zinc-250 block group-hover:text-primary transition-colors">Rohan Sharma</span>
                      <span className="text-[9px] text-zinc-550 block font-mono">rohan@glamouros.com</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-650 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <button
                    onClick={() => setShowAdminGooglePicker(false)}
                    className="text-[10px] font-bold text-rose-400 hover:text-rose-350 text-center mt-3 block py-1 uppercase tracking-wider"
                  >
                    Close Selector
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  const activeBranch = branches.find(b => b.id === activeBranchId) || branches[0]
  const branchAppointments = appointments.filter(a => a.branch_id === activeBranchId)
  const branchStylists = stylists.filter(s => s.branch_id === activeBranchId)

  const completedTodayCount = branchAppointments.filter(a => a.status === 'Completed').length
  const scheduledCount = branchAppointments.length

  // Tab controllers
  const tabs = [
    { id: 'calendar', label: 'Operations Calendar', icon: Calendar },
    { id: 'qr', label: 'QR Operations Desk', icon: QrCode },
    { id: 'chat', label: 'Salon Assistant', icon: MessageSquare },
    { id: 'pos', label: 'POS Billing Terminal', icon: Receipt },
    { id: 'inventory', label: 'AI Supply & Forecasting', icon: Package },
    { id: 'staff', label: 'Stylist Commissions', icon: Users },
    { id: 'analytics', label: 'Executive Analytics', icon: TrendingUp },
  ] as const

  // Hackathon Runway script details mapping
  const demoStepsInfo = [
    { title: 'Overview', desc: 'Welcome! This is the GlamourOS Sandbox. Use these steps to guide the judges through a live lifecycle.' },
    { title: '1. Roster Congestion', desc: 'Branches operate at high loads. Notice the Low Stock Warnings in the Notifications sidebar!' },
    { title: '2. Unified Roster', desc: 'Review the busy timeline in Banjara Hills under Sandeep, Rohan, and Kavya Reddy.' },
    { title: '3. WhatsApp Inquiry', desc: 'Navigate to "Salon Assistant" tab and click the prompt "Jubilee Hills haircut at 3:30 PM".' },
    { title: '4. AI Smart Schedule', desc: 'The AI Parser detects Rohan is double-booked at 3:30, auto-shifting the slot to 3:45 PM.' },
    { title: '5. Calendar Update', desc: 'Switch to the "Operations Calendar" tab. A glowing purple reservation has instantly populated under Rohan!' },
    { title: '6. POS UPI Settle', desc: 'Switch to "POS Terminal" tab. Settle invoice INV-550912 with active GST CGST/SGST splits and scan UPI QR.' },
    { title: '7. Recharts Insights', desc: 'Review the "Executive Analytics" tab. Walk judges through revenue trends, peak times, and restock forecasts.' }
  ]

  const handleDemoNext = () => {
    nextDemoStep()
    const nextS = (demoStep + 1) % 8

    // Automatically transition active tabs to direct the presentation flow
    if (nextS === 2) setActiveTab('calendar')
    else if (nextS === 3) setActiveTab('chat')
    else if (nextS === 5) setActiveTab('calendar')
    else if (nextS === 6) setActiveTab('pos')
    else if (nextS === 7) setActiveTab('analytics')
  }

  return (
    <div className="min-h-screen pb-12 bg-background">

      {/* SaaS Header */}
      <header className="border-b border-border bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Zap className="w-5 h-5 text-zinc-950" />
            </div>
            <div>
              <h1 className="font-heading font-black text-base tracking-tight text-zinc-100 flex items-center gap-1.5">
                GlamourOS
                <Badge variant="primary" className="text-[9px] font-bold px-1.5 py-0">SaaS Sandbox</Badge>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800/60 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-350">
                <UserCheck className="w-3.5 h-3.5 text-primary" />
                <span>{user.name}</span>
                <span className="text-[9px] text-zinc-550 uppercase">({user.role})</span>
              </div>
            )}

            <Button
              onClick={() => {
                logout()
                window.location.href = '/'
              }}
              variant="secondary"
              size="sm"
              className="text-[10px] h-8 rounded-lg bg-rose-950/20 border-rose-500/35 text-rose-300 hover:bg-rose-950/40 hover:text-rose-250"
            >
              🔒 Lock Terminal
            </Button>

            {/* Branch Switching Header dropdown */}
            <div className="flex items-center gap-2 bg-slate-900 border border-border px-3 py-1.5 rounded-lg">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <select
                value={activeBranchId}
                onChange={(e) => setActiveBranch(e.target.value)}
                className="bg-transparent text-zinc-200 text-xs font-semibold focus:outline-none cursor-pointer"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id} className="bg-slate-950 text-zinc-300">
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-6 flex flex-col gap-6">



        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Sidebar Nav */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <Card className="p-3">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold px-3 py-2 block">Management Modules</span>
              <nav className="flex flex-col gap-1 mt-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all text-left border ${isActive
                          ? 'bg-zinc-800 text-primary border-primary/20 shadow-sm shadow-primary/5'
                          : 'text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-zinc-900/30'
                        }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-zinc-500'}`} />
                      {tab.label}
                    </button>
                  )
                })}
              </nav>
            </Card>

            {/* Quick Metrics */}
            <Card className="p-4 text-xs flex flex-col gap-3">
              <h4 className="font-bold text-zinc-500 text-[10px] uppercase tracking-wider">Branch Activity Summary</h4>
              <div className="flex flex-col gap-2.5">
                <div className="flex justify-between border-b border-border pb-1.5">
                  <span className="text-zinc-500">Stylists Clocked:</span>
                  <span className="text-zinc-300 font-semibold">{branchStylists.length} active</span>
                </div>
                <div className="flex justify-between border-b border-border pb-1.5">
                  <span className="text-zinc-500">Schedules Booked:</span>
                  <span className="text-zinc-300 font-semibold">{scheduledCount} bookings</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Invoices Settled:</span>
                  <span className="text-success font-bold">{completedTodayCount} done</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Main workspace view */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="min-h-[460px]">
              {activeTab === 'calendar' && <BookingCalendar />}
              {activeTab === 'qr' && <QRManagerTab />}
              {activeTab === 'chat' && <WhatsAppMock />}
              {activeTab === 'pos' && <BillingPOS />}
              {activeTab === 'inventory' && <InventoryTab />}
              {activeTab === 'staff' && <StaffCommission />}
              {activeTab === 'analytics' && <AnalyticsTab />}
            </div>
          </div>

          {/* Right Live notifications logger */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between border-b border-border pb-3.5 mb-4">
                <h4 className="text-xs font-bold text-zinc-250 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" />
                  Live Event Notifications
                </h4>
                <button
                  onClick={clearNotifications}
                  className="text-[9px] font-bold text-zinc-500 hover:text-zinc-300 transition-colors uppercase tracking-wider"
                >
                  Clear
                </button>
              </div>

              <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-lg border text-[11px] leading-relaxed flex gap-2 ${n.type === 'alert'
                        ? 'bg-alert/5 border-alert/20 text-alert'
                        : n.type === 'warning'
                          ? 'bg-warning/5 border-warning/20 text-warning'
                          : n.type === 'success'
                            ? 'bg-success/5 border-success/20 text-success'
                            : 'bg-zinc-900 border-border text-zinc-300'
                      }`}
                  >
                    <div className="flex-1">
                      <p>{n.text}</p>
                      <span className="text-[8px] text-zinc-500 mt-1 block font-medium">{n.time}</span>
                    </div>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <p className="text-center text-zinc-500 text-xs py-10 italic">
                    Sandbox event log is currently empty.
                  </p>
                )}
              </div>
            </Card>

            {/* Quick action controller - manual booking form */}
            <Card className="p-4.5 text-xs">
              <h4 className="font-bold text-zinc-300 mb-2 text-[10px] uppercase tracking-wider font-heading flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Real-Time Quick Booking
              </h4>
              <p className="text-[10px] text-zinc-500 leading-relaxed mb-4">
                Input custom customer name, tier/role, and phone to book standard or VVIP slots instantly into the calendar.
              </p>

              <div className="flex flex-col gap-3">
                {/* Customer Details Group */}
                <div>
                  <label className="text-[9px] text-zinc-400 block font-bold mb-1 uppercase">Customer Name</label>
                  <input
                    type="text"
                    value={bookingName}
                    onChange={(e) => setBookingName(e.target.value)}
                    placeholder="e.g. Ananya Reddy"
                    className="w-full bg-zinc-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] text-zinc-200 outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] text-zinc-400 block font-bold mb-1 uppercase">Phone Number</label>
                    <input
                      type="text"
                      value={bookingPhone}
                      onChange={(e) => setBookingPhone(e.target.value)}
                      placeholder="e.g. +91 98480 22338"
                      className="w-full bg-zinc-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] text-zinc-200 outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-zinc-400 block font-bold mb-1 uppercase">Loyalty Tier / Role</label>
                    <select
                      value={bookingTier}
                      onChange={(e: any) => setBookingTier(e.target.value)}
                      className="w-full bg-zinc-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] text-zinc-200 outline-none focus:border-indigo-500"
                    >
                      <option value="Standard">Standard</option>
                      <option value="Silver">Silver</option>
                      <option value="Gold">Gold</option>
                      <option value="Platinum">Platinum VVIP</option>
                    </select>
                  </div>
                </div>

                {/* Service Dropdown */}
                <div>
                  <label className="text-[9px] text-zinc-400 block font-bold mb-1 uppercase">Service Category</label>
                  <select
                    value={bookingServiceId}
                    onChange={(e) => setBookingServiceId(e.target.value)}
                    className="w-full bg-zinc-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] text-zinc-200 outline-none focus:border-indigo-500"
                  >
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name} (₹{s.price})</option>
                    ))}
                  </select>
                </div>

                {/* Stylist Match Dropdown */}
                <div>
                  <label className="text-[9px] text-zinc-400 block font-bold mb-1 uppercase">Select Stylist (AI Match)</label>
                  <select
                    value={bookingStylistId}
                    onChange={(e) => setBookingStylistId(e.target.value)}
                    className="w-full bg-zinc-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] text-zinc-200 outline-none focus:border-indigo-500"
                  >
                    {stylists.filter(s => s.branch_id === activeBranchId).map(st => (
                      <option key={st.id} value={st.id}>{st.name} ({st.specialty} - {st.rating}★)</option>
                    ))}
                  </select>
                </div>

                {/* Date and Time selectors */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] text-zinc-400 block font-bold mb-1 uppercase">Date</label>
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full bg-zinc-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] text-zinc-200 outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-zinc-400 block font-bold mb-1 uppercase">Time Slot</label>
                    <input
                      type="text"
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      placeholder="e.g. 15:30"
                      className="w-full bg-zinc-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] text-zinc-200 outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <Button
                  onClick={() => {
                    const selectedService = services.find(s => s.id === bookingServiceId) || services[0]
                    createAppointment({
                      customer_id: bookingPhone,
                      branch_id: activeBranchId,
                      stylist_id: bookingStylistId,
                      date: bookingDate,
                      time: bookingTime,
                      duration: selectedService.duration,
                      base_price: selectedService.price,
                      source: 'Website',
                      notes: `VVIP Customer: ${bookingName} (${bookingTier})`
                    })
                    setActiveTab('calendar')
                  }}
                  variant="glow"
                  size="sm"
                  className="w-full justify-center text-[10px] py-2 mt-2 rounded-lg font-bold"
                >
                  ⚡ Instant Book & AI Resolve
                </Button>
              </div>
            </Card>
          </div>

        </div>

      </main>
    </div>
  )
}
