"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useMainStore } from '../../store/mainStore'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { 
  QrCode, Sparkles, CheckCircle2, UserCheck, Calendar, FileText, 
  ArrowRight, ShieldCheck, RefreshCw, Volume2, Landmark
} from 'lucide-react'

export function QRManagerTab() {
  const { appointments, initData } = useMainStore()
  const [membershipScans, setMembershipScans] = useState(42)
  const [invoiceDownloads, setInvoiceDownloads] = useState(18)
  const [lastCheckinTime, setLastCheckinTime] = useState<string | null>(null)

  useEffect(() => {
    initData()
  }, [initData])

  // Dynamic calculations
  const totalCheckedIn = appointments.filter(a => a.checkInStatus === 'checked_in').length
  const pendingCheckins = appointments.filter(a => a.checkInStatus !== 'checked_in')

  // Capture when checkin count changes to show live updates
  useEffect(() => {
    if (totalCheckedIn > 0) {
      setLastCheckinTime(new Date().toLocaleTimeString())
      setMembershipScans(prev => prev + 1)
      setInvoiceDownloads(prev => prev + 1)
    }
  }, [totalCheckedIn])

  const recentCheckins = appointments.filter(a => a.checkInStatus === 'checked_in')

  return (
    <Card className="p-6 bg-[#111014]/65 border border-zinc-850 rounded-2xl relative overflow-hidden flex flex-col gap-6">
      {/* Laser overlay decoration */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#7F77DD] to-transparent animate-pulse" />

      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-900">
        <div>
          <h3 className="text-base font-black text-zinc-100 uppercase tracking-tight flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#7F77DD]" />
            QR & Check-In Desk
          </h3>
          <p className="text-[10px] text-zinc-500 font-sans mt-0.5">
            Admin management console for active salon check-ins, VIP loyalty validations, and GST invoicing audits.
          </p>
        </div>
        <Link href="/dashboard/checkin">
          <Button
            className="text-[9px] font-black uppercase tracking-widest bg-[#7F77DD] hover:bg-[#9089e6] text-zinc-950 px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md border-none"
          >
            Launch Live Scanner Desk
            <ArrowRight className="w-3.5 h-3.5 text-zinc-950" />
          </Button>
        </Link>
      </div>

      {/* Top 4 Stats Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Stat 1: Total Checked In */}
        <div className="bg-[#060608] border border-zinc-900 p-4 rounded-xl shadow-inner relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-5">
            <UserCheck className="w-12 h-12 text-[#7F77DD]" />
          </div>
          <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider block">Checked-In Today</span>
          <span className="text-xl font-black text-zinc-150 block mt-1 tracking-tight">{totalCheckedIn}</span>
          <div className="flex items-center gap-1 mt-1 text-[8px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-400 font-bold uppercase">Real-Time Sync</span>
          </div>
        </div>

        {/* Stat 2: Pending Queue */}
        <div className="bg-[#060608] border border-zinc-900 p-4 rounded-xl shadow-inner relative overflow-hidden">
          <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider block">Active Queue</span>
          <span className="text-xl font-black text-zinc-150 block mt-1 tracking-tight">{pendingCheckins.length}</span>
          <div className="flex items-center gap-1 mt-1 text-[8px]">
            <span className="text-zinc-550 uppercase">Waiting desk check</span>
          </div>
        </div>

        {/* Stat 3: Membership VIP scans */}
        <div className="bg-[#060608] border border-zinc-900 p-4 rounded-xl shadow-inner relative overflow-hidden">
          <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider block">Membership Scans</span>
          <span className="text-xl font-black text-amber-500 block mt-1 tracking-tight">{membershipScans}</span>
          <div className="flex items-center gap-1 mt-1 text-[8px]">
            <span className="text-amber-400/80 font-bold uppercase">VIP Reward validation</span>
          </div>
        </div>

        {/* Stat 4: Invoice Downloads */}
        <div className="bg-[#060608] border border-zinc-900 p-4 rounded-xl shadow-inner relative overflow-hidden">
          <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider block">GST Audits</span>
          <span className="text-xl font-black text-[#1D9E75] block mt-1 tracking-tight">{invoiceDownloads}</span>
          <div className="flex items-center gap-1 mt-1 text-[8px]">
            <span className="text-[#1D9E75] font-bold uppercase">Ledger Exported</span>
          </div>
        </div>

      </div>

      {/* Main Grid content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Side: Recent Check-in Logs */}
        <div className="md:col-span-8 flex flex-col gap-4">
          <div className="bg-[#060608]/70 border border-zinc-900 p-4 rounded-xl shadow-inner flex-1 flex flex-col min-h-[220px]">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-3 flex items-center justify-between">
              <span>Live Desk check-in feed</span>
              {lastCheckinTime && (
                <span className="text-[8px] text-zinc-550 font-normal normal-case">Last updated @ {lastCheckinTime}</span>
              )}
            </h4>

            {recentCheckins.length > 0 ? (
              <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-1">
                {recentCheckins.map((appt, i) => (
                  <div 
                    key={appt.id || i}
                    className="p-3 bg-[#111014]/80 border border-zinc-850 rounded-xl text-xs flex items-center justify-between gap-3 shadow-sm hover:border-zinc-800 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-zinc-200 block">{appt.customerName || 'Virat Kohli'}</span>
                        <span className="text-[9px] text-zinc-500 block font-sans">{appt.serviceName} • {appt.branchName}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-mono text-zinc-400 block">{appt.bookingTime}</span>
                      <span className="text-[8px] font-black uppercase text-emerald-400 tracking-wider">Checked In ✓</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <ShieldCheck className="w-8 h-8 text-zinc-700 animate-pulse mb-2" />
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Waiting for First Client...</span>
                <p className="text-[8px] text-zinc-650 max-w-[200px] leading-normal font-sans mt-0.5">
                  Launch the **Live Scanner Desk** in another tab and simulate a customer check-in to witness real-time logs updating instantly!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Scan desk companion QR */}
        <div className="md:col-span-4 flex flex-col gap-4">
          <div className="bg-[#060608]/70 border border-zinc-900 p-4 rounded-xl flex flex-col items-center text-center shadow-inner">
            <span className="text-[8px] font-bold text-[#7F77DD] uppercase tracking-widest bg-[#7F77DD]/10 border border-[#7F77DD]/20 px-2 py-0.5 rounded-full mb-3">
              Desk Assistant QR
            </span>
            <div className="bg-white border-2 border-zinc-800 rounded-xl p-2.5 aspect-square w-full max-w-[120px] flex items-center justify-center">
              <img 
                src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=25D366&data=https://wa.me/14155238886"
                alt="Assistant Desk QR"
                className="w-full h-full object-contain"
              />
            </div>
            <h5 className="text-[9px] font-black uppercase text-zinc-300 mt-3 tracking-wide">AI Assistant Companion</h5>
            <p className="text-[8px] text-zinc-550 leading-normal font-sans mt-1 max-w-[150px]">
              Display this static QR code at the desk for check-in guests to activate their mobile virtual assistants instantly.
            </p>
          </div>
        </div>

      </div>

    </Card>
  )
}
