"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useMainStore } from '../../../store/mainStore'
import { Button } from '../../../components/ui/Button'
import { 
  ShieldCheck, Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle, 
  CheckCircle2, Cpu, BarChart3, TrendingUp, Users, Wallet, Zap 
} from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const { adminLogin, isAuthenticated, user, addNotification } = useMainStore()

  // Form states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Feedback states
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Check session on mount
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      router.push('/dashboard')
    }
  }, [isAuthenticated, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!email || !password) {
      setErrorMsg('Please enter both administrative Email and Password.')
      return
    }

    setIsLoading(true)

    try {
      const result = await adminLogin(email, password)

      if (result.user.role !== 'admin') {
        setErrorMsg('Access Denied: This credentials set belongs to a non-administrative account.')
        setIsLoading(false)
        return
      }

      setSuccessMsg('Administrative key verified. Booting ERP operations console...')
      
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch (err: any) {
      setErrorMsg(err.message || 'Access Denied: Invalid administrator credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#030308] text-zinc-100 flex flex-col justify-between overflow-hidden relative font-mono">
      
      {/* Premium background meshes */}
      <div className="absolute top-[-30%] left-[-20%] w-[900px] h-[900px] rounded-full bg-indigo-950/15 blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-30%] right-[-20%] w-[900px] h-[900px] rounded-full bg-emerald-950/10 blur-[160px] pointer-events-none" />
      <div className="absolute top-[40%] right-[30%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between relative z-10 border-b border-zinc-900/50">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/5">
            <Cpu className="w-5.5 h-5.5 text-emerald-400 animate-pulse" />
          </div>
          <div>
            <h1 className="font-heading font-black text-sm sm:text-base tracking-widest text-zinc-200 uppercase flex items-center gap-2">
              GlamourOS
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">ENTERPRISE</span>
            </h1>
            <p className="text-[8px] text-zinc-550 font-bold uppercase tracking-wider">Automated ERP Chains Manager</p>
          </div>
        </Link>
        
        <Link href="/">
          <Button variant="outline" size="sm" className="h-8 text-[10px] rounded-lg font-bold border-zinc-800 text-zinc-400 hover:text-zinc-200 bg-zinc-950/80">
            ← Core Site
          </Button>
        </Link>
      </header>

      {/* Main Grid: Left Side Forms, Right Side Analytics Preview */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Grid: Admin Sign-in Card */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full bg-[#070710]/70 border border-zinc-850 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
          >
            {/* Elegant top glowing status bar */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />
            
            <div className="flex flex-col gap-2 mb-6">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span className="text-[9px] uppercase tracking-widest font-black">Secure Authentication Layer</span>
              </div>
              <h2 className="text-2xl font-black font-heading tracking-tight text-zinc-100">Enterprise Admin Console</h2>
              <p className="text-[10px] text-zinc-450 font-sans">
                Access the multi-branch dynamic pricing matrix, staff commissions payroll generator, and real-time POS analytics ledger.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Administrative Email */}
              <div>
                <label className="text-[9px] text-zinc-400 block font-bold mb-1.5 uppercase tracking-widest">
                  Administrator Email
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setErrorMsg('')
                    }}
                    placeholder="admin@glamouros.com"
                    className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-200 outline-none focus:border-emerald-500 transition-all font-bold"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-[9px] text-zinc-450 block font-bold mb-1.5 uppercase tracking-widest">
                  Secure Token Key (Password)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-550">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setErrorMsg('')
                    }}
                    placeholder="••••••••"
                    className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl pl-10 pr-12 py-2.5 text-xs text-zinc-200 outline-none focus:border-emerald-500 transition-all font-bold tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-350"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Warnings and alerts */}
              <AnimatePresence>
                {errorMsg && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-rose-950/20 border border-rose-900/30 rounded-xl p-3 flex gap-2.5 items-start text-[10px] text-rose-400 font-sans"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{errorMsg}</span>
                  </motion.div>
                )}

                {successMsg && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-3 flex gap-2.5 items-start text-[10px] text-emerald-400 font-sans"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                    <span>{successMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full justify-center gap-2 rounded-xl py-3 mt-2 font-black text-xs uppercase tracking-widest bg-emerald-500 text-zinc-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/10 border-none"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent animate-spin rounded-full"></span>
                    VERIFYING KEY...
                  </span>
                ) : (
                  <>
                    LAUNCH DASHBOARD
                    <ArrowRight className="w-4 h-4 text-zinc-950" />
                  </>
                )}
              </Button>
            </form>

            {/* Quick Demo shortcuts */}
            <div className="mt-6 border-t border-zinc-900 pt-5 text-center">
              <span className="text-[8px] text-zinc-500 block font-bold mb-2 uppercase tracking-widest">Master Bypass Credentials</span>
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@glamouros.com')
                  setPassword('admin123')
                  setErrorMsg('')
                }}
                className="bg-zinc-950/50 hover:bg-zinc-900 border border-zinc-800 text-[9px] font-extrabold text-emerald-400 px-3 py-1.5 rounded-lg hover:border-emerald-500/30 transition-colors"
              >
                Load Developer Admin (admin@glamouros.com / admin123)
              </button>
            </div>

            {/* Customer portal fallback redirect */}
            <div className="mt-4 text-center">
              <Link href="/login" className="text-[10px] text-zinc-550 font-bold hover:text-zinc-300">
                ← Switch to GlamourOS Customer Login
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Right Grid: Gorgeous Live Analytics Board Preview */}
        <div className="lg:col-span-7 flex flex-col gap-4 self-stretch justify-center">
          
          <div className="text-left mb-2">
            <span className="text-zinc-500 text-[8px] tracking-widest uppercase block mb-1">Live Metrics Engine</span>
            <h3 className="text-lg font-black text-zinc-350 tracking-wider">GLAMOUROS ERP OPERATIONAL HUB</h3>
            <p className="text-[10px] text-zinc-550 font-sans leading-relaxed">
              Real-time monitoring of three operational chain locations in Hyderabad. Connect the database to view active staff workload maps instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Location Banjara Hills occupancy */}
            <div className="bg-[#070710]/55 border border-zinc-900 p-4.5 rounded-2xl flex flex-col justify-between h-[110px] backdrop-blur-md relative overflow-hidden">
              <div className="flex justify-between items-start">
                <span className="text-[8px] text-zinc-500 font-bold uppercase">Banjara Hills</span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              </div>
              <div>
                <span className="text-[18px] font-black text-primary">25.00%</span>
                <span className="text-[8px] text-zinc-450 block uppercase font-bold tracking-wider mt-1">Live Capacity Fill-rate</span>
              </div>
            </div>

            {/* Location Madhapur occupancy */}
            <div className="bg-[#070710]/55 border border-zinc-900 p-4.5 rounded-2xl flex flex-col justify-between h-[110px] backdrop-blur-md relative overflow-hidden">
              <div className="flex justify-between items-start">
                <span className="text-[8px] text-zinc-500 font-bold uppercase">Madhapur (Hitech)</span>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              </div>
              <div>
                <span className="text-[18px] font-black text-rose-500">90.00%</span>
                <span className="text-[8px] text-zinc-450 block uppercase font-bold tracking-wider mt-1">Safety Occupancy Peak Alert</span>
              </div>
            </div>

            {/* POS Total Ledger */}
            <div className="bg-[#070710]/55 border border-zinc-900 p-4.5 rounded-2xl flex flex-col justify-between h-[110px] backdrop-blur-md relative overflow-hidden">
              <div className="flex justify-between items-start">
                <span className="text-[8px] text-zinc-500 font-bold uppercase">GST Ledger Splitting</span>
                <Wallet className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <span className="text-[18px] font-black text-emerald-400">₹45,950</span>
                <span className="text-[8px] text-zinc-450 block uppercase font-bold tracking-wider mt-1">Total Chain Settled Today</span>
              </div>
            </div>

            {/* Staff commissions payout */}
            <div className="bg-[#070710]/55 border border-zinc-900 p-4.5 rounded-2xl flex flex-col justify-between h-[110px] backdrop-blur-md relative overflow-hidden">
              <div className="flex justify-between items-start">
                <span className="text-[8px] text-zinc-500 font-bold uppercase">Staff Commissions Ledger</span>
                <Users className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <span className="text-[18px] font-black text-indigo-400">35.00%</span>
                <span className="text-[8px] text-zinc-450 block uppercase font-bold tracking-wider mt-1">Master Stylist Payout Index</span>
              </div>
            </div>
          </div>

          {/* System tracing telemetry console */}
          <div className="bg-[#020205] border border-zinc-900/60 p-4 rounded-xl font-mono text-[9px] text-zinc-500 leading-normal flex flex-col gap-1 shadow-inner shadow-black/80">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-2 mb-2">
              <span className="font-bold text-zinc-400">📡 SYSTEM TRACE TELEMETRY PANEL</span>
              <span className="text-[8px] text-emerald-400">STANDBY</span>
            </div>
            <p className="truncate">PACKET_CAPTURE: PORT_5000_LISTENER_ESTABLISHED</p>
            <p className="truncate text-zinc-400">MONGO_ATLAS_URI: resolving to host standard cluster...</p>
            <p className="truncate text-emerald-500">FALLBACK_SANDBOX: ACTIVE (High fidelity operations simulated)</p>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900/50 py-6 text-center text-[9px] text-zinc-650 bg-zinc-950/20 relative z-10 mt-6">
        <p>© 2026 GlamourOS Enterprise. All rights reserved. Registered under ISO/IEC 27001 Cryptographic Protocols.</p>
      </footer>
    </div>
  )
}
