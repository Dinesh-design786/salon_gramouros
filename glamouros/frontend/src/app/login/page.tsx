"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useMainStore } from '../../store/mainStore'
import { Button } from '../../components/ui/Button'
import { Sparkles, Eye, EyeOff, Lock, Phone, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react'

export default function CustomerLoginPage() {
  const router = useRouter()
  const { login, isAuthenticated, user } = useMainStore()

  // Form States
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  // Feedback states
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // If already logged in, go straight to customer dashboard
  useEffect(() => {
    if (isAuthenticated && user?.role === 'customer') {
      router.push('/customer')
    }
  }, [isAuthenticated, user, router])

  // Pre-load remembered phone
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('remembered_customer')
      if (saved) {
        setPhone(saved)
        setRememberMe(true)
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!phone) {
      setErrorMsg('Please enter your phone number.')
      return
    }

    if (phone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit phone number.')
      return
    }

    if (!password) {
      setErrorMsg('Password is required.')
      return
    }

    setIsLoading(true)

    try {
      const result = await login(phone, password)

      // Verification
      if (result.user.role !== 'customer') {
        setErrorMsg('Unauthorized: This portal is exclusively for customers. Admins please use the Admin Portal.')
        setIsLoading(false)
        return
      }

      setSuccessMsg(`✅ Welcome, ${result.user.name}! Opening your Customer Dashboard...`)

      if (rememberMe && typeof window !== 'undefined') {
        localStorage.setItem('remembered_customer', phone)
      }

      setTimeout(() => {
        router.push('/customer')
      }, 1200)
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0B0A09] text-zinc-100 font-sans relative overflow-hidden">

      {/* Background Image overlay for premium depth */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=2000&auto=format&fit=crop"
          alt="Luxe Backdrop"
          className="w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B0A09]/98 via-[#0B0A09]/92 to-[#1a120a]/95" />
      </div>

      {/* Ambient Glows */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#C5A880]/5 blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#8B6914]/5 blur-[120px] pointer-events-none z-0" />

      {/* Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between relative z-10">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#C5A880] flex items-center justify-center shadow-md shadow-[#C5A880]/20">
            <Sparkles className="w-5.5 h-5.5 text-white" />
          </div>
          <div>
            <h1 className="font-heading font-black text-lg tracking-tight text-white">
              GlamourOS
            </h1>
            <p className="text-[10px] text-[#C5A880] font-bold uppercase tracking-wider">Luxe Salon &amp; Spa</p>
          </div>
        </Link>

        <Link href="/">
          <Button variant="outline" size="sm" className="h-9 text-xs rounded-xl font-bold border-zinc-800 text-zinc-400 hover:text-zinc-100 bg-zinc-900/60">
            ← Home
          </Button>
        </Link>
      </header>

      {/* Auth Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-md bg-[#151413] border border-[#222120] rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/80"
        >
          {/* Brand header */}
          <div className="text-center mb-8">
            <span className="text-[#C5A880] text-[10px] font-black uppercase tracking-widest block mb-2">✦ GlamourOS Luxe Salon</span>
            <h2 className="text-3xl font-heading font-black text-white tracking-tight">Customer Login</h2>
            <p className="text-xs text-zinc-440 mt-2">
              Sign in with your phone number and password to manage appointments, loyalty points, digital wallet, and membership tiers.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Phone Number Input */}
            <div>
              <label className="text-[10px] text-zinc-400 block font-bold mb-2 uppercase tracking-wider">
                Phone Number
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  id="login-phone"
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/\D/g, ''))
                    setErrorMsg('')
                  }}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-[#0B0A09] border border-[#222120] rounded-2xl pl-10 pr-4 py-3 text-xs text-zinc-100 outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] transition-all font-semibold font-mono tracking-widest"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] text-zinc-400 block font-bold uppercase tracking-wider">
                  Password
                </label>
                <a href="#forgot" className="text-[9px] text-[#C5A880] font-bold hover:underline">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setErrorMsg('')
                  }}
                  placeholder="••••••••"
                  className="w-full bg-[#0B0A09] border border-[#222120] rounded-2xl pl-10 pr-12 py-3 text-xs text-zinc-100 outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] transition-all font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center mt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#0B0A09] text-[#C5A880] border-[#222120] focus:ring-[#C5A880]"
                />
                <span className="text-[10px] text-zinc-400 font-bold">Remember my login</span>
              </label>
            </div>

            {/* Alerts */}
            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-rose-950/20 border border-rose-900/40 rounded-2xl p-3 flex gap-2.5 items-start text-[11px] text-rose-300"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                  <span className="font-semibold">{errorMsg}</span>
                </motion.div>
              )}

              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-emerald-950/20 border border-emerald-900/40 rounded-2xl p-3 flex gap-2.5 items-start text-[11px] text-emerald-300"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
                  <span className="font-semibold">{successMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full justify-center gap-2 rounded-2xl py-3.5 mt-2 font-extrabold text-xs uppercase tracking-wider bg-[#C5A880] text-white hover:bg-[#B3966E] shadow-lg shadow-[#C5A880]/15"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin rounded-full"></span>
                  Logging in...
                </span>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 border-t border-[#222120] pt-5 text-center">
            <span className="text-[10px] text-zinc-400 block font-bold mb-2 uppercase tracking-wider">Quick Demo Login</span>
            <div className="flex justify-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setPhone('9876543210')
                  setPassword('password123')
                  setErrorMsg('')
                }}
                className="bg-[#0B0A09] border border-[#222120] text-[10px] font-bold text-zinc-300 px-3 py-1 rounded-xl hover:border-[#C5A880] transition-colors"
              >
                Virat (Platinum)
              </button>
              <button
                type="button"
                onClick={() => {
                  setPhone('9123456789')
                  setPassword('password123')
                  setErrorMsg('')
                }}
                className="bg-[#0B0A09] border border-[#222120] text-[10px] font-bold text-zinc-300 px-3 py-1 rounded-xl hover:border-[#C5A880] transition-colors"
              >
                Deepika (Gold)
              </button>
            </div>
          </div>

          {/* Register Redirect */}
          <div className="mt-5 text-center">
            <p className="text-[11px] text-zinc-400 font-medium">
              New client?{' '}
              <Link href="/book" className="text-[#C5A880] font-bold hover:underline">
                Book without login →
              </Link>
            </p>
            <p className="text-[10px] text-zinc-600 mt-1.5">
              No account yet?{' '}
              <Link href="/register" className="text-[#A68A64] font-bold hover:underline">
                Create Account
              </Link>
            </p>
          </div>

        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#222120] py-6 text-center text-[10px] text-zinc-500 bg-[#0B0A09] relative z-10">
        <p>© 2026 GlamourOS Retail. Secure Session Manager active.</p>
      </footer>
    </div>
  )
}
