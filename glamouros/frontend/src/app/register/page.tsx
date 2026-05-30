"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useMainStore } from '../../store/mainStore'
import { Button } from '../../components/ui/Button'
import { Sparkles, Eye, EyeOff, Lock, Phone, User, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react'

export default function CustomerRegisterPage() {
  const router = useRouter()
  const { registerUser, isAuthenticated, user } = useMainStore()

  // Form States
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Feedback states
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Check session on mount
  useEffect(() => {
    if (isAuthenticated && user?.role === 'customer') {
      router.push('/booking')
    }
  }, [isAuthenticated, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!name || !phone || !password || !confirmPassword) {
      setErrorMsg('Please fill in all fields.')
      return
    }

    if (phone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit phone number.')
      return
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.')
      return
    }

    setIsLoading(true)

    try {
      const result = await registerUser({
        name,
        email: `${phone}@glamouros.in`,   // synthetic email so store stays compatible
        phone,
        password,
        confirmPassword
      })

      setSuccessMsg(`Welcome, ${result.user.name}! Creating your Luxury Elite profile...`)

      setTimeout(() => {
        router.push('/booking')
      }, 1500)
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Phone number may already be registered.')
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

        <Link href="/login">
          <Button variant="outline" size="sm" className="h-9 text-xs rounded-xl font-bold border-[#2a2826] text-[#C5A880] hover:text-white bg-[#151413]/60 hover:bg-[#1e1c1a]">
            ← Sign In
          </Button>
        </Link>
      </header>

      {/* Register Form Panel */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-md overflow-hidden border border-[#2a2826] rounded-3xl backdrop-blur-md shadow-2xl shadow-black/90 flex flex-col"
        >
          {/* Card Header: Light Theme Banner */}
          <div className="bg-gradient-to-r from-[#DFD5C6] via-[#F4EFE6] to-[#E9DFCE] border-b border-[#C5A880]/30 px-8 py-6 text-center">
            <span className="text-[#9E835A] text-[9px] font-black uppercase tracking-[3px] block mb-1">Create Luxe Profile</span>
            <h2 className="text-2xl font-heading font-black text-zinc-950 tracking-tight">Customer Registration</h2>
            <p className="text-[10px] text-zinc-550 mt-1 font-bold">
              Join GlamourOS Elite to unlock real-time checkout passes
            </p>
          </div>

          {/* Card Body: Deep Dark Theme Section */}
          <div className="bg-[#111009]/95 p-8 flex flex-col gap-4">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    id="reg-name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      setErrorMsg('')
                    }}
                    placeholder="e.g. Virat Kohli"
                    className="w-full bg-[#0d0c0b] border border-[#2a2826] rounded-xl pl-10 pr-4 py-3 text-xs text-zinc-100 placeholder:text-zinc-650 outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]/40 transition-all font-semibold"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    id="reg-phone"
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/\D/g, ''))
                      setErrorMsg('')
                    }}
                    placeholder="e.g. 9876543210"
                    className="w-full bg-[#0d0c0b] border border-[#2a2826] rounded-xl pl-10 pr-4 py-3 text-xs text-zinc-100 placeholder:text-zinc-650 outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]/40 transition-all font-semibold font-mono tracking-widest"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setErrorMsg('')
                    }}
                    placeholder="Min 6 characters"
                    className="w-full bg-[#0d0c0b] border border-[#2a2826] rounded-xl pl-10 pr-12 py-3 text-xs text-zinc-100 placeholder:text-zinc-650 outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]/40 transition-all font-semibold"
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

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="reg-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      setErrorMsg('')
                    }}
                    placeholder="••••••••"
                    className="w-full bg-[#0d0c0b] border border-[#2a2826] rounded-xl pl-10 pr-12 py-3 text-xs text-zinc-100 placeholder:text-zinc-650 outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]/40 transition-all font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Alerts */}
              <AnimatePresence>
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-rose-950/20 border border-rose-800/40 rounded-xl p-3 flex gap-2.5 items-start text-[11px] text-rose-300"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-450 mt-0.5" />
                    <span className="font-semibold">{errorMsg}</span>
                  </motion.div>
                )}

                {successMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-3 flex gap-2.5 items-start text-[11px] text-emerald-300"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-450 mt-0.5" />
                    <span className="font-semibold">{successMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full justify-center gap-2 rounded-xl py-3.5 mt-2 font-extrabold text-xs uppercase tracking-wider bg-[#C5A880] text-white hover:bg-[#B3966E] shadow-lg shadow-[#C5A880]/15"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin rounded-full"></span>
                    Creating Account...
                  </span>
                ) : (
                  <>
                    Create Luxe Account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Login Redirect */}
            <div className="mt-2 text-center">
              <p className="text-[11px] text-zinc-500 font-semibold">
                Already have an account?{' '}
                <Link href="/login" className="text-[#C5A880] font-black hover:underline tracking-wide">
                  Sign In
                </Link>
              </p>
            </div>
          </div>

        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2a2826]/30 py-6 text-center text-[10px] text-zinc-500 bg-[#0B0A09]/60 backdrop-blur-sm relative z-10">
        <p>© 2026 GlamourOS Retail. Secure Session Manager active.</p>
      </footer>
    </div>
  )
}
