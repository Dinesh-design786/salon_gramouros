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
    <div className="min-h-screen flex flex-col justify-between bg-[#FAF8F5] text-zinc-800 font-sans relative overflow-hidden">

      {/* Background blurs */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#EAE0D5]/40 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#C5A880]/15 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between relative z-10">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#C5A880] flex items-center justify-center shadow-md shadow-[#C5A880]/20">
            <Sparkles className="w-5.5 h-5.5 text-white" />
          </div>
          <div>
            <h1 className="font-heading font-black text-lg tracking-tight text-zinc-900">
              GlamourOS
            </h1>
            <p className="text-[10px] text-[#A68A64] font-bold uppercase tracking-wider">Luxe Salon &amp; Spa</p>
          </div>
        </Link>

        <Link href="/login">
          <Button variant="outline" size="sm" className="h-9 text-xs rounded-xl font-bold border-zinc-200 text-zinc-650 hover:text-zinc-950 bg-white">
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
          className="w-full max-w-md bg-white border border-zinc-100 rounded-3xl p-8 sm:p-10 shadow-xl shadow-zinc-200/50"
        >
          {/* Card Header */}
          <div className="text-center mb-6">
            <span className="text-[#C5A880] text-[10px] font-black uppercase tracking-widest block mb-2">Create Luxe Profile</span>
            <h2 className="text-3xl font-heading font-black text-zinc-900 tracking-tight">Customer Registration</h2>
            <p className="text-xs text-zinc-450 mt-1.5">
              Register with your phone number to unlock premium booking and loyalty rewards.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Full Name */}
            <div>
              <label className="text-[9px] text-zinc-450 block font-bold mb-1.5 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
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
                  className="w-full bg-[#FAF8F5] border border-zinc-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-zinc-800 outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] transition-all font-semibold"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="text-[9px] text-zinc-450 block font-bold mb-1.5 uppercase tracking-wider">
                Phone Number
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
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
                  className="w-full bg-[#FAF8F5] border border-zinc-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-zinc-800 outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] transition-all font-semibold font-mono tracking-widest"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-[9px] text-zinc-450 block font-bold mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
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
                  className="w-full bg-[#FAF8F5] border border-zinc-200 rounded-2xl pl-10 pr-12 py-2.5 text-xs text-zinc-800 outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] transition-all font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-[9px] text-zinc-450 block font-bold mb-1.5 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
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
                  className="w-full bg-[#FAF8F5] border border-zinc-200 rounded-2xl pl-10 pr-12 py-2.5 text-xs text-zinc-800 outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] transition-all font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
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
                  className="bg-rose-50 border border-rose-100 rounded-2xl p-3 flex gap-2.5 items-start text-[11px] text-rose-600"
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
                  className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 flex gap-2.5 items-start text-[11px] text-emerald-600"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
                  <span className="font-semibold">{successMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full justify-center gap-2 rounded-2xl py-3.5 mt-2 font-extrabold text-xs uppercase tracking-wider bg-[#C5A880] text-white hover:bg-[#B3966E] shadow-lg shadow-[#C5A880]/15"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin rounded-full"></span>
                  Creating Account...
                </span>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Login Redirect */}
          <div className="mt-5 text-center">
            <p className="text-[11px] text-zinc-500 font-medium">
              Already have an account?{' '}
              <Link href="/login" className="text-[#A68A64] font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </div>

        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200/50 py-6 text-center text-[10px] text-zinc-450 bg-white relative z-10">
        <p>© 2026 GlamourOS Retail. Secure Session Manager active.</p>
      </footer>
    </div>
  )
}
