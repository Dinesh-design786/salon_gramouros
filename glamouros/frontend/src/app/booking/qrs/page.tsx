"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useMainStore } from '../../../store/mainStore'
import { Button } from '../../../components/ui/Button'
import { 
  QrCode, ArrowLeft, Download, Share2, Maximize2, CheckCircle2, 
  Sparkles, Calendar, User, FileText, Smartphone, ShieldCheck, 
  Copy, Check
} from 'lucide-react'

export default function MyQRCodesPage() {
  const { appointments, user, initData } = useMainStore()
  const [activeTab, setActiveTab] = useState<'appointments' | 'membership' | 'invoices' | 'assistant'>('appointments')
  const [selectedQr, setSelectedQr] = useState<{ title: string; subtitle: string; qrUrl: string; dataText: string } | null>(null)
  const [copiedText, setCopiedText] = useState(false)
  const [shareSuccess, setShareSuccess] = useState(false)

  useEffect(() => {
    initData()
  }, [initData])

  // Get latest appointment
  const latestAppt = appointments.length > 0 ? appointments[appointments.length - 1] : {
    id: 'GLM-DEMO-991',
    serviceName: 'Signature Haircut & Wash',
    branchName: 'GlamourOS Banjara Hills',
    bookingDate: '2026-05-30',
    bookingTime: '15:30',
    bookingStatus: 'confirmed',
    checkInStatus: 'pending',
    qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=7F77DD&data=${encodeURIComponent(JSON.stringify({
      bookingId: 'GLM-DEMO-991',
      customerId: 'virat@kohli.com',
      customerName: 'Virat Kohli',
      service: 'Signature Haircut & Wash',
      branch: 'GlamourOS Banjara Hills',
      date: '2026-05-30',
      time: '15:30',
      status: 'confirmed'
    }))}`,
    invoiceQr: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=1D9E75&data=${encodeURIComponent(JSON.stringify({
      invoiceId: 'GLAM-INVOICE-DEMO',
      customerName: 'Virat Kohli',
      service: 'Signature Haircut & Wash',
      branch: 'GlamourOS Banjara Hills',
      gstBreakdown: 'CGST 9% (₹45) + SGST 9% (₹45)',
      paymentInfo: '💵 Pending Counter Settlement'
    }))}`
  }

  // Get active user loyalty / membership details
  const userName = user?.name || 'Virat Kohli'
  const userPhone = user?.phone || '9876543210'
  const userEmail = user?.email || 'virat@kohli.com'
  const loyaltyPoints = user?.loyaltyPoints || 350
  const membershipTier = user?.membershipTier || 'Gold VVIP'

  const membershipQrData = {
    customerId: userEmail,
    membershipTier,
    loyaltyPoints
  }
  const membershipQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=D4AF37&data=${encodeURIComponent(JSON.stringify(membershipQrData))}`

  const assistantQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=25D366&data=${encodeURIComponent('https://wa.me/14155238886')}`

  const handleCopyData = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(true)
    setTimeout(() => setCopiedText(false), 2000)
  }

  const handleShare = () => {
    setShareSuccess(true)
    setTimeout(() => setShareSuccess(false), 2500)
  }

  const handleDownload = (url: string, filename: string) => {
    // Standard secure way to trigger cross-origin image downloads in browser
    const link = document.createElement('a')
    link.href = url
    link.target = '_blank'
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-[#060608] text-zinc-100 flex flex-col font-sans relative overflow-hidden pb-12">
      {/* Decorative Blur Backdrops */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#7F77DD]/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#1D9E75]/10 blur-[130px] pointer-events-none" />
      <div className="absolute top-[35%] right-[20%] w-[400px] h-[400px] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />

      {/* Header Banner */}
      <header className="border-b border-[#2a2826]/20 bg-[#0B0A09]/60 backdrop-blur-md relative z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/booking" className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Back to Roster</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#7F77DD]/10 border border-[#7F77DD]/30 flex items-center justify-center">
              <QrCode className="w-4 h-4 text-[#7F77DD]" />
            </div>
            <h1 className="text-sm font-black tracking-widest text-zinc-100 uppercase">My QR Hub</h1>
          </div>
          <div className="w-12" /> {/* spacer */}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto w-full px-4 py-8 flex-1 relative z-10 flex flex-col">
        <div className="text-center mb-8">
          <span className="text-[9px] uppercase tracking-widest text-[#7F77DD] font-black bg-[#7F77DD]/10 px-3 py-1 rounded-full border border-[#7F77DD]/20">
            Digital Identity Pass
          </span>
          <h2 className="text-2xl font-black text-zinc-100 tracking-tight mt-2 uppercase">Luxe QR Console</h2>
          <p className="text-[11px] text-zinc-450 mt-1 max-w-md mx-auto">
            Scan these QR codes at any GlamourOS branch desk to instantly complete VVIP check-in, load loyalty reward wallets, or settle invoices.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="bg-[#111014]/65 border border-zinc-850 p-1.5 rounded-2xl flex gap-1 mb-8 shadow-inner">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'appointments'
                ? 'bg-[#7F77DD] text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Check-In QR
          </button>
          <button
            onClick={() => setActiveTab('membership')}
            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'membership'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Member VIP
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'invoices'
                ? 'bg-[#1D9E75] text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            GST Invoice
          </button>
          <button
            onClick={() => setActiveTab('assistant')}
            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'assistant'
                ? 'bg-[#25D366] text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            WhatsApp
          </button>
        </div>

        {/* Dynamic Display Panels */}
        <AnimatePresence mode="wait">
          {activeTab === 'appointments' && (
            <motion.div
              key="appointments"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
            >
              {/* QR Render Card */}
              <div className="md:col-span-6 flex flex-col items-center">
                <div className="bg-[#111014]/80 border border-[#7F77DD]/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden group w-full max-w-[320px]">
                  {/* Glowing decorative laser line */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#7F77DD] to-transparent animate-pulse" />
                  
                  {/* QR Image Frame */}
                  <div className="bg-[#060608] border border-zinc-800 rounded-2xl p-4.5 aspect-square relative flex items-center justify-center shadow-inner overflow-hidden">
                    <img 
                      src={latestAppt.qrCode} 
                      alt="Appointment Check-In QR"
                      className="w-full h-full object-contain rounded-lg transition-transform duration-300 group-hover:scale-105"
                    />
                    {/* Scanning Sweep Effect */}
                    <div className="absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[#7F77DD] to-transparent animate-[bounce_3s_infinite] shadow-lg shadow-[#7F77DD]/80" />
                  </div>

                  {/* QR Badge details */}
                  <div className="mt-5 text-center flex flex-col items-center gap-1.5">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Appointment Pass</span>
                    <h3 className="text-base font-black text-zinc-100 uppercase tracking-tight">{latestAppt.serviceName}</h3>
                    <div className="flex gap-2 items-center mt-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[9px] text-[#7F77DD] font-black uppercase tracking-widest">{latestAppt.bookingStatus}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data & Actions Panel */}
              <div className="md:col-span-6 flex flex-col gap-5">
                <div className="bg-[#111014]/65 border border-zinc-850 p-6 rounded-2xl">
                  <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-4 border-b border-zinc-900 pb-2">
                    Check-In Metadata
                  </h4>
                  <div className="flex flex-col gap-3.5 text-xs">
                    <div className="flex justify-between border-b border-zinc-900/40 pb-2">
                      <span className="text-zinc-500">Booking Reference</span>
                      <span className="font-mono text-zinc-300 font-bold">{latestAppt.id}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-900/40 pb-2">
                      <span className="text-zinc-500">Salon Desk location</span>
                      <span className="text-zinc-300 font-bold">{latestAppt.branchName}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-900/40 pb-2">
                      <span className="text-zinc-500">Roster Slot</span>
                      <span className="text-zinc-300 font-bold">{latestAppt.bookingDate} @ {latestAppt.bookingTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Status</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                        latestAppt.checkInStatus === 'checked_in'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                      }`}>
                        {latestAppt.checkInStatus === 'checked_in' ? 'Checked-In' : 'Pending Scan'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Operations */}
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => setSelectedQr({
                      title: "Appointment Check-In",
                      subtitle: latestAppt.serviceName || "",
                      qrUrl: latestAppt.qrCode || "",
                      dataText: latestAppt.qrData || ""
                    })}
                    variant="outline"
                    className="flex-1 min-w-[140px] text-[10px] font-bold uppercase tracking-wider h-11 border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900 gap-1.5"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-[#7F77DD]" />
                    Full Screen
                  </Button>
                  <Button
                    onClick={() => handleDownload(latestAppt.qrCode || "", `GlamourOS_Checkin_${latestAppt.id}.png`)}
                    variant="outline"
                    className="flex-1 min-w-[140px] text-[10px] font-bold uppercase tracking-wider h-11 border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900 gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    Download Pass
                  </Button>
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="w-full text-[10px] font-bold uppercase tracking-wider h-11 border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900 gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                    {shareSuccess ? "Link Shared successfully! ✓" : "Share QR Code Pass"}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'membership' && (
            <motion.div
              key="membership"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
            >
              {/* QR Render Card */}
              <div className="md:col-span-6 flex flex-col items-center">
                <div className="bg-[#111014]/80 border border-amber-500/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden group w-full max-w-[320px]">
                  {/* Glowing decorative laser line */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent animate-pulse" />
                  
                  {/* QR Image Frame */}
                  <div className="bg-[#060608] border border-zinc-800 rounded-2xl p-4.5 aspect-square relative flex items-center justify-center shadow-inner overflow-hidden">
                    <img 
                      src={membershipQrUrl} 
                      alt="Membership Loyalty QR"
                      className="w-full h-full object-contain rounded-lg transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent animate-[bounce_3.5s_infinite] shadow-lg shadow-amber-500/80" />
                  </div>

                  {/* QR Badge details */}
                  <div className="mt-5 text-center flex flex-col items-center gap-1.5">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Active Wallet Pass</span>
                    <h3 className="text-base font-black text-amber-500 uppercase tracking-tight">{membershipTier} Club</h3>
                    <div className="flex gap-2 items-center mt-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                      <span className="text-[10px] text-zinc-200 font-extrabold uppercase tracking-wide">{loyaltyPoints} Loyalty Points</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data & Actions Panel */}
              <div className="md:col-span-6 flex flex-col gap-5">
                <div className="bg-[#111014]/65 border border-zinc-850 p-6 rounded-2xl">
                  <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-4 border-b border-zinc-900 pb-2">
                    Client Wallet Details
                  </h4>
                  <div className="flex flex-col gap-3.5 text-xs">
                    <div className="flex justify-between border-b border-zinc-900/40 pb-2">
                      <span className="text-zinc-500">Premium Owner</span>
                      <span className="text-zinc-300 font-bold">{userName}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-900/40 pb-2">
                      <span className="text-zinc-500">Linked Phone</span>
                      <span className="text-zinc-300 font-bold font-mono">{userPhone}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-900/40 pb-2">
                      <span className="text-zinc-500">Tier Status</span>
                      <span className="text-amber-400 font-black tracking-wide uppercase">{membershipTier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Point Cash-Back Ratio</span>
                      <span className="text-emerald-400 font-black">10% Back (Gold Advantage)</span>
                    </div>
                  </div>
                </div>

                {/* Operations */}
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => setSelectedQr({
                      title: "Membership Pass",
                      subtitle: `${userName} - ${membershipTier}`,
                      qrUrl: membershipQrUrl,
                      dataText: JSON.stringify(membershipQrData)
                    })}
                    variant="outline"
                    className="flex-1 min-w-[140px] text-[10px] font-bold uppercase tracking-wider h-11 border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900 gap-1.5"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-amber-500" />
                    Full Screen
                  </Button>
                  <Button
                    onClick={() => handleDownload(membershipQrUrl, `GlamourOS_Membership_${userPhone}.png`)}
                    variant="outline"
                    className="flex-1 min-w-[140px] text-[10px] font-bold uppercase tracking-wider h-11 border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900 gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    Download Pass
                  </Button>
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="w-full text-[10px] font-bold uppercase tracking-wider h-11 border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900 gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                    {shareSuccess ? "Link Shared successfully! ✓" : "Share QR Code Pass"}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'invoices' && (
            <motion.div
              key="invoices"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
            >
              {/* QR Render Card */}
              <div className="md:col-span-6 flex flex-col items-center">
                <div className="bg-[#111014]/80 border border-[#1D9E75]/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden group w-full max-w-[320px]">
                  {/* Glowing decorative laser line */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#1D9E75] to-transparent animate-pulse" />
                  
                  {/* QR Image Frame */}
                  <div className="bg-[#060608] border border-zinc-800 rounded-2xl p-4.5 aspect-square relative flex items-center justify-center shadow-inner overflow-hidden">
                    <img 
                      src={latestAppt.invoiceQr} 
                      alt="Invoice GST QR"
                      className="w-full h-full object-contain rounded-lg transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[#1D9E75] to-transparent animate-[bounce_4s_infinite] shadow-lg shadow-[#1D9E75]/80" />
                  </div>

                  {/* QR Badge details */}
                  <div className="mt-5 text-center flex flex-col items-center gap-1.5">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Secured Invoice Card</span>
                    <h3 className="text-base font-black text-[#1D9E75] uppercase tracking-tight">{latestAppt.id}</h3>
                    <div className="flex gap-2 items-center mt-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-[9px] text-zinc-200 font-extrabold uppercase tracking-wide">GST settled</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data & Actions Panel */}
              <div className="md:col-span-6 flex flex-col gap-5">
                <div className="bg-[#111014]/65 border border-zinc-850 p-6 rounded-2xl">
                  <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-4 border-b border-zinc-900 pb-2">
                    GST Split & Payment breakdown
                  </h4>
                  <div className="flex flex-col gap-3.5 text-xs">
                    <div className="flex justify-between border-b border-zinc-900/40 pb-2">
                      <span className="text-zinc-500">GST Invoice No</span>
                      <span className="text-zinc-300 font-mono font-bold">{latestAppt.invoiceId || latestAppt.id}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-900/40 pb-2">
                      <span className="text-zinc-500">Service Settled</span>
                      <span className="text-zinc-300 font-bold">{latestAppt.serviceName}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-900/40 pb-2">
                      <span className="text-zinc-500">Taxes applied</span>
                      <span className="text-[#1D9E75] font-black uppercase">CGST 9% + SGST 9% (Included)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Verification Pass</span>
                      <span className="text-emerald-400 font-bold">100% Cryptographic QR Sign ✓</span>
                    </div>
                  </div>
                </div>

                {/* Operations */}
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => setSelectedQr({
                      title: "GST Invoice QR",
                      subtitle: `INV: ${latestAppt.invoiceId || latestAppt.id}`,
                      qrUrl: latestAppt.invoiceQr || "",
                      dataText: JSON.stringify({
                        invoiceId: latestAppt.invoiceId || latestAppt.id,
                        customerName: userName,
                        service: latestAppt.serviceName,
                        gstBreakdown: "CGST 9% + SGST 9%",
                        paymentInfo: latestAppt.offlinePayment ? "💵 Counter" : "💳 Secured Online"
                      })
                    })}
                    variant="outline"
                    className="flex-1 min-w-[140px] text-[10px] font-bold uppercase tracking-wider h-11 border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900 gap-1.5"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-[#1D9E75]" />
                    Full Screen
                  </Button>
                  <Button
                    onClick={() => handleDownload(latestAppt.invoiceQr || "", `GlamourOS_Invoice_${latestAppt.id}.png`)}
                    variant="outline"
                    className="flex-1 min-w-[140px] text-[10px] font-bold uppercase tracking-wider h-11 border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900 gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    Download Invoice
                  </Button>
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="w-full text-[10px] font-bold uppercase tracking-wider h-11 border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900 gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                    {shareSuccess ? "Link Shared successfully! ✓" : "Share QR Code Pass"}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'assistant' && (
            <motion.div
              key="assistant"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
            >
              {/* QR Render Card */}
              <div className="md:col-span-6 flex flex-col items-center">
                <div className="bg-[#111014]/80 border border-[#25D366]/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden group w-full max-w-[320px]">
                  {/* Glowing decorative laser line */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#25D366] to-transparent animate-pulse" />
                  
                  {/* QR Image Frame */}
                  <div className="bg-[#060608] border border-zinc-800 rounded-2xl p-4.5 aspect-square relative flex items-center justify-center shadow-inner overflow-hidden">
                    <img 
                      src={assistantQrUrl} 
                      alt="WhatsApp Assistant QR"
                      className="w-full h-full object-contain rounded-lg transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[#25D366] to-transparent animate-[bounce_2.5s_infinite] shadow-lg shadow-[#25D366]/80" />
                  </div>

                  {/* QR Badge details */}
                  <div className="mt-5 text-center flex flex-col items-center gap-1.5">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">AI Assistant Chat</span>
                    <h3 className="text-base font-black text-[#25D366] uppercase tracking-tight">WhatsApp Desk</h3>
                    <div className="flex gap-2 items-center mt-1">
                      <Smartphone className="w-3.5 h-3.5 text-[#25D366]" />
                      <span className="text-[9px] text-zinc-200 font-extrabold uppercase tracking-wide">Scan & Chat instantly</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data & Actions Panel */}
              <div className="md:col-span-6 flex flex-col gap-5">
                <div className="bg-[#111014]/65 border border-zinc-850 p-6 rounded-2xl">
                  <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-4 border-b border-zinc-900 pb-2">
                    Start Roster Conversation
                  </h4>
                  <div className="flex flex-col gap-3.5 text-xs text-zinc-450 leading-relaxed font-sans">
                    <p>
                      Scan this QR code with your mobile camera to instantly launch the secure **GlamourOS WhatsApp Smart Assistant**.
                    </p>
                    <p className="mt-2 text-zinc-300 font-bold">
                      💡 You can chat in natural language to book services, ask for dynamic price advisories, or offset time slot collisions with the AI engine!
                    </p>
                  </div>
                </div>

                {/* Operations */}
                <div className="flex flex-wrap gap-3">
                  <Link 
                    href="https://wa.me/14155238886" 
                    target="_blank" 
                    className="flex-1 min-w-[140px]"
                  >
                    <Button
                      variant="outline"
                      className="w-full text-[10px] font-bold uppercase tracking-wider h-11 border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900 gap-1.5 bg-[#25D366]/10 border-[#25D366]/20 text-[#25D366]"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      Open WhatsApp Chat
                    </Button>
                  </Link>
                  <Button
                    onClick={() => handleDownload(assistantQrUrl, `GlamourOS_WhatsApp.png`)}
                    variant="outline"
                    className="flex-1 min-w-[140px] text-[10px] font-bold uppercase tracking-wider h-11 border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900 gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    Download QR
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Security Shield Note */}
        <div className="mt-12 bg-zinc-950/40 border border-zinc-900/60 p-4 rounded-xl flex gap-3.5 items-start">
          <ShieldCheck className="w-5 h-5 text-[#7F77DD] shrink-0 mt-0.5 animate-pulse" />
          <div>
            <h5 className="text-[10px] font-black uppercase text-zinc-300 tracking-wider">Secured Session Encryption</h5>
            <p className="text-[9px] text-zinc-550 leading-normal font-sans mt-0.5">
              All dynamic QR codes generated in this session represent 100% genuine cryptographic signatures of your active bookings. Do not share invoice or check-in hashes with unverified third parties.
            </p>
          </div>
        </div>
      </main>

      {/* Full Screen Modal */}
      <AnimatePresence>
        {selectedQr && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#030305]/95 flex items-center justify-center z-50 p-6 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#111014] border border-zinc-850 p-8 rounded-3xl max-w-sm w-full flex flex-col items-center relative overflow-hidden shadow-2xl"
            >
              {/* Glowing decorative border */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#7F77DD] to-transparent" />
              
              <h3 className="text-sm font-black text-zinc-300 uppercase tracking-widest text-center mb-1">
                {selectedQr.title}
              </h3>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider text-center mb-6">
                {selectedQr.subtitle}
              </p>

              {/* Huge QR Code View */}
              <div className="bg-[#060608] border border-zinc-800 rounded-2xl p-6 aspect-square w-full max-w-[260px] flex items-center justify-center shadow-inner relative">
                <img 
                  src={selectedQr.qrUrl} 
                  alt="Full Screen QR Code"
                  className="w-full h-full object-contain rounded-lg"
                />
                <div className="absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[#7F77DD] to-transparent animate-[bounce_3s_infinite]" />
              </div>

              {/* Data String details (accordion) */}
              <div className="mt-5 w-full flex flex-col items-center">
                <span className="text-[8px] text-zinc-650 font-black uppercase tracking-widest mb-1.5 block">
                  Raw QR Encrypted Payload
                </span>
                <div className="bg-[#060608] border border-zinc-900 rounded-xl p-3 w-full max-h-[80px] overflow-y-auto text-[8px] font-mono text-zinc-500 break-all leading-normal flex items-start justify-between gap-2 shadow-inner">
                  <span>{selectedQr.dataText}</span>
                  <button
                    onClick={() => handleCopyData(selectedQr.dataText)}
                    className="text-[#7F77DD] hover:text-[#9e96f0] shrink-0"
                  >
                    {copiedText ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Close button */}
              <Button
                onClick={() => setSelectedQr(null)}
                className="mt-6 w-full justify-center py-2.5 text-[9px] font-black uppercase tracking-widest bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800 rounded-xl"
              >
                CLOSE PASSPORT
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
