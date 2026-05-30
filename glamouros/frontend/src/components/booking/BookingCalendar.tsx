"use client"

import React, { useState, useEffect } from 'react'
import { useMainStore } from '../../store/mainStore'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Calendar, Clock, User, Scissors, RefreshCw } from 'lucide-react'

export const BookingCalendar = () => {
  const { 
    appointments, 
    stylists, 
    activeBranchId, 
    updateAppointmentStatus, 
    createAppointment,
    branches,
    initData
  } = useMainStore()

  // Get current date string dynamically (e.g. "2026-05-30")
  const getTodayDateString = () => {
    const today = new Date()
    const offset = today.getTimezoneOffset()
    const localDate = new Date(today.getTime() - (offset * 60 * 1000))
    return localDate.toISOString().split('T')[0]
  }

  const [selectedDate, setSelectedDate] = useState('')
  const [selectedStylist, setSelectedStylist] = useState('')
  const [selectedTime, setSelectedTime] = useState('11:00')
  const [selectedService, setSelectedService] = useState('s1000000-0000-0000-0000-000000000001') // default haircut
  const [liveTime, setLiveTime] = useState('')

  // Set local date on mount to avoid Next SSR hydration errors
  useEffect(() => {
    setSelectedDate(getTodayDateString())
    initData()

    // Dynamic Clock update
    const updateTime = () => {
      const now = new Date()
      setLiveTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const activeBranch = branches.find(b => b.id === activeBranchId)
  const branchStylists = stylists.filter(s => s.branch_id === activeBranchId)
  const branchAppts = appointments.filter(a => a.branch_id === activeBranchId)

  // Calendar operating hours
  const hours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']

  const handleCreate = async () => {
    if (!selectedStylist) return
    const originalPrice = selectedService === 's1000000-0000-0000-0000-000000000005' ? 8000 : 500
    
    await createAppointment({
      stylist_id: selectedStylist,
      time: selectedTime,
      date: selectedDate || getTodayDateString(),
      base_price: originalPrice,
      source: 'Walk-in',
      notes: 'Direct roster walk-in appointment.'
    })
  }

  // Get dynamic pricing badge
  const fillRate = activeBranch?.fill_rate || 30
  let pricingLabel = 'Standard pricing active'
  let pricingVariant: 'slate' | 'success' | 'alert' = 'slate'

  if (fillRate < 30) {
    pricingLabel = 'Happy Hour Active (15% Off Services)'
    pricingVariant = 'success'
  } else if (fillRate > 85) {
    pricingLabel = 'Surge Pricing Active (20% Markup)'
    pricingVariant = 'alert'
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* Calendar Header Dynamic pricing advisor banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border border-zinc-850 bg-[#111014]/65 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-8.5 h-8.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-xs text-primary">
            📅
          </div>
          <div>
            <h3 className="text-xs font-bold text-zinc-100 flex items-center gap-2">
              Daily Roster Calendar
              <Badge variant={pricingVariant as any} className="scale-90 font-bold">{pricingLabel}</Badge>
            </h3>
            <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-0.5">
              <span>{activeBranch?.name || 'Chain branch'}</span>
              <span>•</span>
              <span className="text-zinc-400 font-mono font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                Live: {liveTime || '--:--:--'}
              </span>
            </div>
          </div>
        </div>

        {/* Date Selector & Walk-in controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Calendar Date Picker */}
          <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-[11px] text-zinc-200 font-bold focus:outline-none outline-none cursor-pointer"
            />
          </div>

          <select
            value={selectedStylist}
            onChange={(e) => setSelectedStylist(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-3 text-[11px] text-zinc-300 font-medium focus:outline-none"
          >
            <option value="">Choose Stylist...</option>
            {branchStylists.map(st => (
              <option key={st.id} value={st.id}>{st.name} ({st.specialty})</option>
            ))}
          </select>

          <select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-3 text-[11px] text-zinc-300 focus:outline-none"
          >
            {hours.map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>

          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-3 text-[11px] text-zinc-300 focus:outline-none"
          >
            <option value="s1000000-0000-0000-0000-000000000001">Signature Haircut (₹500)</option>
            <option value="s1000000-0000-0000-0000-000000000005">Royal Bridal Spa (₹8000)</option>
          </select>

          <Button
            onClick={handleCreate}
            variant="primary"
            size="sm"
            className="text-[10px] font-bold py-2 rounded-lg bg-[#7F77DD] hover:bg-[#9089e6] text-zinc-950 border-none px-3"
          >
            Add Booking
          </Button>
        </div>
      </div>

      {/* Calendar timeline grid */}
      <div className="border border-zinc-850 rounded-xl overflow-hidden bg-slate-950/40">
        
        {/* Therapist headers */}
        <div className="grid grid-cols-12 border-b border-zinc-850 bg-slate-900/50 py-3 text-center text-xs font-bold text-zinc-300">
          <div className="col-span-2 border-r border-zinc-850 text-[10px] uppercase text-zinc-550 font-extrabold flex items-center justify-center">
            Hour
          </div>
          <div className="col-span-10 grid grid-cols-3">
            {branchStylists.map(st => (
              <div key={st.id} className="border-r border-zinc-850 last:border-0 flex flex-col items-center justify-center gap-0.5">
                <span className="text-zinc-200 font-bold">{st.name}</span>
                <span className="text-[9px] text-zinc-500 font-semibold">{st.rating}★ · {st.workload}% Load</span>
              </div>
            ))}
            {branchStylists.length === 0 && (
              <div className="col-span-3 text-center text-zinc-500 py-2 italic text-[11px]">
                No stylists registered under this branch.
              </div>
            )}
          </div>
        </div>

        {/* Calendar slots rows */}
        <div className="flex flex-col max-h-[460px] overflow-y-auto">
          {hours.map(hr => (
            <div key={hr} className="grid grid-cols-12 border-b border-zinc-850 last:border-0 min-h-[64px] items-stretch">
              
              {/* Hour identifier */}
              <div className="col-span-2 border-r border-zinc-850 flex items-center justify-center bg-slate-900/10 text-xs font-bold text-zinc-400">
                {hr}
              </div>

              {/* Roster column reservation blocks */}
              <div className="col-span-10 grid grid-cols-3">
                {branchStylists.map(st => {
                  // Filter by BOTH active selectedDate and stylist time
                  const matchingAppts = branchAppts.filter(
                    a => a.stylist_id === st.id && 
                         a.date === selectedDate && 
                         a.time.startsWith(hr.substring(0, 2))
                  )

                  return (
                    <div key={st.id} className="border-r border-zinc-850 last:border-0 p-1.5 flex flex-col gap-1 min-h-[56px] relative justify-center">
                      {matchingAppts.map(appt => {
                        const isWhatsapp = appt.source === 'WhatsApp'
                        const isCompleted = appt.status === 'Completed'
                        const isCheckedIn = appt.checkInStatus === 'checked_in'

                        return (
                          <div
                            key={appt.id}
                            className={`p-2 rounded-lg text-[10px] leading-tight cursor-pointer border transition-all ${
                              isCompleted
                                ? 'bg-zinc-900 border-zinc-800 text-zinc-500 line-through opacity-60'
                                : isCheckedIn
                                  ? 'bg-[#1D9E75]/10 border-[#1D9E75]/40 text-[#1D9E75] shadow-sm shadow-[#1D9E75]/5'
                                  : isWhatsapp
                                    ? 'bg-[#7F77DD]/10 border-[#7F77DD]/40 text-[#7F77DD] shadow-sm shadow-[#7F77DD]/5 animate-pulse-slow'
                                    : 'bg-zinc-800 border-zinc-750 text-zinc-200 hover:border-zinc-500'
                            }`}
                            onClick={() => {
                              // Transition status sequence on click
                              if (appt.status === 'Confirmed') {
                                updateAppointmentStatus(appt.id, 'In Progress')
                              } else if (appt.status === 'In Progress') {
                                updateAppointmentStatus(appt.id, 'Completed')
                              }
                            }}
                          >
                            <div className="flex items-center justify-between font-bold">
                              <span>{appt.customerName || appt.customer_id || 'VVIP Client'}</span>
                            </div>
                            <div className="text-[9px] text-zinc-400 mt-0.5 truncate">
                              {appt.notes ? appt.notes.split('.')[0] : 'Hair Treatment'}
                            </div>
                            <div className="mt-1.5 flex items-center justify-between gap-1 text-[8px] font-semibold tracking-wider">
                              <Badge 
                                variant={
                                  appt.status === 'Completed' 
                                    ? 'slate' 
                                    : appt.status === 'In Progress' 
                                      ? 'warning' 
                                      : isCheckedIn 
                                        ? 'success' 
                                        : 'primary'
                                }
                              >
                                {isCheckedIn && appt.status !== 'Completed' ? 'Checked In' : appt.status}
                              </Badge>
                              <span className="text-zinc-500">₹{appt.applied_price || appt.base_price || 500}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>

            </div>
          ))}
        </div>

      </div>

    </div>
  )
}

export default BookingCalendar
